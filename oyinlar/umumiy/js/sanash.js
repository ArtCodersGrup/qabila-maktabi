// Kombinatorika — sof hisob (41–45-o'yinlar uchun umumiy): ko'paytirish va qo'shish qoidasi,
// o'rin almashtirish, o'rinlashtirish, birikma, Paskal uchburchagi.
// Sonlar BigInt (20! JS number'ga sig'maydi). Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const B = (x) => (typeof x === "bigint" ? x : BigInt(x));

  // n! — BigInt. Manfiy uchun xato.
  function fakt(n) {
    const k = B(n);
    if (k < 0n) throw new RangeError("fakt: manfiy son");
    let out = 1n;
    for (let i = 2n; i <= k; i++) out *= i;
    return out;
  }

  // O'rinlashtirish: n tadan k tasi, TARTIB MUHIM. A(n,k) = n!/(n−k)!
  function A(n, k) {
    const nn = B(n);
    const kk = B(k);
    if (kk < 0n || kk > nn) return 0n;
    let out = 1n;
    for (let i = 0n; i < kk; i++) out *= nn - i;
    return out;
  }

  // Birikma: n tadan k tasi, TARTIB MUHIM EMAS. C(n,k) = A(n,k)/k!
  // Bo'lish har qadamda butun chiqadi, shuning uchun katta sonlarda ham aniq.
  function C(n, k) {
    const nn = B(n);
    let kk = B(k);
    if (kk < 0n || kk > nn) return 0n;
    if (kk > nn - kk) kk = nn - kk;
    let out = 1n;
    for (let i = 1n; i <= kk; i++) out = (out * (nn - kk + i)) / i;
    return out;
  }

  // Takrorli: a ta belgidan i uzunlikdagi so'zlar — a^i (01-o'yindagi qoida)
  const takrorli = (a, i) => B(a) ** B(i);

  // Ko'paytirish qoidasi: har qadamda nechta tanlov bo'lsa, hammasi ko'paytiriladi
  const kopaytir = (list) => list.reduce((acc, x) => acc * B(x), 1n);
  // Qo'shish qoidasi: bir-birini istisno qiladigan holatlar qo'shiladi
  const qosh = (list) => list.reduce((acc, x) => acc + B(x), 0n);

  // Hamma variantni haqiqatan yozib chiqish (formulani tekshirish uchun; kichik n da).
  // Natija — massivlar ro'yxati, leksikografik tartibda.
  function variantlar(qadamlar) {
    let out = [[]];
    for (const q of qadamlar) {
      const yangi = [];
      for (const bor of out) for (const x of q) yangi.push(bor.concat([x]));
      out = yangi;
    }
    return out;
  }

  // n ta narsaning barcha tartiblari (o'rin almashtirish)
  function tartiblar(list) {
    if (list.length <= 1) return [list.slice()];
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const qolgan = list.slice(0, i).concat(list.slice(i + 1));
      for (const t of tartiblar(qolgan)) out.push([list[i]].concat(t));
    }
    return out;
  }

  // n tadan k tasi, tartib muhim (o'rinlashtirish) — ro'yxat
  function orinlar(list, k) {
    if (k === 0) return [[]];
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const qolgan = list.slice(0, i).concat(list.slice(i + 1));
      for (const t of orinlar(qolgan, k - 1)) out.push([list[i]].concat(t));
    }
    return out;
  }

  // n tadan k tasi, tartib muhim emas (birikma) — ro'yxat, asl tartibni saqlaydi
  function tanlovlar(list, k) {
    if (k === 0) return [[]];
    if (list.length < k) return [];
    const [bosh, ...qolgan] = list;
    return tanlovlar(qolgan, k - 1).map((t) => [bosh].concat(t)).concat(tanlovlar(qolgan, k));
  }

  // Paskal uchburchagi: 0 dan n gacha qatorlar (BigInt)
  function paskal(n) {
    const out = [[1n]];
    for (let i = 1; i <= n; i++) {
      const oldin = out[i - 1];
      const qator = [1n];
      for (let j = 1; j < i; j++) qator.push(oldin[j - 1] + oldin[j]);
      qator.push(1n);
      out.push(qator);
    }
    return out;
  }

  // Dirixle: n ta narsa k ta qutiga joylansa, eng to'la qutida kamida nechta bo'ladi
  const dirixle = (n, k) => (k <= 0 ? 0 : Math.ceil(n / k));

  // Katta sonni o'qishli yozish: 3 628 800
  const chiroyli = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const api = { fakt, A, C, takrorli, kopaytir, qosh, variantlar, tartiblar, orinlar, tanlovlar, paskal, dirixle, chiroyli };

  root.QK = root.QK || {};
  root.QK.sanash = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
