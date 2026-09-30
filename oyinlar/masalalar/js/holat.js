// Bolaning masalalar bo'yicha holati: har masalaning eng yaxshi foizi va yechilgani.
// Brauzer xotirasi ishlamasa ham hammasi ishlaydi (QOIDALAR §8).
(function (root) {
  "use strict";

  const KEY = "masalalar:holat:v1";

  function oqi() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === "object" ? data : {};
    } catch (e) {
      return {};
    }
  }

  function yoz(data) {
    try {
      if (root.localStorage) root.localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      // Saqlanmadi — muhim emas
    }
  }

  const biri = (id) => {
    const d = oqi()[id];
    return d && typeof d === "object" ? { foiz: d.foiz || 0, yechilgan: !!d.yechilgan, urinish: d.urinish || 0 }
      : { foiz: 0, yechilgan: false, urinish: 0 };
  };

  // Urinish natijasi saqlanadi: eng yaxshi foiz tushib ketmaydi
  function belgila(id, foiz, toliq) {
    const data = oqi();
    const oldin = biri(id);
    data[id] = {
      foiz: Math.max(oldin.foiz, Math.max(0, Math.min(100, Math.floor(foiz || 0)))),
      yechilgan: oldin.yechilgan || !!toliq,
      urinish: oldin.urinish + 1,
    };
    yoz(data);
    return data[id];
  }

  const hammasi = () => oqi();
  const tozala = () => yoz({});
  const yechilganlar = () => Object.keys(oqi()).filter((id) => oqi()[id] && oqi()[id].yechilgan);

  const api = { KEY, biri, belgila, hammasi, yechilganlar, tozala };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.masalaHolat = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
