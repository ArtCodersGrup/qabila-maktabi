// Robotni o'rgatamiz — sof hisob: misollar, eng yaqin misol, chiziqli model, xato va o'qitish.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
// Maydon: x — yong'oqning kattaligi, y — og'irligi (1..9). Chiziqdan yuqorisi — "to'la".
(function (root) {
  "use strict";

  const ANGLES = [-60, -45, -30, -15, 0, 15, 30, 45, 60];
  const Y_MIN = 1.5;
  const Y_MAX = 8.5;
  const Y_STEP = 0.5;
  const START = { angle: 0, y0: 5 }; // robotning boshlang'ich modeli
  const ACTIONS = ["up", "down", "left", "right"];

  const slope = (angle) => Math.tan((angle * Math.PI) / 180);
  const lineY = (line, x) => line.y0 + slope(line.angle) * (x - 5);

  // Nuqta chiziqdan yuqoridami (chiziq (5, y0) nuqtasidan o'tadi)
  const above = (line, p) => p.y - lineY(line, p.x) > 0;

  // Modelning bashorati: chiziqdan yuqorida — to'la
  const predict = (line, p) => above(line, p);

  // Nuqtadan chiziqqacha bo'lgan masofa
  const gap = (line, p) => Math.abs(p.y - lineY(line, p.x)) * Math.cos(Math.atan(slope(line.angle)));

  const wrongOnes = (points, line) => points.filter((p) => predict(line, p) !== p.full);
  const errorsOf = (points, line) => wrongOnes(points, line).length;

  // Xatoning "kattaligi": noto'g'ri tomondagi nuqtalar chiziqdan qancha uzoqda
  const loss = (points, line) => wrongOnes(points, line).reduce((sum, p) => sum + gap(line, p), 0);

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const nearestList = (points, q, k) => [...points].sort((a, b) => dist(a, q) - dist(b, q)).slice(0, k);
  const nearest = (points, q) => nearestList(points, q, 1)[0];

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const round1 = (v) => Math.round(v * 10) / 10;
  const keyOf = (line) => `${line.angle}:${line.y0}`;

  // Chiziqni surish: "up" / "down" — ko'tarish-tushirish, "left" / "right" — burish
  function move(line, action) {
    if (action === "up" || action === "down") {
      const y0 = round1(clamp(line.y0 + (action === "up" ? Y_STEP : -Y_STEP), Y_MIN, Y_MAX));
      return { angle: line.angle, y0 };
    }
    const i = ANGLES.indexOf(line.angle);
    const j = clamp(i + (action === "left" ? 1 : -1), 0, ANGLES.length - 1);
    return { angle: ANGLES[j], y0: line.y0 };
  }

  // Robotning o'qitilishi: har qadamda xatoni eng ko'p kamaytiradigan surish tanlanadi.
  // Qaytaradi: [{ line, errors }] — boshlang'ich holatdan oxirgisigacha.
  function train(points, start, maxSteps) {
    let line = start || START;
    const seen = new Set([keyOf(line)]);
    const steps = [{ line, errors: errorsOf(points, line) }];
    for (let k = 0; k < (maxSteps || 40); k++) {
      if (errorsOf(points, line) === 0) break;
      const cur = loss(points, line);
      let best = null;
      for (const action of ACTIONS) {
        const next = move(line, action);
        if (seen.has(keyOf(next))) continue;
        const value = loss(points, next);
        if (!best || value < best.value) best = { line: next, value };
      }
      if (!best || best.value >= cur - 1e-9) break;
      line = best.line;
      seen.add(keyOf(line));
      steps.push({ line, errors: errorsOf(points, line) });
    }
    return steps;
  }

  const fit = (points, start) => train(points, start).slice(-1)[0].line;

  // ---------- Ma'lumot to'plamlari ----------
  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  function take(arr, k, rng) {
    const rest = arr.slice();
    const out = [];
    while (out.length < k && rest.length) out.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
    return out;
  }

  // Yashirin qoidadan uzoqda turgan nuqtalar (x chegarasi berilishi mumkin)
  function poolFor(hidden, margin, xLo, xHi) {
    const pool = [];
    for (let x = xLo; x <= xHi; x++) {
      for (let y = 1; y <= 9; y++) {
        const p = { x, y, full: above(hidden, { x, y }) };
        if (gap(hidden, p) >= margin) pool.push(p);
      }
    }
    return pool;
  }

  // n ta misol: yarmi to'la, yarmi bo'sh, hammasi yashirin chiziqdan uzoqda
  function makeExamples(n, rng, opts) {
    rng = rng || Math.random;
    const o = opts || {};
    const margin = o.margin || 1.2;
    const xLo = o.xLo || 1;
    const xHi = o.xHi || 9;
    const angles = o.angles || [-30, -15, 0, 15, 30];
    for (let attempt = 0; ; attempt++) {
      const hidden = { angle: pick(angles, rng), y0: randInt(4, 6, rng) };
      const pool = poolFor(hidden, attempt < 100 ? margin : margin - 0.2, xLo, xHi);
      const fulls = pool.filter((p) => p.full);
      const empties = pool.filter((p) => !p.full);
      const half = Math.floor(n / 2);
      if (fulls.length < half || empties.length < n - half) continue;
      const points = take(fulls, half, rng).concat(take(empties, n - half, rng));
      return { points: take(points, points.length, rng), hidden };
    }
  }

  // 1-bosqich: 6 ta misol va savol yong'og'i (eng yaqin misol aniq va to'g'ri bo'lsin)
  function makeNearestTask(prev, rng) {
    rng = rng || Math.random;
    for (let attempt = 0; ; attempt++) {
      const sep = attempt < 150 ? 1.5 : 1.0;
      const set = makeExamples(6, rng, { margin: 1.5 });
      const query = { x: randInt(2, 8, rng), y: randInt(2, 8, rng) };
      if (set.points.some((p) => p.x === query.x && p.y === query.y)) continue;
      if (gap(set.hidden, query) < 1.5) continue;
      const list = nearestList(set.points, query, set.points.length);
      const near = list[0];
      const other = list.find((p) => p.full !== near.full);
      const answer = above(set.hidden, query);
      if (near.full !== answer) continue;
      if (dist(other, query) - dist(near, query) < sep) continue;
      if (prev && prev.query.x === query.x && prev.query.y === query.y) continue;
      return { points: set.points, query, answer, near };
    }
  }

  // 2-bosqich: 10 ta misol va qiyshiq boshlang'ich chiziq (3–5 xato), robot 0 ga keltira oladi
  function makeLineTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const set = makeExamples(10, rng, { margin: 1.0 });
      const start = { angle: pick(ANGLES, rng), y0: randInt(3, 7, rng) };
      const e = errorsOf(set.points, start);
      if (e < 3 || e > 5) continue;
      if (errorsOf(set.points, fit(set.points, start)) !== 0) continue;
      if (prev && prev.start.angle === start.angle && prev.start.y0 === start.y0) continue;
      return { points: set.points, start, hidden: set.hidden };
    }
  }

  // 3-bosqich namoyishi: o'qitish misollari o'ng chekkada — sinovda 2 xato;
  // chap chekkadan 2 ta misol qo'shilsa, xato yo'qoladi
  function makeBiasTask(rng) {
    rng = rng || Math.random;
    for (;;) {
      const hidden = { angle: pick([15, 30], rng), y0: randInt(4, 5, rng) };
      const right = poolFor(hidden, 1.2, 6, 9);
      const left = poolFor(hidden, 1.2, 1, 4);
      const all = poolFor(hidden, 1.2, 1, 9);
      if (right.filter((p) => p.full).length < 3 || right.filter((p) => !p.full).length < 3) continue;
      if (left.filter((p) => p.full).length < 1 || left.filter((p) => !p.full).length < 1) continue;
      const train6 = take(right.filter((p) => p.full), 3, rng).concat(take(right.filter((p) => !p.full), 3, rng));
      const model = fit(train6, START);
      if (errorsOf(train6, model) !== 0) continue;
      const test6 = take(all, 6, rng);
      const wrong = wrongOnes(test6, model);
      if (wrong.length !== 2 || !wrong.every((p) => p.x <= 4)) continue;
      const extra = take(left.filter((p) => !test6.some((t) => t.x === p.x && t.y === p.y)), 2, rng);
      if (extra.length < 2) continue;
      const model2 = fit(train6.concat(extra), START);
      if (errorsOf(test6, model2) !== 0) continue;
      return { train: train6, test: test6, extra, model, model2 };
    }
  }

  // 3-bosqich mashqi: "Robot bu yong'oqni nima deydi?"
  function makePredictTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const line = { angle: pick([-45, -30, -15, 0, 15, 30, 45], rng), y0: randInt(3, 7, rng) };
      const query = { x: randInt(1, 9, rng), y: randInt(1, 9, rng) };
      if (gap(line, query) < 1.2) continue;
      if (prev && prev.query && prev.query.x === query.x && prev.query.y === query.y) continue;
      return { type: "predict", line, query, answer: predict(line, query) };
    }
  }

  // 3-bosqich mashqi: "Robot qaysi yong'oqdan ko'p narsa o'rganadi?" — misollardan eng uzoqdagisi
  function makeUsefulTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const set = makeExamples(6, rng, { margin: 1.2, xLo: 5, xHi: 9 });
      const options = [];
      for (let k = 0; k < 3; k++) options.push({ x: randInt(1, 9, rng), y: randInt(1, 9, rng) });
      if (new Set(options.map((o) => `${o.x}:${o.y}`)).size !== 3) continue;
      const far = options.map((o) => Math.min.apply(null, set.points.map((p) => dist(p, o))));
      const sorted = far.slice().sort((a, b) => b - a);
      if (sorted[0] - sorted[1] < 1.5) continue;
      return { type: "useful", points: set.points, options, answer: far.indexOf(sorted[0]) };
    }
  }

  // Mashq tartibi: avval bashorat, keyin foydali misol, keyin tasodifiy
  function makeStage3Task(k, prev, rng) {
    rng = rng || Math.random;
    const usePredict = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return usePredict ? makePredictTask(prev, rng) : makeUsefulTask(prev, rng);
  }

  const api = {
    ANGLES, START, ACTIONS, Y_MIN, Y_MAX, Y_STEP,
    slope, lineY, above, predict, gap, wrongOnes, errorsOf, loss,
    dist, nearest, nearestList, move, train, fit,
    makeExamples, makeNearestTask, makeLineTask, makeBiasTask, makePredictTask, makeUsefulTask, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.learn = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
