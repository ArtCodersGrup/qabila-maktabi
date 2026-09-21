// pixels.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/pixels.js");

const noRepeat = (make) => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = make(prev);
    if (prev) assert.notDeepEqual(P.taskKey(t), P.taskKey(prev));
    prev = t;
  }
};

test("minBits va kodlar", () => {
  assert.deepEqual([2, 3, 4, 5, 8, 16, 17, 256].map(P.minBits), [1, 2, 2, 3, 3, 4, 5, 8]);
  assert.equal(P.code(0, 2), "00");
  assert.equal(P.code(3, 2), "11");
  assert.equal(P.code(1, 1), "1");
});

test("4 rangli palitra: oq 00, qizil 01, yashil 10, ko'k 11", () => {
  assert.deepEqual(P.PALETTE4.map((c) => c.name), ["oq", "qizil", "yashil", "koʻk"]);
  P.PALETTE4.forEach((c, i) => assert.equal(c.code, P.code(i, 2)));
  assert.equal(P.PALETTE16.length, 16);
  assert.equal(new Set(P.PALETTE16).size, 16);
});

test("ranglar jadvali: 2 → 1 … 256 → 8", () => {
  for (const [colors, bits] of P.COLOR_TABLE) assert.equal(P.minBits(colors), bits);
  assert.deepEqual(P.COLOR_TABLE.map((r) => r[0]), [2, 4, 8, 16, 256]);
});

test("runs: qator bo'laklari (qisqa yozuv)", () => {
  assert.deepEqual(P.runs([1, 1, 1, 0, 0, 1]), [{ value: 1, count: 3 }, { value: 0, count: 2 }, { value: 1, count: 1 }]);
  assert.deepEqual(P.runs(P.DEMO_ROW).map((r) => r.count), [6, 2, 2]);
  assert.equal(P.DEMO_ROW.length, 10);
});

test("rang aralashtirish: 8 xil nom, nishonlar sariq va oq", () => {
  assert.equal(P.mixName([1, 1, 0]), "sariq");
  assert.equal(P.mixName([1, 1, 1]), "oq");
  assert.equal(P.mixName([0, 0, 0]), "qora");
  assert.equal(P.mixCss([1, 0, 1]), "rgb(255, 0, 255)");
  const names = new Set();
  for (let k = 0; k < 8; k++) names.add(P.mixName([k >> 2 & 1, k >> 1 & 1, k & 1]));
  assert.equal(names.size, 8);
  assert.deepEqual(P.TARGETS.map((t) => P.mixName(t)), ["sariq", "oq"]);
});

test("telefon surati: 12 million piksel, 36 million bayt ≈ 34 Mbayt", () => {
  assert.equal(P.PHOTO.pixels, 12000000);
  assert.equal(P.PHOTO.bytes, 36000000);
  assert.equal(P.PHOTO.mb, 34);
});

test("makeBwTask: bit — W × H, bayt — W × H : 8, javob ≤ 100", () => {
  const types = new Set();
  for (let k = 0; k < 300; k++) {
    const t = P.makeBwTask(null);
    types.add(t.type);
    assert.equal(t.cells.length, t.w * t.h);
    assert.ok(t.w >= 3 && t.h >= 3 && t.w * t.h <= 100);
    assert.ok(t.cells.some((c) => c === 1) && t.cells.some((c) => c === 0));
    if (t.type === "bits") assert.equal(t.answer, t.w * t.h);
    else {
      assert.equal((t.w * t.h) % 8, 0);
      assert.equal(t.answer, (t.w * t.h) / 8);
    }
  }
  assert.deepEqual([...types].sort(), ["bits", "bytes"]);
  noRepeat((prev) => P.makeBwTask(prev));
});

test("makeColorTask: bit soni va rasm hajmi", () => {
  const types = new Set();
  for (let k = 0; k < 300; k++) {
    const t = P.makeColorTask(null);
    types.add(t.type);
    if (t.type === "bpp") {
      assert.ok(P.BPP_COLORS.includes(t.colors));
      assert.equal(t.answer, P.minBits(t.colors));
    } else {
      assert.ok([2, 4, 16].includes(t.colors));
      assert.equal(t.bpp, P.minBits(t.colors));
      assert.equal(t.answer, t.w * t.h * t.bpp);
      assert.ok(t.answer <= 100 && t.w * t.h >= 4);
      assert.ok(t.cells.every((c) => c >= 0 && c < t.colors));
    }
  }
  assert.deepEqual([...types].sort(), ["bpp", "size"]);
  noRepeat((prev) => P.makeColorTask(prev));
});

test("makePhotoTask: rangli rasm, qisqa yozuv, Mbayt taqqoslash", () => {
  const types = new Set();
  for (let k = 0; k < 400; k++) {
    const t = P.makePhotoTask(null);
    types.add(t.type);
    if (t.type === "rgb") {
      assert.equal(t.answer, t.w * t.h * 3);
      assert.ok(t.answer <= 100 && t.w * t.h >= 4);
    } else if (t.type === "runs") {
      assert.ok(t.row.length >= 8 && t.row.length <= 12);
      assert.equal(t.answer, P.runs(t.row).length);
      assert.ok(t.answer >= 2 && t.answer <= 5);
    } else {
      assert.equal(t.type, "compare");
      assert.ok(t.kb === 1000 * t.mb || t.kb === 1000 * (t.mb + 1));
      assert.equal(t.answer, t.mb * 1024 > t.kb ? "mb" : "kb");
    }
  }
  assert.deepEqual([...types].sort(), ["compare", "rgb", "runs"]);
  noRepeat((prev) => P.makePhotoTask(prev));
});
