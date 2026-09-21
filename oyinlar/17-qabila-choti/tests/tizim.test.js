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

test("makeChotiTask: choʻtdagi son va +1, 3 ta simga sigʻadi", () => {
  const types = new Set();
  for (let k = 0; k < 300; k++) {
    const t = T.makeChotiTask(null);
    types.add(t.type);
    assert.ok(t.base >= 2 && t.base <= 9);
    assert.ok(t.value < t.base ** 3);
    if (t.type === "read") {
      assert.equal(t.answer, S.toBase(t.value, t.base));
      assert.ok(t.value >= t.base ** 2, "birinchi sim bo'sh bo'lmasin");
    } else {
      assert.equal(t.value % t.base, t.base - 1, "oxirgi simda n−1");
      assert.equal(t.answer, S.toBase(t.value + 1, t.base));
      assert.ok(t.value + 1 < t.base ** 3);
    }
  }
  assert.deepEqual([...types].sort(), ["next", "read"]);
  noRepeat((prev) => T.makeChotiTask(prev));
});

test("makeDigitTask: yozuv to'g'riligi, eng kichik asos, harf qiymati", () => {
  const types = new Set();
  let yes = 0;
  let no = 0;
  for (let k = 0; k < 400; k++) {
    const t = T.makeDigitTask(null);
    types.add(t.type);
    if (t.type === "valid") {
      assert.equal(t.answer, S.valid(t.number, t.base) ? "ha" : "yoq");
      if (t.answer === "ha") yes++;
      else no++;
      assert.notEqual(t.number[0], "0");
    } else if (t.type === "minBase") {
      const max = Math.max(...[...t.number].map(S.digitValue));
      assert.equal(t.answer, Math.max(2, max + 1));
    } else {
      assert.equal(t.type, "digitVal");
      assert.equal(t.answer, S.digitValue(t.digit));
      assert.ok(t.answer >= 10);
    }
  }
  assert.ok(yes > 20 && no > 20);
  assert.deepEqual([...types].sort(), ["digitVal", "minBase", "valid"]);
  noRepeat((prev) => T.makeDigitTask(prev));
});

test("makePlaceTask: xona qiymati, raqam turgan xona, tizim turi", () => {
  const types = new Set();
  for (let k = 0; k < 400; k++) {
    const t = T.makePlaceTask(null);
    types.add(t.type);
    if (t.type === "place") {
      assert.equal(t.answer, t.base ** (t.k - 1));
      assert.ok(t.k >= 2 && t.answer <= 256);
    } else if (t.type === "digitPlace") {
      assert.ok(S.valid(t.number, t.base));
      assert.equal(t.number.split(t.digit).length - 1, 1, "raqam bir marta uchrasin");
      const pos = t.number.indexOf(t.digit);
      assert.equal(t.answer, t.base ** (t.number.length - 1 - pos));
    } else {
      assert.equal(t.type, "kind");
      assert.ok(["poz", "nopoz"].includes(t.answer));
      assert.ok(t.why.length > 5);
    }
  }
  assert.deepEqual([...types].sort(), ["digitPlace", "kind", "place"]);
  assert.ok(T.KINDS.some((x) => x.kind === "poz") && T.KINDS.some((x) => x.kind === "nopoz"));
  noRepeat((prev) => T.makePlaceTask(prev));
});
