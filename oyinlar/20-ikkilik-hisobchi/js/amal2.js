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

  // 1-bosqich: 2–31 oralig'idagi ikki son (3–5 xona)
  const makeAddTask = (prev, rng) => loop(prev, rng, (r) => {
    const x = randInt(3, 31, r);
    const y = randInt(2, 31, r);
    return { a: bin(x), b: bin(y), answer: bin(x + y) };
  });

  // 2-bosqich: a > b; 85% hollarda kamida bitta qarz bo'lsin
  const makeSubTask = (prev, rng) => loop(prev, rng, (r) => {
    const x = randInt(5, 31, r);
    const y = randInt(1, x - 1, r);
    const borrow = S.subColumns(bin(x), bin(y), 2).cols.some((c) => c.borrowOut);
    if (!borrow && r() < 0.85) return null;
    return { a: bin(x), b: bin(y), answer: bin(x - y) };
  });

  // 3-bosqich: × 10₂ / 100₂ / 1000₂ yoki × 11, 101, 110, 111 (natija ≤ 8 xona)
  const makeMulTask = (prev, rng) => loop(prev, rng, (r) => {
    if (r() < 0.4) {
      const x = randInt(2, 15, r);
      const k = randInt(1, 3, r);
      return { type: "shift", a: bin(x), b: "1" + "0".repeat(k), answer: bin(x * 2 ** k) };
    }
    const y = pick([3, 5, 6, 7], r);
    const x = randInt(3, Math.min(15, Math.floor(255 / y)), r);
    return { type: "mul", a: bin(x), b: bin(y), answer: bin(x * y) };
  });

  const api = { makeAddTask, makeSubTask, makeMulTask };

  if (node) module.exports = api;
  else root.QK.amal2 = api;
})(typeof window !== "undefined" ? window : globalThis);
