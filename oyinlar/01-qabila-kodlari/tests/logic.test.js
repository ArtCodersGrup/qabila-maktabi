// logic.js uchun testlar. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

test("countExact: aⁱ", () => {
  assert.equal(L.countExact(3, 3), 27);
  assert.equal(L.countExact(2, 5), 32);
  assert.equal(L.countExact(4, 3), 64);
  assert.equal(L.countExact(1, 2), 1);
});

test("countUpTo: a + a² + … + aⁱ", () => {
  assert.equal(L.countUpTo(3, 3), 39);
  assert.equal(L.countUpTo(2, 2), 6);
  assert.equal(L.countUpTo(4, 3), 84);
  assert.equal(L.countUpTo(1, 2), 2);
});

test("countWords turga qarab tanlaydi", () => {
  assert.equal(L.countWords(3, 2, "exact"), 9);
  assert.equal(L.countWords(3, 2, "upto"), 12);
});

test("STAGE_PAIRS: 8 ta juftlik, hammasi chegarada", () => {
  assert.equal(L.STAGE_PAIRS.length, 8);
  for (const [a, i] of L.STAGE_PAIRS) {
    assert.ok(a >= 2 && a <= 4, `a=${a}`);
    assert.ok(L.countExact(a, i) <= 64, `${a}^${i}`);
    assert.ok(L.countUpTo(a, i) <= 84, `sum ${a},${i}`);
  }
});

test("listWords exact: to'liq, takrorsiz, tartibli", () => {
  assert.deepEqual(L.listWords(["A", "U"], 2, "exact"), ["AA", "AU", "UA", "UU"]);
  const w = L.listWords(["A", "U", "F"], 2, "exact");
  assert.equal(w.length, 9);
  assert.equal(new Set(w).size, 9);
});

test("listWords upto: avval qisqalari", () => {
  assert.deepEqual(L.listWords(["A", "U"], 2, "upto"), ["A", "U", "AA", "AU", "UA", "UU"]);
  assert.equal(L.listWords(["A", "U", "F"], 3, "upto").length, 39);
});

test("listWords: harf yo'q bo'lsa — bo'sh ro'yxat", () => {
  assert.deepEqual(L.listWords([], 2, "exact"), []);
  assert.deepEqual(L.listWords([], 2, "upto"), []);
});

test("minLetters: dizayndagi 3-bosqich misollari", () => {
  assert.equal(L.minLetters(5, 2, "upto"), 2);
  assert.equal(L.minLetters(5, 2, "exact"), 3);
  assert.equal(L.minLetters(20, 3, "exact"), 3);
});

test("stage3Steps: 1 dan javobgacha", () => {
  assert.deepEqual(L.stage3Steps(5, 2, "upto"), [
    { a: 1, count: 2, enough: false },
    { a: 2, count: 6, enough: true },
  ]);
});

test("stage3Range: odamlar soni oralig'i", () => {
  assert.deepEqual(L.stage3Range("exact", 2, 2), [2, 4]);
  assert.deepEqual(L.stage3Range("exact", 3, 4), [28, 30]);
  assert.deepEqual(L.stage3Range("upto", 3, 3), [15, 30]);
  assert.equal(L.stage3Range("upto", 3, 4), null);
});

test("makeRng: bir xil urug' — bir xil ketma-ketlik", () => {
  const r1 = L.makeRng(42);
  const r2 = L.makeRng(42);
  for (let k = 0; k < 5; k++) {
    const v = r1();
    assert.equal(v, r2());
    assert.ok(v >= 0 && v < 1);
  }
});

test("pickLetters: har xil harflar, to'plamdan", () => {
  const rng = L.makeRng(1);
  for (let k = 0; k < 200; k++) {
    const ls = L.pickLetters(4, rng);
    assert.equal(new Set(ls).size, 4);
    for (const l of ls) assert.ok(L.LETTER_POOL.includes(l));
  }
  assert.ok(!L.LETTER_POOL.includes("O"));
});

test("makeExercise: 1000 marta — chegaralar, yagona javob, ketma-ket takror yo'q", () => {
  const rng = L.makeRng(7);
  for (const stage of [1, 2, 3]) {
    let prev = null;
    for (let k = 0; k < 1000; k++) {
      const ex = L.makeExercise(stage, prev, rng);
      assert.equal(ex.stage, stage);
      if (stage < 3) {
        assert.equal(ex.type, stage === 1 ? "exact" : "upto");
        assert.ok(L.STAGE_PAIRS.some(([a, i]) => a === ex.a && i === ex.i));
        assert.equal(ex.letters.length, ex.a);
        assert.equal(ex.answer, L.countWords(ex.a, ex.i, ex.type));
      } else {
        assert.ok(ex.people >= 2 && ex.people <= 30, `people=${ex.people}`);
        assert.ok([2, 3, 4].includes(ex.answer));
        assert.ok([2, 3].includes(ex.i));
        assert.equal(L.minLetters(ex.people, ex.i, ex.type), ex.answer);
      }
      if (prev) assert.notEqual(L.exerciseKey(ex), L.exerciseKey(prev));
      prev = ex;
    }
  }
});

test("checkAnswer: son yoki satr", () => {
  const ex = { answer: 27 };
  assert.equal(L.checkAnswer(ex, 27), true);
  assert.equal(L.checkAnswer(ex, "27"), true);
  assert.equal(L.checkAnswer(ex, 26), false);
});

test("productText va sumText", () => {
  assert.equal(L.productText(4, 3), "4 × 4 × 4");
  assert.equal(L.productText(3, 1), "3");
  assert.equal(L.sumText(4, 3), "4 + 4 × 4 + 4 × 4 × 4");
});
