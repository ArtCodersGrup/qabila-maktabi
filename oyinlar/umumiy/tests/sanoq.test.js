// sanoq.js testlari (17–22-o'yinlar uchun umumiy hisob). Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../js/sanoq.js");

test("raqamlar: 0–9 va A–F", () => {
  assert.equal(S.DIGITS, "0123456789ABCDEF");
  assert.equal(S.digitValue("B"), 11);
  assert.equal(S.digitValue("b"), 11);
  assert.equal(S.digitChar(15), "F");
});

test("toBase va fromBase", () => {
  assert.equal(S.toBase(13, 2), "1101");
  assert.equal(S.toBase(0, 2), "0");
  assert.equal(S.toBase(255, 16), "FF");
  assert.equal(S.toBase(200, 16), "C8");
  assert.equal(S.toBase(139, 8), "213");
  assert.equal(S.fromBase("1011", 2), 11);
  assert.equal(S.fromBase("7E", 16), 126);
  assert.equal(S.fromBase("34", 5), 19);
  for (let b = 2; b <= 16; b++) for (let n = 0; n < 300; n += 7) assert.equal(S.fromBase(S.toBase(n, b), b), n);
});

test("valid: raqamlar asosdan kichik bo'lishi kerak", () => {
  assert.ok(S.valid("101", 2));
  assert.ok(!S.valid("102", 2));
  assert.ok(!S.valid("129", 8));
  assert.ok(S.valid("7E", 16));
  assert.ok(!S.valid("", 10));
  assert.ok(!S.valid("G1", 16));
});

test("yozuv: 101₂, 7E₁₆", () => {
  assert.equal(S.sub(2), "₂");
  assert.equal(S.sub(16), "₁₆");
  assert.equal(S.fmt("7E", 16), "7E₁₆");
  assert.equal(S.clean("00101"), "101");
  assert.equal(S.clean("0"), "0");
  assert.equal(S.clean("0a"), "A");
});

test("xona qiymatlari va yoyib yozish", () => {
  assert.deepEqual(S.places(2, 5), [1, 2, 4, 8, 16]);
  assert.deepEqual(S.places(16, 3), [1, 16, 256]);
  assert.deepEqual(S.expand("213", 8), [
    { digit: "2", value: 2, place: 64 },
    { digit: "1", value: 1, place: 8 },
    { digit: "3", value: 3, place: 1 },
  ]);
});

test("divSteps: bo'lib-bo'lib, qoldiqlar pastdan yuqoriga", () => {
  const steps = S.divSteps(13, 2);
  assert.deepEqual(steps.map((s) => [s.n, s.q, s.r]), [[13, 6, 1], [6, 3, 0], [3, 1, 1], [1, 0, 1]]);
  const read = steps.map((s) => S.digitChar(s.r)).reverse().join("");
  assert.equal(read, "1101");
  assert.equal(S.divSteps(200, 16).map((s) => S.digitChar(s.r)).reverse().join(""), "C8");
});

test("addColumns: ko'chirish bilan qo'shish", () => {
  const r = S.addColumns("1011", "110", 2);
  assert.equal(r.result, "10001");
  assert.deepEqual(r.cols.map((c) => c.carryOut), [0, 1, 1, 1]);
  assert.equal(S.addColumns("2A", "3F", 16).result, "69");
  assert.equal(S.addColumns("34", "13", 5).result, "102");
  for (let k = 0; k < 200; k++) {
    const b = 2 + (k % 15);
    const x = (k * 37) % 250;
    const y = (k * 53) % 250;
    assert.equal(S.addColumns(S.toBase(x, b), S.toBase(y, b), b).result, S.toBase(x + y, b));
  }
});

test("subColumns: qarz olish bilan ayirish", () => {
  const r = S.subColumns("1101", "110", 2);
  assert.equal(r.result, "111");
  assert.ok(r.cols.some((c) => c.borrowOut === 1));
  assert.equal(S.subColumns("10", "1", 2).result, "1");
  assert.equal(S.subColumns("42", "14", 5).result, "23");
  for (let k = 0; k < 200; k++) {
    const b = 2 + (k % 15);
    const x = (k * 41) % 250;
    const y = (k * 17) % (x + 1);
    assert.equal(S.subColumns(S.toBase(x, b), S.toBase(y, b), b).result, S.toBase(x - y, b));
  }
});

test("mulDigit va mulBinary", () => {
  assert.equal(S.mulDigit("1A", 3, 16).result, "4E");
  assert.equal(S.mulDigit("23", 4, 5).result, "202");
  for (let k = 0; k < 200; k++) {
    const b = 2 + (k % 15);
    const x = (k * 29) % 200;
    const d = 1 + (k % (b - 1));
    assert.equal(S.mulDigit(S.toBase(x, b), d, b).result, S.toBase(x * d, b));
  }
  const m = S.mulBinary("101", "11");
  assert.deepEqual(m.rows, ["101", "1010"]);
  assert.equal(m.result, "1111");
  assert.deepEqual(S.mulBinary("111", "101").rows, ["111", "0", "11100"]);
  assert.equal(S.mulBinary("111", "101").result, S.toBase(35, 2));
});
