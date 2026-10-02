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

test("makeBwTask: bit — W × H, bayt — W × H : 8; maydon tier bilan o'sadi (100 / 144 / 256)", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    const lim = P.BW_SIZE[tier];
    let max = 0;
    for (let k = 0; k < 300; k++) {
      const t = P.makeBwTask(null, Math.random, tier);
      types.add(t.type);
      assert.equal(t.cells.length, t.w * t.h);
      assert.ok(t.w >= lim.a && t.h >= lim.a && t.w <= lim.b && t.h <= lim.b && t.w * t.h <= lim.area);
      assert.ok(t.cells.some((c) => c === 1) && t.cells.some((c) => c === 0));
      if (t.type === "bits") assert.equal(t.answer, t.w * t.h);
      else {
        assert.equal((t.w * t.h) % 8, 0);
        assert.equal(t.answer, (t.w * t.h) / 8);
      }
      max = Math.max(max, t.w * t.h);
    }
    assert.deepEqual([...types].sort(), ["bits", "bytes"]);
    assert.ok(max > lim.area * 0.7, `tier ${tier}: eng katta maydon ${max}`);
    noRepeat((prev) => P.makeBwTask(prev, Math.random, tier));
  }
  assert.deepEqual(P.BW_SIZE.map((x) => x.area), [100, 144, 256]);
});

test("makeColorTask: bit soni va rasm hajmi, tier bilan ranglar va hajm o'sadi", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    for (let k = 0; k < 300; k++) {
      const t = P.makeColorTask(null, Math.random, tier);
      types.add(t.type);
      if (t.type === "bpp") {
        assert.ok(P.BPP_TIER[tier].includes(t.colors));
        assert.equal(t.answer, P.minBits(t.colors));
        assert.ok(2 ** t.answer >= t.colors && 2 ** (t.answer - 1) < t.colors);
      } else {
        assert.ok([2, 4, 16].includes(t.colors));
        assert.equal(t.bpp, P.minBits(t.colors));
        assert.equal(t.answer, t.w * t.h * t.bpp);
        assert.ok(t.answer <= P.COLOR_SIZE[tier].bits && t.w * t.h >= 4);
        assert.ok(t.cells.every((c) => c >= 0 && c < t.colors));
      }
    }
    assert.deepEqual([...types].sort(), ["bpp", "size"]);
    noRepeat((prev) => P.makeColorTask(prev, Math.random, tier));
  }
  assert.ok(Math.max(...P.BPP_TIER[2]) === 1000 && Math.max(...P.BPP_TIER[0]) === 16);
});

test("makePhotoTask: rangli rasm, qisqa yozuv, 4 variantli taqqoslash; tier 1+ da kam rangli rasm baytda", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    const answers = new Set();
    for (let k = 0; k < 900; k++) {
      const t = P.makePhotoTask(null, Math.random, tier);
      types.add(t.type);
      if (t.type === "rgb") {
        assert.equal(t.answer, t.w * t.h * 3);
        assert.ok(t.answer <= P.RGB_SIZE[tier].area * 3 && t.w * t.h >= 4);
      } else if (t.type === "cbytes") {
        assert.ok(tier > 0, "tier 0 da bu tur yo'q");
        assert.equal(t.bpp, P.minBits(t.colors));
        assert.equal((t.w * t.h * t.bpp) % 8, 0);
        assert.equal(t.answer, (t.w * t.h * t.bpp) / 8);
        assert.ok(t.cells.every((c) => c >= 0 && c < t.colors));
      } else if (t.type === "runs") {
        const lim = P.RUNS[tier];
        assert.ok(t.row.length >= lim.len[0] && t.row.length <= lim.len[1]);
        assert.equal(t.answer, P.runs(t.row).length);
        assert.ok(t.answer >= lim.r[0] && t.answer <= lim.r[1]);
      } else {
        assert.equal(t.type, "compare");
        assert.ok(t.mb >= P.CMP_MB[tier][0] && t.mb <= P.CMP_MB[tier][1]);
        assert.ok(t.n >= 1 && t.each >= 1 && Number.isInteger(t.each));
        // Mustaqil hisob: Kbaytda
        const v = { mb: t.mb * 1024, kb: t.kb, photos: t.n * t.each * 1024 };
        const max = Math.max(v.mb, v.kb, v.photos);
        const tops = Object.keys(v).filter((key) => v[key] === max);
        if (t.answer === "teng") assert.equal(tops.length, 3);
        else assert.deepEqual(tops, [t.answer], "bitta eng katta");
        answers.add(t.answer);
      }
    }
    assert.deepEqual([...types].sort(), tier ? ["cbytes", "compare", "rgb", "runs"] : ["compare", "rgb", "runs"]);
    assert.deepEqual([...answers].sort(), ["kb", "mb", "photos", "teng"], `tier ${tier}: 4 javobning hammasi uchraydi`);
    noRepeat((prev) => P.makePhotoTask(prev, Math.random, tier));
  }
  assert.equal(P.CMP_OPTIONS.length, 4);
  assert.equal(P.cmpAnswer({ mb: 4, kb: 4096, n: 2, each: 2 }), "teng");
  assert.equal(P.cmpAnswer({ mb: 4, kb: 4000, n: 1, each: 3 }), "mb");
  assert.equal(P.cmpAnswer({ mb: 4, kb: 5000, n: 1, each: 3 }), "kb");
  assert.equal(P.cmpAnswer({ mb: 4, kb: 4000, n: 5, each: 1 }), "photos");
});
