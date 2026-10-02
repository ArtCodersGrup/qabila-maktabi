// bozor.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../../umumiy/js/sanoq.js");
const B = require("../js/bozor.js");

const check = (make, bases, minLen, maxLen, limit = 255) => {
  let prev = null;
  let top = 0;
  for (let k = 0; k < 400; k++) {
    const t = make(prev);
    assert.ok(bases.includes(t.base), String(t.base));
    assert.ok(S.valid(t.number, t.base));
    assert.ok(t.number.length >= minLen && t.number.length <= maxLen, t.number);
    assert.equal(t.answer, S.fromBase(t.number, t.base));
    assert.ok(t.answer <= limit);
    if (prev) assert.notEqual(t.number + t.base, prev.number + prev.base);
    top = Math.max(top, t.number.length);
    prev = t;
  }
  assert.equal(top, maxLen, "eng uzun yozuv ham chiqadi");
};

const BASES = [3, 4, 5, 6, 7, 8];
test("2-lik: tier 0 — 4–6 xona (≤ 63), tier 1 — 7–8 xona (≤ 255), tier 2 — 9–10 xona (≤ 1023)", () => {
  check((p) => B.makeBinTask(p), [2], 4, 6, 63);
  check((p) => B.makeBinTask(p, Math.random, 0), [2], 4, 6, 63);
  check((p) => B.makeBinTask(p, Math.random, 1), [2], 7, 8, 255);
  check((p) => B.makeBinTask(p, Math.random, 2), [2], 9, 10, 1023);
  assert.deepEqual(B.BIN, [[8, 63], [64, 255], [256, 1023]]);
});
test("3–8-lik: tier 0 — 2–3 xona, tier 1 — 3 xona, tier 2 — 4 xona (≤ 999)", () => {
  check((p) => B.makeMidTask(p), BASES, 2, 3);
  check((p) => B.makeMidTask(p, Math.random, 1), BASES, 3, 3);
  check((p) => B.makeMidTask(p, Math.random, 2), BASES, 4, 4, 999);
});
test("16-lik: tier 0 — 2 xona, ko'pincha harfli; tier 1 — birinchi raqam harf; tier 2 — 3 xona (≤ 511)", () => {
  check((p) => B.makeHexTask(p), [16], 2, 2);
  let letters = 0;
  for (let k = 0; k < 200; k++) if (/[A-F]/.test(B.makeHexTask(null).number)) letters++;
  assert.ok(letters > 140);
  check((p) => B.makeHexTask(p, Math.random, 1), [16], 2, 2);
  check((p) => B.makeHexTask(p, Math.random, 2), [16], 3, 3, 511);
  for (let k = 0; k < 200; k++) {
    assert.match(B.makeHexTask(null, Math.random, 1).number, /^[A-F][0-9A-F]$/);
    assert.match(B.makeHexTask(null, Math.random, 2).number, /[A-F]/, "tier 2 da ham harf bor");
    assert.equal(B.makeHexTask(null, Math.random, 2).tier, 2);
  }
});

test("yoyib yozish matni", () => {
  assert.equal(B.expandText("1011", 2), "1·8 + 0·4 + 1·2 + 1·1");
  assert.equal(B.sumText("10100101", 2), "128 + 32 + 4 + 1 = 165");
  assert.equal(B.expandText("C8", 16), "12·16 + 8·1");
  assert.equal(B.expandText("213", 8), "2·64 + 1·8 + 3·1");
});
