# 06 — Robotni oʻrgatamiz: ish rejasi

**Maqsad:** 6-o'yin: mashina misollardan qanday o'rganadi (eng yaqin misol → chegara chizig'i → o'qitish → sinov va ma'lumot sifati).

**Arxitektura:** 1–5-o'yindagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/`. Sof hisob `js/learn.js` (Node testlari), maydon va tugmalar `js/learn-ui.js`, rasmlar `js/game-art.js`, sahnalar `js/scenes/`, mashq sikli `umumiy/js/practice.js`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Eslatma: bu rejadagi kod bloklari tayyor fayllardan olingan (kod TDD tartibida yozildi: avval `tests/learn.test.js`, keyin `js/learn.js`).

## Umumiy cheklovlar

- Kutubxona/yig'ish yo'q; `index.html` ikki marta bosib ochiladi; internet kerak emas.
- Ekrandagi matn o'zbek lotin (`ʻ` U+02BB, `ʼ` U+02BC), bolaga "sen", pufakda ≤ 2 qisqa gap.
- Bosiladigan element ≥ 48×48 px; matn ≥ 18 px; 360 px; gorizontal scroll yo'q; xato uchun qizil yo'q, ✓/↻.
- Xato: 1-xato maslahat, 2-xato yechim + yangi misol. 3 ta to'g'ri javob — bosqich tugaydi.
- To'la/bo'sh farqi faqat rang bilan emas, **shakl** bilan ham: to'la — to'ldirilgan doira, bo'sh — ichi bo'sh; sinov nuqtalari — kvadrat.
- Commit: `-m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"`. Branch: `oyin/06-robotni-orgatamiz`.

## Nomlar va interfeyslar

- `QK.learn` (Node'da `require`): `ANGLES`, `START`, `ACTIONS`, `lineY(line, x)`, `above(line, p)`, `predict(line, p)`, `gap(line, p)`, `wrongOnes(points, line)`, `errorsOf(points, line)`, `loss(points, line)`, `dist(a, b)`, `nearest(points, q)`, `nearestList(points, q, k)`, `move(line, action)`, `train(points, start)` → `[{line, errors}]`, `fit(points, start)`, `makeExamples(n, rng, opts)`, `makeNearestTask(prev, rng?)`, `makeLineTask(prev, rng?)`, `makeBiasTask(rng?)`, `makePredictTask(prev, rng?)`, `makeUsefulTask(prev, rng?)`, `makeStage3Task(k, prev, rng?)`.
- `QK.art.robot()`, `QK.art.nut(state)` (`closed | full | empty`), `QK.art.story(name)` (`data | cats | biasCats | human`).
- `QK.learnUi`: `SHAPES`, `shapeIcon(i)`, `field(host)` → `{ set, get, wrap }`, `nutCard(host, point, onCrack?, small?)` → `{ reveal(full), el }`, `errorBadge(host)` → `{ set(n) }`, `lineControls(onMove, extra?)`, `answerButtons(onPick)`, `optionButtons(count, onPick)`.
- `QK.common` (shu o'yin): `board()`, `line(text)`, `answerLine(text)`, `nutName(full)`, `answerTask({answer, hint, solution})`, `lineEditor({f, points, start, badge, extra, onMove})`, `trainAnimation(f, points, start, badge)`.
- Maydon holati (`field.set`): `points`, `test` (`mark: "ok" | "wrong"`), `line`, `query`, `links`, `options`, `glow`, `regions`.

---

### 1-vazifa: Hisob moduli (`js/learn.js`) — TDD

- [x] **1-qadam: branch**

```bash
cd /Users/bicoder/Documents/Information && git checkout -b oyin/06-robotni-orgatamiz
```

- [x] **2-qadam: muvaffaqiyatsiz testlar — `tests/learn.test.js`**

```js
// learn.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/learn.js");

const P = (x, y, full) => ({ x, y, full });

test("above / predict: chiziqdan yuqoridagi — to'la", () => {
  const line = { angle: 0, y0: 5 };
  assert.equal(L.above(line, P(5, 7)), true);
  assert.equal(L.above(line, P(5, 3)), false);
  assert.equal(L.predict(line, P(1, 9)), true);
  const slanted = { angle: 45, y0: 5 };
  assert.equal(L.above(slanted, P(9, 9)), false); // chiziq x=9 da y=9 — tepasida emas
  assert.equal(L.above(slanted, P(8, 9)), true);  // chiziq x=8 da y=8
  assert.equal(L.above(slanted, P(1, 2)), true);  // chiziq x=1 da y=1
});

test("errorsOf va wrongOnes: model qancha xato qiladi", () => {
  const line = { angle: 0, y0: 5 };
  const points = [P(2, 8, true), P(3, 7, true), P(4, 2, false), P(6, 7, false)];
  assert.equal(L.errorsOf(points, line), 1);
  assert.deepEqual(L.wrongOnes(points, line), [P(6, 7, false)]);
  assert.equal(L.errorsOf(points, { angle: 0, y0: 9 }), 2);
});

test("nearest / nearestList: eng yaqin misol", () => {
  const points = [P(1, 1, true), P(5, 5, false), P(9, 9, true)];
  assert.deepEqual(L.nearest(points, { x: 2, y: 2 }), P(1, 1, true));
  assert.deepEqual(L.nearest(points, { x: 8, y: 8 }), P(9, 9, true));
  assert.deepEqual(L.nearestList(points, { x: 5, y: 6 }, 2), [P(5, 5, false), P(9, 9, true)]);
  assert.equal(L.dist({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});

test("move: chiziqni surish va burish chegaradan chiqmaydi", () => {
  assert.deepEqual(L.move({ angle: 0, y0: 5 }, "up"), { angle: 0, y0: 5.5 });
  assert.deepEqual(L.move({ angle: 0, y0: 5 }, "down"), { angle: 0, y0: 4.5 });
  assert.equal(L.move({ angle: 0, y0: 8.5 }, "up").y0, 8.5);
  assert.equal(L.move({ angle: 0, y0: 1.5 }, "down").y0, 1.5);
  assert.equal(L.move({ angle: 0, y0: 5 }, "left").angle, L.ANGLES[L.ANGLES.indexOf(0) + 1]);
  assert.equal(L.move({ angle: L.ANGLES[0], y0: 5 }, "right").angle, L.ANGLES[0]);
  assert.equal(L.move({ angle: L.ANGLES[L.ANGLES.length - 1], y0: 5 }, "left").angle, L.ANGLES[L.ANGLES.length - 1]);
});

test("train: xato kamayib boradi va oxirida 0 ga yetadi", () => {
  const points = [P(2, 8, true), P(3, 9, true), P(4, 7, true), P(6, 2, false), P(7, 3, false), P(8, 1, false)];
  const steps = L.train(points, { angle: 0, y0: 2 });
  assert.ok(steps.length > 1);
  for (let k = 1; k < steps.length; k++) assert.ok(steps[k].errors <= steps[k - 1].errors, "xato koʻpaydi");
  assert.equal(steps[steps.length - 1].errors, 0);
  assert.deepEqual(L.fit(points, { angle: 0, y0: 2 }), steps[steps.length - 1].line);
});

test("makeExamples: yarmi to'la, hammasi chiziqdan uzoqda, takrorsiz", () => {
  for (let i = 0; i < 100; i++) {
    const set = L.makeExamples(10, Math.random);
    assert.equal(set.points.length, 10);
    assert.equal(set.points.filter((p) => p.full).length, 5);
    assert.equal(L.errorsOf(set.points, set.hidden), 0);
    assert.equal(new Set(set.points.map((p) => `${p.x}:${p.y}`)).size, 10);
    for (const p of set.points) {
      assert.ok(p.x >= 1 && p.x <= 9 && p.y >= 1 && p.y <= 9, `${p.x},${p.y}`);
      assert.ok(L.gap(set.hidden, p) >= 1.2 - 1e-9);
    }
  }
});

test("makeNearestTask: eng yaqin misol javobga mos va ikkilanishsiz", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = L.makeNearestTask(prev);
    assert.equal(task.points.length, 6);
    const near = L.nearest(task.points, task.query);
    assert.equal(near.full, task.answer, "eng yaqin misol javobdan farq qildi");
    const other = L.nearestList(task.points, task.query, 6).find((p) => p.full !== near.full);
    assert.ok(L.dist(other, task.query) - L.dist(near, task.query) >= 1, "javob ikkilanarli");
    if (prev) assert.notDeepEqual(task.query, prev.query);
    prev = task;
  }
});

test("makeLineTask: boshida 3–5 xato, robot 0 ga keltira oladi", () => {
  let prev = null;
  for (let i = 0; i < 100; i++) {
    const task = L.makeLineTask(prev);
    assert.equal(task.points.length, 10);
    const e = L.errorsOf(task.points, task.start);
    assert.ok(e >= 3 && e <= 5, String(e));
    assert.equal(L.errorsOf(task.points, L.fit(task.points, task.start)), 0);
    prev = task;
  }
});

test("makeBiasTask: o'qitish o'ng chekkada, sinovda 2 xato, qo'shimcha misol tuzatadi", () => {
  for (let i = 0; i < 30; i++) {
    const task = L.makeBiasTask();
    assert.equal(task.train.length, 6);
    assert.equal(task.test.length, 6);
    assert.equal(task.extra.length, 2);
    for (const p of task.train) assert.ok(p.x >= 6, `train x=${p.x}`);
    for (const p of task.extra) assert.ok(p.x <= 4, `extra x=${p.x}`);
    assert.equal(L.errorsOf(task.train, task.model), 0);
    const wrong = task.test.filter((p) => L.predict(task.model, p) !== p.full);
    assert.equal(wrong.length, 2);
    assert.equal(L.errorsOf(task.test, task.model2), 0);
  }
});

test("makePredictTask: javob model chizig'iga mos", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = L.makePredictTask(prev);
    assert.equal(task.type, "predict");
    assert.equal(task.answer, L.predict(task.line, task.query));
    assert.ok(L.gap(task.line, task.query) >= 1.2 - 1e-9);
    if (prev) assert.notDeepEqual(task.query, prev.query);
    prev = task;
  }
});

test("makeUsefulTask: to'g'ri javob — misollardan eng uzoqdagi yong'oq", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = L.makeUsefulTask(prev);
    assert.equal(task.type, "useful");
    assert.equal(task.options.length, 3);
    const far = task.options.map((o) => Math.min(...task.points.map((p) => L.dist(p, o))));
    const sorted = [...far].sort((a, b) => b - a);
    assert.equal(far[task.answer], sorted[0]);
    assert.ok(sorted[0] - sorted[1] >= 1.5, "variantlar bir-biriga yaqin");
    prev = task;
  }
});

test("makeStage3Task: avval bashorat, keyin foydali misol", () => {
  assert.equal(L.makeStage3Task(0, null).type, "predict");
  assert.equal(L.makeStage3Task(1, null).type, "useful");
});
```

- [x] **3-qadam: testni ishga tushirish — yiqilishi kerak**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/06-robotni-orgatamiz && node --test tests/learn.test.js 2>&1 | tail -3
```

- [x] **4-qadam: `js/learn.js`**

```js
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
```

- [x] **5-qadam: testlar o'tishi kerak**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/06-robotni-orgatamiz && node --test tests/learn.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
```

---

### 2-vazifa: Rasmlar (`js/game-art.js`)

- [x] **1-qadam: `js/game-art.js`**

```js
// 6-o'yinga xos SVG rasmlar: robot, yong'oq (yopiq/to'la/bo'sh) va hikoya sahnalari.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const METAL = "#B8C0C8";

  // Robot: qutisimon bosh, antenna, ko'krakdagi chiroqchalar
  const robot = () => `<svg viewBox="0 0 120 150" aria-hidden="true">
  <line x1="60" y1="30" x2="60" y2="16" stroke="${INK}" stroke-width="3"/>
  <circle cx="60" cy="12" r="5" fill="#F08A24" stroke="${INK}" stroke-width="2"/>
  <rect x="30" y="28" width="60" height="50" rx="14" fill="${METAL}" stroke="${INK}" stroke-width="3"/>
  <circle cx="46" cy="50" r="7" fill="#2F6FDE"/>
  <circle cx="74" cy="50" r="7" fill="#2F6FDE"/>
  <circle cx="48" cy="48" r="2.5" fill="#FFFFFF"/>
  <circle cx="76" cy="48" r="2.5" fill="#FFFFFF"/>
  <rect x="48" y="64" width="24" height="6" rx="3" fill="${INK}"/>
  <rect x="20" y="86" width="14" height="36" rx="7" fill="${METAL}" stroke="${INK}" stroke-width="3"/>
  <rect x="86" y="86" width="14" height="36" rx="7" fill="${METAL}" stroke="${INK}" stroke-width="3"/>
  <rect x="34" y="82" width="52" height="46" rx="10" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>
  <rect x="44" y="92" width="32" height="20" rx="4" fill="#FFF6E5" stroke="${INK}" stroke-width="2"/>
  <circle cx="52" cy="102" r="3" fill="#1A9E77"/>
  <circle cx="60" cy="102" r="3" fill="#F0C040"/>
  <circle cx="68" cy="102" r="3" fill="#2F6FDE"/>
  <rect x="42" y="128" width="13" height="18" rx="4" fill="#8A929A" stroke="${INK}" stroke-width="3"/>
  <rect x="65" y="128" width="13" height="18" rx="4" fill="#8A929A" stroke="${INK}" stroke-width="3"/>
</svg>`;

  // Yong'oq: "closed" — yopiq, "full" — chaqilgan, mag'izli, "empty" — chaqilgan, bo'sh
  function nut(state) {
    if (state === "closed") {
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
  <ellipse cx="32" cy="35" rx="22" ry="24" fill="#A9743F" stroke="${INK}" stroke-width="3"/>
  <path d="M32 12 V58" stroke="#7A4E2A" stroke-width="3"/>
  <path d="M20 22 q10 12 0 24 M44 22 q-10 12 0 24" stroke="#7A4E2A" stroke-width="2.5" fill="none"/>
  <path d="M27 11 q5 -7 10 0" stroke="#6B4220" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;
    }
    const inside = state === "full"
      ? `<ellipse cx="32" cy="35" rx="10" ry="15" fill="#E8C98A" stroke="${INK}" stroke-width="2"/>
  <path d="M32 22 V48 M27 28 q5 7 0 14 M37 28 q-5 7 0 14" stroke="#C49A5A" stroke-width="2" fill="none"/>`
      : `<ellipse cx="32" cy="35" rx="10" ry="15" fill="none" stroke="#8A8A8A" stroke-width="2" stroke-dasharray="4 4"/>`;
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
  <ellipse cx="17" cy="35" rx="13" ry="23" fill="#A9743F" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="47" cy="35" rx="13" ry="23" fill="#A9743F" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="17" cy="35" rx="8" ry="17" fill="#C79763"/>
  <ellipse cx="47" cy="35" rx="8" ry="17" fill="#C79763"/>
  ${inside}
</svg>`;
  }

  // Mushuk boshi (hikoya rasmlari uchun)
  const catFace = (cx, cy, r, fur) => `
  <path d="M${cx - r * 0.75} ${cy - r * 0.45} L${cx - r * 0.4} ${cy - r * 1.25} L${cx + r * 0.05} ${cy - r * 0.75} Z" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <path d="M${cx + r * 0.75} ${cy - r * 0.45} L${cx + r * 0.4} ${cy - r * 1.25} L${cx - r * 0.05} ${cy - r * 0.75} Z" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <circle cx="${cx - r * 0.35}" cy="${cy - r * 0.12}" r="${r * 0.13}" fill="${INK}"/>
  <circle cx="${cx + r * 0.35}" cy="${cy - r * 0.12}" r="${r * 0.13}" fill="${INK}"/>
  <path d="M${cx} ${cy + r * 0.22} l${-r * 0.18} ${r * 0.2} M${cx} ${cy + r * 0.22} l${r * 0.18} ${r * 0.2}" stroke="${INK}" stroke-width="2" fill="none"/>`;

  // Ko'p misollar: kartochkalar to'ri
  function data() {
    const colors = ["#2F6FDE", "#1A9E77", "#F08A24", "#8E5BD0"];
    let cards = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        cards += `<rect x="${10 + c * 36}" y="${12 + r * 34}" width="30" height="28" rx="5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`;
        cards += `<circle cx="${25 + c * 36}" cy="${26 + r * 34}" r="8" fill="${colors[(r * 5 + c) % 4]}"/>`;
      }
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">${cards}</svg>`;
  }

  // Minglab mushuk rasmlari
  function cats() {
    let grid = "";
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) grid += catFace(30 + c * 47, 38 + r * 50, 15, "#F4F1EA");
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">${grid}</svg>`;
  }

  // Ma'lumotda faqat oq mushuklar — qora mushuk tanishsiz qoladi
  function biasCats() {
    let grid = "";
    for (let c = 0; c < 3; c++) grid += catFace(38 + c * 45, 42, 15, "#F4F1EA");
    return `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="10" y="12" width="140" height="62" rx="10" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="6 5"/>
  ${grid}
  ${catFace(170, 95, 16, "#4A4A55")}
</svg>`;
  }

  // Muhim qarorni odam qabul qiladi
  const human = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="120" y="54" width="46" height="40" rx="8" fill="${METAL}" stroke="${INK}" stroke-width="3"/>
  <rect x="130" y="36" width="26" height="22" rx="6" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>
  <circle cx="137" cy="47" r="3" fill="#2F6FDE"/>
  <circle cx="149" cy="47" r="3" fill="#2F6FDE"/>
  <line x1="143" y1="36" x2="143" y2="28" stroke="${INK}" stroke-width="3"/>
  <circle cx="143" cy="25" r="4" fill="#F08A24" stroke="${INK}" stroke-width="2"/>
  <rect x="120" y="94" width="46" height="8" rx="3" fill="#8A929A"/>
  <path d="M34 126 Q36 84 60 80 Q84 84 86 126 Z" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
  <circle cx="60" cy="58" r="18" fill="#E2A77E" stroke="${INK}" stroke-width="3"/>
  <path d="M42 52 Q60 34 78 52 Q60 44 42 52 Z" fill="#4A3B2E"/>
  <circle cx="53" cy="58" r="2.5" fill="${INK}"/>
  <circle cx="67" cy="58" r="2.5" fill="${INK}"/>
  <path d="M84 92 Q104 86 112 74" stroke="#2F6FDE" stroke-width="10" stroke-linecap="round" fill="none"/>
  <circle cx="114" cy="72" r="6" fill="#E2A77E" stroke="${INK}" stroke-width="2"/>
