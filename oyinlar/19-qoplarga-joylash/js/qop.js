// Qoplarga joylash — topshiriqlar: kattadan boshlab (ikkilik tangalar), bo'lib-bo'lib (2–8-lik),
// 16/8-likka o'tkazish va 4 variantdan to'g'ri yozuvni tanlash (tier bilan qiyinlashadi). Umumiy hisob — umumiy/js/sanoq.js.
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

  function shuffle(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): chegaralar tier 0 / 1 / 2 bo'yicha
  const GREEDY = [[5, 63], [32, 127], [64, 255]]; // 1-bosqich: o'nlik → ikkilik
  const DIV = [{ n: [10, 100], base: [2, 8] }, { n: [60, 127], base: [2, 8] }, { n: [100, 255], base: [3, 8] }]; // 2-bosqich
  const ANY = [[20, 100], [100, 255], [256, 511]]; // 3-bosqich: 16-lik va 8-lik

  // 1-bosqich: o'nlik → ikkilik (kattadan boshlab)
  const makeGreedyTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    const [lo, hi] = GREEDY[tier || 0];
    const n = randInt(lo, hi, r);
    return { n, base: 2, answer: S.toBase(n, 2) };
  });

  // 2-bosqich: o'nlik → 2–8-lik (bo'lib-bo'lib); tier 2 da 2-lik yo'q (8 marta bo'lish — zerikarli)
  const makeDivTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    const lim = DIV[tier || 0];
    const n = randInt(lim.n[0], lim.n[1], r);
    const base = randInt(lim.base[0], lim.base[1], r);
    return { n, base, answer: S.toBase(n, base) };
  });

  // "To'g'ri yozuvni tanla": 4 variant — to'g'ri, qoldiqlar teskari o'qilgan, bitta raqami xato, qo'shni son
  function chooseOptions(n, base, rng) {
    const right = S.toBase(n, base);
    const out = [right];
    const push = (s) => { if (s && s[0] !== "0" && !out.includes(s)) out.push(s); };
    push([...right].reverse().join("")); // eng ko'p uchraydigan xato
    // bitta raqami 1 ga farq qiladi (shu tizim raqami bo'lib qoladi)
    const pos = randInt(0, right.length - 1, rng);
    const v = S.digitValue(right[pos]);
    const w = v + 1 < base ? v + 1 : v - 1;
    push(right.slice(0, pos) + S.digitChar(w) + right.slice(pos + 1));
    for (const d of [base, -base, 1, -1, 2, base * base, 3, -2]) {
      if (out.length >= 4) break;
      if (n + d > 0) push(S.toBase(n + d, base));
    }
    return shuffle(out, rng);
  }

  // 3-bosqich: 16-lik, 8-lik yoki "to'g'ri yozuvni tanla" (4 variant)
  const makeAnyTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    const x = r();
    const [lo, hi] = ANY[tier || 0];
    if (x < 1 / 3) {
      const n = randInt(lo, hi, r);
      return { type: "hex", n, base: 16, answer: S.toBase(n, 16) };
    }
    if (x < 2 / 3) {
      const n = randInt(lo, hi, r);
      return { type: "oct", n, base: 8, answer: S.toBase(n, 8) };
    }
    for (;;) {
      const base = pick(tier === 2 ? [3, 5, 8, 16] : [2, 2, 8, 16], r);
      const n = base === 2 ? randInt(5, tier ? 127 : 63, r) : randInt(20, hi, r);
      const right = S.toBase(n, base);
      const reversed = [...right].reverse().join("");
      if (reversed === right || reversed[0] === "0") continue; // teskarisi farq qilsin va 0 bilan boshlanmasin
      const options = chooseOptions(n, base, r);
      if (options.length < 4) continue;
      return { type: "choose", n, base, options, reversed, answer: right };
    }
  });

  const api = { GREEDY, DIV, ANY, greedySteps, makeGreedyTask, makeDivTask, makeAnyTask, chooseOptions };

  if (node) module.exports = api;
  else root.QK.qop = api;
})(typeof window !== "undefined" ? window : globalThis);
