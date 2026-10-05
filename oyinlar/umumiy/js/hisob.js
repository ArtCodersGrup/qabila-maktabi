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
      if (r.ok) eslab(null);
      return r;
    },
    parol: (eski, yangi) => userli("/api/hisob/parol", { eski, yangi }),
    profil: (ism) => userli("/api/hisob/profil", { ism }),
    oqituvchiman: () => userli("/api/hisob/oqituvchi-sorov", {}),
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
