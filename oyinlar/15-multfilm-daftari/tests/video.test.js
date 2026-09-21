// video.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../js/video.js");

const noRepeat = (make) => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = make(prev);
    if (prev) assert.notEqual(V.taskKey(t), V.taskKey(prev));
    prev = t;
  }
};

test("kadr: 6 × 6, pastki qator — yer, quyosh bor", () => {
  const bg = V.background();
  assert.equal(bg.length, 36);
  assert.deepEqual(bg.slice(30), [1, 1, 1, 1, 1, 1]);
  assert.equal(bg.filter((c) => c === 2).length, 1);
});

test("sakrovchi koptok: 6 kadr, har birida bitta koptok, 3-kadr bo'sh", () => {
  assert.equal(V.BOUNCE.length, 6);
  for (let k = 0; k < 6; k++) {
    const f = V.bounceFrame(k);
    assert.equal(f.filter((c) => c === V.BALL).length, 1, `${k}-kadr`);
    const [x, y] = V.BOUNCE[k];
    assert.equal(f[y * 6 + x], V.BALL);
  }
  assert.equal(V.MISSING, 2);
  assert.ok(V.placeOk(...V.BOUNCE[2]));
  assert.ok(V.placeOk(2, 2));
  assert.ok(!V.placeOk(1, 2), "2-kadr joyi emas");
  assert.ok(!V.placeOk(2, 4));
});

test("kichik ekran: 4 × 4 oq-qora, 2 bayt", () => {
  assert.equal(V.TINY.bits, 16);
  assert.equal(V.TINY.bytes, 2);
  assert.equal(V.tinyFrame(0).length, 16);
  assert.equal(V.tinyFrame(3).filter(Boolean).length, 1);
});

test("haqiqiy video: 1 kadr ≈ 6 Mbayt, 1 soniya 144, 1 daqiqa 8640 Mbayt ≈ 8 Gbayt", () => {
  assert.equal(V.REAL.frameBytes, 1920 * 1080 * 3);
  assert.equal(V.REAL.frameMb, 6);
  assert.equal(V.REAL.secondMb, 144);
  assert.equal(V.REAL.minuteMb, 8640);
  assert.equal(V.REAL.minuteGb, 8);
});

test("namuna juftligi: quti bir katak suriladi — 4 ta katak o'zgaradi", () => {
  assert.equal(V.diff(V.DEMO_A, V.DEMO_B).length, 4);
  assert.deepEqual(V.diff(V.DEMO_A, V.DEMO_A), []);
});

test("makeScene: 2–8 ta o'zgarish, yer va quyosh joyida", () => {
  const counts = new Set();
  for (let k = 0; k < 400; k++) {
    const { a, b } = V.makeScene();
    const d = V.diff(a, b);
    counts.add(d.length);
    assert.ok(d.length >= 2 && d.length <= 8);
    assert.deepEqual(a.slice(30), [1, 1, 1, 1, 1, 1]);
    assert.deepEqual(b.slice(30), [1, 1, 1, 1, 1, 1]);
    assert.equal(a[5], 2);
    assert.equal(b[5], 2);
  }
  assert.ok(counts.has(3) || counts.has(5), "toq sonlar ham chiqsin");
});

test("makeFrameTask: jami kadr va necha soniya, javob ≤ 100", () => {
  const types = new Set();
  for (let k = 0; k < 300; k++) {
    const t = V.makeFrameTask(null);
    types.add(t.type);
    assert.ok(V.FPS.includes(t.fps));
    assert.equal(t.total, t.fps * t.seconds);
    assert.ok(t.total <= 100 && t.seconds >= 2);
    assert.equal(t.answer, t.type === "total" ? t.total : t.seconds);
  }
  assert.deepEqual([...types].sort(), ["seconds", "total"]);
  noRepeat((prev) => V.makeFrameTask(prev));
});

test("makeSizeTask: kadrlar, soniyalar, Gbayt taqqoslash", () => {
  const types = new Set();
  for (let k = 0; k < 300; k++) {
    const t = V.makeSizeTask(null);
    types.add(t.type);
    if (t.type === "frames") assert.equal(t.answer, t.frameBytes * t.frames);
    else if (t.type === "fps") assert.equal(t.answer, t.frameBytes * t.fps * t.seconds);
    else {
      assert.equal(t.type, "compare");
      assert.ok(t.mb === 1000 * t.gb || t.mb === 1000 * (t.gb + 1));
      assert.equal(t.answer, t.gb * 1024 > t.mb ? "gb" : "mb");
    }
    if (t.type !== "compare") assert.ok(t.answer <= 100 && t.answer >= 4);
  }
  assert.deepEqual([...types].sort(), ["compare", "fps", "frames"]);
  noRepeat((prev) => V.makeSizeTask(prev));
});

test("makeCompressTask: farq, tejalgan piksel, qaysi video", () => {
  const types = new Set();
  for (let k = 0; k < 300; k++) {
    const t = V.makeCompressTask(null);
    types.add(t.type);
    if (t.type === "diff") {
      assert.equal(t.answer, V.diff(t.a, t.b).length);
      assert.equal(t.options.length, 4);
      assert.equal(new Set(t.options).size, 4);
      assert.ok(t.options.includes(t.answer));
      assert.ok(t.options.every((n) => n >= 1));
    } else if (t.type === "saved") {
      assert.equal(t.answer, 36 - t.changed);
    } else {
      assert.equal(t.type, "which");
      assert.equal(t.options.length, 2);
      assert.equal(t.options[t.answer].calm, true);
    }
  }
  assert.deepEqual([...types].sort(), ["diff", "saved", "which"]);
  assert.ok(V.PAIRS.length >= 4);
  noRepeat((prev) => V.makeCompressTask(prev));
});
