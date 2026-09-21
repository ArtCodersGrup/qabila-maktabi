// Tangalar bozori — topshiriqlar: 2-lik, 3–8-lik va 16-lik sonni o'nlikka o'tkazish, yoyib yozish matni.
// Umumiy hisob — umumiy/js/sanoq.js. Node'da test qilinadi.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const S = node ? require("../../umumiy/js/sanoq.js") : root.QK.sanoq;

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const same = (a, b) => !!a && a.number === b.number && a.base === b.base;

  function make(prev, rng, gen) {
    rng = rng || Math.random;
    for (;;) {
      const { base, value } = gen(rng);
      const task = { base, number: S.toBase(value, base), answer: value };
      if (!same(prev, task)) return task;
    }
  }

  // 1-bosqich: 4–8 xonali ikkilik son (8 … 255)
  const makeBinTask = (prev, rng) => make(prev, rng, (r) => ({ base: 2, value: randInt(8, 255, r) }));

  // 2-bosqich: 3–8-lik, 2–3 xonali son (≤ 255)
  const makeMidTask = (prev, rng) => make(prev, rng, (r) => {
    const base = pick([3, 4, 5, 6, 7, 8], r);
    return { base, value: randInt(base, Math.min(255, base ** 3 - 1), r) };
  });

  // 3-bosqich: 2 xonali 16-lik son; 80% hollarda harfli
  const makeHexTask = (prev, rng) => make(prev, rng, (r) => {
    for (;;) {
      const value = randInt(16, 255, r);
      const letter = /[A-F]/.test(S.toBase(value, 16));
      if (letter || r() < 0.2) return { base: 16, value };
    }
  });

  // "1·8 + 0·4 + 1·2 + 1·1" (harflar songa aylantiriladi)
  const expandText = (number, base) => S.expand(number, base).map((d) => `${d.value}·${d.place}`).join(" + ");

  // Ikkilik uchun: faqat 1 turgan xonalar — "128 + 32 + 4 + 1 = 165"
  const sumText = (number, base) => {
    const parts = S.expand(number, base).filter((d) => d.value).map((d) => d.value * d.place);
    return `${parts.join(" + ")} = ${S.fromBase(number, base)}`;
  };

  const api = { makeBinTask, makeMidTask, makeHexTask, expandText, sumText };

  if (node) module.exports = api;
  else root.QK.bozor = api;
})(typeof window !== "undefined" ? window : globalThis);