</svg>`;

  const STORY = { data: data(), cats: cats(), biasCats: biasCats(), human };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { robot, nut, story });
})(window);
```

- [x] **2-qadam: `tests/game-art.test.js`**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("robot va yong'oq holatlari SVG qaytaradi", () => {
  assert.match(art.robot(), /^<svg[\s\S]*<\/svg>$/);
  for (const state of ["closed", "full", "empty"]) {
    assert.match(art.nut(state), /^<svg[\s\S]*<\/svg>$/, state);
  }
  assert.ok(art.nut("full").includes("#E8C98A"), "to'la yong'oqda mag'iz bor");
  assert.ok(!art.nut("empty").includes("#E8C98A"), "bo'sh yong'oqda mag'iz yo'q");
  assert.ok(art.nut("closed").includes("ellipse cx=\"32\""), "yopiq yong'oq butun");
});

test("hikoya rasmlari va matnsizlik", () => {
  for (const name of ["data", "cats", "biasCats", "human"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
  assert.ok(!art.robot().includes("<text"));
});
```

---

### 3-vazifa: Ekran qismlari (`js/learn-ui.js`), sahifa va uslublar

- [x] **1-qadam: `js/learn-ui.js`**

```js
// Robotni o'rgatamiz: maydon (misollar, chegara chizig'i), yong'oq kartochkasi, tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, art } = QK;

  const NS = "http://www.w3.org/2000/svg";
  const FULL = "#1A9E77";   // to'la
  const EMPTY = "#FFFFFF";  // bo'sh (ichi bo'sh)
  const INK = "#2B2B3A";
  const MARK = "#F08A24";

  // Variant belgilari: shakl bilan farqlanadi (faqat rang emas)
  const SHAPES = [
    { name: "uchburchak", color: "#2F6FDE", path: (x, y, r) => `M${x} ${y - r} L${x + r} ${y + r * 0.8} L${x - r} ${y + r * 0.8} Z` },
    { name: "kvadrat", color: "#F08A24", path: (x, y, r) => `M${x - r} ${y - r} H${x + r} V${y + r} H${x - r} Z` },
    { name: "olmos", color: "#8E5BD0", path: (x, y, r) => `M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z` },
  ];

  const el = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
    return node;
  };

  // Variant belgisi (tugmalar ichida ham ishlatiladi)
  function shapeIcon(i) {
    const s = SHAPES[i];
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${s.path(12, 12, 9)}" fill="${s.color}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }

  // Maydon: gorizontal o'q — kattaligi, vertikal — og'irligi
  function field(host) {
    const svg = el("svg", { viewBox: "0 0 100 100", class: "field" });
    const wrap = ui.h("div", { class: "field-wrap" },
      ui.h("div", { class: "axis-y", text: "ogʻirligi" }),
      ui.h("div", { class: "field-box" }),
      ui.h("div", { class: "axis-x", text: "kattaligi" }));
    wrap.querySelector(".field-box").append(svg);
    host.append(wrap);

    const state = { points: [], test: [], line: null, query: null, links: [], options: [], glow: [], regions: true };
    const px = (x) => 6 + x * 8.8;
    const py = (y) => 94 - y * 8.8;

    function dot(p, kind) {
      const x = px(p.x);
      const y = py(p.y);
      const r = 3.4;
      if (kind === "test") {
        return el("rect", {
          x: x - r, y: y - r, width: r * 2, height: r * 2, rx: 0.8,
          fill: p.full ? FULL : EMPTY, stroke: INK, "stroke-width": 1.4,
        });
      }
      return el("circle", { cx: x, cy: y, r, fill: p.full ? FULL : EMPTY, stroke: INK, "stroke-width": 1.4 });
    }

    function draw() {
      svg.innerHTML = "";
      for (let g = 0; g <= 10; g++) {
        svg.append(el("line", { x1: px(g), y1: py(0), x2: px(g), y2: py(10), stroke: "#E4DCC9", "stroke-width": 0.6 }));
        svg.append(el("line", { x1: px(0), y1: py(g), x2: px(10), y2: py(g), stroke: "#E4DCC9", "stroke-width": 0.6 }));
      }
      svg.append(el("rect", { x: px(0), y: py(10), width: px(10) - px(0), height: py(0) - py(10), fill: "none", stroke: "#C9BFA6", "stroke-width": 1 }));

      if (state.line) {
        const y0 = learn.lineY(state.line, 0);
        const y10 = learn.lineY(state.line, 10);
        if (state.regions) {
          svg.append(el("polygon", {
            points: `${px(0)},${py(y0)} ${px(10)},${py(y10)} ${px(10)},${py(10)} ${px(0)},${py(10)}`,
            fill: "rgba(26,158,119,0.12)",
          }));
          svg.append(el("polygon", {
            points: `${px(0)},${py(y0)} ${px(10)},${py(y10)} ${px(10)},${py(0)} ${px(0)},${py(0)}`,
            fill: "rgba(107,78,61,0.10)",
          }));
        }
        svg.append(el("line", { x1: px(0), y1: py(y0), x2: px(10), y2: py(y10), stroke: INK, "stroke-width": 1.8, "stroke-linecap": "round" }));
      }

      for (const p of state.links) {
        if (!state.query) break;
        svg.append(el("line", {
          x1: px(state.query.x), y1: py(state.query.y), x2: px(p.x), y2: py(p.y),
          stroke: MARK, "stroke-width": 1.2, "stroke-dasharray": "3 2",
        }));
      }

      state.points.forEach((p) => svg.append(dot(p, "train")));
      state.test.forEach((p) => {
        svg.append(dot(p, "test"));
        if (!p.mark) return;
        const x = px(p.x);
        const y = py(p.y) - 6;
        if (p.mark === "wrong") {
          svg.append(el("path", { d: `M${x - 3} ${y - 3} L${x + 3} ${y + 3} M${x + 3} ${y - 3} L${x - 3} ${y + 3}`, stroke: MARK, "stroke-width": 1.6, "stroke-linecap": "round" }));
        } else {
          svg.append(el("path", { d: `M${x - 3} ${y} L${x - 1} ${y + 3} L${x + 3} ${y - 3}`, stroke: FULL, "stroke-width": 1.6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }));
        }
      });

      for (const p of state.glow) {
        svg.append(el("circle", { cx: px(p.x), cy: py(p.y), r: 6, fill: "none", stroke: MARK, "stroke-width": 1.6, class: "glow" }));
      }

      state.options.forEach((p, i) => {
        const s = SHAPES[i % SHAPES.length];
        svg.append(el("path", { d: s.path(px(p.x), py(p.y), 4), fill: s.color, stroke: INK, "stroke-width": 1.2, "stroke-linejoin": "round" }));
      });

      if (state.query) {
        svg.append(el("circle", {
          cx: px(state.query.x), cy: py(state.query.y), r: 4.6,
          fill: "#FFF6E5", stroke: MARK, "stroke-width": 1.8, "stroke-dasharray": "3 2",
        }));
      }
    }

    draw();
    return {
      set(patch) {
        Object.assign(state, patch);
        draw();
      },
      get: () => state,
      wrap,
    };
  }

  // Yong'oq kartochkasi: bosilsa chaqiladi. onCrack() — bola bosganda; small — ixcham (yonma-yon).
  function nutCard(host, point, onCrack, small) {
    const shell = ui.h("span", { class: "nut-art", html: art.nut("closed") });
    const label = ui.h("span", { class: "nut-size", text: `kattaligi ${point.x} · ogʻirligi ${point.y}` });
    const card = ui.h(onCrack ? "button" : "div", {
      class: "nut-card" + (small ? " sm" : ""), type: onCrack ? "button" : false,
      "aria-label": `Yongʻoq: kattaligi ${point.x}, ogʻirligi ${point.y}`,
    }, shell, label);
    if (onCrack) card.addEventListener("click", () => onCrack());
    host.append(card);
    return {
      reveal(full) {
        shell.innerHTML = art.nut(full ? "full" : "empty");
        shell.classList.add("cracked");
        card.disabled = true;
      },
      el: card,
    };
  }

  // "Xato: N" hisoblagichi
  function errorBadge(host) {
    const badge = ui.h("div", { class: "err-badge", "aria-live": "polite" });
    host.append(badge);
    return {
      set(n) {
        badge.textContent = n === 0 ? "Xato: 0 ✓" : `Xato: ${n}`;
        badge.classList.toggle("ok", n === 0);
      },
      el: badge,
    };
  }

  // Chiziq tugmalari: ▲ ▼ ⟲ ⟳ (+ ixtiyoriy qo'shimcha tugma)
  function lineControls(onMove, extra) {
    const pad = ui.h("div", { class: "line-pad" });
    [["up", "▲", "Koʻtarish"], ["down", "▼", "Tushirish"], ["left", "⟲", "Chapga burish"], ["right", "⟳", "Oʻngga burish"]]
      .forEach(([action, label, aria]) => {
        pad.append(ui.h("button", {
          class: "key", type: "button", text: label, "aria-label": aria,
          onClick: () => { sound.play("tap"); onMove(action); },
        }));
      });
    ui.clearControl();
    ui.control().append(pad);
    if (extra) ui.control().append(extra);
    return { pad };
  }

  // Javob tugmalari: To'la / Bo'sh
  function answerButtons(onPick) {
    ui.clearControl();
    ui.control().append(ui.h("div", { class: "choice-row" },
      ui.button("Toʻla", () => onPick(true)),
      ui.button("Boʻsh", () => onPick(false), "secondary")));
  }

  // Variant tugmalari: shakllar bilan (uchburchak, kvadrat, olmos)
  function optionButtons(count, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    for (let i = 0; i < count; i++) {
      row.append(ui.h("button", {
        class: "btn secondary opt", type: "button", "aria-label": SHAPES[i % SHAPES.length].name,
        html: shapeIcon(i), onClick: () => { sound.play("tap"); onPick(i); },
      }));
    }
    ui.clearControl();
    ui.control().append(row);
  }

  QK.learnUi = { SHAPES, shapeIcon, field, nutCard, errorBadge, lineControls, answerButtons, optionButtons };
})(window);
```

- [x] **2-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Robotni oʻrgatamiz</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="../umumiy/css/asos.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app">
    <header class="topbar">
      <button class="icon-btn" id="btn-home" type="button" aria-label="Bosh ekran"></button>
      <div class="progress" id="progress" aria-label="Toʻgʻri javoblar"></div>
      <button class="icon-btn" id="btn-sound" type="button" aria-label="Ovoz"></button>
    </header>
    <main class="play" id="play">
      <section class="zone-stage" id="zone-stage">
        <div class="bubble" id="bubble" hidden></div>
        <div class="actor" id="actor-elder"></div>
        <div class="actor" id="actor-apprentice"></div>
      </section>
      <section class="zone-work" id="zone-work"></section>
      <section class="zone-control" id="zone-control"></section>
    </main>
  </div>
  <script src="js/learn.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="../umumiy/js/practice.js"></script>
  <script src="js/learn-ui.js"></script>
  <script src="js/scenes/common.js"></script>
  <script src="js/scenes/stage1.js"></script>
  <script src="js/scenes/stage2.js"></script>
  <script src="js/scenes/stage3.js"></script>
  <script src="js/scenes/final.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [x] **3-qadam: `css/style.css`**

```css
/* Robotni o'rgatamiz — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.lbox { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }

/* ---------- Maydon: misollar va chegara chizig'i ---------- */
.field-wrap {
  display: grid; align-items: center; justify-content: center; gap: 4px;
  grid-template-columns: auto auto;
  grid-template-areas: "ylab field" ". xlab";
}
.axis-y { grid-area: ylab; writing-mode: vertical-rl; transform: rotate(180deg); font-size: 18px; font-weight: 800; opacity: 0.75; }
.axis-x { grid-area: xlab; font-size: 18px; font-weight: 800; opacity: 0.75; text-align: center; }
.field-box { grid-area: field; width: min(262px, 64vw); aspect-ratio: 1; }
.field { display: block; width: 100%; height: 100%; background: #fff; border-radius: 12px; box-shadow: 0 2px 0 var(--soya); }
.glow { animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.3; } }

