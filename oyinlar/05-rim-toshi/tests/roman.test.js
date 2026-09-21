// roman.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../js/roman.js");

test("toRoman: standart yozuv", () => {
  const pairs = [[1, "I"], [3, "III"], [4, "IV"], [7, "VII"], [9, "IX"], [12, "XII"], [14, "XIV"],
    [26, "XXVI"], [40, "XL"], [42, "XLII"], [49, "XLIX"], [88, "LXXXVIII"], [90, "XC"], [99, "XCIX"],
    [100, "C"], [1999, "MCMXCIX"], [2026, "MMXXVI"]];
  for (const [n, s] of pairs) assert.equal(R.toRoman(n), s, String(n));
});

test("fromRoman: har qanday yozuvning qiymati", () => {
  assert.equal(R.fromRoman("XLII"), 42);
  assert.equal(R.fromRoman("IIII"), 4);
  assert.equal(R.fromRoman("VV"), 10);
  assert.equal(R.fromRoman("IL"), 49);
  for (let n = 1; n <= 3999; n++) assert.equal(R.fromRoman(R.toRoman(n)), n);
});

test("isStandard: Rimliklar shunday yozganmi", () => {
  for (const s of ["I", "IV", "XLII", "XC", "MMXXVI"]) assert.equal(R.isStandard(s), true, s);
  for (const s of ["IIII", "VV", "IL", "XXXX", "VIV", ""]) assert.equal(R.isStandard(s), false, s);
});

test("mistake: nostandart yozuvdagi xato turi", () => {
  assert.equal(R.mistake("IIII"), "repeat");
  assert.equal(R.mistake("XXXXII"), "repeat");
  assert.equal(R.mistake("VV"), "twice");
  assert.equal(R.mistake("VIV"), "twice");
  assert.equal(R.mistake("IL"), "subtract");
  assert.equal(R.mistake("IIX"), "subtract");
});

test("tokens va symbolValues: yoyilma uchun", () => {
  assert.deepEqual(R.tokens("XLII"), [{ text: "XL", value: 40 }, { text: "I", value: 1 }, { text: "I", value: 1 }]);
  assert.deepEqual(R.tokens("XCIX"), [{ text: "XC", value: 90 }, { text: "IX", value: 9 }]);
  assert.deepEqual(R.symbolValues("XXVII"), [10, 10, 5, 1, 1]);
  for (let n = 1; n <= 100; n++) {
    const s = R.toRoman(n);
    assert.equal(R.tokens(s).reduce((sum, t) => sum + t.value, 0), n, s);
  }
});

test("sortSymbols va merge: belgilar kattadan kichikka", () => {
  assert.equal(R.sortSymbols("IXV"), "XVI");
  assert.equal(R.merge("XII", "VIII"), "XVIIIII");
  assert.equal(R.merge("XXXV", "XXV"), "XXXXXVV");
});

test("applyRule: belgilar yetsa — yangi yozuv, yetmasa — null", () => {
  const [rI, rV, rX, rL] = R.RULES;
  assert.equal(R.ruleLabel(rI), "IIIII → V");
  assert.equal(R.applyRule("XVIIIII", rI), "XVV");
  assert.equal(R.applyRule("XVV", rV), "XX");
  assert.equal(R.applyRule("XX", rV), null);
  assert.equal(R.applyRule("IIII", rI), null);
  assert.equal(R.applyRule("XXXXXVV", rX), "LVV");
  assert.equal(R.applyRule("LL", rL), "C");
});

test("canTidy va tidy: qoidalar tugaguncha", () => {
  assert.equal(R.canTidy("XVIIIII"), true);
  assert.equal(R.canTidy("XXVI"), false);
  assert.equal(R.tidy("XVIIIII"), "XX");
  assert.equal(R.tidy("XXXXXVV"), "LX");
  for (let a = 2; a <= 60; a++) {
    for (let b = 2; b <= 20; b++) {
      if (!R.hasNo49(a) || !R.hasNo49(b) || !R.hasNo49(a + b)) continue;
      assert.equal(R.tidy(R.merge(R.toRoman(a), R.toRoman(b))), R.toRoman(a + b), a + "+" + b);
    }
  }
});

test("places va partsOf: xonalar", () => {
  assert.deepEqual(R.places(352), [
    { digit: 3, place: 2, value: 300 },
    { digit: 5, place: 1, value: 50 },
    { digit: 2, place: 0, value: 2 },
  ]);
  assert.deepEqual(R.places(105).map((p) => p.value), [100, 0, 5]);
  assert.deepEqual(R.partsOf(42), [40, 2]);
  assert.deepEqual(R.partsOf(100), [100]);
  assert.deepEqual(R.partsOf(7), [7]);
  assert.deepEqual(R.partsOf(90), [90]);
});

test("makeReadWriteTask: oʻqish/yozish, 3–100, ketma-ket takrorlanmaydi", () => {
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const t = R.makeReadWriteTask(i % 3, prev);
    assert.ok(t.n >= 3 && t.n <= 100, String(t.n));
    if (i % 3 === 0) {
      assert.equal(t.type, "read");
      assert.ok(t.n <= 39, String(t.n));
    }
    if (i % 3 === 1) assert.equal(t.type, "write");
    assert.equal(t.roman, R.toRoman(t.n));
    if (prev) assert.notEqual(t.n, prev.n);
    prev = t;
  }
});

test("makeTidyTask: 4 va 9 raqamisiz, yigʻindi ≤ 80, qoida kerak", () => {
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const t = R.makeTidyTask(prev);
    assert.equal(t.type, "tidy");
    assert.equal(t.op, "+");
    assert.equal(t.answer, t.a + t.b);
    assert.ok(t.answer <= 80, String(t.answer));
    for (const n of [t.a, t.b, t.answer]) assert.ok(R.hasNo49(n), String(n));
    assert.ok(R.canTidy(R.merge(R.toRoman(t.a), R.toRoman(t.b))));
    prev = t;
  }
});

test("makeArithTask: qoʻshishda ≤ 100, ayirishda natija ≥ 1", () => {
  let prev = null;
  let plus = 0;
  for (let i = 0; i < 300; i++) {
    const t = R.makeArithTask(prev);
    assert.equal(t.type, "arith");
    assert.ok(t.a >= 2 && t.b >= 2);
    if (t.op === "+") {
      plus++;
      assert.equal(t.answer, t.a + t.b);
      assert.ok(t.answer <= 100, String(t.answer));
    } else {
      assert.equal(t.op, "−");
      assert.equal(t.answer, t.a - t.b);
      assert.ok(t.answer >= 1, String(t.answer));
    }
    prev = t;
  }
  assert.ok(plus > 0 && plus < 300);
});

test("makeCalcTask: avval lagan, keyin aylantirish", () => {
  assert.equal(R.makeCalcTask(0, null).type, "tidy");
  assert.equal(R.makeCalcTask(1, null).type, "arith");
});

test("makePlaceTask: raqamlar har xil va nolsiz; javob — xonadagi qiymat", () => {
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const t = R.makePlaceTask(prev);
    const s = String(t.number);
    assert.ok(s.length === 2 || s.length === 3, s);
    assert.ok(!s.includes("0"), s);
    assert.equal(new Set(s).size, s.length, s);
    assert.equal(s[t.index], String(t.digit));
    assert.equal(t.answer, t.digit * Math.pow(10, t.place));
    if (prev) assert.notEqual(t.number, prev.number);
    prev = t;
  }
});
