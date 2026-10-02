// tizim.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const S = require("../../umumiy/js/sanoq.js");
const T = require("../js/tizim.js");

const noRepeat = (make) => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = make(prev);
    if (prev) assert.notEqual(JSON.stringify(t), JSON.stringify(prev));
    prev = t;
  }
};

test("makeChotiTask: choʻtdagi son va +1, simlarga sigʻadi; tier 2 da 4 sim", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    let doubleCarry = 0;
    for (let k = 0; k < 400; k++) {
      const t = T.makeChotiTask(null, Math.random, tier);
      types.add(t.type);
      assert.equal(t.rods, tier === 2 ? 4 : 3);
      assert.ok(t.base >= 2 && t.base <= (tier === 2 ? 6 : 9));
      assert.ok(t.value < t.base ** t.rods);
      assert.ok(t.value <= 729, "son yoddan o'qiladigan chegarada");
      if (tier === 2) assert.ok(t.value <= 255 && t.value + (t.type === "next" ? 1 : 0) <= 255);
      assert.ok(t.answer.length <= t.rods, `${t.answer} — ${t.rods} simga sig'adi`);
      if (t.type === "read") {
        assert.equal(t.answer, S.toBase(t.value, t.base));
        assert.ok(t.value >= t.base ** (t.rods - 1), "birinchi sim bo'sh bo'lmasin");
      } else {
        assert.equal(t.value % t.base, t.base - 1, "oxirgi simda n−1");
        assert.equal(t.answer, S.toBase(t.value + 1, t.base));
        assert.ok(t.value + 1 < t.base ** t.rods);
        if (t.value % t.base ** 2 === t.base ** 2 - 1) doubleCarry++;
      }
    }
    assert.deepEqual([...types].sort(), ["next", "read"]);
    if (tier >= 1) assert.ok(doubleCarry > 20, "tier 1+ da ko'chish ikki simdan o'tadi");
    noRepeat((prev) => T.makeChotiTask(prev, Math.random, tier));
  }
  assert.equal(T.makeChotiTask(null).rods, 3); // tier berilmasa — 0
});

test("makeDigitTask: noto'g'ri raqamni topish (4+ variant), eng kichik asos, harf qiymati", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    let good = 0;
    let bad = 0;
    let letters = 0;
    for (let k = 0; k < 600; k++) {
      const t = T.makeDigitTask(null, Math.random, tier);
      types.add(t.type);
      if (t.type === "valid") {
        assert.equal(t.number.length, 3 + tier, "variantlar soni = uzunlik + 1 ≥ 4");
        assert.notEqual(t.number[0], "0");
        // Xato raqamlar: mustaqil hisob
        const wrong = [...t.number].map((ch, i) => (S.digitValue(ch) >= t.base ? i : -1)).filter((i) => i >= 0);
        if (t.answer === -1) {
          good++;
          assert.deepEqual(wrong, []);
          assert.ok(S.valid(t.number, t.base));
        } else {
          bad++;
          assert.deepEqual(wrong, [t.answer], "aynan bitta xato raqam");
          if (tier === 2) assert.equal(S.digitValue(t.number[t.answer]), t.base, "tier 2: xato raqam asosga teng");
        }
        if (t.answer === -1 && /[A-F]/.test(t.number)) letters++;
      } else if (t.type === "minBase") {
        const max = Math.max(...[...t.number].map(S.digitValue));
        assert.equal(t.answer, Math.max(2, max + 1));
        assert.ok(t.number.length >= (tier === 2 ? 4 : 3) && t.number.length <= (tier === 2 ? 5 : 4));
      } else {
        assert.equal(t.type, "digitVal");
        assert.equal(t.answer, S.digitValue(t.digit));
        assert.ok(t.answer >= 10);
      }
    }
    assert.ok(good > 20 && bad > 60, `${good}/${bad}`);
    assert.ok(letters > 0, "harfli to'g'ri yozuv ham chiqadi");
    assert.deepEqual([...types].sort(), ["digitVal", "minBase", "valid"]);
    noRepeat((prev) => T.makeDigitTask(prev, Math.random, tier));
  }
});

test("makePlaceTask: xona qiymati, raqam turgan xona, tizim turi (4 yozuvdan bittasi)", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    let maxPlace = 0;
    for (let k = 0; k < 600; k++) {
      const t = T.makePlaceTask(null, Math.random, tier);
      types.add(t.type);
      if (t.type === "place") {
        assert.equal(t.answer, t.base ** (t.k - 1));
        assert.ok(t.k >= (tier === 2 ? 3 : 2) && t.answer <= T.PLACE_MAX[tier]);
        maxPlace = Math.max(maxPlace, t.answer);
      } else if (t.type === "digitPlace") {
        assert.ok(S.valid(t.number, t.base));
        assert.equal(t.number.split(t.digit).length - 1, 1, "raqam bir marta uchrasin");
        const pos = t.number.indexOf(t.digit);
        assert.equal(t.answer, t.base ** (t.number.length - 1 - pos));
        assert.ok(t.answer <= 256);
        const [lo, hi] = T.DIGIT_PLACE[tier][t.base];
        assert.ok(t.number.length >= lo && t.number.length <= hi);
      } else {
        assert.equal(t.type, "kind");
        assert.ok(["poz", "nopoz"].includes(t.ask));
        assert.equal(t.options.length, 4);
        assert.equal(new Set(t.options).size, 4);
        // Aynan bitta variant so'ralgan turda
        const kinds = t.options.map((text) => T.KINDS.find((x) => x.text === text).kind);
        assert.equal(kinds.filter((x) => x === t.ask).length, 1);
        assert.equal(T.KINDS.find((x) => x.text === t.answer).kind, t.ask);
        assert.ok(t.options.includes(t.answer));
        assert.ok(t.why.length > 5);
      }
    }
    assert.deepEqual([...types].sort(), ["digitPlace", "kind", "place"]);
    assert.equal(maxPlace, T.PLACE_MAX[tier], "chegara tier bilan o'sadi");
    noRepeat((prev) => T.makePlaceTask(prev, Math.random, tier));
  }
  assert.deepEqual(T.PLACE_MAX, [64, 256, 1024]);
  assert.ok(T.KINDS.filter((x) => x.kind === "poz").length >= 3 && T.KINDS.filter((x) => x.kind === "nopoz").length >= 3);
});
