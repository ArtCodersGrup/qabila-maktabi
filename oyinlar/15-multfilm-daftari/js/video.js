// Multfilm daftari — sof hisob: kadrlar (6 × 6), sakrovchi koptok, sahna va kadrlar farqi,
// haqiqiy video hajmi va topshiriqlar. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const SIZE = 6;
  const CELLS = SIZE * SIZE;

  // Katak qiymatlari → ranglar: osmon, yer, quyosh, koptok, qush, quti
  const COLORS = ["#FFFFFF", "#1A9E77", "#F0C040", "#E0524A", "#2F6FDE", "#F08A24"];
  const GROUND = 1;
  const SUN = 2;
  const BALL = 3;
  const BIRD = 4;
  const BOX = 5;

  const at = (x, y) => y * SIZE + x;

  // Fon: pastki qator — yer, o'ng-yuqori burchakda quyosh
  function background() {
    const cells = Array(CELLS).fill(0);
    for (let x = 0; x < SIZE; x++) cells[at(x, SIZE - 1)] = GROUND;
    cells[at(SIZE - 1, 0)] = SUN;
    return cells;
  }

  // 1-bosqich: koptok yoy bo'ylab sakraydi (x, y); 3-kadr (indeks 2) — bola chizadi
  const BOUNCE = [[0, 4], [1, 2], [2, 1], [3, 1], [4, 2], [5, 4]];
  const MISSING = 2;

  function bounceFrame(k) {
    const cells = background();
    const [x, y] = BOUNCE[k];
    cells[at(x, y)] = BALL;
    return cells;
  }

  // Yetishmayotgan kadr: 2- va 4-kadr joylari orasida (3-ustun, 2–3-qator)
  const placeOk = (x, y) => x === 2 && y >= 1 && y <= 2;

  const SPEEDS = { slow: 1, fast: 12 };

  // 2-bosqich: kichik ekran 4 × 4, oq-qora; nuqta chapdan o'ngga yuradi
  const TINY = { w: 4, h: 4, bits: 16, bytes: 2 };
  function tinyFrame(k) {
    const cells = Array(TINY.w * TINY.h).fill(0);
    cells[TINY.w + (k % TINY.w)] = 1;
    return cells;
  }

  // Haqiqiy video: 1920 × 1080, rangli (3 bayt), 24 kadr/soniya
  const frameBytes = 1920 * 1080 * 3;
  const frameMb = Math.round(frameBytes / 1024 / 1024);
  const REAL = {
    w: 1920, h: 1080, fps: 24, frameBytes, frameMb,
    secondMb: frameMb * 24,
    minuteMb: frameMb * 24 * 60,
    minuteGb: Math.floor((frameMb * 24 * 60) / 1024),
  };

  // Namuna: 2 × 2 quti bir katak o'ngga suriladi
  function withBox(x) {
    const cells = background();
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) cells[at(x + dx, 2 + dy)] = BOX;
    return cells;
  }
  const DEMO_A = withBox(1);
  const DEMO_B = withBox(2);

  // O'zgargan kataklar indekslari
  const diff = (a, b) => a.reduce((out, c, i) => (c !== b[i] ? out.concat(i) : out), []);

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];

  // Mashq sahnasi: 1–3 narsa bir katakka suriladi, ba'zan yangi qush paydo bo'ladi.
  // Narsalar faqat osmonda (0–4-qator) va quyoshga tegmaydi.
  function makeScene(rng) {
    rng = rng || Math.random;
    const MOVES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (;;) {
      const a = background();
      const b = background();
      const used = new Set([at(SIZE - 1, 0)]);
      const n = randInt(1, 3, rng);
      let ok = true;
      for (let k = 0; k < n && ok; k++) {
        const kind = k === 0 && rng() < 0.4 ? BOX : pick([BALL, BIRD], rng);
        const s = kind === BOX ? 2 : 1;
        const x = randInt(0, SIZE - s, rng);
        const y = randInt(0, SIZE - 1 - s, rng);
        const [dx, dy] = pick(MOVES, rng);
        const foot = (fx, fy) => {
          const out = [];
          for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) out.push([fx + i, fy + j]);
          return out;
        };
        const from = foot(x, y);
        const to = foot(x + dx, y + dy);
        const inside = to.every(([cx, cy]) => cx >= 0 && cx < SIZE && cy >= 0 && cy < SIZE - 1);
        const cells = [...from, ...to].map(([cx, cy]) => at(cx, cy));
        if (!inside || cells.some((i) => used.has(i))) { ok = false; break; }
        cells.forEach((i) => used.add(i));
        from.forEach(([cx, cy]) => { a[at(cx, cy)] = kind; });
        to.forEach(([cx, cy]) => { b[at(cx, cy)] = kind; });
      }
      if (!ok) continue;
      // Ba'zan 2-kadrda yangi qush paydo bo'ladi (1 ta o'zgarish — toq sonlar ham chiqsin)
      if (rng() < 0.4) {
        const free = [];
        for (let i = 0; i < at(0, SIZE - 1); i++) if (!used.has(i)) free.push(i);
        b[pick(free, rng)] = BIRD;
      }
      const changed = diff(a, b).length;
      if (changed >= 2 && changed <= 8) return { a, b };
    }
  }

  // "Qaysi video ko'proq siqiladi?" — tinch va harakatli video juftliklari
  const PAIRS = [
    { calm: "Yangiliklar: diktor deyarli qimirlamaydi", busy: "Futbol: hamma yugurib yuribdi" },
    { calm: "Uxlayotgan mushuk", busy: "Oʻynayotgan kuchukchalar" },
    { calm: "Tinch koʻl manzarasi", busy: "Poyga mashinalari" },
    { calm: "Dars: oʻqituvchi doska oldida", busy: "Multfilm: quvlashmachoq" },
    { calm: "Tungi osmon va yulduzlar", busy: "Bayramdagi raqs" },
  ];

  const FPS = [2, 4, 5, 10, 12, 24];

  const taskKey = (t) => JSON.stringify([t.type, t.answer, t.fps, t.seconds, t.frameBytes, t.frames, t.gb, t.mb, t.n, t.each, t.ask,
    t.changed, t.a && t.a.join(""), t.b && t.b.join(""), t.options && t.options.map((o) => (typeof o === "object" ? o.label : o))]);
  const same = (a, b) => !!a && taskKey(a) === taskKey(b);

  // Qiyinlik zinasi (QOIDALAR 4.3): chegaralar tier 0 / 1 / 2 bo'yicha
  const FRAME = [{ min: 2, sec: 9, total: 100 }, { min: 3, sec: 12, total: 150 }, { min: 4, sec: 15, total: 200 }]; // 1-bosqich
  const FRAME_BYTES = [[2, 12], [4, 16], [6, 20]]; // 2-bosqich: 1 kadr hajmi; kadrlar ≤ 10
  const FRAMES_TOTAL = [100, 150, 200]; // kadrlar × bayt chegarasi
  const FPS_TASK = [{ fb: [1, 4], sec: 5, total: 100 }, { fb: [1, 5], sec: 5, total: 150 }, { fb: [2, 6], sec: 6, total: 240 }];
  const CMP_GB = [[1, 5], [2, 9], [6, 20]]; // taqqoslashdagi Gbayt
  const CHANGED = [[2, 12], [8, 20], [15, 30]]; // 3-bosqich: o'zgargan piksellar (kadr — 36 piksel)

  // 1-bosqich mashqi: jami kadr / necha soniya
  function makeFrameTask(prev, rng, tier) {
    rng = rng || Math.random;
    const lim = FRAME[tier || 0];
    for (;;) {
      const fps = pick(FPS, rng);
      const max = Math.min(lim.sec, Math.floor(lim.total / fps));
      if (max < lim.min) continue;
      const seconds = randInt(lim.min, max, rng);
      const type = rng() < 0.5 ? "total" : "seconds";
      const task = { type, fps, seconds, total: fps * seconds, answer: type === "total" ? fps * seconds : seconds };
      if (!same(prev, task)) return task;
    }
  }

  // "Qaysi biri eng katta?" — uch karta: g Gbayt, m Mbayt, n ta kino × s Gbayt — va "Uchalasi teng" (4 variant).
  // Qiymatlar Mbaytda. Yo bitta eng katta, yo uchalasi teng.
  const cmpSizes = (t) => ({ gb: t.gb * 1024, mb: t.mb, films: t.n * t.each * 1024 });
  function cmpAnswer(t) {
    const v = cmpSizes(t);
    if (v.gb === v.mb && v.gb === v.films) return "teng";
    const max = Math.max(v.gb, v.mb, v.films);
    return ["gb", "mb", "films"].find((k) => v[k] === max);
  }
  const CMP_OPTIONS = ["gb", "mb", "films", "teng"];
  function makeCompareTask(rng, tier) {
    const [lo, hi] = CMP_GB[tier];
    for (;;) {
      const gb = randInt(lo, hi, rng);
      const equal = rng() < 0.2;
      const total = equal ? gb : gb + pick([-2, -1, 1, 2], rng);
      if (total < 1) continue;
      const ns = [2, 3, 4, 5].filter((n) => total % n === 0);
      const n = ns.length ? pick(ns, rng) : 1;
      // 1000 ≠ 1024 tuzog'i: 1000·g Mbayt < g Gbayt < 1000·(g + 1) Mbayt
      const mb = equal ? gb * 1024 : 1000 * (gb + (rng() < 0.5 ? 0 : 1));
      const task = { type: "compare", gb, mb, n, each: total / n };
      const v = cmpSizes(task);
      const top = Math.max(v.gb, v.mb, v.films);
      if ([v.gb, v.mb, v.films].filter((x) => x === top).length === 2) continue; // ikkitasi teng — savol noaniq
      task.answer = cmpAnswer(task);
      return task;
    }
  }

  // 2-bosqich mashqi: kadrlar × bayt, soniyalar, Gbayt va Mbayt
  function makeSizeTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const r = rng();
      let task;
      if (r < 1 / 3) {
        const frameBytes = randInt(FRAME_BYTES[tier][0], FRAME_BYTES[tier][1], rng);
        const lo = tier ? 4 : 2;
        const max = Math.min(10, Math.floor(FRAMES_TOTAL[tier] / frameBytes));
        if (max < lo) continue;
        const frames = randInt(lo, max, rng);
        task = { type: "frames", frameBytes, frames, answer: frameBytes * frames };
      } else if (r < 2 / 3) {
        const lim = FPS_TASK[tier];
        const frameBytes = randInt(lim.fb[0], lim.fb[1], rng);
        const fps = pick([2, 4, 5, 10], rng);
        const max = Math.floor(lim.total / (frameBytes * fps));
        if (max < 2) continue;
        const seconds = randInt(2, Math.min(lim.sec, max), rng);
        task = { type: "fps", frameBytes, fps, seconds, answer: frameBytes * fps * seconds };
      } else {
        task = makeCompareTask(rng, tier);
      }
      if (!same(prev, task)) return task;
    }
  }

  // 4 xil son: to'g'ri javob va unga yaqinlari (1 dan kichik emas), aralashtirilgan
  function numberOptions(answer, rng) {
    const set = new Set([answer]);
    for (const d of [1, -1, 2, -2, 3, 4]) {
      if (set.size === 4) break;
      if (answer + d >= 1) set.add(answer + d);
    }
    const list = [...set];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function shuffle(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // 3-bosqich mashqi: nechta katak o'zgardi, nechta piksel tejaldi, to'rt videodan qaysi biri eng ko'p / eng kam siqiladi
  function makeCompressTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const r = rng();
      let task;
      if (r < 1 / 3) {
        const { a, b } = makeScene(rng);
        const answer = diff(a, b).length;
        task = { type: "diff", a, b, answer, options: numberOptions(answer, rng) };
      } else if (r < 2 / 3) {
        const changed = randInt(CHANGED[tier][0], CHANGED[tier][1], rng);
        task = { type: "saved", changed, answer: CELLS - changed };
      } else {
        // 4 variant: "eng ko'p siqiladi" — 1 tinch + 3 harakatli; "eng kam siqiladi" (tier 1+) — 1 harakatli + 3 tinch
        const ask = tier > 0 && rng() < 0.5 ? "least" : "most";
        const calm = shuffle(PAIRS.map((p) => p.calm), rng);
        const busy = shuffle(PAIRS.map((p) => p.busy), rng);
        const one = ask === "most" ? { label: calm[0], calm: true } : { label: busy[0], calm: false };
        const rest = (ask === "most" ? busy : calm).slice(0, 3).map((label) => ({ label, calm: ask !== "most" }));
        const options = shuffle([one, ...rest], rng);
        task = { type: "which", ask, options, answer: options.indexOf(one) };
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = {
    SIZE, CELLS, COLORS, GROUND, SUN, BALL, BIRD, BOX,
    background, BOUNCE, MISSING, bounceFrame, placeOk, SPEEDS,
    TINY, tinyFrame, REAL, DEMO_A, DEMO_B, diff, makeScene, PAIRS, FPS,
    taskKey, makeFrameTask, makeSizeTask, makeCompressTask,
    FRAME, FRAME_BYTES, FRAMES_TOTAL, FPS_TASK, CMP_GB, CHANGED, CMP_OPTIONS, cmpSizes, cmpAnswer,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.video = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
