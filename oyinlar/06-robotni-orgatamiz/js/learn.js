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

  // Qiyinlik zinasi (QOIDALAR 4.3): tier 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim
  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));

  // 1-bosqich: n ta misol va savol yong'og'i. Javob ikki qadam: eng yaqin misolni bosish (nearIndex),
  // keyin "to'la / bo'sh" (answer). tier 0: 6 misol, so'rov 2..8, boshqa sinfdagi misol kamida 1.5 uzoqroq;
  // tier 1: so'rov 1..9, farq 1.2..3.0; tier 2: 8 misol, farq 0.8..2.0 va ikkinchi nomzod 0.5..1.5 yaqinlikda.
  function makeNearestTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const n = t >= 2 ? 8 : 6;
    const sepBase = [1.5, 1.2, 0.8][t];
    const sepMax = [9, 3.0, 2.0][t]; // yuqori zinada boshqa sinfdagi misol ham yaqin tursin — aks holda savol oson
    const uniq = [1.0, 0.7, 0.5][t]; // eng yaqin va undan keyingi misol orasidagi farq — bosganda ikkilanmasin
    const uniqMax = [9, 9, 1.5][t]; // tier 2: ikkinchi nomzod ham yaqin — chamalab emas, solishtirib topiladi
    const lo = t >= 1 ? 1 : 2;
    const hi = t >= 1 ? 9 : 8;
    for (let attempt = 0; ; attempt++) {
      const sep = attempt < 150 ? sepBase : Math.max(0.5, sepBase - 0.4);
      const set = makeExamples(n, rng, { margin: 1.5 });
      const query = { x: randInt(lo, hi, rng), y: randInt(lo, hi, rng) };
      if (set.points.some((p) => p.x === query.x && p.y === query.y)) continue;
      if (gap(set.hidden, query) < 1.5) continue;
      const list = nearestList(set.points, query, set.points.length);
      const near = list[0];
      const other = list.find((p) => p.full !== near.full);
      const answer = above(set.hidden, query);
      if (near.full !== answer) continue;
      const d = dist(other, query) - dist(near, query);
      if (d < sep || d > sepMax) continue;
      const u = dist(list[1], query) - dist(near, query);
      if (u < uniq || u > uniqMax) continue;
      if (prev && prev.query.x === query.x && prev.query.y === query.y) continue;
      return { points: set.points, query, answer, near, nearIndex: set.points.indexOf(near), tier: t };
    }
  }

  // 2-bosqich: 10 ta misol va qiyshiq boshlang'ich chiziq, robot 0 ga keltira oladi.
  // Boshlang'ich xato: tier 0 — 3..5, tier 1 — 4..6, tier 2 — 5..7 (ko'proq surish kerak).
  const LINE_ERRORS = [[3, 5], [4, 6], [5, 7]];
  function makeLineTask(prev, rng, tier) {
    rng = rng || Math.random;
    const [eLo, eHi] = LINE_ERRORS[tierOf(tier)];
    for (;;) {
      const set = makeExamples(10, rng, { margin: 1.0 });
      const start = { angle: pick(ANGLES, rng), y0: randInt(3, 7, rng) };
      const e = errorsOf(set.points, start);
      if (e < eLo || e > eHi) continue;
      if (errorsOf(set.points, fit(set.points, start)) !== 0) continue;
      if (prev && prev.start.angle === start.angle && prev.start.y0 === start.y0) continue;
      return { points: set.points, start, hidden: set.hidden, tier: tierOf(tier) };
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

  // 3-bosqich mashqi: "Robot qaysi yong'oqda adashadi?" — model chizig'i va n ta chaqilgan sinov yong'og'i,
  // faqat bittasi chiziqning noto'g'ri tomonida. tier 0: 6 ta, adashgani chiziqdan 1.0..3.0 uzoqda;
  // tier 1: 0.8..2.0; tier 2: 8 ta, 0.5..1.5 (chiziqqa yaqin — diqqat bilan qarash kerak).
  const MISTAKE_GAP = [[1.0, 3.0], [0.8, 2.0], [0.5, 1.5]];
  function makeMistakeTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const n = t >= 2 ? 8 : 6;
    const [gLo, gHi] = MISTAKE_GAP[t];
    for (;;) {
      const line = { angle: pick([-45, -30, -15, 0, 15, 30, 45], rng), y0: randInt(3, 7, rng) };
      const pool = poolFor(line, 0.5, 1, 9);
      const nearLine = pool.filter((p) => gap(line, p) >= gLo && gap(line, p) <= gHi);
      if (!nearLine.length || pool.length < n) continue;
      const wrong = pick(nearLine, rng);
      const rest = take(pool.filter((p) => p !== wrong), n - 1, rng);
      const test = take(rest.concat([{ x: wrong.x, y: wrong.y, full: !wrong.full }]), n, rng);
      const answer = test.findIndex((p) => p.x === wrong.x && p.y === wrong.y);
      if (prev && prev.type === "mistake" && prev.line.angle === line.angle && prev.line.y0 === line.y0) continue;
      return { type: "mistake", line, test, answer, tier: t };
    }
  }

  // 3-bosqich mashqi: "Robot qaysi yong'oqdan ko'p narsa o'rganadi?" — 4 variantdan misollardan eng uzoqdagisi.
  // tier 0: misollar o'ng yarmida, eng uzoq variant boshqalardan 1.5 ga ustun; tier 1: yarmi tasodifiy; tier 2: farq 1.0.
  function makeUsefulTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const margin = t >= 2 ? 1.0 : 1.5;
    for (;;) {
      const side = t >= 1 && rng() < 0.5 ? { xLo: 1, xHi: 5 } : { xLo: 5, xHi: 9 };
      const set = makeExamples(6, rng, { margin: 1.2, xLo: side.xLo, xHi: side.xHi });
      const options = [];
      for (let k = 0; k < 4; k++) options.push({ x: randInt(1, 9, rng), y: randInt(1, 9, rng) });
      if (new Set(options.map((o) => `${o.x}:${o.y}`)).size !== 4) continue;
      if (options.some((o) => set.points.some((p) => p.x === o.x && p.y === o.y))) continue;
      const far = options.map((o) => Math.min.apply(null, set.points.map((p) => dist(p, o))));
      const sorted = far.slice().sort((a, b) => b - a);
      if (sorted[0] - sorted[1] < margin) continue;
      const answer = far.indexOf(sorted[0]);
      if (prev && prev.type === "useful" && prev.options[prev.answer].x === options[answer].x && prev.options[prev.answer].y === options[answer].y) continue;
      return { type: "useful", points: set.points, options, answer, tier: t };
    }
  }

  // Mashq tartibi: avval "qaysi yong'oqda adashadi", keyin "qaysi misol foydali", keyin tasodifiy
  function makeStage3Task(k, prev, rng, tier) {
    rng = rng || Math.random;
    const useMistake = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useMistake ? makeMistakeTask(prev, rng, tier) : makeUsefulTask(prev, rng, tier);
  }

  const api = {
    ANGLES, START, ACTIONS, Y_MIN, Y_MAX, Y_STEP,
    slope, lineY, above, predict, gap, wrongOnes, errorsOf, loss,
    dist, nearest, nearestList, move, train, fit,
    makeExamples, makeNearestTask, makeLineTask, makeBiasTask, makeMistakeTask, makeUsefulTask, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.learn = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
