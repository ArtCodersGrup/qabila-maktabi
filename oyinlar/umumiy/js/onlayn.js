// Onlayn xonalar: ikki qurilma bir-biriga Supabase Realtime (Broadcast + Presence) orqali xabar yuboradi.
// Ism, chat va erkin matn yo'q: faqat xona kodi, tomon (Oy/Quyosh) va ro'yxatdagi xabar turlari.
// Kutubxona — umumiy/js/supabase.min.js (QOIDALAR 8, istisno). Sof qismlar (kod, xabar tekshiruvi) Node'da test qilinadi.
(function (root) {
  "use strict";

  // Ommaviy (publishable) kalit — saytda ochiq turishi odatiy: ma'lumotlar bazasi RLS bilan himoyalangan.
  // Maxfiy (service) kalit bu yerga HECH QACHON yozilmaydi.
  const CONFIG = {
    url: "https://kgwbpsvvclupvhsydedk.supabase.co",
    key: "sb_publishable__Al5XrNtL5EZ-9Jj0GzehA_-G5uCh4m",
  };

  const CODE_TTL = 10 * 60 * 1000; // xona kodi 10 daqiqa amal qiladi
  const HOST_WAIT = 6000; // xona egasini shuncha kutamiz (sekin tarmoqda presence kech keladi)
  const SIDES = ["left", "right"]; // chap — Oy (xonani ochgan), o'ng — Quyosh (kod bilan kirgan)
  const KINDS = ["sinov", "poyga", "savol", "tog"]; // xona turlari (bazadagi check bilan bir xil)

  // ---------- Sof qismlar ----------
  // 4 xonali kod: 1000–9999 (boshida 0 bo'lmaydi — aytish va yozish oson)
  const makeCode = (rng) => String(1000 + Math.floor((rng || Math.random)() * 9000));
  const validCode = (s) => /^[1-9][0-9]{3}$/.test(String(s));
  const channelName = (kind, code) => `xona:${kind}:${code}`;

  // O'yin xabari: { type, data, t, from }. types — shu o'yinda ruxsat etilgan turlar; boshqasi tashlab yuboriladi
  function validMessage(msg, types) {
    if (!msg || typeof msg !== "object") return false;
    if (!types.includes(msg.type)) return false;
    if (!SIDES.includes(msg.from) || typeof msg.t !== "number") return false;
    // Ma'lumot — kichik obyekt, ichida erkin matn yo'q (faqat son, mantiq va qisqa kalit so'zlar)
    const data = msg.data == null ? {} : msg.data;
    if (typeof data !== "object" || Array.isArray(data)) return false;
    return Object.values(data).every((v) => typeof v === "number" || typeof v === "boolean" || (typeof v === "string" && /^[a-z0-9:_-]{0,32}$/i.test(v)));
  }

  // Xona egasi (chap tomon) presence'da ko'rinishini kutamiz. Qat'iy pauza yaramaydi:
  // maktab tarmog'ida serverga yo'l 700 ms ham bo'ladi, shuncha kutib "xona yo'q" deb xato aytardi.
  async function waitForHost(ch, ms) {
    const dead = Date.now() + ms;
    for (;;) {
      const info = roomInfo(ch.presenceState());
      if (info.sides.includes("left") || Date.now() >= dead) return info;
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  // Presence holatidan: kim ulangan va xona qachon ochilgan
  function roomInfo(state) {
    const sides = SIDES.filter((s) => state[s] && state[s].length);
    const host = state.left && state.left[0];
    return { sides, full: sides.length === 2, hostAt: host ? host.at : null, extra: SIDES.some((s) => state[s] && state[s].length > 1) };
  }

  // ---------- Supabase bilan ishlash ----------
  let client = null;
  const available = () => !!(root.supabase && root.supabase.createClient) && !CONFIG.key.startsWith("__");
  function getClient() {
    if (!client) client = root.supabase.createClient(CONFIG.url, CONFIG.key, { auth: { persistSession: false } });
    return client;
  }

  // Server bilan aloqa sinovi: vaqtinchalik kanalga ulanib ko'radi. Natija: { ok, ms } yoki { ok: false, reason }
  function ping(timeout = 8000) {
    if (!available()) return Promise.resolve({ ok: false, reason: "lib" });
    if (root.navigator && root.navigator.onLine === false) return Promise.resolve({ ok: false, reason: "offline" });
    const t0 = Date.now();
    const ch = getClient().channel(`sinov:${makeCode()}${Date.now()}`);
    return new Promise((resolve) => {
      const timer = setTimeout(() => { getClient().removeChannel(ch); resolve({ ok: false, reason: "timeout" }); }, timeout);
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          getClient().removeChannel(ch);
          resolve({ ok: true, ms: Date.now() - t0 });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timer);
          getClient().removeChannel(ch);
          resolve({ ok: false, reason: "error" });
        }
      });
    });
  }

  // Xona ochildi — bazaga kichik yozuv (loyiha "faol" hisoblanadi; shaxsiy ma'lumot yo'q). Xato bo'lsa — jim.
  function logRoom(kind, code) {
    try {
      getClient().from("xonalar").insert({ kod: code, turi: kind }).then(() => {}, () => {});
    } catch (e) {
      // e'tiborsiz
    }
  }

  // Xonaga ulanish. side "left" — ochgan (Oy), "right" — kod bilan kirgan (Quyosh).
  // on: { status(s), peers(info), message(msg) }; types — ruxsat etilgan xabar turlari.
  // status: "connecting" | "waiting" | "ready" | "peer-left" | "full" | "missing" | "expired" | "error"
  function join({ kind, code, side, types, on }) {
    const ch = getClient().channel(channelName(kind, code), {
      config: { broadcast: { self: false }, presence: { key: side } },
    });
    const at = side === "left" ? Date.now() : null;
    let tracked = false;
    let closed = false;
    let wasFull = false;
    const emit = (s) => { if (!closed && on.status) on.status(s); };

    function close() {
      if (closed) return;
      closed = true;
      getClient().removeChannel(ch);
    }

    ch.on("broadcast", { event: "msg" }, ({ payload }) => {
      if (!closed && validMessage(payload, types) && payload.from !== side && on.message) on.message(payload);
    });
    ch.on("presence", { event: "sync" }, () => {
      if (closed) return;
      const info = roomInfo(ch.presenceState());
      if (!tracked) return;
      if (on.peers) on.peers(info);
      if (info.full) {
        wasFull = true;
        emit("ready");
      } else if (wasFull) {
        emit("peer-left");
      } else {
        emit("waiting");
      }
    });

    emit("connecting");
    ch.subscribe(async (status) => {
      if (closed) return;
      if (status === "SUBSCRIBED") {
        if (side === "right") {
          // Kirishdan oldin tekshiramiz: xona bormi, eskirmaganmi, to'la emasmi
          let info = await waitForHost(ch, HOST_WAIT);
          if (closed) return;
          if (!info.sides.includes("left")) { emit("missing"); close(); return; }
          // Egasi topildi — uchinchi qurilma bor-yo'qligini ko'rish uchun biroz kutamiz
          await new Promise((r) => setTimeout(r, 400));
          if (closed) return;
          info = roomInfo(ch.presenceState());
          if (info.sides.includes("right")) { emit("full"); close(); return; }
          if (info.hostAt && Date.now() - info.hostAt > CODE_TTL) { emit("expired"); close(); return; }
        }
        tracked = true;
        await ch.track({ side, at: at || Date.now() });
        if (side === "left") logRoom(kind, code);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        emit("error");
      }
    });

    return {
      code,
      side,
      send(type, data) {
        if (closed || !types.includes(type)) return;
        ch.send({ type: "broadcast", event: "msg", payload: { type, data: data || {}, t: Date.now(), from: side } });
      },
      leave: close,
    };
  }

  const api = { CONFIG, CODE_TTL, HOST_WAIT, SIDES, KINDS, makeCode, validCode, channelName, validMessage, roomInfo, available, ping, join };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.onlayn = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
