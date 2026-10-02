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

  // Qiyinlik zinasi (QOIDALAR 4.3): tier 0 — 2–3 xonali (≤ 200), tier 1 — 3 xonali, ko'chish/qarz albatta;
  // tier 2 — 3–4 xonali (≤ 999), asos 12 gacha (A, B raqamlari), kamida ikkita ko'chish/qarz
  const BASES = [[3, 9], [3, 9], [3, 12]];
  function value(base, r, tier) {
    if (tier === 2) return randInt(base ** 2, Math.min(base ** 4 - 1, 999), r);
    return randInt(tier === 1 ? base ** 2 : base, Math.min(base ** 3 - 1, 200), r);
  }
  const count = (cols, key) => cols.filter((c) => c[key]).length;

  // 1-bosqich: tier 0 — 90% hollarda kamida bitta ko'chish; natija 4 xonadan oshmaydi
  const makeAddTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    tier = tier || 0;
    const base = randInt(BASES[tier][0], BASES[tier][1], r);
    const x = value(base, r, tier);
    const y = value(base, r, tier);
    if (x + y >= base ** 4) return null;
    const a = S.toBase(x, base);
    const b = S.toBase(y, base);
    const n = count(S.addColumns(a, b, base).cols, "carryOut");
    if (tier === 0 ? !n && r() < 0.9 : n < tier) return null;
    return { base, a, b, answer: S.toBase(x + y, base) };
  });

  // 2-bosqich: a > b; tier 0 — 90% hollarda kamida bitta qarz
  const makeSubTask = (prev, rng, tier) => loop(prev, rng, (r) => {
    tier = tier || 0;
    const base = randInt(BASES[tier][0], BASES[tier][1], r);
    const x = value(base, r, tier);
    const lo = tier ? base ** 2 : base; // b ham kamida 2 (tier 1+ da 3) xonali va a dan kichik bo'lsin
    if (x - 1 < lo) return null;
    const y = randInt(lo, x - 1, r);
    const a = S.toBase(x, base);
    const b = S.toBase(y, base);
    const n = count(S.subColumns(a, b, base).cols, "borrowOut");
    if (tier === 0 ? !n && r() < 0.9 : n < tier) return null;
    return { base, a, b, answer: S.toBase(x - y, base) };
  });

  // 3-bosqich: ko'paytirish (tier 0–1: 2 xonali, tier 2: 3 xonali × bir xonali) yoki jumboq.
  // Jumboq: tier 0 — bir xonali (x + y = 1c); tier 1+ — ikki xonali ("12 + 13 = 30 qaysi tizimda?")
  const makeStage3Task = (prev, rng, tier) => loop(prev, rng, (r) => {
    tier = tier || 0;
    const base = randInt(tier ? 5 : 4, 9, r);
    if (r() < 0.6) {
      const x = tier === 2 ? randInt(base ** 2, Math.min(base ** 3 - 1, 200), r) : randInt(base, base * base - 1, r);
      const d = randInt(tier ? 3 : 2, base - 1, r);
      return { type: "mul", base, a: S.toBase(x, base), d, answer: S.toBase(x * d, base) };
    }
    // birlar: x + y = base + c (x, y < base, ko'chish bor)
    const x = randInt(2, base - 1, r);
    const y = randInt(Math.max(base - x, 1), base - 1, r);
    const c = x + y - base;
    if (tier === 0) return { type: "puzzle", x, y, c, answer: base };
    // o'nlar: p + q + 1 < base — yig'indi ikki xonali bo'lib qoladi
    const top = tier === 2 ? 3 : 1;
    const p = randInt(1, top, r);
    const q = randInt(1, top, r);
    if (p + q + 1 >= base) return null;
    return { type: "puzzle2", x, y, c, a: `${p}${x}`, b: `${q}${y}`, sum: `${p + q + 1}${c}`, answer: base };
  });

  const api = { BASES, makeAddTask, makeSubTask, makeStage3Task };

  if (node) module.exports = api;
  else root.QK.sayyora = api;
})(typeof window !== "undefined" ? window : globalThis);
