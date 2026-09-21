// bozor.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../../umumiy/js/sanoq.js");
const B = require("../js/bozor.js");

const check = (make, bases, minLen, maxLen) => {
  let prev = null;
  for (let k = 0; k < 400; k++) {
    const t = make(prev);
    assert.ok(bases.includes(t.base), String(t.base));
    assert.ok(S.valid(t.number, t.base));
    assert.ok(t.number.length >= minLen && t.number.length <= maxLen, t.number);
    assert.equal(t.answer, S.fromBase(t.number, t.base));
    assert.ok(t.answer <= 255);
    if (prev) assert.notEqual(t.number + t.base, prev.number + prev.base);
    prev = t;
  }
};

test("2-lik: 4–8 xona, ≤ 255", () => check((p) => B.makeBinTask(p), [2], 4, 8));
test("3–8-lik: 2–3 xona", () => check((p) => B.makeMidTask(p), [3, 4, 5, 6, 7, 8], 2, 3));
test("16-lik: 2 xona, ko'pincha harfli", () => {
  check((p) => B.makeHexTask(p), [16], 2, 2);
  let letters = 0;
  for (let k = 0; k < 200; k++) if (/[A-F]/.test(B.makeHexTask(null).number)) letters++;
  assert.ok(letters > 140);
});

test("yoyib yozish matni", () => {
  assert.equal(B.expandText("1011", 2), "1·8 + 0·4 + 1·2 + 1·1");
  assert.equal(B.sumText("10100101", 2), "128 + 32 + 4 + 1 = 165");
  assert.equal(B.expandText("C8", 16), "12·16 + 8·1");
  assert.equal(B.expandText("213", 8), "2·64 + 1·8 + 3·1");
});
