// Qoplarga joylash — topshiriqlar: kattadan boshlab (ikkilik tangalar), bo'lib-bo'lib (2–8-lik),
// 16/8-likka o'tkazish va teskari o'qilgan javobni topish. Umumiy hisob — umumiy/js/sanoq.js.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const S = node ? require("../../umumiy/js/sanoq.js") : root.QK.sanoq;

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const same = (a, b) => !!a && JSON.stringify(a) === JSON.stringify(b);

  // Kattadan boshlab: eng katta sig'adigan tangadan 1 gacha. left — shu tanga oldidagi qoldiq
  function greedySteps(n) {
    let coin = 1;
    while (coin * 2 <= n) coin *= 2;
    const steps = [];
    let left = n;
    for (; coin >= 1; coin /= 2) {
      const fits = coin <= left;
      steps.push({ coin, fits, left });
      if (fits) left -= coin;
    }
    return steps;
  }

  function loop(prev, rng, gen) {
    rng = rng || Math.random;
    for (;;) {
      const task = gen(rng);
      if (!same(prev, task)) return task;
    }
  }

  // 1-bosqich: 5–63 → ikkilik
  const makeGreedyTask = (prev, rng) => loop(prev, rng, (r) => {
    const n = randInt(5, 63, r);
    return { n, base: 2, answer: S.toBase(n, 2) };
  });

  // 2-bosqich: 10–100 → 2–8-lik
  const makeDivTask = (prev, rng) => loop(prev, rng, (r) => {
    const n = randInt(10, 100, r);
    const base = randInt(2, 8, r);
    return { n, base, answer: S.toBase(n, base) };
  });

  // 3-bosqich: 16-lik, 8-lik yoki "to'g'rimi?" (to'g'ri yoki qoldiqlar teskari o'qilgan)
  const makeAnyTask = (prev, rng) => loop(prev, rng, (r) => {
    const x = r();
    if (x < 1 / 3) {
      const n = randInt(20, 255, r);
      return { type: "hex", n, base: 16, answer: S.toBase(n, 16) };
    }
    if (x < 2 / 3) {
      const n = randInt(20, 255, r);
      return { type: "oct", n, base: 8, answer: S.toBase(n, 8) };
    }
    for (;;) {
      const base = pick([2, 2, 8, 16], r);
      const n = randInt(base === 2 ? 5 : 20, base === 2 ? 63 : 255, r);
      const right = S.toBase(n, base);
      const reversed = [...right].reverse().join("");
      if (reversed === right || reversed[0] === "0") continue; // teskarisi farq qilsin va 0 bilan boshlanmasin
      const shown = r() < 0.5 ? right : reversed;
      return { type: "check", n, base, shown, answer: shown === right ? "ha" : "yoq" };
    }
  });

  const api = { greedySteps, makeGreedyTask, makeDivTask, makeAnyTask };

  if (node) module.exports = api;
  else root.QK.qop = api;
})(typeof window !== "undefined" ? window : globalThis);