/* ---------- Yong'oq kartochkasi ---------- */
.nut-holder { display: flex; justify-content: center; min-height: 104px; }
.nut-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px; min-height: 100px;
  padding: 8px 14px; border: none; border-radius: 14px; background: #fff; box-shadow: 0 3px 0 var(--soya);
  color: inherit;
}
.nut-card:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 var(--soya); }
.nut-card:disabled { opacity: 1; }
.nut-art { width: 64px; height: 64px; }
.nut-art svg { display: block; width: 100%; height: 100%; }
.nut-art.cracked { animation: pop 0.35s; }
.nut-size { font-size: 18px; font-weight: 800; }
.nut-card.sm { flex-direction: row; gap: 10px; min-height: 60px; padding: 6px 12px; }
.nut-card.sm .nut-art { width: 44px; height: 44px; }

/* ---------- Hisoblagichlar va tugmalar ---------- */
.count-line { font-size: 18px; font-weight: 800; text-align: center; }
.err-badge { font-size: 22px; font-weight: 900; color: var(--yana); }
.err-badge.ok { color: var(--togri); }
.line-pad { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; width: 100%; max-width: 320px; }
.line-pad .key { font-size: 26px; }
.btn.opt { padding: 8px 20px; }
.btn.opt svg { display: block; width: 34px; height: 34px; }
.answer { font-size: 20px; font-weight: 900; color: var(--togri); text-align: center; }

