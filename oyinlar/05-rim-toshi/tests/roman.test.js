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

test("makeReadWriteTask: zina bilan sonlar kattalashadi — 3..39, 40..100, 101..399", () => {
  assert.deepEqual(R.READ_RANGES, [[3, 39], [40, 100], [101, 399]]);
  for (const tier of [0, 1, 2]) {
    const [lo, hi] = R.READ_RANGES[tier];
    let prev = null;
    let max = 0;
    for (let i = 0; i < 600; i++) {
      const t = R.makeReadWriteTask(i % 4, prev, Math.random, tier);
      assert.ok(t.n >= lo && t.n <= hi, `tier ${tier}: ${t.n}`);
      assert.equal(t.roman, R.toRoman(t.n));
      assert.equal(R.fromRoman(t.roman), t.n);
      assert.ok(t.roman.length <= R.MAX_SYMBOLS, `${t.roman} klaviaturaga sig'maydi`);
      assert.ok(/^[IVXLC]+$/.test(t.roman), `${t.roman}: klaviaturada yo'q belgi`);
      if (prev) assert.notEqual(t.n, prev.n);
      max = Math.max(max, t.n);
      prev = t;
    }
    assert.ok(max > (lo + hi) / 2, `tier ${tier}: katta sonlar chiqmadi (${max})`);
  }
  // Zina berilmasa, to'g'ri javoblar sonidan olinadi
  assert.ok(R.makeReadWriteTask(5, null).n >= 101);
});

test("tidySteps: laganni tartibga solish uchun nechta qoida kerak", () => {
  assert.equal(R.tidySteps("XII"), 0);
  assert.equal(R.tidySteps(R.merge("XII", "VIII")), 2); // IIIII → V, VV → X
  assert.equal(R.tidySteps("LL"), 1);
  for (const str of ["XVIIIII", "LXXXXXVV", "LLXXX"]) assert.equal(R.canTidy(str), R.tidySteps(str) > 0);
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
    if (prev) assert.ok(t.a !== prev.a || t.b !== prev.b);
    prev = t;
  }
});

test("makeTidyTask: zina bilan — yigʻindi 100 / 150 gacha, 2 / 3 ta qoida; lagan natijasi standart yozuv", () => {
  const limits = [{ sum: 80, steps: 1 }, { sum: 100, steps: 2 }, { sum: 150, steps: 3 }];
  for (const tier of [0, 1, 2]) {
    let prev = null;
    let max = 0;
    for (let i = 0; i < 300; i++) {
      const t = R.makeTidyTask(prev, Math.random, tier);
      const tray = R.merge(R.toRoman(t.a), R.toRoman(t.b));
      assert.ok(t.answer <= limits[tier].sum, `tier ${tier}: ${t.answer}`);
      assert.ok(R.tidySteps(tray) >= limits[tier].steps, `tier ${tier}: qoidalar kam`);
      assert.ok(tray.length <= R.MAX_TRAY, `lagan to'lib ketdi: ${tray}`);
      for (const n of [t.a, t.b, t.answer]) assert.ok(R.hasNo49(n), String(n));
      assert.equal(R.tidy(tray), R.toRoman(t.answer), "tartibga solingan lagan — standart Rim yozuvi");
      max = Math.max(max, t.answer);
      prev = t;
    }
    if (tier === 2) assert.ok(max > 100, "tier 2 da yuzdan katta yigʻindi (LL → C) chiqishi kerak");
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

test("makeArithTask: zina bilan — 100, 200, 399 gacha; hamma son klaviaturada yoziladi", () => {
  const top = [100, 200, 399];
  const maxSeen = [];
  for (const tier of [0, 1, 2]) {
    let prev = null;
    let max = 0;
    for (let i = 0; i < 400; i++) {
      const t = R.makeArithTask(prev, Math.random, tier);
      assert.equal(t.answer, t.op === "+" ? t.a + t.b : t.a - t.b);
      assert.ok(t.answer >= 1 && Math.max(t.a, t.answer) <= top[tier], `tier ${tier}: ${t.a} ${t.op} ${t.b}`);
      for (const n of [t.a, t.b, t.answer]) {
        assert.ok(R.toRoman(n).length <= R.MAX_SYMBOLS, `${n} = ${R.toRoman(n)} sig'maydi`);
        assert.ok(/^[IVXLC]+$/.test(R.toRoman(n)));
      }
      if (prev) assert.ok(t.op !== prev.op || t.a !== prev.a || t.b !== prev.b);
      max = Math.max(max, t.a, t.answer);
      prev = t;
    }
    maxSeen.push(max);
  }
  assert.ok(maxSeen[0] < maxSeen[1] && maxSeen[1] < maxSeen[2], String(maxSeen));
  assert.ok(maxSeen[2] > 250);
});

test("makeCalcTask: avval lagan, keyin aylantirish; zina uzatiladi", () => {
  assert.equal(R.makeCalcTask(0, null).type, "tidy");
  assert.equal(R.makeCalcTask(1, null).type, "arith");
  assert.equal(R.makeCalcTask(0, null, Math.random, 2).tier, 2);
  assert.equal(R.makeCalcTask(5, null).tier, 2);
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

test("makePlaceTask: zina bilan — 4 xonali va ichida 0 bor; soʻralgan raqam noldan farqli", () => {
  for (const tier of [1, 2]) {
    let prev = null;
    let zeros = 0;
    let four = 0;
    for (let i = 0; i < 400; i++) {
      const t = R.makePlaceTask(prev, Math.random, tier);
      const s = String(t.number);
      assert.ok(tier === 2 ? s.length === 4 : s.length === 3 || s.length === 4, s);
      assert.equal(new Set(s).size, s.length, s);
      assert.notEqual(t.digit, 0);
      assert.equal(s[t.index], String(t.digit));
      assert.equal(t.answer, t.digit * Math.pow(10, t.place));
      assert.equal(t.place, s.length - 1 - t.index);
      if (s.includes("0")) zeros++;
      if (s.length === 4) four++;
      if (prev) assert.notEqual(t.number, prev.number);
      prev = t;
    }
    if (tier === 2) assert.equal(zeros, 400, "tier 2 da har bir sonda 0 bor");
    else assert.ok(zeros > 100 && zeros < 300 && four > 100, `tier 1: nol ${zeros}, 4 xonali ${four}`);
  }
});

test("makeZeroTask: sonda aynan bitta 0 (boshida emas); javob — nolsiz son", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let i = 0; i < 300; i++) {
      const t = R.makeZeroTask(prev, Math.random, tier);
      const s = String(t.number);
      assert.equal(s.length, tier === 2 ? 4 : 3);
      assert.equal([...s].filter((ch) => ch === "0").length, 1, s);
      assert.equal(s[t.index], "0");
      assert.notEqual(t.index, 0);
      assert.equal(String(t.answer), s.replace("0", ""));
      assert.ok(t.answer < t.number);
      if (prev) assert.notEqual(t.number, prev.number);
      prev = t;
    }
  }
});

test("makeSwapTask: ikki raqam joy almashadi; javob — raqamning yangi xonadagi qiymati", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let i = 0; i < 300; i++) {
      const t = R.makeSwapTask(prev, Math.random, tier);
      const a = String(t.number);
      const b = String(t.swapped);
      assert.equal(a.length, tier === 2 ? 4 : 3);
      assert.ok(!a.includes("0") && new Set(a).size === a.length, a);
      assert.notEqual(t.number, t.swapped);
      const moved = [...a].filter((ch, k) => ch !== b[k]);
      assert.deepEqual(moved.sort(), [String(t.digit), String(t.other)].sort(), "aynan shu ikki raqam almashgan");
      assert.equal(b[t.index], String(t.digit));
      assert.equal(t.answer, t.digit * Math.pow(10, b.length - 1 - t.index));
      assert.equal(t.before, t.digit * Math.pow(10, a.length - 1 - a.indexOf(String(t.digit))));
      assert.notEqual(t.answer, t.before, "qiymat oʻzgarishi kerak");
      if (prev) assert.notEqual(t.number, prev.number);
      prev = t;
    }
  }
});

