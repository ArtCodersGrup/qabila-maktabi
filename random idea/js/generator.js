// Tasodifiy tanlov va jumla yasash. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // data.js: Node'da require, brauzerda index.html script tartibi orqali oldindan yuklanadi.
  const D = typeof module !== "undefined" && module.exports ? require("./data.js") : root.QK.data;

  // Ro'yxatdan `prev`dan farqli element tanlaydi (list.length > 1 bo'lsa).
  // `rng` — 0 (kirituvchi) dan 1 (kirituvchimas) gacha son qaytaruvchi funksiya (test uchun almashtiriladi).
  function pickFrom(list, prev, rng) {
    const pool = list.length > 1 ? list.filter((x) => x !== prev) : list;
    const idx = Math.floor(rng() * pool.length);
    return pool[idx];
  }

  function pickService(prev, rng) {
    return pickFrom(D.SERVICES, prev, rng);
  }

  function pickCompany(prev, rng) {
    return pickFrom(D.COMPANIES, prev, rng);
  }

  function buildSentence(company, service) {
    return `${company} uchun ${service} qilish`;
  }

  const api = { pickFrom, pickService, pickCompany, buildSentence };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.generator = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
