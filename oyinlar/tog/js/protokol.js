// Tog'ning onlayn xonasi: qurilmalar o'rtasida nima yuboriladi.
// Qoida: erkin matn (ism, chat, savol matni) tarmoqqa CHIQMAYDI — faqat sonlar, 0/1 va qisqa kalit so'zlar.
// Savollar har qurilmada o'zida hosil qilinadi (kod hammada bor), tarmoqqa faqat "to'g'ri/xato" ketadi.
// Boshlovchi (o'qituvchi qurilmasi) holatni o'zi hisoblaydi va tarqatadi.
(function (root) {
  "use strict";

  const T = typeof module !== "undefined" && module.exports ? require("./tog.js") : root.QK.tog;

  const TYPES = ["lobbi", "holat", "kirdi", "javob"];
  const MIN_JAVOB = 1200; // shundan tez kelgan javob hisobga olinmaydi (tasodifan bosish yoki aldash)
  const HOST_JIM = 20000; // boshlovchidan shuncha vaqt xabar kelmasa — u uzilgan (DIZAYN 9.4)
  const SABABLAR = ["chogqi", "uzib-ketdi", "vaqt", "toxtatildi"];

  // O'yinchining yashirin raqami: ism emas, faqat shu qurilmani tanish uchun (uzilib qolsa — o'sha joyidan davom etadi)
  function kimlik(rng) {
    const r = rng || Math.random;
    let s = "";
    for (let k = 0; k < 6; k++) s += "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(r() * 31)];
    return s;
  }

  // ---------- Boshlovchi → hamma ----------
  // Lobbi: kim kirdi va qaysi qahramonni tanladi
  const lobbi = (odamlar) => ({ ids: odamlar.map((o) => o.id), qah: odamlar.map((o) => o.qahramon) });

  // Holat: reyting tartibida (birinchi — yetakchi). Vaqtlar nisbiy — qurilmalar soati har xil bo'ladi.
  function paket(s, now) {
    const r = T.reyting(s);
    return {
      tog: s.tog,
      mav: s.mavzular || [],
      ids: r.map((p) => p.id),
      qah: r.map((p) => p.qahramon),
      pog: r.map((p) => p.pogona),
      chiq: r.map((p) => (p.chiqdi ? 1 : 0)),
      pauza: r.map((p) => Math.max(0, Math.ceil((p.pauzaGacha - now) / 1000))),
      tgr: r.map((p) => p.togri),
      xat: r.map((p) => p.xato),
      qoldi: Math.max(0, Math.ceil((s.tugaydi - now) / 1000)),
      tugadi: s.tugadi ? 1 : 0,
      golib: s.golib || "",
      sabab: s.sabab || "",
    };
  }

  // Paket to'g'rimi: uzunliklari teng, sonlari son, ro'yxat 12 kishidan oshmagan
  function yaxshiPaket(p) {
    if (!p || typeof p !== "object" || !Array.isArray(p.ids)) return false;
    if (!p.ids.length || p.ids.length > T.MAX_PLAYERS) return false;
    const n = p.ids.length;
    const royxat = ["qah", "pog", "chiq", "pauza", "tgr", "xat"];
    if (!royxat.every((k) => Array.isArray(p[k]) && p[k].length === n)) return false;
    if (!["pog", "chiq", "pauza", "tgr", "xat"].every((k) => p[k].every((v) => typeof v === "number" && v >= 0 && v < 100000))) return false;
    if (typeof p.qoldi !== "number" || p.qoldi < 0) return false;
    if (p.sabab && !SABABLAR.includes(p.sabab)) return false;
    if (p.mav && (!Array.isArray(p.mav) || p.mav.length > 16 || !p.mav.every((v) => typeof v === "string"))) return false;
    return !!T.TOGLAR.find((t) => t.id === p.tog);
  }

  // ---------- Paketdan ekran uchun holat ----------
  // T.reyting tartibni qayta hisoblaydi, shuning uchun har kimning o'rni "vaqtlar" ichiga yoziladi:
  // bir xil pog'onada turganlar boshlovchidagi tartibda qoladi. O'rin 1 dan boshlanadi —
  // tog.js da "vaqtlar[pogona] || Infinity" turibdi, 0 bo'lsa o'yinchi eng oxirga tushib ketardi.
  function holat(p, now) {
    const t = T.togById(p.tog);
    const s = {
      tog: t.id,
      mavzular: Array.isArray(p.mav) && p.mav.length ? p.mav.slice() : null,
      pogona: t.pogona,
      chegara: t.chegara,
      boshlanish: 0.5,
      tugaydi: now + p.qoldi * 1000,
      oyinchilar: {},
      tartib: p.ids.slice(),
      tugadi: !!p.tugadi,
      golib: p.golib || null,
      sabab: p.sabab || null,
    };
    p.ids.forEach((id, k) => {
      s.oyinchilar[id] = {
        id,
        qahramon: p.qah[k],
        pogona: p.pog[k],
        chiqdi: !!p.chiq[k],
        pauzaGacha: p.pauza[k] ? now + p.pauza[k] * 1000 : 0,
        xatoKetma: 0,
        togri: p.tgr[k],
        xato: p.xat[k],
        oxirgi: now,
        vaqtlar: { [p.pog[k]]: k + 1 },
      };
    });
    return s;
  }

  // ---------- O'yinchi → boshlovchi ----------
  // Boshlovchi javobni qabul qiladimi: o'yinchi bor, juda tez bosmadi, pauzada emas
  function qabul(s, id, ok, now) {
    const p = s.oyinchilar[id];
    if (!p || now - p.oxirgi < MIN_JAVOB) return false;
    return !!T.javob(s, id, !!ok, now);
  }

  // Bo'sh qahramonlar: bitta qahramon bitta bolaga (DIZAYN 2.7)
  const bosh = (band) => T.QAHRAMONLAR.filter((q) => !band.includes(q.id));

  const api = { TYPES, MIN_JAVOB, HOST_JIM, SABABLAR, kimlik, lobbi, paket, yaxshiPaket, holat, qabul, bosh };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.togProtokol = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
