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

test("makeLadderTask: hamma savol 4 variantli; tier 1+ da ikki pog'ona, tier 2 da qadamlar soni", () => {
  const expected = [["next", "number", "unit"], ["next", "next2", "number", "unit", "unit2"], ["next", "next2", "number", "steps", "unit", "unit2"]];
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    for (let k = 0; k < 500; k++) {
      const t = U.makeLadderTask(null, Math.random, tier);
      types.add(t.type);
      assert.ok(t.options.includes(t.answer), JSON.stringify(t));
      assert.equal(t.options.length, 4, `${t.type}: 4 variant`);
      assert.equal(new Set(t.options).size, 4);
      if (t.type === "unit") assert.equal(t.answer, U.UNITS[t.i - 1]);
      if (t.type === "number") assert.equal(t.answer, String(U.factor(t.i - 1)));
      if (t.type === "next") assert.equal(t.answer, U.UNITS[t.i + 1]);
      if (t.type === "next2") assert.equal(t.answer, U.UNITS[t.i + 2]);
      if (t.type === "unit2") {
        assert.equal(t.answer, U.UNITS[t.i - 2]);
        // 1 U[i] = factor × factor U[i−2] — mustaqil hisob bitlarda
        assert.equal(U.toBits(1, U.UNITS[t.i]), U.factor(t.i - 1) * U.factor(t.i - 2) * U.toBits(1, U.UNITS[t.i - 2]));
        assert.ok(t.text.includes(`${U.factor(t.i - 1)} × ${U.factor(t.i - 2)}`));
      }
      if (t.type === "steps") {
        assert.equal(Number(t.answer), t.j - t.i);
        assert.ok(t.i >= 1, "bit → bayt qadami × 8 — bu savolga kirmaydi");
        assert.equal(U.toBits(1, U.UNITS[t.j]) / U.toBits(1, U.UNITS[t.i]), 1024 ** (t.j - t.i));
      }
      assert.ok(t.text.includes("___") || t.text.includes("?"));
    }
    assert.deepEqual([...types].sort(), expected[tier]);
    noRepeat((prev) => U.makeLadderTask(prev, Math.random, tier));
  }
});

test("makeCompareTask: uch karta + «Uchalasi teng» — 4 variant; yo bitta eng katta, yo uchalasi teng", () => {
  for (const tier of [0, 1, 2]) {
    const answers = new Set();
    const types = new Set();
    for (let k = 0; k < 600; k++) {
      const t = U.makeCompareTask(null, Math.random, tier);
      types.add(t.type);
      assert.equal(t.cards.length, 3);
      assert.equal(new Set(t.cards.map((c) => c.label)).size, 3);
      assert.equal(U.UNITS.indexOf(t.unit) - U.UNITS.indexOf(t.small), 1);
      // Mustaqil hisob: yozuvdan qiymat (kichik birlikda)
      for (const c of t.cards) {
        const value = c.label.split(" + ").reduce((sum, part) => {
          const [n, unit] = part.split(" ");
          return sum + Number(n) * (unit === t.unit ? 1024 : 1);
        }, 0);
        assert.equal(c.value, value, c.label);
      }
      const top = Math.max(...t.cards.map((c) => c.value));
      const tops = t.cards.map((c, i) => (c.value === top ? i : -1)).filter((i) => i >= 0);
      if (t.answer === U.TENG) assert.equal(tops.length, 3);
      else assert.deepEqual(tops, [t.answer], "bitta eng katta");
      answers.add(t.answer);
    }
    assert.deepEqual([...answers].sort(), [0, 1, 2, 3], `tier ${tier}: 4 javobning hammasi uchraydi`);
    assert.deepEqual([...types].sort(), ["equal", "mixed"]);
    noRepeat((prev) => U.makeCompareTask(prev, Math.random, tier));
  }
  assert.equal(U.TENG, 3);
});

test("makeFitTask: xotira : fayl, javob butun; tier 1+ da «yana nechta sig'adi»", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    for (let k = 0; k < 400; k++) {
      const t = U.makeFitTask(null, Math.random, tier);
      types.add(t.type);
      const capBits = U.toBits(t.cap, t.capUnit);
      const fileBits = U.toBits(t.size, t.sizeUnit);
      assert.equal(capBits % fileBits, 0);
      if (t.type === "left") {
        assert.equal(t.answer, capBits / fileBits - t.used);
        assert.ok(t.used >= 1 && t.answer >= 2, JSON.stringify(t));
      } else {
        assert.equal(t.answer, capBits / fileBits);
      }
      assert.ok(t.answer >= 2 && t.answer <= 64);
      if (t.type === "cross") {
        assert.equal(U.UNITS.indexOf(t.capUnit) - U.UNITS.indexOf(t.sizeUnit), 1);
        assert.ok(t.cap >= U.CROSS_CAP[tier][0] && t.cap <= U.CROSS_CAP[tier][1]);
        assert.ok(U.CROSS_SIZE[tier].includes(t.size));
      } else assert.equal(t.capUnit, t.sizeUnit);
    }
    assert.deepEqual([...types].sort(), [["cross", "same"], ["cross", "left", "same"], ["cross", "left"]][tier]);
    noRepeat((prev) => U.makeFitTask(prev, Math.random, tier));
  }
});
