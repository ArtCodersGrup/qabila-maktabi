// lamps.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/lamps.js");

test("count: holatlar soni ^ chiroqlar soni", () => {
  assert.equal(L.count(2, 3), 8);
  assert.equal(L.count(3, 2), 9);
  assert.equal(L.count(2, 8), 256);
  assert.equal(L.count(3, 4), 81);
});

test("allPatterns: tartib bilan, takrorsiz", () => {
  assert.deepEqual(L.allPatterns(2, 2).map(L.patternKey), ["00", "01", "10", "11"]);
  const p3 = L.allPatterns(2, 3).map(L.patternKey);
  assert.equal(new Set(p3).size, 8);
  assert.equal(p3[5], "101");
  assert.deepEqual(L.allPatterns(3, 2).map(L.patternKey), ["00", "01", "02", "10", "11", "12", "20", "21", "22"]);
});

test("fromNumber / toNumber bir-birining teskarisi", () => {
  assert.deepEqual(L.fromNumber(5, 3), [1, 0, 1]);
  assert.deepEqual(L.fromNumber(13, 4), [1, 1, 0, 1]);
  assert.equal(L.toNumber([1, 1, 0]), 6);
  for (const states of [2, 3]) {
    for (let n = 1; n <= 4; n++) {
      for (let v = 0; v < L.count(states, n); v++) assert.equal(L.toNumber(L.fromNumber(v, n, states), states), v);
    }
  }
});

test("placeValues va sumText", () => {
  assert.deepEqual(L.placeValues(3), [4, 2, 1]);
  assert.deepEqual(L.placeValues(4), [8, 4, 2, 1]);
  assert.equal(L.sumText([1, 0, 1]), "4 + 1");
  assert.equal(L.sumText([1, 1, 0, 1]), "8 + 4 + 1");
  assert.equal(L.sumText([0, 0, 0]), "0");
});

test("minLamps: eng kamida nechta chiroq", () => {
  assert.equal(L.minLamps(29, 2), 5);
  assert.equal(L.minLamps(29, 3), 4);
  assert.equal(L.minLamps(8, 2), 3);
  assert.equal(L.minLamps(9, 3), 2);
  assert.equal(L.minLamps(10, 3), 3);
  assert.equal(L.minLamps(50, 2), 6);
  assert.equal(L.minLamps(2, 2), 1);
});

test("lampSteps: 1 dan javobgacha", () => {
  assert.deepEqual(L.lampSteps(5, 2), [
    { lamps: 1, count: 2, enough: false },
    { lamps: 2, count: 4, enough: false },
    { lamps: 3, count: 8, enough: true },
  ]);
});

test("ma'nolar va narsalar", () => {
  assert.equal(L.MEANINGS.length, 8);
  assert.equal(L.MEANINGS[5], "Mehmon");
  assert.equal(L.MEANINGS[6], "Xavf");
  for (const t of L.THINGS) {
    for (const s of [L.PLAIN, L.COLOR]) {
      const a = L.minLamps(t.n, s);
      assert.ok(a >= 2 && a <= 6, `${t.text} ${s}: ${a}`);
    }
  }
});

test("makeCodeTask: ma'no ketma-ket takrorlanmaydi, ikki turi ham chiqadi", () => {
  let prev = null;
  const types = new Set();
  for (let k = 0; k < 1000; k++) {
    const t = L.makeCodeTask(prev);
    assert.ok(t.meaning >= 0 && t.meaning < 8);
    if (prev) assert.notEqual(t.meaning, prev.meaning);
    types.add(t.type);
    prev = t;
  }
  assert.deepEqual([...types].sort(), ["decode", "encode"]);
});

test("makeBinaryTask: 1–2-misol 3 chiroq (1–7), 3-misol 4 chiroq (1–15)", () => {
  let prev = null;
  const types = new Set();
  for (let k = 0; k < 1000; k++) {
    const idx = k % 3;
    const t = L.makeBinaryTask(idx, prev);
    assert.equal(t.lamps, idx === 2 ? 4 : 3);
    assert.ok(t.value >= 1 && t.value < L.count(2, t.lamps));
    if (prev) assert.notEqual(t.value, prev.value);
    types.add(t.type);
    prev = t;
  }
  assert.deepEqual([...types].sort(), ["toLamps", "toNumber"]);
});

test("makeLampsQuestion: javob to'g'ri, ketma-ket bir xil savol yo'q", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const q = L.makeLampsQuestion(prev);
    assert.ok(q.states === L.PLAIN || q.states === L.COLOR);
    assert.equal(q.items, L.THINGS[q.thing].n);
    assert.equal(q.answer, L.minLamps(q.items, q.states));
    if (prev) assert.ok(q.thing !== prev.thing || q.states !== prev.states);
    prev = q;
  }
  assert.deepEqual(L.makeLampsQuestion(null, () => 0), { thing: 0, text: "29 ta harf", items: 29, states: 2, answer: 5 });
});