/* ---------- Hikoya va tabrik ---------- */
.story { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.story-art { width: min(240px, 66vw); }
.story-art.small { width: min(110px, 28vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }

/* Yotiq telefon: sahna ustuni tor, maydon kichik */
@media (orientation: landscape) and (max-height: 500px) {
  .play.compact { grid-template-columns: minmax(150px, 24%) minmax(0, 1fr); }
  .field-box { width: min(170px, 42vh); }
  .nut-holder { min-height: 86px; }
  .nut-card { min-height: 82px; padding: 6px 10px; }
  .nut-art { width: 48px; height: 48px; }
  .story-art { width: min(180px, 34vh); }
}
```

---

### 4-vazifa: Sahnalar

- [x] **1-qadam: `js/scenes/common.js`**

```js
// Robotni o'rgatamiz: umumiy sahna qismlari — maydon, javob tugmalari, chiziq sozlagich, o'qitish animatsiyasi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, learnUi, practice } = QK;

  // Ish maydoni: ixcham rejim + maydon
  function board() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    return { box, f: learnUi.field(box) };
  }

  const line = (text) => ui.h("div", { class: "count-line", text });
  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const nutName = (full) => (full ? "toʻla" : "boʻsh");

  // "To'la / Bo'sh" javobli vazifa
  const answerTask = ({ answer, hint, solution }) => practice.tries({
    setup: (submit) => learnUi.answerButtons(submit),
    check: (value) => value === answer,
    hint,
    solution,
  });

  // Chiziqni bola sozlaydi. onMove(line) — har surishdan keyin chaqiriladi.
  function lineEditor({ f, points, start, badge, extra, onMove }) {
    let current = start;
    const refresh = () => {
      QK.probe = { line: current, points }; // tekshirish uchun (brauzer sinovi)
      f.set({ points, line: current, glow: [] }); // misollar doim koʻrinib tursin
      if (badge) badge.set(learn.errorsOf(points, current));
      if (onMove) onMove(current);
    };
    learnUi.lineControls((action) => {
      current = learn.move(current, action);
      refresh();
    }, extra);
    refresh();
    return { get: () => current };
  }

  // Robotning o'qitilishi: chiziq qadamba-qadam suriladi, xato kamayadi
  async function trainAnimation(f, points, start, badge) {
    const steps = learn.train(points, start);
    for (const step of steps) {
      f.set({ line: step.line });
      if (badge) badge.set(step.errors);
      sound.play("tap");
      await ui.sleep(280);
    }
    sound.play("correct");
    return steps[steps.length - 1].line;
  }

  QK.common = { board, line, answerLine, nutName, answerTask, lineEditor, trainAnimation };
})(window);
```

- [x] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: misollardan o'rganish — eng yaqin misol (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, art, learnUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Qabilaga robot keldi!");
    await ui.say("apprentice", "U yongʻoqlarni saralay oladimi?");
    await ui.say("elder", "Hozircha yoʻq — u hech narsa bilmaydi. Biz oʻrgatamiz.");
    await ui.say("elder", "Morzeda jadvalni biz yozgandik. Robotga esa misollar koʻrsatamiz.");
  }

  // 4.1: 6 ta yong'oqni chaqib, o'qitish ma'lumotini yig'ish
  async function collect(points) {
    const { box, f } = common.board();
    const counter = common.line("Misollar: 0 / 6");
    box.append(counter);
    const holder = ui.h("div", { class: "nut-holder" });
    ui.control().append(holder);
    ui.bubble("elder", "Yongʻoqni bos — chaqib koʻramiz. Ichida magʻiz bormi?");
    const shown = [];
    for (const p of points) {
      holder.innerHTML = "";
      await ui.settle((done) => {
        const card = learnUi.nutCard(holder, p, () => {
          sound.play(p.full ? "correct" : "retry");
          card.reveal(p.full);
          done();
        });
      });
      shown.push(p);
      f.set({ points: shown.slice() });
      counter.textContent = `Misollar: ${shown.length} / 6`;
      await ui.sleep(550);
    }
    holder.remove();
    await ui.say("elder", "Bu — oʻqitish maʼlumoti. Toʻla yongʻoqlar tepada, boʻshlari pastda!");
  }

  // 4.2: eng yaqin misol bo'yicha qaror
  async function nearestDemo(task) {
    const { box, f } = common.board();
    f.set({ points: task.points, query: task.query });
    const holder = ui.h("div", { class: "nut-holder" });
    box.append(holder);
    const card = learnUi.nutCard(holder, task.query, null, true);
    await ui.say("elder", "Yangi yongʻoq. Robot uni chaqmasdan aytishi kerak: toʻlami yoki boʻsh?");
    ui.bubble("elder", "Robot eng oʻxshash misolni qidiradi. «Robot qaror qilsin»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Robot qaror qilsin", () => { ui.clearControl(); done(); }, "big"));
    });
    f.set({ links: learn.nearestList(task.points, task.query, 3) });
    sound.play("tap");
    await ui.sleep(700);
    f.set({ links: [task.near], glow: [task.near] });
    await ui.say("elder", `Eng yaqin misol — ${common.nutName(task.near.full)}. Robot «${common.nutName(task.answer)}» deydi.`);
    card.reveal(task.answer);
    sound.play("win");
    await ui.say("elder", "Chaqib koʻrdik — toʻgʻri!");
  }

  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robot qoidani yozmaydi — u koʻrgan misollariga qaraydi.");
    await ui.say("elder", "Eng yaqin misol qanday boʻlsa, javob ham shunday.");
  }

  // 4.4: "Robot bu yong'oqni nima deydi?"
  function nearestTask(task) {
    const { box, f } = common.board();
    f.set({ points: task.points, query: task.query });
    const holder = ui.h("div", { class: "nut-holder" });
    box.append(holder);
    const card = learnUi.nutCard(holder, task.query, null, true);
    ui.bubble("elder", "Robot bu yongʻoqni nima deydi?");
    return common.answerTask({
      answer: task.answer,
      hint: () => {
        f.set({ links: learn.nearestList(task.points, task.query, 3) });
        ui.bubble("elder", "↻ Eng yaqin uchta misolga chiziq tortdik. Eng yaqini qaysi?");
      },
      solution: () => {
        f.set({ links: [task.near], glow: [task.near] });
        card.reveal(task.answer);
        box.append(common.answerLine(`Eng yaqin misol — ${common.nutName(task.near.full)}`));
      },
    });
  }

  async function stage1() {
    const first = learn.makeNearestTask(null);
    await collect(first.points);
    await nearestDemo(first);
    await explain();
    await ui.say("elder", "Endi oʻzing ayt: robot nima deydi? 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev) => learn.makeNearestTask(prev),
      run: nearestTask,
      praise: (task) => `Eng yaqin misol — ${common.nutName(task.near.full)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [x] **3-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: chegara chizig'i — model va o'qitish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, learnUi, practice, common } = QK;

  // 5.1–5.2: bola chiziqni o'zi sozlaydi
  async function drawLine() {
    const task = learn.makeLineTask(null);
    const { box, f } = common.board();
    const badge = learnUi.errorBadge(box);
    f.set({ points: task.points, line: task.start });
    badge.set(learn.errorsOf(task.points, task.start));
    await ui.say("elder", "Har safar hamma misolni koʻrib chiqish — sekin. Yaxshisi, chegara chizamiz.");
    ui.bubble("elder", "Chiziqni sur va bur: toʻlalar tepada, boʻshlar pastda qolsin!");
    await ui.settle((done) => {
      common.lineEditor({
        f,
        points: task.points,
        start: task.start,
        badge,
        onMove: (line) => {
          if (learn.errorsOf(task.points, line) !== 0) return;
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          ui.clearControl();
          done();
        },
      });
    });
    await ui.say("elder", "Xato 0! Bu chiziq — robotning modeli.");
    await ui.say("elder", "Endi robot har bir yongʻoqni chiziq bilan taqqoslaydi — tez va oson.");
  }

  // 5.3: robot o'zi o'rganadi
  async function robotTrains() {
    const task = learn.makeLineTask(null);
    const { box, f } = common.board();
    const badge = learnUi.errorBadge(box);
    f.set({ points: task.points, line: task.start });
    badge.set(learn.errorsOf(task.points, task.start));
    await ui.say("elder", "Yangi misollar. Endi chiziqni robot oʻzi topadi.");
    ui.bubble("elder", "«Oʻrgat»ni bos va qara: u har xatodan keyin chiziqni biroz suradi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Oʻrgat", () => { ui.clearControl(); done(); }, "big"));
    });
    await common.trainAnimation(f, task.points, task.start, badge);
    await ui.say("elder", "Xato 0! Chiziqni qadamba-qadam tuzatish — bu oʻqitish.");
  }

  // 5.4: mashq — chiziqni 0 xatoga keltirish
  function lineTask(task) {
    const { box, f } = common.board();
    const badge = learnUi.errorBadge(box);
    ui.bubble("elder", "Chiziqni sozla: xato 0 boʻlsin, keyin «Tayyor»ni bos.");
    let editor = null;
    return practice.tries({
      setup: (submit) => {
        editor = common.lineEditor({
          f,
          points: task.points,
          start: task.start,
          badge,
          extra: ui.button("Tayyor", () => submit(editor.get())),
        });
      },
      check: (line) => learn.errorsOf(task.points, line) === 0,
      hint: (line) => {
        f.set({ glow: learn.wrongOnes(task.points, line) });
        ui.bubble("elder", `↻ ${learn.errorsOf(task.points, line)} ta misol notoʻgʻri tomonda — ular belgilandi.`);
      },
      solution: () => {
        const fitted = learn.fit(task.points, task.start);
        f.set({ line: fitted, glow: [] });
        badge.set(0);
        box.append(common.answerLine("Robot shunday chizdi — xato 0"));
      },
    });
  }

  async function stage2() {
    await drawLine();
    await robotTrains();
    await ui.say("elder", "Endi oʻzing chiz! 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev) => learn.makeLineTask(prev),
      run: lineTask,
      praise: () => "Xato 0 — model tayyor.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [x] **4-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: sinov, ma'lumot sifati va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, art, learnUi, practice, common } = QK;

  const SCENES = [
    { art: "data", lines: ["Bugungi sunʼiy intellekt ham shunday oʻrganadi.", "Faqat uning misollari millionlab."] },
    { art: "cats", lines: ["Mushukni tanish uchun unga minglab mushuk rasmi koʻrsatiladi."] },
    { art: "biasCats", lines: ["Misollarda faqat oq mushuklar boʻlsa, qora mushukni tanimay qolishi mumkin.", "Maʼlumot qanday boʻlsa — javob shunday."] },
    { art: "human", lines: ["Shuning uchun muhim ishda oxirgi qarorni odam qabul qiladi.", "Mashina yordam beradi, lekin javobgarlik odamda."] },
  ];

  // Sinov nuqtalarini birma-bir tekshirish: ✓ yoki ✗
  async function runTest(f, model, testPoints) {
    const shown = [];
    let wrong = 0;
    for (const p of testPoints) {
      const ok = learn.predict(model, p) === p.full;
      if (!ok) wrong++;
      shown.push(Object.assign({}, p, { mark: ok ? "ok" : "wrong" }));
      f.set({ test: shown.slice() });
      sound.play(ok ? "tap" : "retry");
      await ui.sleep(420);
    }
    return wrong;
  }

  // 6.1–6.3: sinov, xato sababi va tuzatish
  async function testAndFix() {
    const task = learn.makeBiasTask();
    const { box, f } = common.board();
    const note = common.line(" ");
    box.append(note);
    f.set({ points: task.train, line: task.model });
    note.textContent = "Oʻqitish misollari: 6 ta";
    await ui.say("elder", "Robot oʻrgandi. Lekin u haqiqatan bilib oldimi?");
    await ui.say("elder", "Sinaymiz: u hali koʻrmagan yongʻoqlarni beramiz. Bular — sinov maʼlumoti.");
    const wrong = await runTest(f, task.model, task.test);
    note.textContent = `Sinov: ${task.test.length - wrong} toʻgʻri, ${wrong} xato`;
    await ui.say("elder", `${wrong} tasida xato qildi! Nega?`);
    f.set({ glow: learn.wrongOnes(task.test, task.model) });
    await ui.say("elder", "Qara: oʻqitish misollarining hammasi oʻng tomonda edi.");
    await ui.say("elder", "Robot chap tomondagi kichik yongʻoqlarni umuman koʻrmagan.");

    ui.bubble("elder", "Chap tomondan 2 ta yongʻoq chaqamiz va robotga koʻrsatamiz.");
    const holder = ui.h("div", { class: "nut-holder" });
    ui.control().append(holder);
    const points = task.train.slice();
    for (const p of task.extra) {
      holder.innerHTML = "";
      await ui.settle((done) => {
        const card = learnUi.nutCard(holder, p, () => {
          sound.play(p.full ? "correct" : "retry");
          card.reveal(p.full);
          done();
        });
      });
      points.push(p);
      f.set({ points: points.slice(), glow: [p] });
      await ui.sleep(550);
    }
    holder.remove();
    f.set({ glow: [] });
    await ui.say("elder", "Endi robot qaytadan oʻrganadi.");
    const model2 = await common.trainAnimation(f, points, learn.START, null);
    const wrong2 = await runTest(f, model2, task.test);
    note.textContent = `Sinov: ${task.test.length - wrong2} toʻgʻri, ${wrong2} xato`;
    await ui.say("elder", "Hammasi toʻgʻri! Yangi misollar robotni tuzatdi.");
    await ui.say("elder", "Maʼlumot qanday boʻlsa, robot shunday oʻylaydi.");
  }

  // 6.4: "Robot bu yong'oqni nima deydi?"
  function predictTask(task) {
    const { box, f } = common.board();
    f.set({ points: [], line: task.line, query: task.query });
    ui.bubble("elder", "Robotning modeli — mana shu chiziq. U bu yongʻoqni nima deydi?");
    return common.answerTask({
      answer: task.answer,
      hint: () => {
        f.set({ glow: [task.query] });
        ui.bubble("elder", "↻ Yongʻoq chiziqning qaysi tomonida? Yuqorisi — toʻla, pasti — boʻsh.");
      },
      solution: () => {
        f.set({ glow: [task.query] });
        box.append(common.answerLine(`Chiziqdan ${task.answer ? "yuqorida — toʻla" : "pastda — boʻsh"}`));
      },
    });
  }

  // 6.4: "Robot qaysi yong'oqdan ko'p narsa o'rganadi?"
  function usefulTask(task) {
    const { box, f } = common.board();
    f.set({ points: task.points, options: task.options });
    ui.bubble("elder", "Robot qaysi yongʻoqdan koʻproq narsa oʻrganadi?");
    box.append(common.line("Misollar — doiralar, variantlar — shakllar"));
    return practice.tries({
      setup: (submit) => learnUi.optionButtons(task.options.length, submit),
      check: (value) => value === task.answer,
      hint: () => {
        f.set({ glow: task.points });
        ui.bubble("elder", "↻ Robot shu joylarni koʻrgan. Boʻsh joydagi yongʻoq koʻproq oʻrgatadi.");
      },
      solution: () => {
        f.set({ glow: [task.options[task.answer]] });
        box.append(common.answerLine("Robot shu joyda hali misol koʻrmagan"));
      },
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await testAndFix();
    await ui.say("elder", "Endi oʻzing javob ber. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => learn.makeStage3Task(correct, prev),
      run: (task) => (task.type === "predict" ? predictTask(task) : usefulTask(task)),
      praise: (task) => (task.type === "predict"
        ? `Chiziqdan ${task.answer ? "yuqorida — toʻla" : "pastda — boʻsh"}.`
        : "Robot u yerda misol koʻrmagan edi."),
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
```

- [x] **5-qadam: `js/scenes/final.js`**

```js
// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    const text = goingOn
      ? `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`
      : `${s}-bosqich tugadi! Barakalla!`;
    await ui.say("elder", text);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi sen robotni oʻrgata olasan!");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Mashinaga qoida emas — misollar beriladi" }),
        ui.h("div", { text: "Model — chegara chizigʻi, oʻqitish — xatoni kamaytirish" }),
        ui.h("div", { text: "Maʼlumot qanday boʻlsa — javob shunday" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
```

- [x] **6-qadam: `js/main.js` va `tests/main.test.js`**

```js
// 6-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Robotni oʻrgatamiz",
  storageKey: "robotni-orgatamiz:v1",
  stageTitles: ["Misollardan oʻrganish", "Chegara chizigʻi", "Sinov va maʼlumot"],
});
```

```js
// main.js testi: umumiy qobiqqa (umumiy/js/app.js) qanday sozlamalar berilishini tekshiradi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

let captured = null;
const win = { QK: { app: { start: (cfg) => { captured = cfg; } } } };
loadScript(path.join(__dirname, "../js/main.js"), win);

test("main.js: saqlash kaliti, sarlavha va bosqich nomlari", () => {
  assert.equal(captured.storageKey, "robotni-orgatamiz:v1");
  assert.equal(captured.title, "Robotni oʻrgatamiz");
  assert.deepEqual(captured.stageTitles, ["Misollardan oʻrganish", "Chegara chizigʻi", "Sinov va maʼlumot"]);
});
```

---

### 5-vazifa: Bosh sahifa va tekshiruv

- [x] **1-qadam: bosh sahifaga "Sunʼiy intellekt" bo'limi va 6-o'yin qo'shiladi**

`bosh/js/bosh-art.js` ga `robot` ikonkasi, `bosh/js/bosh.js` ga bo'lim (`ai`) va o'yin qatori.

```bash
cd /Users/bicoder/Documents/Information && node --test bosh/tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
```

- [x] **2-qadam: statik tekshiruv — sintaksis va `index.html` dagi fayllar**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/06-robotni-orgatamiz && for f in $(grep -o 'src="[^"]*"' index.html | cut -d'"' -f2); do node --check "$f" || echo "XATO: $f"; test -f "$f" || echo "YOʻQ: $f"; done && echo "statik tekshiruv tugadi"
```

- [x] **3-qadam: barcha o'yinlar testlari**

```bash
cd /Users/bicoder/Documents/Information/oyinlar && for d in 0*/ umumiy/; do (cd "$d" && printf "%-30s " "$d" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' '; echo); done
```

- [x] **4-qadam: brauzerda to'liq o'ynab chiqish**

Mahalliy server + Playwright skripti (`scratchpad/play6.js`): 375×667, 360×640, 667×375, 1280×800 va ataylab xato qilinadigan o'tish. Javoblar `QK.current` va `QK.probe` dan olinadi. Tekshiriladi: konsol xatolari, gorizontal scroll, boshqaruv zonasining ekranga sig'ishi.

```bash
cd /Users/bicoder/Documents/Information && python3 -m http.server 8777 >/dev/null 2>&1 &
sleep 1 && echo "http://localhost:8777/oyinlar/06-robotni-orgatamiz/"
```

- [x] **5-qadam: commit, main'ga birlashtirish va GitHub'ga yuklash**

```bash
cd /Users/bicoder/Documents/Information && git add -A && git commit -m "06-robotni-orgatamiz: sunʼiy intellekt oʻyini" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" && git checkout main && git merge --no-ff oyin/06-robotni-orgatamiz && git branch -d oyin/06-robotni-orgatamiz && git push
```
