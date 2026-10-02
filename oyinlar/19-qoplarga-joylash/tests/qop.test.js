// qop.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../../umumiy/js/sanoq.js");
const Q = require("../js/qop.js");

test("greedySteps: 13 → 8, 4, 2, 1: sig'adi, sig'adi, yo'q, sig'adi", () => {
  const steps = Q.greedySteps(13);
  assert.deepEqual(steps.map((s) => s.coin), [8, 4, 2, 1]);
  assert.deepEqual(steps.map((s) => s.fits), [true, true, false, true]);
  assert.deepEqual(steps.map((s) => s.left), [13, 5, 1, 1]);
  assert.equal(steps.map((s) => (s.fits ? "1" : "0")).join(""), "1101");
  for (let n = 1; n < 100; n++) assert.equal(Q.greedySteps(n).map((s) => (s.fits ? "1" : "0")).join(""), S.toBase(n, 2));
});

test("makeGreedyTask: tier bo'yicha 5–63 / 32–127 / 64–255 → ikkilik", () => {
  assert.deepEqual(Q.GREEDY, [[5, 63], [32, 127], [64, 255]]);
  for (const tier of [0, 1, 2]) {
    let prev = null;
    let max = 0;
    for (let k = 0; k < 400; k++) {
      const t = Q.makeGreedyTask(prev, Math.random, tier);
      assert.ok(t.n >= Q.GREEDY[tier][0] && t.n <= Q.GREEDY[tier][1]);
      assert.equal(t.base, 2);
      assert.equal(t.answer, S.toBase(t.n, 2));
      assert.ok(t.answer.length <= 8, "8 xonadan oshmaydi (klaviatura chegarasi)");
      if (prev) assert.notEqual(t.n, prev.n);
      max = Math.max(max, t.n);
      prev = t;
    }
    assert.ok(max > Q.GREEDY[tier][1] * 0.9, "yuqori chegaraga yaqin sonlar ham chiqadi");
  }
  assert.ok(Q.makeGreedyTask(null).n <= 63); // tier berilmasa — 0
});

test("makeDivTask: tier bo'yicha 10–100 / 60–127 / 100–255 → 2–8-lik", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const lim = Q.DIV[tier];
    for (let k = 0; k < 400; k++) {
      const t = Q.makeDivTask(prev, Math.random, tier);
      assert.ok(t.n >= lim.n[0] && t.n <= lim.n[1]);
      assert.ok(t.base >= lim.base[0] && t.base <= lim.base[1]);
      assert.equal(t.answer, S.toBase(t.n, t.base));
      assert.ok(t.answer.length <= 7, "7 xonadan oshmaydi (klaviatura chegarasi)");
      if (prev) assert.ok(t.n !== prev.n || t.base !== prev.base);
      prev = t;
    }
  }
  assert.equal(Q.DIV[2].base[0], 3, "tier 2 da 2-lik yo'q");
});

test("makeAnyTask: 16-lik, 8-lik va 4 variantdan to'g'ri yozuvni tanlash", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    let prev = null;
    let withReversed = 0;
    let chooses = 0;
    for (let k = 0; k < 600; k++) {
      const t = Q.makeAnyTask(prev, Math.random, tier);
      types.add(t.type);
      if (t.type === "choose") {
        chooses++;
        assert.equal(t.answer, S.toBase(t.n, t.base));
        assert.equal(t.options.length, 4, "4 variant");
        assert.equal(new Set(t.options).size, 4);
        assert.ok(t.options.includes(t.answer));
        for (const o of t.options) {
          assert.ok(S.valid(o, t.base), `${o} — ${t.base}-lik yozuv`);
          assert.notEqual(o[0], "0");
          // Faqat bitta variant shu songa teng
          assert.equal(S.fromBase(o, t.base) === t.n, o === t.answer);
        }
        assert.equal(t.reversed, [...t.answer].reverse().join(""));
        if (t.options.includes(t.reversed)) withReversed++;
      } else {
        assert.ok([8, 16].includes(t.base));
        assert.ok(t.n >= Q.ANY[tier][0] && t.n <= Q.ANY[tier][1]);
        assert.equal(t.answer, S.toBase(t.n, t.base));
        assert.ok(t.answer.length <= 4);
      }
      if (prev) assert.notEqual(JSON.stringify(t), JSON.stringify(prev));
      prev = t;
    }
    assert.deepEqual([...types].sort(), ["choose", "hex", "oct"]);
    assert.equal(withReversed, chooses, "teskari o'qilgan javob doim variantlar ichida");
  }
  assert.deepEqual(Q.ANY, [[20, 100], [100, 255], [256, 511]]);
});
