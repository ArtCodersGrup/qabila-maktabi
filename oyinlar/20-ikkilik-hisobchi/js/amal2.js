// Ikkilik hisobchi — topshiriqlar: ikkilikda qo'shish, ayirish (ko'pincha qarzli), surish va ko'paytirish.
// Umumiy hisob — umumiy/js/sanoq.js. Node'da test qilinadi.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const S = node ? require("../../umumiy/js/sanoq.js") : root.QK.sanoq;

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const bin = (n) => S.toBase(n, 2);

  function loop(prev, rng, gen) {
    rng = rng || Math.random;
    for (;;) {
      const task = gen(rng);
      if (task && !(prev && JSON.stringify(prev) === JSON.stringify(task))) return task;
    }
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): chegaralar tier 0 / 1 / 2 bo'yicha
  const ADD = [{ x: [3, 31], y: [2, 31] }, { x: [16, 63], y: [16, 63] }, { x: [32, 127], y: [32, 127] }]; // 1-bosqich
  const SUB = [[5, 31], [16, 63], [32, 127]]; // 2-bosqich: kamayuvchi
  const SHIFT = [3, 3, 4]; // 3-bosqich: eng ko'pi bilan nechta nol (× 10₂ … × 10000₂)
  const MULT = [[3, 5, 6, 7], [5, 6, 7, 9, 10], [9, 10, 11, 12, 13]]; // 3-bosqich: ko'paytuvchi

  // 1-bosqich: ikki sonni qo'shish (tier 0 — 3–5 xona, tier 2 — 6–7 xona, natija ≤ 8 xona)
  const makeAddTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    const lim = ADD[tier || 0];
    const x = randInt(lim.x[0], lim.x[1], r);
    const y = randInt(lim.y[0], lim.y[1], r);
    return { a: bin(x), b: bin(y), answer: bin(x + y) };
  });

  const borrows = (x, y) => S.subColumns(bin(x), bin(y), 2).cols.filter((c) => c.borrowOut).length;

  // 2-bosqich: a > b; tier 0 — 85% hollarda kamida bitta qarz; tier 1 — albatta qarz; tier 2 — kamida ikkita qarz
  const makeSubTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    tier = tier || 0;
    const x = randInt(SUB[tier][0], SUB[tier][1], r);
    const y = randInt(tier ? 3 : 1, x - 1, r);
    const n = borrows(x, y);
    if (tier === 0 ? !n && r() < 0.85 : n < tier) return null;
    return { a: bin(x), b: bin(y), answer: bin(x - y) };
  });

  // 3-bosqich: × 10₂ … × 10000₂ (surish) yoki ko'paytirish; natija ≤ 8 xona.
  // Ko'paytuvchi: tier 0 — 11, 101, 110, 111; tier 1 — 1001, 1010 ham; tier 2 — 1001 … 1101 (4 xonali)
  const makeMulTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    tier = tier || 0;
    if (r() < (tier === 2 ? 0.2 : 0.4)) {
      const x = randInt(tier === 2 ? 5 : 2, 15, r);
      const k = randInt(tier === 2 ? 2 : 1, SHIFT[tier], r);
      return { type: "shift", a: bin(x), b: "1" + "0".repeat(k), answer: bin(x * 2 ** k) };
    }
    const y = pick(MULT[tier], r);
    const x = randInt(tier === 2 ? 5 : 3, Math.min(15, Math.floor(255 / y)), r);
    return { type: "mul", a: bin(x), b: bin(y), answer: bin(x * y) };
  });

  const api = { ADD, SUB, SHIFT, MULT, makeAddTask, makeSubTask, makeMulTask };

  if (node) module.exports = api;
  else root.QK.amal2 = api;
})(typeof window !== "undefined" ? window : globalThis);
