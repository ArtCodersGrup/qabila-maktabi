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

test("makeFrameTask: jami kadr va necha soniya; chegara tier bilan o'sadi (100 / 150 / 200)", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    const lim = V.FRAME[tier];
    let max = 0;
    for (let k = 0; k < 300; k++) {
      const t = V.makeFrameTask(null, Math.random, tier);
      types.add(t.type);
      assert.ok(V.FPS.includes(t.fps));
      assert.equal(t.total, t.fps * t.seconds);
      assert.ok(t.total <= lim.total && t.seconds >= lim.min && t.seconds <= lim.sec);
      assert.equal(t.answer, t.type === "total" ? t.total : t.seconds);
      max = Math.max(max, t.total);
    }
    assert.deepEqual([...types].sort(), ["seconds", "total"]);
    assert.ok(max > lim.total * 0.7);
    noRepeat((prev) => V.makeFrameTask(prev, Math.random, tier));
  }
  assert.deepEqual(V.FRAME.map((x) => x.total), [100, 150, 200]);
});

test("makeSizeTask: kadrlar, soniyalar, 4 variantli Gbayt taqqoslash (teng ham bor)", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    const answers = new Set();
    for (let k = 0; k < 900; k++) {
      const t = V.makeSizeTask(null, Math.random, tier);
      types.add(t.type);
      if (t.type === "frames") {
        assert.equal(t.answer, t.frameBytes * t.frames);
        assert.ok(t.frames <= 10 && t.answer <= V.FRAMES_TOTAL[tier]);
        assert.ok(t.frameBytes >= V.FRAME_BYTES[tier][0] && t.frameBytes <= V.FRAME_BYTES[tier][1]);
      } else if (t.type === "fps") {
        assert.equal(t.answer, t.frameBytes * t.fps * t.seconds);
        assert.ok(t.answer <= V.FPS_TASK[tier].total && t.seconds >= 2);
      } else {
        assert.equal(t.type, "compare");
        assert.ok(t.gb >= V.CMP_GB[tier][0] && t.gb <= V.CMP_GB[tier][1]);
        assert.ok(t.n >= 1 && t.each >= 1 && Number.isInteger(t.each));
        const v = { gb: t.gb * 1024, mb: t.mb, films: t.n * t.each * 1024 };
        const top = Math.max(v.gb, v.mb, v.films);
        const tops = Object.keys(v).filter((key) => v[key] === top);
        if (t.answer === "teng") assert.equal(tops.length, 3);
        else assert.deepEqual(tops, [t.answer], "bitta eng katta");
        answers.add(t.answer);
      }
      if (t.type !== "compare") assert.ok(t.answer >= 4);
    }
    assert.deepEqual([...types].sort(), ["compare", "fps", "frames"]);
    assert.deepEqual([...answers].sort(), ["films", "gb", "mb", "teng"], `tier ${tier}`);
    noRepeat((prev) => V.makeSizeTask(prev, Math.random, tier));
  }
  assert.equal(V.CMP_OPTIONS.length, 4);
});

test("makeCompressTask: farq, tejalgan piksel, to'rt videodan bittasi (4 variant)", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    const asks = new Set();
    for (let k = 0; k < 400; k++) {
      const t = V.makeCompressTask(null, Math.random, tier);
      types.add(t.type);
      if (t.type === "diff") {
        assert.equal(t.answer, V.diff(t.a, t.b).length);
        assert.equal(t.options.length, 4);
        assert.equal(new Set(t.options).size, 4);
        assert.ok(t.options.includes(t.answer));
        assert.ok(t.options.every((n) => n >= 1));
      } else if (t.type === "saved") {
        assert.equal(t.answer, 36 - t.changed);
        assert.ok(t.changed >= V.CHANGED[tier][0] && t.changed <= V.CHANGED[tier][1]);
        assert.ok(t.answer >= 6);
      } else {
        assert.equal(t.type, "which");
        asks.add(t.ask);
        assert.equal(t.options.length, 4);
        assert.equal(new Set(t.options.map((o) => o.label)).size, 4);
        // "eng ko'p siqiladi" — yagona tinch video; "eng kam" — yagona harakatli
        const want = t.ask === "most";
        assert.equal(t.options.filter((o) => o.calm === want).length, 1);
        assert.equal(t.options[t.answer].calm, want);
      }
    }
    assert.deepEqual([...types].sort(), ["diff", "saved", "which"]);
    assert.deepEqual([...asks].sort(), tier ? ["least", "most"] : ["most"]);
    noRepeat((prev) => V.makeCompressTask(prev, Math.random, tier));
  }
  assert.ok(V.PAIRS.length >= 4);
});
