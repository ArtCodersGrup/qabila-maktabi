// Sayyoralar sanog'i — topshiriqlar: 3–9-lik tizimda qo'shish, ayirish (ko'pincha ko'chish/qarz bilan),
// bir xonali songa ko'paytirish va "qaysi tizimda a + b = 1c?" jumbog'i. Node'da test qilinadi.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const S = node ? require("../../umumiy/js/sanoq.js") : root.QK.sanoq;

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));

  function loop(prev, rng, gen) {
    rng = rng || Math.random;
    for (;;) {
      const task = gen(rng);
      if (task && !(prev && JSON.stringify(prev) === JSON.stringify(task))) return task;
    }
  }

  // 2–3 xonali n-lik sonning qiymati
  const value = (base, r) => randInt(base, Math.min(base ** 3 - 1, 200), r);

  // 1-bosqich: 90% hollarda kamida bitta ko'chish
  const makeAddTask = (prev, rng) => loop(prev, rng, (r) => {
    const base = randInt(3, 9, r);
    const a = S.toBase(value(base, r), base);
    const b = S.toBase(value(base, r), base);
    if (!S.addColumns(a, b, base).cols.some((c) => c.carryOut) && r() < 0.9) return null;
    return { base, a, b, answer: S.toBase(S.fromBase(a, base) + S.fromBase(b, base), base) };
  });

  // 2-bosqich: a > b, 90% hollarda kamida bitta qarz
  const makeSubTask = (prev, rng) => loop(prev, rng, (r) => {
    const base = randInt(3, 9, r);
    const x = value(base, r);
    if (x - 1 < base) return null; // b ham kamida 2 xonali va a dan kichik bo'lsin
    const y = randInt(base, x - 1, r);
    const a = S.toBase(x, base);
    const b = S.toBase(y, base);
    if (!S.subColumns(a, b, base).cols.some((c) => c.borrowOut) && r() < 0.9) return null;
    return { base, a, b, answer: S.toBase(x - y, base) };
  });

  // 3-bosqich: ko'paytirish (2 xonali × bir xonali) yoki jumboq
  const makeStage3Task = (prev, rng) => loop(prev, rng, (r) => {
    const base = randInt(4, 9, r);
    if (r() < 0.6) {
      const a = S.toBase(randInt(base, base * base - 1, r), base);
      const d = randInt(2, base - 1, r);
      return { type: "mul", base, a, d, answer: S.toBase(S.fromBase(a, base) * d, base) };
    }
    // x + y = 1c (base-lik): x, y < base, x + y ≥ base
    const x = randInt(2, base - 1, r);
    const y = randInt(Math.max(base - x, 1), base - 1, r);
    return { type: "puzzle", x, y, c: x + y - base, answer: base };
  });

  const api = { makeAddTask, makeSubTask, makeStage3Task };

  if (node) module.exports = api;
  else root.QK.sayyora = api;
})(typeof window !== "undefined" ? window : globalThis);
