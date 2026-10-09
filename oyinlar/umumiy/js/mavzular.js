// Savol mavzulari va bosh sahifa bo'limlari o'rtasidagi bog'lanish (sof funksiyalar, Node'da test qilinadi).
// 1) Tog'da bola o'zi o'ynasa, mavzu faqat unga mos bo'lim(lar)ni o'qib tugatgandan keyin ochiladi
//    (bo'limdagi tanlangan toifaga mos HAMMA o'yinning HAMMA bosqichi). O'qituvchi xonasida qulf yo'q.
// 2) Har javob mavzu bo'yicha sanaladi (STAT kaliti, akkauntga sinxronlanadi): zaif mavzu — maslahat.
(function (root) {
  "use strict";

  const STAT = "tog:mavzular:v1"; // { mavzu: { t: to'g'ri, x: xato } }
  const ZAIF_MIN = 5; // shundan kam javobli mavzu baholanmaydi
  const ZAIF_ULUSH = 0.4; // xatolar ulushi shundan ko'p bo'lsa — zaif

  // Savol mavzusi → bosh sahifa bo'limlari (bosh/js/bosh.js dagi SECTIONS id lari)
  const BOLIMLAR = {
    kod: ["kod"],
    ikkilik: ["ikkilik"],
    olchov: ["olchov"],
    sanoq: ["ikkilik"], // sanoq tizimlari o'yinlari «Sonlar va ikkilik kod» bo'limida
    ai: ["ai", "ai2"],
    klaviatura: ["klaviatura"],
    mantiq: ["mantiq"],
    tanishuv: ["tanishuv"],
    dastur: ["dastur"],
    internet: ["internet"],
    xavfsizlik: ["xavfsizlik"],
    python: ["python"],
    algoritm: ["algoritm"],
    kombinatorika: ["kombinatorika"],
    cpp: ["cpp"],
  };

  const bolimlari = (mavzu) => BOLIMLAR[mavzu] || [];

  // Mavzu ochiqmi. katalog: { GAMES, SECTIONS, mos(game, toifa) }, toifa — { id }, tugadimi(game) → bool.
  // Natija: { holat: "ochiq" | "yopiq" | "yoq", bolimlar: [{ id, title, tugagan, jami }] }.
  // "yoq" — bu toifada mavzuning bo'limida birorta o'yin yo'q (mashqda ko'rsatilmaydi).
  function holat(mavzu, katalog, toifa, tugadimi) {
    const bolimlar = [];
    for (const id of bolimlari(mavzu)) {
      const sec = katalog.SECTIONS.find((s) => s.id === id);
      const oyinlar = katalog.GAMES.filter((g) => g.topic === id && katalog.mos(g, toifa));
      if (!sec || !oyinlar.length) continue;
      bolimlar.push({ id, title: sec.title, tugagan: oyinlar.filter(tugadimi).length, jami: oyinlar.length });
    }
    if (!bolimlar.length) return { holat: "yoq", bolimlar };
    return { holat: bolimlar.every((b) => b.tugagan === b.jami) ? "ochiq" : "yopiq", bolimlar };
  }

  // Yopiq mavzu uchun bolaga matn
  function sabab(h) {
    const qolgan = h.bolimlar.filter((b) => b.tugagan < b.jami);
    const nomlar = qolgan.map((b) => `«${b.title}» (${b.tugagan}/${b.jami} oʻyin)`);
    return `Bu mavzuni qoʻshish uchun ${nomlar.join(" va ")} boʻlimini oʻqib tugat.`;
  }

  // ---------- Statistika ----------
  const butun = (v) => Number.isInteger(v) && v >= 0 && v <= 1e6;
  function tozala(stat) {
    const out = {};
    if (!stat || typeof stat !== "object" || Array.isArray(stat)) return out;
    for (const [k, v] of Object.entries(stat)) {
      if (!/^[a-z0-9_-]{1,32}$/.test(k) || !v || typeof v !== "object") continue;
      const t = butun(v.t) ? v.t : 0;
      const x = butun(v.x) ? v.x : 0;
      if (t || x) out[k] = { t, x };
    }
    return out;
  }

  function qosh(stat, mavzu, ok) {
    const s = tozala(stat);
    if (!/^[a-z0-9_-]{1,32}$/.test(String(mavzu))) return s;
    const v = s[mavzu] || { t: 0, x: 0 };
    if (ok) v.t++;
    else v.x++;
    s[mavzu] = v;
    return s;
  }

  const zaifmi = (v) => !!v && v.t + v.x >= ZAIF_MIN && v.x / (v.t + v.x) > ZAIF_ULUSH;

  // Mavzular jadvali: ko'p xato ulushi tepada. topics — [{ id, title }] (savollar TOPICS)
  function jadval(stat, topics) {
    const s = tozala(stat);
    return Object.entries(s).map(([id, v]) => {
      const t = (topics || []).find((x) => x.id === id);
      return { id, title: t ? t.title : id, t: v.t, x: v.x, jami: v.t + v.x, foiz: Math.round((100 * v.x) / (v.t + v.x)), zaif: zaifmi(v) };
    }).sort((a, b) => (b.zaif - a.zaif) || (b.foiz - a.foiz) || (b.jami - a.jami));
  }

  // Bir nechta statistikani qo'shish (sinf bo'yicha jami)
  function yigindi(list) {
    const out = {};
    for (const st of list) {
      for (const [k, v] of Object.entries(tozala(st))) {
        const o = out[k] || (out[k] = { t: 0, x: 0 });
        o.t += v.t;
        o.x += v.x;
      }
    }
    return out;
  }

  const api = { STAT, ZAIF_MIN, ZAIF_ULUSH, BOLIMLAR, bolimlari, holat, sabab, tozala, qosh, zaifmi, jadval, yigindi };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.mavzular = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
