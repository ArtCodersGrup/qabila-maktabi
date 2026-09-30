// Masalalar ro'yxati: qidiruv, filtr va sahifalash (sof mantiq).
// Ekran bilan ishlamaydi, Node'da test qilinadi: tests/royxat.test.js
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const bank = node ? require("./bank.js") : root.QK.bank;

  const SAHIFADA = 10; // bir sahifada nechta masala (muallif talabi, 2026-10-01)

  // Bankdagi hamma masala bitta ro'yxatda: daraja belgisi bilan, qiyinlik bo'yicha tartiblangan
  function hammasi() {
    const out = [];
    bank.LEVELS.forEach((level) => {
      level.problems.forEach((p) => out.push(Object.assign({ daraja: level.id, darajaNom: level.title }, p)));
    });
    return out.sort((a, b) => (a.rating - b.rating) || ((a.tartib || 99) - (b.tartib || 99)) || (a.id < b.id ? -1 : 1));
  }

  // Filtrda ko'rinadigan tanlovlar
  const darajalar = () => bank.LEVELS.map((l) => ({ id: l.id, nom: l.title }));
  const teglar = () => {
    const bor = new Set();
    hammasi().forEach((p) => (p.tags || []).forEach((t) => bor.add(t)));
    return bank.TAGS.filter((t) => bor.has(t));
  };
  const qiyinliklar = () => [...new Set(hammasi().map((p) => p.rating))].sort((a, b) => a - b);

  // Qidiruv: nom, shart, teg va manba kodi bo'yicha (katta-kichik harf farqsiz)
  function mosKeladi(p, matn) {
    const q = String(matn || "").trim().toLowerCase();
    if (!q) return true;
    const joy = [p.title, p.what, (p.tags || []).join(" "), p.darajaNom,
      p.manba ? p.manba.kod + " " + p.manba.nom : "", String(p.rating)].join(" ").toLowerCase();
    return q.split(/\s+/).every((soz) => joy.includes(soz));
  }

  // holat: { [id]: { foiz, yechilgan } } — "yechilgan/yechilmagan" filtri uchun
  function filtr(list, f, holat) {
    const o = f || {};
    const h = holat || {};
    return list.filter((p) => {
      if (o.daraja && p.daraja !== o.daraja) return false;
      if (o.teg && !(p.tags || []).includes(o.teg)) return false;
      if (o.qiyinlik && p.rating !== Number(o.qiyinlik)) return false;
      if (o.holat === "yechilgan" && !(h[p.id] && h[p.id].yechilgan)) return false;
      if (o.holat === "yechilmagan" && h[p.id] && h[p.id].yechilgan) return false;
      return mosKeladi(p, o.qidiruv);
    });
  }

  // Sahifalash: 1-sahifadan boshlanadi, chegaradan chiqmaydi
  function sahifa(list, n, sahifada) {
    const per = sahifada || SAHIFADA;
    const jami = list.length;
    const sahifalar = Math.max(1, Math.ceil(jami / per));
    const hozir = Math.min(Math.max(1, Math.floor(n || 1)), sahifalar);
    const boshi = (hozir - 1) * per;
    return { items: list.slice(boshi, boshi + per), sahifa: hozir, sahifalar, jami, boshi };
  }

  const bittasi = (id) => hammasi().find((p) => p.id === id) || null;

  // Bank masalasidan kod.js tushunadigan vazifa: ko'rinadigan namuna + yashirin testlar
  function vazifa(p) {
    return {
      id: p.id,
      type: "kod-yoz",
      title: p.title,
      what: p.what,
      hint: p.hint,
      solution: p.solution,
      tail: p.tail || null,
      tests: [{ stdin: p.namuna.stdin, out: p.namuna.out }].concat(p.tests.map((stdin) => ({ stdin }))),
    };
  }

  const api = { SAHIFADA, hammasi, darajalar, teglar, qiyinliklar, mosKeladi, filtr, sahifa, bittasi, vazifa };

  if (node) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.masalaRoyxat = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
