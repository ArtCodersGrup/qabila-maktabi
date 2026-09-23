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

  // Oddiy qiymat: son, mantiq yoki qisqa kalit so'z. Erkin matn (gap, ism, chat) hech qachon o'tmaydi.
  const oddiy = (v) => typeof v === "number" || typeof v === "boolean" || (typeof v === "string" && /^[a-z0-9:_-]{0,32}$/i.test(v));
  // Ro'yxat ham bo'ladi: 12 o'yinchining pog'onasi kabi (har qiymati baribir oddiy)
  const qiymat = (v) => oddiy(v) || (Array.isArray(v) && v.length <= 32 && v.every(oddiy));
  const kimlik = (v) => typeof v === "string" && /^[a-z0-9:_-]{1,32}$/i.test(v);

  // O'yin xabari: { type, data, t, from }. types — shu o'yinda ruxsat etilgan turlar; boshqasi tashlab yuboriladi
  function validMessage(msg, types) {
    if (!msg || typeof msg !== "object") return false;
    if (!types.includes(msg.type)) return false;
    if (!kimlik(msg.from) || typeof msg.t !== "number") return false;
    // Ma'lumot — kichik obyekt: sonlar, mantiq, qisqa kalit so'zlar va ularning ro'yxatlari
    const data = msg.data == null ? {} : msg.data;
    if (typeof data !== "object" || Array.isArray(data)) return false;
    return Object.values(data).every(qiymat);
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
      // Ikki kishilik xona: faqat qarshi tomondan kelgan xabar
      if (!closed && validMessage(payload, types) && SIDES.includes(payload.from) && payload.from !== side && on.message) on.message(payload);
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

  // ---------- Ko'p kishilik xona (tog' o'yini) ----------
  // Bitta boshlovchi ("host" — o'qituvchi qurilmasi) va 12 tagacha o'yinchi.
  // Boshlovchi o'yin holatini o'zi hisoblaydi va tarqatadi; o'yinchilar faqat javobini yuboradi.
  const HOST = "host";
  const MAX_ODAM = 13; // 12 o'yinchi + boshlovchi

  async function waitForKeys(ch, ms) {
    const dead = Date.now() + ms;
    for (;;) {
      const keys = Object.keys(ch.presenceState());
      if (keys.includes(HOST) || Date.now() >= dead) return keys;
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  // me — o'yinchining yashirin raqami (ism emas!), role — "host" yoki "player".
  // on: { status(s), peers(ids, hostBor), message(msg) }
  // status: "connecting" | "ready" | "missing" | "full" | "error"
  function xona({ kind, code, me, role, types, on }) {
    const key = role === "host" ? HOST : me;
    const ch = getClient().channel(channelName(kind, code), {
      config: { broadcast: { self: false }, presence: { key } },
    });
    let tracked = false;
    let closed = false;
    const emit = (s) => { if (!closed && on.status) on.status(s); };
    const close = () => {
      if (closed) return;
      closed = true;
      getClient().removeChannel(ch);
    };

    ch.on("broadcast", { event: "msg" }, ({ payload }) => {
      if (!closed && validMessage(payload, types) && payload.from !== key && on.message) on.message(payload);
    });
    ch.on("presence", { event: "sync" }, () => {
      if (closed || !tracked || !on.peers) return;
      const keys = Object.keys(ch.presenceState());
      on.peers(keys.filter((k) => k !== HOST), keys.includes(HOST));
    });

    emit("connecting");
    ch.subscribe(async (status) => {
      if (closed) return;
      if (status === "SUBSCRIBED") {
        if (role !== "host") {
          const keys = await waitForKeys(ch, HOST_WAIT);
          if (closed) return;
          if (!keys.includes(HOST)) { emit("missing"); close(); return; }
          const odam = keys.filter((k) => k !== HOST);
          if (odam.length >= MAX_ODAM - 1 && !odam.includes(me)) { emit("full"); close(); return; }
        }
        tracked = true;
        await ch.track({ role: role === "host" ? "host" : "player", at: Date.now() });
        emit("ready");
        if (role === "host") logRoom(kind, code);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        emit("error");
      }
    });

    return {
      code,
      me: key,
      send(type, data) {
        if (closed || !types.includes(type)) return;
        ch.send({ type: "broadcast", event: "msg", payload: { type, data: data || {}, t: Date.now(), from: key } });
      },
      leave: close,
    };
  }

  const api = { CONFIG, CODE_TTL, HOST_WAIT, HOST, MAX_ODAM, SIDES, KINDS, xona, makeCode, validCode, channelName, validMessage, roomInfo, available, ping, join };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.onlayn = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
