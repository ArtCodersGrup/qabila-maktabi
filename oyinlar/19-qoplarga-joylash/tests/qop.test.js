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

test("makeGreedyTask: 5–63 → ikkilik", () => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = Q.makeGreedyTask(prev);
    assert.ok(t.n >= 5 && t.n <= 63);
    assert.equal(t.base, 2);
    assert.equal(t.answer, S.toBase(t.n, 2));
    if (prev) assert.notEqual(t.n, prev.n);
    prev = t;
  }
});

test("makeDivTask: 10–100 → 2–8-lik", () => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = Q.makeDivTask(prev);
    assert.ok(t.n >= 10 && t.n <= 100);
    assert.ok(t.base >= 2 && t.base <= 8);
    assert.equal(t.answer, S.toBase(t.n, t.base));
    if (prev) assert.ok(t.n !== prev.n || t.base !== prev.base);
    prev = t;
  }
});

test("makeAnyTask: 16-lik, 8-lik va tekshirish (teskari o'qilgan javob)", () => {
  const types = new Set();
  let prev = null;
  for (let k = 0; k < 400; k++) {
    const t = Q.makeAnyTask(prev);
    types.add(t.type);
    if (t.type === "check") {
      assert.equal(t.answer, t.shown === S.toBase(t.n, t.base) ? "ha" : "yoq");
      if (t.answer === "yoq") assert.equal(t.shown, [...S.toBase(t.n, t.base)].reverse().join(""));
      assert.notEqual(t.shown[0], "0");
    } else {
      assert.ok([8, 16].includes(t.base));
      assert.ok(t.n >= 20 && t.n <= 255);
      assert.equal(t.answer, S.toBase(t.n, t.base));
    }
    if (prev) assert.notEqual(JSON.stringify(t), JSON.stringify(prev));
    prev = t;
  }
  assert.deepEqual([...types].sort(), ["check", "hex", "oct"]);
});
