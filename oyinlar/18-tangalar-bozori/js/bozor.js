// Tangalar bozori — topshiriqlar: 2-lik, 3–8-lik va 16-lik sonni o'nlikka o'tkazish, yoyib yozish matni.
// Umumiy hisob — umumiy/js/sanoq.js. Node'da test qilinadi.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const S = node ? require("../../umumiy/js/sanoq.js") : root.QK.sanoq;

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const same = (a, b) => !!a && a.number === b.number && a.base === b.base;

  function make(prev, rng, tier, gen) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const { base, value } = gen(rng, tier);
      const task = { base, number: S.toBase(value, base), answer: value, tier };
      if (!same(prev, task)) return task;
    }
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): chegaralar tier 0 / 1 / 2 bo'yicha
  const BIN = [[8, 63], [64, 255], [256, 1023]]; // 1-bosqich: 4–6, 7–8 va 9–10 xonali ikkilik son
  const HEX = [[16, 255], [160, 255], [256, 511]]; // 3-bosqich: 2 xonali; birinchi raqami ham harf; 3 xonali

  // 1-bosqich: ikkilik son → o'nlik
  const makeBinTask = (prev, rng, tier) => make(prev, rng, tier, (r, t) => ({ base: 2, value: randInt(BIN[t][0], BIN[t][1], r) }));

  // 2-bosqich: 3–8-lik son. tier 0 — 2–3 xonali (≤ 255); tier 1 — faqat 3 xonali; tier 2 — 4 xonali (≤ 999)
  const makeMidTask = (prev, rng, tier) => make(prev, rng, tier, (r, t) => {
    const base = pick([3, 4, 5, 6, 7, 8], r);
    if (t === 2) return { base, value: randInt(base ** 3, Math.min(999, base ** 4 - 1), r) };
    return { base, value: randInt(t === 1 ? base ** 2 : base, Math.min(255, base ** 3 - 1), r) };
  });

  // 3-bosqich: 16-lik son; tier 0 da 80% hollarda harfli, tier 1 da birinchi raqam ham harf (A0…FF), tier 2 — 3 xonali
  const makeHexTask = (prev, rng, tier) => make(prev, rng, tier, (r, t) => {
    for (;;) {
      const value = randInt(HEX[t][0], HEX[t][1], r);
      const letter = /[A-F]/.test(S.toBase(value, 16));
      if (letter || (t === 0 && r() < 0.2)) return { base: 16, value };
    }
  });

  // "1·8 + 0·4 + 1·2 + 1·1" (harflar songa aylantiriladi)
  const expandText = (number, base) => S.expand(number, base).map((d) => `${d.value}·${d.place}`).join(" + ");

  // Ikkilik uchun: faqat 1 turgan xonalar — "128 + 32 + 4 + 1 = 165"
  const sumText = (number, base) => {
    const parts = S.expand(number, base).filter((d) => d.value).map((d) => d.value * d.place);
    return `${parts.join(" + ")} = ${S.fromBase(number, base)}`;
  };

  const api = { BIN, HEX, makeBinTask, makeMidTask, makeHexTask, expandText, sumText };

  if (node) module.exports = api;
  else root.QK.bozor = api;
})(typeof window !== "undefined" ? window : globalThis);
