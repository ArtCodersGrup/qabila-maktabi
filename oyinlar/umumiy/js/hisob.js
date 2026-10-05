// Akkaunt qatlami: serverdagi /api/hisob va /api/admin bilan ishlash. Faqat sayt o'z serverida ochilganda
// (kelajagim.uz yoki lokal sinov serveri) ishlaydi; fayldan ochilganda akkaunt yo'q — o'yinlar baribir ishlaydi.
// Brauzerda faqat ism va rol eslab qolinadi (bosh sahifada darhol ko'rsatish uchun); sessiya — httpOnly cookie'da.
(function (root) {
  "use strict";

  const XOTIRA = "qabila:hisob:v1";
  const OZIMIZ = ["kelajagim.uz", "www.kelajagim.uz", "localhost", "127.0.0.1"];
  const ROLLAR = { student: "Oʻquvchi", teacher: "Oʻqituvchi", admin: "Admin" };

  const mumkin = (loc) => !!loc && /^https?:$/.test(loc.protocol) && OZIMIZ.includes(loc.hostname);

  async function sorov(yol, body) {
    const opt = { method: body === undefined ? "GET" : "POST", credentials: "same-origin", headers: {} };
    if (body !== undefined) {
      opt.headers["Content-Type"] = "application/json";
      opt.body = JSON.stringify(body);
    }
    let r;
    try {
      r = await root.fetch(yol, opt);
    } catch (e) {
      return { ok: false, holat: 0, xato: "tarmoq" };
    }
    let d = {};
    try { d = await r.json(); } catch (e) { /* bo'sh javob */ }
    if (r.ok) return Object.assign({ ok: true }, d);
    return { ok: false, holat: r.status, xato: (d && typeof d.detail === "string" && d.detail) || "xato" };
  }

  function eslab(user) {
    try {
      if (user) root.localStorage.setItem(XOTIRA, JSON.stringify({ ism: user.ism || "", rol: user.rol }));
      else root.localStorage.removeItem(XOTIRA);
    } catch (e) { /* maxfiy rejim */ }
  }

  function saqlangan() {
    try {
      const d = JSON.parse(root.localStorage.getItem(XOTIRA) || "null");
      return d && typeof d.rol === "string" && typeof d.ism === "string" ? d : null;
    } catch (e) {
      return null;
    }
  }

  // Foydalanuvchi qaytaradigan so'rovlar: javobdagi user eslab qolinadi
  async function userli(yol, body) {
    const r = await sorov(yol, body);
    if (r.ok && r.user) eslab(r.user);
    else if (r.holat === 401) eslab(null);
    return r;
  }

  const EGASI = "qabila:egasi:v1"; // bu qurilmadagi progress kimniki (user id)
  const NAVBAT = "qabila:navbat:v1";
  const MAXSUS = ["masalalar:holat:v1", "on-barmoq:rekord"];

  // localStorage dagi progress kalitlari: bosqichli o'yinlar (done bor va bo'sh emas), masalalar, o'n barmoq rekordi
  function progressKalitlari(store) {
    const out = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (!k || k.startsWith("qabila:")) continue;
      if (MAXSUS.includes(k)) { out.push(k); continue; }
      if (!/^[a-z0-9-]{1,40}:v\d{1,3}$/.test(k)) continue;
      try {
        const v = JSON.parse(store.getItem(k));
        if (v && Array.isArray(v.done) && v.done.length > 0) out.push(k);
      } catch (e) { /* buzuq */ }
    }
    return out;
  }

  function egasi() {
    try {
      const n = Number(root.localStorage.getItem(EGASI));
      return Number.isInteger(n) && n > 0 ? n : null;
    } catch (e) {
      return null;
    }
  }

  // Qurilmada kimgadir tegishli bo'lmagan (mehmon) progress bormi
  function mehmonBor() {
    try {
      return egasi() === null && progressKalitlari(root.localStorage).length > 0;
    } catch (e) {
      return false;
    }
  }

  // To'liq sinxron: mahalliy progressni yuboradi, serverdan birlashtirilganini oladi va yozadi
  async function sinxron(userId) {
    let ls;
    try { ls = root.localStorage; } catch (e) { return { ok: false, xato: "xotira" }; }
    const kalitlar = {};
    for (const k of progressKalitlari(ls)) {
      try {
        const v = JSON.parse(ls.getItem(k));
        if (v && typeof v === "object" && !Array.isArray(v)) delete v.muted;
        kalitlar[k] = v;
      } catch (e) { /* buzuq */ }
    }
    const r = await sorov("/api/progress", { kalitlar });
    if (!r.ok) return r;
    for (const [k, v] of Object.entries(r.kalitlar || {})) {
      try {
        let yoz = v;
        if (v && typeof v === "object" && Array.isArray(v.done)) {
          // ovoz tanlovi faqat shu qurilmaniki — saqlanib qoladi
          let muted = false;
          try { muted = !!(JSON.parse(ls.getItem(k)) || {}).muted; } catch (e) { /* yo'q */ }
          yoz = Object.assign({}, v, { muted });
        }
        ls.setItem(k, JSON.stringify(yoz));
      } catch (e) { /* joy yo'q */ }
    }
    try {
      ls.setItem(EGASI, String(userId));
      ls.removeItem(NAVBAT);
    } catch (e) { /* e'tiborsiz */ }
    return { ok: true };
  }

  // Chiqishda: bu qurilmadagi progress keyingi bolaga o'tib ketmasin
  function tozala() {
    try {
      const ls = root.localStorage;
      for (const k of progressKalitlari(ls)) ls.removeItem(k);
      ls.removeItem(EGASI);
      ls.removeItem(NAVBAT);
    } catch (e) { /* e'tiborsiz */ }
  }

  const api = {
    XOTIRA,
    ROLLAR,
    mumkin,
    saqlangan,
    men: () => userli("/api/hisob/men"),
    sozlama: () => sorov("/api/hisob/sozlama"),
    kirish: (login, parol) => userli("/api/hisob/kirish", { login, parol }),
    async chiqish() {
      const r = await sorov("/api/hisob/chiqish", {});
      if (r.ok) { eslab(null); tozala(); }
      return r;
    },
    parol: (eski, yangi) => userli("/api/hisob/parol", { eski, yangi }),
    profil: (ism) => userli("/api/hisob/profil", { ism }),
    oqituvchiman: () => userli("/api/hisob/oqituvchi-sorov", {}),
    progressKalitlari,
    egasi,
    mehmonBor,
    sinxron,
    tozala,
    sinf: {
      royxat: () => sorov("/api/sinflar"),
      yarat: (nom) => sorov("/api/sinflar", { nom }),
      olish: (id) => sorov("/api/sinflar/" + Number(id)),
      qosh: (id, ismlar) => sorov("/api/sinflar/" + Number(id) + "/oquvchilar", { ismlar }),
      parol: (id, uid) => sorov("/api/sinflar/" + Number(id) + "/oquvchilar/" + Number(uid) + "/parol", {}),
      qaror: (id, uid, qaror) => sorov("/api/sinflar/" + Number(id) + "/sorovlar/" + Number(uid), { qaror }),
      chiqar: (id, uid) => sorov("/api/sinflar/" + Number(id) + "/chiqar/" + Number(uid), {}),
      progress: (id) => sorov("/api/sinflar/" + Number(id) + "/progress"),
      qoshil: (kod) => sorov("/api/sinflar/qoshil", { kod }),
      meniki: () => sorov("/api/sinflar/meniki"),
    },
    admin: {
      sorovlar: () => sorov("/api/admin/sorovlar"),
      qaror: (id, qaror) => sorov("/api/admin/sorov/" + Number(id), { qaror }),
      statistika: () => sorov("/api/admin/statistika"),
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.hisob = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
