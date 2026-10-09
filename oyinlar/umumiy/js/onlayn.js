// Onlayn xonalar: qurilmalar o'z serverimiz (kelajagim.uz, FastAPI WebSocket) orqali xabar almashadi.
// Ism, chat va erkin matn yo'q: faqat xona kodi, tomon (Oy/Quyosh) yoki yashirin raqam va ro'yxatdagi xabar turlari.
// Server xabarni yana tekshiradi va "from" ni o'zi qo'yadi. Sof qismlar (kod, manzil, xabar tekshiruvi) Node'da test qilinadi.
(function (root) {
  "use strict";

  const SERVER = "wss://kelajagim.uz"; // sahifa fayldan yoki boshqa manzildan ochilganda
  const CODE_TTL = 10 * 60 * 1000; // xona kodi 10 daqiqa amal qiladi
  const HOST_WAIT = 8000; // serverdan "kirdi"/"rad" javobini shuncha kutamiz (sekin maktab tarmog'i)
  const PING_HAR = 15000; // qurilma shuncha vaqtda bir serverga "ping" yuboradi (server "pong" qaytaradi)
  const JIMLIK = 40000; // shuncha vaqt serverdan hech narsa kelmasa — ulanish o'lgan deb yopiladi (qayta ulanadi)
  const QAYTA_KUTISH = [1000, 2000, 3000, 5000, 5000, 5000, 5000]; // qayta ulanish urinishlari orasidagi kutish (~26 s)
  const SIDES = ["left", "right"]; // chap — Oy (xonani ochgan), o'ng — Quyosh (kod bilan kirgan)
  const KINDS = ["sinov", "poyga", "savol", "tog", "tank"]; // server/app/xona_qoidalari.py bilan bir xil
  const HOST = "host";
  const MAX_ODAM = 13; // 12 o'yinchi + boshlovchi

  // ---------- Sof qismlar ----------
  // 4 xonali kod: 1000–9999 (boshida 0 bo'lmaydi — aytish va yozish oson)
  const makeCode = (rng) => String(1000 + Math.floor((rng || Math.random)() * 9000));
  const validCode = (s) => /^[1-9][0-9]{3}$/.test(String(s));
  const channelName = (kind, code) => `xona:${kind}:${code}`;

  // Oddiy qiymat: son, mantiq yoki qisqa kalit so'z. Erkin matn (gap, ism, chat) hech qachon o'tmaydi.
  // Son — chekli va aqlga sig'adigan (vaqt ms, pog'ona, foiz); Infinity/NaN/1e308 o'tmaydi
  const son = (v) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 1e13;
  const oddiy = (v) => son(v) || typeof v === "boolean" || (typeof v === "string" && /^[a-z0-9:_-]{0,32}$/i.test(v));
  // Ro'yxat ham bo'ladi: 12 o'yinchining pog'onasi kabi (har qiymati baribir oddiy)
  const qiymat = (v) => oddiy(v) || (Array.isArray(v) && v.length <= 32 && v.every(oddiy));
  const kimlik = (v) => typeof v === "string" && /^[a-z0-9:_-]{1,32}$/i.test(v);
  const MAX_KALIT = 32; // data obyektida ko'pi bilan shuncha maydon (ulkan payload o'tmasin)

  // O'yin xabari: { type, data, t, from }. types — shu o'yinda ruxsat etilgan turlar; boshqasi tashlab yuboriladi
  function validMessage(msg, types) {
    if (!msg || typeof msg !== "object") return false;
    if (!types.includes(msg.type)) return false;
    if (!kimlik(msg.from) || !son(msg.t)) return false;
    // Ma'lumot — kichik obyekt: sonlar, mantiq, qisqa kalit so'zlar va ularning ro'yxatlari
    const data = msg.data == null ? {} : msg.data;
    if (typeof data !== "object" || Array.isArray(data)) return false;
    const keys = Object.keys(data);
    if (keys.length > MAX_KALIT || !keys.every(kimlik)) return false;
    return Object.values(data).every(qiymat);
  }

  // Server faqat boshlovchiga yuboradigan ismlar (sinf xonasida kirgan bolalar): { kalit: "Ali K." }.
  // Ism o'yin paytida ko'rsatilmaydi — faqat o'yindan keyingi ro'yxatda (qaysi rangda o'ynagani bilan).
  function ismlarToza(d) {
    const out = {};
    if (!d || typeof d !== "object" || Array.isArray(d)) return out;
    for (const [k, v] of Object.entries(d).slice(0, MAX_ODAM)) {
      if (kimlik(k) && typeof v === "string" && v.length >= 1 && v.length <= 40) out[k] = v;
    }
    return out;
  }

  // Presence holatidan: kim ulangan va xona qachon ochilgan
  function roomInfo(state) {
    const sides = SIDES.filter((s) => state[s] && state[s].length);
    const host = state.left && state.left[0];
    return { sides, full: sides.length === 2, hostAt: host ? host.at : null, extra: SIDES.some((s) => state[s] && state[s].length > 1) };
  }

  // Server "odamlar" ro'yxatidan ikki kishilik xona holati (roomInfo bilan bir xil shakl)
  function juftHolat(keys, at) {
    const state = {};
    for (const k of keys) if (SIDES.includes(k)) state[k] = [{ at: k === "left" ? at : null }];
    return roomInfo(state);
  }

  // Qaysi serverga ulanamiz: sayt o'z domenida yoki lokal sinov serverida bo'lsa — o'sha server,
  // fayldan (file://) yoki LAN dan ochilganda — kelajagim.uz
  const OZIMIZ = ["kelajagim.uz", "www.kelajagim.uz", "localhost", "127.0.0.1"];
  function serverUrl(loc) {
    if (loc && /^https?:$/.test(loc.protocol) && OZIMIZ.includes(loc.hostname)) {
      return (loc.protocol === "https:" ? "wss://" : "ws://") + loc.host;
    }
    return SERVER;
  }
  // sinf — o'qituvchi xonani sinfi uchun ochsa (natija saqlanadi); server egasini cookie orqali tekshiradi
  // token — boshlovchining maxfiy belgisi (server "kirdi" da beradi): uzilib qayta ulanganda o'z o'rnini qaytarib oladi
  const xonaUrl = (base, kind, code, key, role, sinf, token) =>
    `${base}/api/ws/xona/${kind}/${code}?key=${encodeURIComponent(key)}&role=${role}` + (Number.isInteger(Number(sinf)) && Number(sinf) > 0 ? `&sinf=${Number(sinf)}` : "")
    + (token ? `&token=${encodeURIComponent(token)}` : "");

  // ---------- Server bilan aloqa ----------
  const available = () => typeof root.WebSocket === "function";
  const baza = () => serverUrl(root.location);

  // Server bilan aloqa sinovi: /api/ws/ping "pong" qaytaradi. Natija: { ok, ms } yoki { ok: false, reason }
  function ping(timeout = 8000) {
    if (!available()) return Promise.resolve({ ok: false, reason: "lib" });
    if (root.navigator && root.navigator.onLine === false) return Promise.resolve({ ok: false, reason: "offline" });
    const t0 = Date.now();
    return new Promise((resolve) => {
      let ws = null;
      let done = false;
      const fin = (r) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { if (ws) ws.close(); } catch (e) { /* e'tiborsiz */ }
        resolve(r);
      };
      const timer = setTimeout(() => fin({ ok: false, reason: "timeout" }), timeout);
      try {
        ws = new root.WebSocket(baza() + "/api/ws/ping");
      } catch (e) {
        fin({ ok: false, reason: "error" });
        return;
      }
      ws.onmessage = () => fin({ ok: true, ms: Date.now() - t0 });
      ws.onerror = () => fin({ ok: false, reason: "error" });
      ws.onclose = () => fin({ ok: false, reason: "error" });
    });
  }

  // Bitta ulanish: serverdan keladigan kirdi / rad / odamlar / msg xabarlarini h ga uzatadi.
  // h: { kirdi(), rad(sabab), odamlar(keys, at), xabar(payload), uzildi() }
  function ulan(url, h) {
    let ws;
    let yopildi = false;
    let kirdi = false;
    let timer = null;
    let pingTimer = null;
    let jimlikTimer = null;
    function yop() {
      if (yopildi) return;
      yopildi = true;
      clearTimeout(timer);
      clearInterval(pingTimer);
      clearTimeout(jimlikTimer);
      try { ws.close(); } catch (e) { /* e'tiborsiz */ }
    }
    // Serverdan har xabar qorovulni yangilaydi; uzoq jimlik — ulanish o'lgan (brauzer buni o'zi sezmasligi mumkin)
    function tirik() {
      clearTimeout(jimlikTimer);
      jimlikTimer = setTimeout(() => { if (!yopildi) { yop(); h.uzildi(); } }, JIMLIK);
    }
    try {
      ws = new root.WebSocket(url);
    } catch (e) {
      yopildi = true;
      setTimeout(() => h.uzildi(), 0);
      return { send() {}, close() {} };
    }
    timer = setTimeout(() => { if (!kirdi) { yop(); h.uzildi(); } }, HOST_WAIT);
    ws.onopen = () => {
      if (yopildi) return;
      tirik();
      pingTimer = setInterval(() => { if (!yopildi && ws.readyState === 1) ws.send(JSON.stringify({ t: "ping" })); }, PING_HAR);
    };
    ws.onmessage = (ev) => {
      if (yopildi) return;
      tirik();
      let d;
      try { d = JSON.parse(ev.data); } catch (e) { return; }
      if (!d || typeof d !== "object") return;
      if (d.t === "pong") return;
      if (d.t === "kirdi") { kirdi = true; clearTimeout(timer); h.kirdi(d); }
      else if (d.t === "rad") { yop(); h.rad(String(d.sabab)); }
      else if (d.t === "odamlar" && Array.isArray(d.keys)) h.odamlar(d.keys.filter(kimlik), son(d.at) ? d.at : null);
      else if (d.t === "msg") h.xabar(d.payload);
      else if (d.t === "ismlar" && h.ismlar) h.ismlar(ismlarToza(d.ismlar));
    };
    ws.onclose = () => {
      if (yopildi) return;
      yopildi = true;
      clearTimeout(timer);
      h.uzildi();
    };
    return {
      send(payload) {
        if (!yopildi && ws.readyState === 1) ws.send(JSON.stringify({ t: "msg", payload }));
      },
      close: yop,
    };
  }

  // Xonaga ulanish. side "left" — ochgan (Oy), "right" — kod bilan kirgan (Quyosh).
  // on: { status(s), peers(info), message(msg) }; types — ruxsat etilgan xabar turlari.
  // status: "connecting" | "waiting" | "ready" | "peer-left" | "full" | "missing" | "expired" | "error"
  function join({ kind, code, side, types, on }) {
    let closed = false;
    let wasFull = false;
    const emit = (s) => { if (!closed && on.status) on.status(s); };
    emit("connecting");
    const c = ulan(xonaUrl(baza(), kind, code, side, side), {
      kirdi() {},
      rad(sabab) { emit(["missing", "full", "expired"].includes(sabab) ? sabab : "error"); closed = true; },
      odamlar(keys, at) {
        if (closed) return;
        const info = juftHolat(keys, at);
        if (on.peers) on.peers(info);
        if (info.full) {
          wasFull = true;
          emit("ready");
        } else if (wasFull) {
          emit("peer-left");
        } else {
          emit("waiting");
        }
      },
      xabar(p) {
        // Ikki kishilik xona: faqat qarshi tomondan kelgan xabar
        if (!closed && validMessage(p, types) && SIDES.includes(p.from) && p.from !== side && on.message) on.message(p);
      },
      uzildi() { emit("error"); closed = true; },
    });
    function close() {
      if (closed) return;
      closed = true;
      c.close();
    }
    return {
      code,
      side,
      send(type, data) {
        if (closed || !types.includes(type)) return;
        c.send({ type, data: data || {}, t: Date.now() });
      },
      leave: close,
    };
  }

  // ---------- Ko'p kishilik xona (tog' o'yini, yozuv poygasi) ----------
  // Bitta boshlovchi ("host" — o'qituvchi qurilmasi) va 12 tagacha o'yinchi.
  // Boshlovchi o'yin holatini o'zi hisoblaydi va tarqatadi; o'yinchilar faqat javobini yuboradi.
  // me — o'yinchining yashirin raqami (ism emas!), role — "host" yoki "player".
  // on: { status(s), peers(ids, hostBor), message(msg), sinf(bog'landimi), ismlar({kalit: ism}) — faqat boshlovchi }; sinf — ixtiyoriy sinf id (faqat boshlovchi)
  // status: "connecting" | "ready" | "missing" | "full" | "error"
  // Aloqa uzilsa (maktab Wi-Fi, telefon uyquga ketdi) qurilma o'zi qayta ulanadi — o'sha kalit bilan, shuning uchun
  // server uni o'sha odam deb biladi; boshlovchi "token" bilan o'z o'rnini qaytaradi. Urinishlar tugasa — "error".
  // status: "connecting" | "ready" | "reconnecting" | "missing" | "full" | "error"
  function xona({ kind, code, me, role, types, on, sinf }) {
    const key = role === "host" ? HOST : me;
    const hostmi = role === "host";
    let closed = false;
    let c = null;
    let token = "";
    let urinish = 0; // ketma-ket muvaffaqiyatsiz qayta ulanishlar
    let qaytaTimer = null;
    let kirganmidik = false; // bir marta kirgan bo'lsak — uzilish vaqtinchalik deb qayta uriniladi
    const emit = (s) => { if (!closed && on.status) on.status(s); };

    function qaytaUrin(sabab) {
      if (closed) return;
      if (!kirganmidik || urinish >= QAYTA_KUTISH.length) {
        closed = true;
        emit(sabab || "error");
        return;
      }
      if (urinish === 0) emit("reconnecting");
      const kut = QAYTA_KUTISH[urinish++];
      qaytaTimer = setTimeout(ochil, kut);
    }

    function ochil() {
      if (closed) return;
      c = ulan(xonaUrl(baza(), kind, code, key, hostmi ? "host" : "player", hostmi ? sinf : null, token), {
        kirdi(d) {
          if (closed) return;
          if (hostmi && typeof d.token === "string") token = d.token;
          urinish = 0;
          kirganmidik = true;
          emit("ready");
          if (hostmi && sinf && on.sinf) on.sinf(!!d.sinf);
        },
        rad(sabab) {
          // "band" — eski ulanishimiz serverda hali yopilmagan: biroz kutib yana urinamiz; "missing" — xona yo'q (boshlovchi ketgan)
          if (sabab === "band" && hostmi && kirganmidik) qaytaUrin("error");
          else if (!kirganmidik || sabab === "missing" || sabab === "full") { closed = true; emit(["missing", "full"].includes(sabab) ? sabab : "error"); }
          else qaytaUrin("error");
        },
        odamlar(keys) {
          if (!closed && on.peers) on.peers(keys.filter((k) => k !== HOST), keys.includes(HOST));
        },
        ismlar(d) {
          if (!closed && hostmi && on.ismlar) on.ismlar(d);
        },
        xabar(p) {
          if (!closed && validMessage(p, types) && p.from !== key && on.message) on.message(p);
        },
        uzildi() { qaytaUrin("error"); },
      });
    }
    emit("connecting");
    ochil();

    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(qaytaTimer);
      if (c) c.close();
    }
    return {
      code,
      me: key,
      send(type, data) {
        if (closed || !types.includes(type) || !c) return;
        c.send({ type, data: data || {}, t: Date.now() });
      },
      leave: close,
    };
  }

  const api = { SERVER, CODE_TTL, HOST_WAIT, PING_HAR, JIMLIK, QAYTA_KUTISH, HOST, MAX_ODAM, SIDES, KINDS, xona, makeCode, validCode, channelName, validMessage, ismlarToza, roomInfo, juftHolat, serverUrl, xonaUrl, available, ping, join };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.onlayn = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
