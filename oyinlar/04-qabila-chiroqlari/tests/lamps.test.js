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
  assert.deepEqual(L.lampSteps(10, 3).map((s) => s.enough), [false, false, true]);
});

test("ma'nolar va narsalar", () => {
  assert.equal(L.MEANINGS.length, 8);
  assert.equal(L.MEANINGS[5], "Mehmon");
  assert.equal(L.MEANINGS[6], "Xavf");
  for (const t of L.THINGS) {
    for (const s of [L.PLAIN, L.COLOR]) {
      const a = L.minLamps(t.n, s);
      assert.ok(a >= 2 && a <= 9, `${t.text} ${s}: ${a}`);
    }
  }
  assert.equal(L.THINGS.length, 12);
  assert.equal(new Set(L.THINGS.map((t) => t.n)).size, 12, "narsalar soni takrorlanmasin");
  for (const t of L.THINGS) assert.ok(t.text.startsWith(`${t.n} ta `), t.text);
});

test("narsalar zinasi: tier 0 — 20 gacha, tier 1 — 64 gacha, tier 2 — 100 dan (7–9 ta oddiy chiroq)", () => {
  const ns = (tier) => L.thingsFor(tier).map((i) => L.THINGS[i].n).sort((a, b) => a - b);
  assert.deepEqual(ns(0), [4, 7, 10, 12, 20]);
  assert.deepEqual(ns(1), [29, 32, 50, 64]);
  assert.deepEqual(ns(2), [100, 256, 365]);
  assert.deepEqual(ns(undefined), ns(0));
  assert.deepEqual(L.thingsFor(2).map((i) => L.minLamps(L.THINGS[i].n, L.PLAIN)).sort(), [7, 8, 9]);
  assert.deepEqual(L.thingsFor(2).map((i) => L.minLamps(L.THINGS[i].n, L.COLOR)).sort(), [5, 6, 6]);
  // Chegaradagi holat: 32 ta narsaga aynan 5 ta chiroq yetadi (2⁵ = 32), 6 ta emas
  assert.equal(L.minLamps(32, L.PLAIN), 5);
  assert.equal(L.minLamps(64, L.PLAIN), 6);
  assert.equal(L.minLamps(256, L.PLAIN), 8);
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

test("makeCodeTask: kod jadvali faqat tier 0 da ko'rinadi (birinchi 2 javob), keyin yoddan", () => {
  assert.equal(L.makeCodeTask(null).showTable, true);
  assert.equal(L.makeCodeTask(null, Math.random, 0).showTable, true);
  assert.equal(L.makeCodeTask(null, Math.random, 1).showTable, false);
  assert.equal(L.makeCodeTask(null, Math.random, 2).showTable, false);
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = L.makeCodeTask(prev, Math.random, k % 3);
    if (prev) assert.notEqual(t.meaning, prev.meaning);
    prev = t;
  }
});

test("hintPair: maslahat javobni aytmaydi — ikki qo'shni qator, biri to'g'ri", () => {
  for (let m = 0; m < L.MEANINGS.length; m++) {
    const seen = new Set();
    for (let k = 0; k < 60; k++) {
      const pair = L.hintPair(m);
      assert.equal(pair.length, 2);
      assert.equal(pair[1] - pair[0], 1, "qatorlar qo'shni bo'lishi kerak");
      assert.ok(pair.includes(m), "to'g'ri qator juftlikda bo'lishi kerak");
      assert.ok(pair[0] >= 0 && pair[1] < L.MEANINGS.length);
      seen.add(pair.join());
    }
    assert.equal(seen.size, m === 0 || m === L.MEANINGS.length - 1 ? 1 : 2, `ma'no ${m}: qo'shni tasodifiy tanlanadi`);
  }
});

test("makeBinaryTask: zina bo'yicha 3 chiroq (1–7), 4 chiroq (8–15), 5 chiroq (16–31)", () => {
  const types = new Set();
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const values = new Set();
    for (let k = 0; k < 600; k++) {
      const t = L.makeBinaryTask(0, prev, Math.random, tier);
      assert.equal(t.lamps, 3 + tier);
      const lo = tier === 0 ? 1 : L.count(2, t.lamps - 1);
      assert.ok(t.value >= lo && t.value < L.count(2, t.lamps), `tier ${tier}: ${t.value}`);
      if (tier > 0) assert.equal(L.fromNumber(t.value, t.lamps)[0], 1, "yangi eng katta chiroq doim yoniq");
      if (prev) assert.notEqual(t.value, prev.value);
      types.add(t.type);
      values.add(t.value);
      prev = t;
    }
    assert.equal(values.size, tier === 0 ? 7 : L.count(2, 2 + tier), `tier ${tier}: hamma sonlar chiqishi kerak`);
  }
  assert.deepEqual([...types].sort(), ["toLamps", "toNumber"]);
});

test("makeBinaryTask: tier berilmasa, to'g'ri javoblar soni (k) dan olinadi: 0–1 → 3, 2–3 → 4, 4+ → 5 chiroq", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map((k) => L.makeBinaryTask(k, null).lamps), [3, 3, 4, 4, 5, 5, 5]);
  // Qiyin rejim: k = 0 bo'lsa ham tier 2 → 5 chiroq
  assert.equal(L.makeBinaryTask(0, null, Math.random, 2).lamps, 5);
});

test("makeLampsQuestion: javob to'g'ri, ketma-ket bir xil savol yo'q, narsalar zina bo'yicha", () => {
  const maxAnswer = [];
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const seen = new Set();
    let max = 0;
    for (let k = 0; k < 1000; k++) {
      const q = L.makeLampsQuestion(prev, Math.random, tier);
      assert.ok(q.states === L.PLAIN || q.states === L.COLOR);
      assert.ok(L.thingsFor(tier).includes(q.thing), `tier ${tier}: ${q.text}`);
      assert.equal(q.items, L.THINGS[q.thing].n);
      assert.equal(q.text, L.THINGS[q.thing].text);
      assert.equal(q.answer, L.minLamps(q.items, q.states));
      assert.ok(L.count(q.states, q.answer) >= q.items && L.count(q.states, q.answer - 1) < q.items, "eng kamida");
      if (prev) assert.ok(q.thing !== prev.thing || q.states !== prev.states);
      seen.add(`${q.thing}-${q.states}`);
      max = Math.max(max, q.answer);
      prev = q;
    }
    assert.equal(seen.size, L.thingsFor(tier).length * 2); // hamma narsa ikkala chiroq turi bilan chiqadi
    maxAnswer.push(max);
  }
  assert.deepEqual(maxAnswer, [5, 6, 9], "javob zina bilan o'sadi");
  assert.deepEqual(L.makeLampsQuestion(null, () => 0), { thing: 1, text: "10 ta raqam", items: 10, states: 2, answer: 4, tier: 0 });
});