test("makeMixedTask: Rim soni + oddiy son; javob oddiy sonda", () => {
  for (const tier of [0, 2]) {
    let prev = null;
    for (let i = 0; i < 300; i++) {
      const t = R.makeMixedTask(prev, Math.random, tier);
      assert.equal(t.roman, R.toRoman(t.n));
      assert.equal(t.answer, t.n + t.b);
      assert.ok(t.n >= (tier === 2 ? 14 : 4) && t.n <= (tier === 2 ? 89 : 39), String(t.n));
      assert.ok(t.b >= 11 && t.b <= (tier === 2 ? 60 : 40));
      assert.ok(t.answer <= 149);
      if (prev) assert.ok(t.n !== prev.n || t.b !== prev.b);
      prev = t;
    }
  }
});

test("makeStage3Task: tartib — xona qiymati → nol / almashish → toʻrt tur aylanib keladi", () => {
  // Oddiy rejim: 6 ta javob, zina 0, 0, 1, 1, 2, 2
  const tiers = [0, 0, 1, 1, 2, 2];
  let prev = null;
  const types = [];
  for (let k = 0; k < 6; k++) {
    prev = R.makeStage3Task(k, prev, Math.random, tiers[k]);
    types.push(prev.type);
  }
  assert.deepEqual(types, ["place", "place", "zero", "swap", "mixed", "place"]);
  assert.equal(String(prev.number).length, 4, "oxirgi savol — 4 xonali son");
  // Qiyin rejim: doim tier 2, toʻrt tur navbat bilan
  const hard = [0, 1, 2, 3, 4, 5, 6].map((k) => R.makeStage3Task(k, null, Math.random, 2).type);
  assert.deepEqual(hard, ["mixed", "place", "zero", "swap", "mixed", "place", "zero"]);
  // Zina berilmasa — toʻgʻri javoblar sonidan
  assert.equal(R.makeStage3Task(0, null).type, "place");
  assert.equal(R.makeStage3Task(2, null).type, "zero");
  // Javob raqam klaviaturasiga sigʻadi (4 xona)
  for (let i = 0; i < 300; i++) assert.ok(R.makeStage3Task(i, null, Math.random, 2).answer <= 9999);
});
