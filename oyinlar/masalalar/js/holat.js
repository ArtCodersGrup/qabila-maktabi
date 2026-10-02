// Bolaning masalalar bo'yicha holati: har masalaning eng yaxshi foizi, yechilgani,
// ochilgan yashirin testlari va ro'yxatdagi filtr tanlovi.
// Brauzer xotirasi ishlamasa ham hammasi ishlaydi (QOIDALAR §8) — shu sessiya ichida xotirada turadi.
(function (root) {
  "use strict";

  const KEY = "masalalar:holat:v1";
  const FILTR_KEY = "masalalar:filtr:v1";
  const FILTR_MAYDONLAR = ["daraja", "teg", "qiyinlik", "holat"];

  // Brauzer xotirasi yo'q/yopiq bo'lsa (maxfiy rejim) — zaxira: sahifa yopilguncha saqlanadi
  const zaxira = {};

  function oqiKalit(kalit) {
    try {
      const raw = root.localStorage && root.localStorage.getItem(kalit);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") return data;
      }
    } catch (e) {
      // O'qilmadi — zaxiraga qaraymiz
    }
    return zaxira[kalit] || null;
  }

  function yozKalit(kalit, data) {
    zaxira[kalit] = data;
    try {
      if (root.localStorage) root.localStorage.setItem(kalit, JSON.stringify(data));
    } catch (e) {
      // Saqlanmadi — muhim emas
    }
  }

  const oqi = () => oqiKalit(KEY) || {};
  const yoz = (data) => yozKalit(KEY, data);

  const sonlar = (a) => (Array.isArray(a) ? a.filter((n) => Number.isInteger(n) && n > 0) : []);

  // ochilgan — shu masalada kirishi/javobi bolaga ko'rsatilgan yashirin test raqamlari (baho.js ga beriladi)
  const biri = (id) => {
    const d = oqi()[id];
    return d && typeof d === "object"
      ? { foiz: d.foiz || 0, yechilgan: !!d.yechilgan, urinish: d.urinish || 0, ochilgan: sonlar(d.ochilgan) }
      : { foiz: 0, yechilgan: false, urinish: 0, ochilgan: [] };
  };

  // Urinish natijasi saqlanadi: eng yaxshi foiz tushib ketmaydi, ochilgan testlar ro'yxati kamaymaydi
  function belgila(id, foiz, toliq, ochilgan) {
    const data = oqi();
    const oldin = biri(id);
    const ochiq = oldin.ochilgan.slice();
    for (const n of sonlar(ochilgan)) if (!ochiq.includes(n)) ochiq.push(n);
    data[id] = {
      foiz: Math.max(oldin.foiz, Math.max(0, Math.min(100, Math.floor(foiz || 0)))),
      yechilgan: oldin.yechilgan || !!toliq,
      urinish: oldin.urinish + 1,
      ochilgan: ochiq,
    };
    yoz(data);
    return data[id];
  }

  const hammasi = () => oqi();
  const tozala = () => yoz({});
  const yechilganlar = () => Object.keys(oqi()).filter((id) => oqi()[id] && oqi()[id].yechilgan);

  // Ro'yxatdagi filtr tanlovi (daraja, mavzu, qiyinlik, holati). Hali tanlanmagan bo'lsa — null:
  // shunda ekran standart filtrni ("Qiyinlik: 500+") qo'yadi.
  function filtrOqi() {
    const d = oqiKalit(FILTR_KEY);
    if (!d) return null;
    const out = {};
    for (const m of FILTR_MAYDONLAR) out[m] = typeof d[m] === "string" ? d[m] : "";
    return out;
  }

  function filtrYoz(f) {
    const out = {};
    for (const m of FILTR_MAYDONLAR) out[m] = String((f && f[m]) || "");
    yozKalit(FILTR_KEY, out);
    return out;
  }

  const api = { KEY, FILTR_KEY, biri, belgila, hammasi, yechilganlar, tozala, filtrOqi, filtrYoz };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.masalaHolat = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
