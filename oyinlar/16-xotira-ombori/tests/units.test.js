// units.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const U = require("../js/units.js");

const noRepeat = (make) => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = make(prev);
    if (prev) assert.notEqual(JSON.stringify(t), JSON.stringify(prev));
    prev = t;
  }
};

test("zinapoya: 6 birlik, birinchi qadam × 8, qolganlari × 1024", () => {
  assert.deepEqual(U.UNITS, ["bit", "bayt", "Kbayt", "Mbayt", "Gbayt", "Tbayt"]);
  assert.deepEqual([0, 1, 2, 3, 4].map(U.factor), [8, 1024, 1024, 1024, 1024]);
});

test("toBits va compare", () => {
  assert.equal(U.toBits(1, "bayt"), 8);
  assert.equal(U.toBits(1, "Kbayt"), 8 * 1024);
  assert.equal(U.toBits(1, "Tbayt"), 8 * 1024 ** 4);
  assert.equal(U.compare({ n: 2000, unit: "Mbayt" }, { n: 1, unit: "Gbayt" }), 1);
  assert.equal(U.compare({ n: 3, unit: "Gbayt" }, { n: 3000, unit: "Mbayt" }), 1);
  assert.equal(U.compare({ n: 1, unit: "Kbayt" }, { n: 1024, unit: "bayt" }), 0);
  assert.equal(U.compare({ n: 900, unit: "Kbayt" }, { n: 1, unit: "Mbayt" }), -1);
});

test("fayllar: 5 ta, hajmi bo'yicha tartibi to'g'ri", () => {
  assert.equal(U.ITEMS.length, 5);
  const sorted = U.ITEMS.slice().sort((a, b) => U.compare(a, b));
  assert.deepEqual(sorted.map((i) => i.id), U.ORDER);
  assert.deepEqual(U.ORDER, ["sms", "page", "photo", "song", "film"]);
});

test("disk: 1 Tbayt (do'kon) = 931 Gbayt (kompyuter)", () => {
  assert.equal(U.DISK.gb, 931);
  assert.equal(U.FLASH.gb / U.FLASH.film, 4);
  assert.equal((U.CROSS.gb * 1024) / U.CROSS.mb, 4);
});

test("makeLadderTask: birlik, son va keyingisi", () => {
  const types = new Set();
  for (let k = 0; k < 300; k++) {
    const t = U.makeLadderTask(null);
    types.add(t.type);
    assert.ok(t.options.includes(t.answer), JSON.stringify(t));
    assert.equal(new Set(t.options).size, t.options.length);
    if (t.type === "unit") assert.equal(t.answer, U.UNITS[t.i - 1]);
    if (t.type === "number") assert.equal(t.answer, String(U.factor(t.i - 1)));
    if (t.type === "next") assert.equal(t.answer, U.UNITS[t.i + 1]);
    assert.ok(t.text.includes("___") || t.type === "next");
  }
  assert.deepEqual([...types].sort(), ["next", "number", "unit"]);
  noRepeat((prev) => U.makeLadderTask(prev));
});

test("makeCompareTask: javob — haqiqatan kattasi, teng emas", () => {
  const types = new Set();
  for (let k = 0; k < 400; k++) {
    const t = U.makeCompareTask(null);
    types.add(t.type);
    const c = U.compare(t.a, t.b);
    assert.notEqual(c, 0);
    assert.equal(t.answer, c > 0 ? 0 : 1);
    if (t.type === "same") assert.equal(t.a.unit, t.b.unit);
    else assert.equal(Math.abs(U.UNITS.indexOf(t.a.unit) - U.UNITS.indexOf(t.b.unit)), 1);
  }
  assert.deepEqual([...types].sort(), ["adjacent", "same", "trap"]);
  noRepeat((prev) => U.makeCompareTask(prev));
});

test("makeFitTask: xotira : fayl, javob butun va ≤ 64", () => {
  const types = new Set();
  for (let k = 0; k < 300; k++) {
    const t = U.makeFitTask(null);
    types.add(t.type);
    const capBits = U.toBits(t.cap, t.capUnit);
    const fileBits = U.toBits(t.size, t.sizeUnit);
    assert.equal(capBits % fileBits, 0);
    assert.equal(t.answer, capBits / fileBits);
    assert.ok(t.answer >= 2 && t.answer <= 64);
    if (t.type === "same") assert.equal(t.capUnit, t.sizeUnit);
    else assert.equal(U.UNITS.indexOf(t.capUnit) - U.UNITS.indexOf(t.sizeUnit), 1);
  }
  assert.deepEqual([...types].sort(), ["cross", "same"]);
  noRepeat((prev) => U.makeFitTask(prev));
});
