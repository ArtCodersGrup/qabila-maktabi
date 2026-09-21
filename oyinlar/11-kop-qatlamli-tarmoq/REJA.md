# 11 — Koʻp qatlamli tarmoq: ish rejasi

**Maqsad:** 11-o'yin: chuqur o'rganish — neyron (yig'indi va chegara), qatlamlar (chiziq → shakl), bitta neyronning chegarasi va og'irliklarni o'rganish.

**Arxitektura:** oldingi o'yinlardagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/`. Sof hisob `js/neural.js` (Node testlari), ekran qismlari `js/neural-ui.js`, rasmlar `js/game-art.js`, sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi; bloklar tayyor fayllardan olingan (TDD: avval `tests/neural.test.js`, keyin `js/neural.js`).

## Nomlar va interfeyslar

- `QK.neural`: `DEMO`, `TIK`, `YOTIQ`, `TABLES` (`va`, `yoki`, `faqatBittasi`), `THRESHOLDS`, `LABELS`, `weightedSum`, `fire(inputs, weights, threshold)`, `hidden(image)`, `output(image)`, `hiddenLabel(image)`, `tableErrors`, `bestOneNeuron(table)`, `canOneNeuron(table)`, `twoLayer(x)`, `updateRule(target, out)`, `trainNeuron(table, start, threshold)`, `makeFireTask`, `makeHiddenTask`, `makeOutputTask`, `makeStage2Task(k, prev)`, `makeUpdateTask`.
- `QK.neuralUi`: `sign(w)`, `neuronView(host, {inputs, weights, threshold, editable, hideLine, onChange})` → `{get, set, showLine}`, `smallGrid`, `layerView(host, {editable, showHidden, showOutput, onChange})` → `{grid, set, reveal}`, `truthTable(host)` → `{set(table, answerFn)}`, `choiceButtons`.
- `QK.art.story(name)`: `layers | brain | blackbox`.

---

### 1-vazifa: Hisob moduli (`js/neural.js`) — TDD

- [x] **1-qadam: muvaffaqiyatsiz testlar — `tests/neural.test.js`**

```js
// neural.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const N = require("../js/neural.js");

test("neyron: yoniq kirishlar og'irligi bilan qo'shiladi, chegaraga yetsa yonadi", () => {
  assert.equal(N.weightedSum([1, 1, 0], [1, 1, -1]), 2);
  assert.equal(N.weightedSum([1, 1, 1], [1, 1, -1]), 1);
  assert.equal(N.fire([1, 1, 0], [1, 1, -1], 2), true);
  assert.equal(N.fire([1, 0, 1], [1, 1, -1], 2), false);
  assert.deepEqual(N.DEMO, { weights: [1, 1, -1], threshold: 2 });
});

test("3×3 tarmoq: tik va yotiq chiziq topuvchilar", () => {
  const cross = [0, 1, 0, 1, 1, 1, 0, 1, 0];
  const vertical = [0, 1, 0, 0, 1, 0, 0, 1, 0];
  const horizontal = [0, 0, 0, 1, 1, 1, 0, 0, 0];
  const corner = [1, 0, 0, 0, 0, 0, 0, 0, 1];
  assert.deepEqual(N.hidden(cross), { tik: true, yotiq: true });
  assert.deepEqual(N.hidden(vertical), { tik: true, yotiq: false });
  assert.equal(N.output(cross), "krest");
  assert.equal(N.output(vertical), "chiziq");
  assert.equal(N.output(horizontal), "chiziq");
  assert.equal(N.output(corner), "boshqa");
  assert.equal(N.hiddenLabel(cross), "ikkalasi");
  assert.equal(N.hiddenLabel(horizontal), "faqat yotiq");
  assert.equal(N.hiddenLabel(corner), "hech biri");
});

test("bitta neyron: VA va YOKI ni uddalaydi, 'faqat bittasi'ni uddalay olmaydi", () => {
  assert.equal(N.canOneNeuron(N.TABLES.va), true);
  assert.equal(N.canOneNeuron(N.TABLES.yoki), true);
  assert.equal(N.canOneNeuron(N.TABLES.faqatBittasi), false);
  assert.equal(N.bestOneNeuron(N.TABLES.faqatBittasi).errors, 1, "eng yaxshisi ham 1 ta xato qiladi");
});

test("ikki qatlam 'faqat bittasi' ishini to'g'ri bajaradi", () => {
  for (const [a, b, want] of N.TABLES.faqatBittasi) assert.equal(N.twoLayer([a, b]).out, want === 1, `${a},${b}`);
});

test("o'rganish: xato bo'lsa og'irlik o'zgaradi va oxirida xato 0", () => {
  for (const name of ["va", "yoki"]) {
    const steps = N.trainNeuron(N.TABLES[name], [0, 0], N.THRESHOLDS[name]);
    assert.ok(steps.length > 1, name);
    assert.equal(steps[steps.length - 1].errors, 0, name);
    const w = steps[steps.length - 1].weights;
    assert.equal(N.tableErrors(N.TABLES[name], w, N.THRESHOLDS[name]), 0, name);
  }
});

test("updateRule: yonishi kerak edi — oshir, yonmasligi kerak edi — kamaytir", () => {
  assert.equal(N.updateRule(true, false), "oshir");
  assert.equal(N.updateRule(false, true), "kamaytir");
  assert.equal(N.updateRule(true, true), "tegma");
});

test("makeFireTask: javob neyron hisobiga mos, ikkala javob ham chiqadi", () => {
  let prev = null;
  const seen = { true: 0, false: 0 };
  for (let i = 0; i < 300; i++) {
    const task = N.makeFireTask(prev);
    assert.equal(task.answer, N.fire(task.inputs, task.weights, task.threshold));
    assert.ok(task.inputs.some((x) => x === 1), "hamma kirish o'chiq");
    assert.ok(task.weights.every((w) => w === 1 || w === -1));
    seen[task.answer]++;
    if (prev) assert.notDeepEqual([task.inputs, task.weights, task.threshold], [prev.inputs, prev.weights, prev.threshold]);
    prev = task;
  }
  assert.ok(seen.true > 60 && seen.false > 60, JSON.stringify(seen));
});

test("makeHiddenTask va makeOutputTask: javob tarmoq hisobiga mos, hamma turdan chiqadi", () => {
  const labels = new Set();
  const outs = new Set();
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const h = N.makeHiddenTask(prev);
    assert.equal(h.answer, N.hiddenLabel(h.image));
    labels.add(h.answer);
    const o = N.makeOutputTask(h);
    assert.equal(o.answer, N.output(o.image));
    outs.add(o.answer);
    prev = o;
  }
  assert.equal(labels.size, 4);
  assert.equal(outs.size, 3);
});

test("makeUpdateTask: neyron xato qilgan, javob qoidaga mos", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = N.makeUpdateTask(prev);
    const out = N.fire(task.inputs, task.weights, task.threshold);
    assert.notEqual(out, task.target, "neyron xato qilmagan");
    assert.equal(task.answer, N.updateRule(task.target, out));
    seen.add(task.answer);
    prev = task;
  }
  assert.deepEqual([...seen].sort(), ["kamaytir", "oshir"]);
});

test("makeStage2Task: avval yashirin, keyin chiqish", () => {
  assert.equal(N.makeStage2Task(0, null).type, "hidden");
  assert.equal(N.makeStage2Task(1, null).type, "output");
});
```

- [x] **2-qadam: `js/neural.js`**

```js
// Ko'p qatlamli tarmoq — sof hisob: neyron, 3×3 tarmoq, bitta neyron chegarasi, o'rganish, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const weightedSum = (inputs, weights) => inputs.reduce((sum, x, i) => sum + x * weights[i], 0);
  const fire = (inputs, weights, threshold) => weightedSum(inputs, weights) >= threshold;

  // 1-bosqich namoyishi
  const DEMO = { weights: [1, 1, -1], threshold: 2 };

  // 3×3 tarmoq: yashirin neyronlar og'irliklari (o'rta ustun / o'rta qator), chegara 3
  const TIK = [0, 1, 0, 0, 1, 0, 0, 1, 0];
  const YOTIQ = [0, 0, 0, 1, 1, 1, 0, 0, 0];
  const LINE_THRESHOLD = 3;

  const hidden = (image) => ({
    tik: fire(image, TIK, LINE_THRESHOLD),
    yotiq: fire(image, YOTIQ, LINE_THRESHOLD),
  });

  // Chiqish qatlami: ikkalasi — krest, bittasi — chiziq, hech biri — boshqa
  function output(image) {
    const h = hidden(image);
    const on = (h.tik ? 1 : 0) + (h.yotiq ? 1 : 0);
    return on === 2 ? "krest" : on === 1 ? "chiziq" : "boshqa";
  }

  function hiddenLabel(image) {
    const h = hidden(image);
    if (h.tik && h.yotiq) return "ikkalasi";
    if (h.tik) return "faqat tik";
    if (h.yotiq) return "faqat yotiq";
    return "hech biri";
  }

  // Ikki kirishli ishlar: [a, b, kerakli javob]
  const TABLES = {
    va: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
    yoki: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]],
    faqatBittasi: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
  };
  const THRESHOLDS = { va: 2, yoki: 1 };

  const tableErrors = (table, weights, threshold) =>
    table.filter(([a, b, want]) => fire([a, b], weights, threshold) !== (want === 1)).length;

  // Bitta neyron: barcha butun og'irlik (−2..2) va chegaralarni (−2..3) sinash
  function bestOneNeuron(table) {
    let best = null;
    for (let w1 = -2; w1 <= 2; w1++) {
      for (let w2 = -2; w2 <= 2; w2++) {
        for (let t = -2; t <= 3; t++) {
          const errors = tableErrors(table, [w1, w2], t);
          if (!best || errors < best.errors) best = { weights: [w1, w2], threshold: t, errors };
        }
      }
    }
    return best;
  }
  const canOneNeuron = (table) => bestOneNeuron(table).errors === 0;

  // Ikki qatlam: "faqat a" va "faqat b" neyronlari, chiqish — "yoki"
  function twoLayer(x) {
    const h1 = fire(x, [1, -1], 1);
    const h2 = fire(x, [-1, 1], 1);
    return { h1, h2, out: fire([h1 ? 1 : 0, h2 ? 1 : 0], [1, 1], 1) };
  }

  // O'rganish qoidasi: yonishi kerak edi-yu yonmadi — oshir; yonmasligi kerak edi-yu yondi — kamaytir
  const updateRule = (target, out) => (target === out ? "tegma" : target ? "oshir" : "kamaytir");

  // Perseptron: chegara o'zgarmaydi, faqat yoniq kirishlarning og'irligi o'zgaradi.
  // Qaytaradi: [{ weights, errors }] — har aylanadan keyin.
  function trainNeuron(table, start, threshold, maxRounds) {
    let weights = start.slice();
    const steps = [{ weights: weights.slice(), errors: tableErrors(table, weights, threshold) }];
    for (let round = 0; round < (maxRounds || 20) && steps[steps.length - 1].errors > 0; round++) {
      for (const [a, b, want] of table) {
        const x = [a, b];
        const rule = updateRule(want === 1, fire(x, weights, threshold));
        if (rule === "tegma") continue;
        weights = weights.map((w, i) => w + (rule === "oshir" ? x[i] : -x[i]));
      }
      steps.push({ weights: weights.slice(), errors: tableErrors(table, weights, threshold) });
    }
    return steps;
  }

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
  const bits = (n, rng) => Array.from({ length: n }, () => (rng() < 0.5 ? 1 : 0));

  // 1-bosqich: "Bu neyron yonadimi?"
  function makeFireTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const inputs = bits(3, rng);
      const weights = Array.from({ length: 3 }, () => (rng() < 0.65 ? 1 : -1));
      const threshold = pick([1, 2], rng);
      if (!inputs.some((x) => x)) continue;
      if (!weights.some((w) => w > 0)) continue;
      const answer = fire(inputs, weights, threshold);
      if (prev && prev.answer === answer && rng() < 0.5) continue; // javoblar aralash chiqsin
      if (prev && prev.inputs.join() === inputs.join() && prev.weights.join() === weights.join() && prev.threshold === threshold) continue;
      return { type: "fire", inputs, weights, threshold, answer };
    }
  }

  // 3×3 rasm: kerakli yashirin holat bilan
  function makeImage(label, rng) {
    for (;;) {
      const image = bits(9, rng).map((x) => (x && rng() < 0.6 ? 1 : 0));
      if (label === "ikkalasi" || label === "faqat tik") [1, 4, 7].forEach((i) => { image[i] = 1; });
      if (label === "ikkalasi" || label === "faqat yotiq") [3, 4, 5].forEach((i) => { image[i] = 1; });
      if (hiddenLabel(image) === label) return image;
    }
  }

  const LABELS = ["ikkalasi", "faqat tik", "faqat yotiq", "hech biri"];

  // 2-bosqich: "Qaysi neyronlar yonadi?"
  function makeHiddenTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const label = pick(LABELS, rng);
      const image = makeImage(label, rng);
      if (prev && prev.image && prev.image.join() === image.join()) continue;
      return { type: "hidden", image, answer: label, options: LABELS };
    }
  }

  // 2-bosqich: "Tarmoq nima deydi?"
  function makeOutputTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const image = makeImage(pick(LABELS, rng), rng);
      if (prev && prev.image && prev.image.join() === image.join()) continue;
      return { type: "output", image, answer: output(image), options: ["krest", "chiziq", "boshqa"] };
    }
  }

  const makeStage2Task = (k, prev, rng) => {
    rng = rng || Math.random;
    const useHidden = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useHidden ? makeHiddenTask(prev, rng) : makeOutputTask(prev, rng);
  };

  // 3-bosqich: neyron xato qildi — og'irlikni oshiramizmi yoki kamaytiramizmi?
  function makeUpdateTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const inputs = bits(3, rng);
      if (!inputs.some((x) => x)) continue;
      const weights = Array.from({ length: 3 }, () => randInt(-1, 2, rng));
      const threshold = randInt(1, 3, rng);
      const out = fire(inputs, weights, threshold);
      const target = !out; // xato bo'lishi uchun kerakli javob — teskarisi
      const answer = updateRule(target, out);
      if (prev && prev.answer === answer && rng() < 0.5) continue;
      if (prev && prev.inputs.join() === inputs.join() && prev.weights.join() === weights.join()) continue;
      return { type: "update", inputs, weights, threshold, target, output: out, answer };
    }
  }

  const api = {
    DEMO, TIK, YOTIQ, LINE_THRESHOLD, TABLES, THRESHOLDS, LABELS,
    weightedSum, fire, hidden, output, hiddenLabel,
    tableErrors, bestOneNeuron, canOneNeuron, twoLayer, updateRule, trainNeuron,
    makeFireTask, makeHiddenTask, makeOutputTask, makeStage2Task, makeUpdateTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.neural = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

---

### 2-vazifa: Rasmlar va ekran qismlari

- [x] **1-qadam: `js/game-art.js`**

```js
// 11-o'yinga xos SVG rasmlar: hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Ko'p qatlamli tarmoq: ustunlardagi doiralar va ularni bog'lovchi chiziqlar
  function layers() {
    const cols = [[30, [24, 48, 72, 96]], [80, [18, 42, 66, 90, 114]], [130, [30, 60, 90]], [175, [45, 75]]];
    let lines = "";
    for (let c = 0; c + 1 < cols.length; c++) {
      for (const y1 of cols[c][1]) {
        for (const y2 of cols[c + 1][1]) {
          lines += `<line x1="${cols[c][0]}" y1="${y1}" x2="${cols[c + 1][0]}" y2="${y2}" stroke="#C9BFA6" stroke-width="1.2"/>`;
        }
      }
    }
    const colors = ["#2F6FDE", "#1A9E77", "#8E5BD0", "#F08A24"];
    let dots = "";
    cols.forEach(([x, ys], c) => {
      for (const y of ys) dots += `<circle cx="${x}" cy="${y}" r="7" fill="${colors[c]}" stroke="${INK}" stroke-width="2"/>`;
    });
    return `<svg viewBox="0 0 200 132" aria-hidden="true">${lines}${dots}</svg>`;
  }

  // Miya — neyron g'oyasi shundan olingan
  const brain = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <path d="M100 18 C70 10 40 22 36 50 C20 58 22 88 42 96 C48 116 78 120 96 108 L100 108 L104 108 C122 120 152 116 158 96 C178 88 180 58 164 50 C160 22 130 10 100 18 Z" fill="#F4C6C6" stroke="${INK}" stroke-width="3"/>
  <path d="M100 20 V106" stroke="#D99A9A" stroke-width="3"/>
  <path d="M56 48 q14 10 0 22 M72 34 q12 12 2 24 M144 48 q-14 10 0 22 M128 34 q-12 12 -2 24 M60 84 q18 -6 30 6 M140 84 q-18 -6 -30 6" stroke="#D99A9A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="64" cy="60" r="4" fill="#F08A24"/>
  <circle cx="136" cy="60" r="4" fill="#F08A24"/>
  <circle cx="100" cy="80" r="4" fill="#F08A24"/>
</svg>`;

  // "Qora quti": ichi ko'rinmaydigan quti, yonidan tishli g'ildiraklar
  const blackbox = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <path d="M8 66 H52" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>
  <path d="M148 66 H192" stroke="#1A9E77" stroke-width="5" stroke-linecap="round"/>
  <path d="M42 56 L54 66 L42 76" stroke="#2F6FDE" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M182 56 L194 66 L182 76" stroke="#1A9E77" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="56" y="22" width="90" height="90" rx="10" fill="${INK}"/>
  <circle cx="86" cy="54" r="14" fill="none" stroke="#8A929A" stroke-width="6" stroke-dasharray="6 5"/>
  <circle cx="116" cy="80" r="11" fill="none" stroke="#8A929A" stroke-width="5" stroke-dasharray="5 4"/>
</svg>`;

  const STORY = { layers: layers(), brain, blackbox };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { story });
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

test("hikoya rasmlari SVG va matnsiz", () => {
  for (const name of ["layers", "brain", "blackbox"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
});

test("qatlamlar rasmi: 4 ta ustun, 14 ta neyron", () => {
  assert.equal((art.story("layers").match(/<circle /g) || []).length, 14);
});
```

- [x] **3-qadam: `js/neural-ui.js`**

```js
// Ko'p qatlamli tarmoq: neyron ko'rinishi, 3×3 rasm, qatlamlar sxemasi, jadval va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { neural, ui, sound } = QK;

  const sign = (w) => (w > 0 ? `+${w}` : `${w}`);

  // Bitta neyron: chapda kirish chiroqlari va og'irliklar, o'ngda yig'indi va chegara
  function neuronView(host, opts) {
    const state = {
      inputs: (opts.inputs || [0, 0, 0]).slice(),
      weights: opts.weights.slice(),
      threshold: opts.threshold,
    };
    const inputsEl = ui.h("div", { class: "n-inputs" });
    const soma = ui.h("div", { class: "soma" });
    const sumEl = ui.h("span", { class: "soma-sum" });
    soma.append(sumEl);
    const thr = ui.h("div", { class: "soma-thr" });
    const line = ui.h("div", { class: "n-line", "aria-live": "polite" });
    const el = ui.h("div", { class: "neuron-box" },
      ui.h("div", { class: "neuron" }, inputsEl, ui.h("div", { class: "n-arrow", text: "→" }),
        ui.h("div", { class: "n-body" }, soma, thr)),
      line);
    host.append(el);

    function render() {
      inputsEl.innerHTML = "";
      state.inputs.forEach((x, i) => {
        const lamp = ui.h(opts.editable ? "button" : "span", {
          class: "lamp-in" + (x ? " on" : ""),
          type: opts.editable ? "button" : false,
          "aria-label": `${i + 1}-kirish: ${x ? "yoniq" : "oʻchiq"}`,
        });
        if (opts.editable) {
          lamp.addEventListener("click", () => {
            state.inputs[i] = state.inputs[i] ? 0 : 1;
            sound.play("tap");
            render();
            if (opts.onChange) opts.onChange(state.inputs.slice());
          });
        }
        inputsEl.append(ui.h("div", { class: "in-row" }, lamp,
          ui.h("span", { class: "w " + (state.weights[i] > 0 ? "plus" : "minus"), text: sign(state.weights[i]) })));
      });
      const sum = neural.weightedSum(state.inputs, state.weights);
      const fired = sum >= state.threshold;
      sumEl.textContent = `Σ ${sum}`;
      soma.classList.toggle("fired", fired);
      thr.textContent = `chegara ≥ ${state.threshold}`;
      const parts = state.inputs.map((x, i) => (x ? sign(state.weights[i]) : null)).filter(Boolean);
      line.textContent = opts.hideLine ? "" : `${parts.length ? parts.join(" ") : "0"} = ${sum} → ${fired ? "yondi ✓" : "yonmadi"}`;
    }
    render();
    return {
      el,
      get: () => ({ inputs: state.inputs.slice(), weights: state.weights.slice(), threshold: state.threshold }),
      set(next) {
        Object.assign(state, next);
        render();
      },
      showLine() {
        opts.hideLine = false;
        render();
      },
    };
  }

  // 3×3 rasm
  function smallGrid(host, opts) {
    const o = opts || {};
    let cells = new Array(9).fill(0);
    const el = ui.h("div", { class: "sgrid" });
    const nodes = [];
    for (let i = 0; i < 9; i++) {
      const node = o.editable
        ? ui.h("button", { class: "scell", type: "button", "aria-label": `${i + 1}-katak` })
        : ui.h("span", { class: "scell" });
      if (o.editable) {
        node.addEventListener("click", () => {
          cells[i] = cells[i] ? 0 : 1;
          sound.play("tap");
          render();
          if (o.onChange) o.onChange(cells.slice());
        });
      }
      nodes.push(node);
      el.append(node);
    }
    const render = () => nodes.forEach((node, i) => node.classList.toggle("on", !!cells[i]));
    host.append(el);
    render();
    return {
      el,
      get: () => cells.slice(),
      set(next) {
        cells = next.slice();
        render();
      },
    };
  }

  // Qatlamlar sxemasi: rasm → [tik, yotiq] → [krest, chiziq, boshqa]
  function layerView(host, opts) {
    const o = opts || {};
    const gridHost = ui.h("div", { class: "layer" }, ui.h("div", { class: "layer-name", text: "Rasm" }));
    const grid = smallGrid(gridHost, { editable: o.editable, onChange: (cells) => { render(cells); if (o.onChange) o.onChange(cells); } });
    const tik = ui.h("div", { class: "hnode", "aria-label": "tik chiziq neyroni" }, ui.h("span", { class: "bar-v" }));
    const yotiq = ui.h("div", { class: "hnode", "aria-label": "yotiq chiziq neyroni" }, ui.h("span", { class: "bar-h" }));
    const hiddenCol = ui.h("div", { class: "layer" }, ui.h("div", { class: "layer-name", text: "1-qatlam" }),
      ui.h("div", { class: "layer-nodes" }, tik, yotiq));
    const outs = {};
    const outNodes = ui.h("div", { class: "layer-nodes" });
    const outCol = ui.h("div", { class: "layer" }, ui.h("div", { class: "layer-name", text: "2-qatlam" }), outNodes);
    for (const name of ["krest", "chiziq", "boshqa"]) {
      outs[name] = ui.h("div", { class: "onode", text: name });
      outNodes.append(outs[name]);
    }
    const el = ui.h("div", { class: "layers" }, gridHost, ui.h("span", { class: "l-arrow", text: "→" }), hiddenCol,
      ui.h("span", { class: "l-arrow", text: "→" }), outCol);
    host.append(el);
    let showOut = o.showOutput !== false;
    let showHidden = o.showHidden !== false;
    function render(cells) {
      const h = neural.hidden(cells);
      tik.classList.toggle("fired", showHidden && h.tik);
      yotiq.classList.toggle("fired", showHidden && h.yotiq);
      const out = neural.output(cells);
      for (const name of Object.keys(outs)) outs[name].classList.toggle("fired", showOut && name === out);
    }
    render(grid.get());
    return {
      el,
      grid,
      set(cells) {
        grid.set(cells);
        render(cells);
      },
      reveal(what) {
        if (what === "hidden") showHidden = true;
        if (what === "output") showOut = true;
        render(grid.get());
      },
    };
  }

  // Ikki kirishli ish jadvali: kerakli javob va neyron javobi
  function truthTable(host) {
    const el = ui.h("div", { class: "ttable" });
    host.append(el);
    return {
      el,
      set(table, answer) {
        el.innerHTML = "";
        el.append(ui.h("div", { class: "trow head" },
          ui.h("span", { text: "A" }), ui.h("span", { text: "B" }), ui.h("span", { text: "kerak" }), ui.h("span", { text: "tarmoq" })));
        for (const [a, b, want] of table) {
          const got = answer ? answer([a, b]) : null;
          const ok = got === null ? null : got === (want === 1);
          el.append(ui.h("div", { class: "trow" + (ok === false ? " bad" : ok ? " good" : "") },
            ui.h("span", { class: "lamp-dot" + (a ? " on" : "") }),
            ui.h("span", { class: "lamp-dot" + (b ? " on" : "") }),
            ui.h("span", { text: want ? "yonsin" : "yonmasin" }),
            ui.h("span", { text: got === null ? "—" : (got ? "yondi" : "yonmadi") + (ok ? " ✓" : " ↻") })));
        }
      },
    };
  }

  // Matnli javob tugmalari
  function choiceButtons(options, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((label, i) => row.append(ui.button(label, () => onPick(i), i % 2 ? "secondary" : "")));
    ui.clearControl();
    ui.control().append(row);
  }

  QK.neuralUi = { sign, neuronView, smallGrid, layerView, truthTable, choiceButtons };
})(window);
```

- [x] **4-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Koʻp qatlamli tarmoq</title>
  <link rel="icon" href="../../bosh/icon.svg">
  <meta name="theme-color" content="#FFF6E5">
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
  <script src="js/neural.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="../umumiy/js/practice.js"></script>
  <script src="js/neural-ui.js"></script>
  <script src="js/scenes/common.js"></script>
  <script src="js/scenes/stage1.js"></script>
  <script src="js/scenes/stage2.js"></script>
  <script src="js/scenes/stage3.js"></script>
  <script src="js/scenes/final.js"></script>
  <script src="../umumiy/js/offline.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [x] **5-qadam: `css/style.css`**

```css
/* Ko'p qatlamli tarmoq — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.nbox { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }

/* ---------- Bitta neyron ---------- */
.neuron-box { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.neuron { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; background: #fff; box-shadow: 0 2px 0 var(--soya); }
.n-inputs { display: flex; flex-direction: column; gap: 8px; }
.in-row { display: flex; align-items: center; gap: 8px; }
.lamp-in {
  width: 48px; height: 48px; padding: 0; border: none; border-radius: 50%;
  background: #D9D2C3; box-shadow: inset 0 0 0 3px #B5AC98;
}
.lamp-in.on { background: #F0C040; box-shadow: 0 0 0 5px rgba(240, 192, 64, 0.35), inset 0 0 0 3px #C99A1E; }
button.lamp-in:active { transform: scale(0.94); }
.w { min-width: 42px; padding: 2px 6px; border-radius: 8px; font-size: 19px; font-weight: 900; text-align: center; }
.w.plus { color: var(--togri); background: #E3F3EC; }
.w.minus { color: #B06A12; background: #FDEBD6; }
.n-arrow { font-size: 28px; font-weight: 900; color: #A89F90; }
.n-body { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.soma {
  display: grid; place-items: center; width: 92px; height: 92px; border-radius: 50%;
  background: #EFE9DC; box-shadow: inset 0 0 0 4px #C9BFA6; transition: background 0.2s, box-shadow 0.2s;
}
.soma.fired { background: #F0C040; box-shadow: 0 0 0 8px rgba(240, 192, 64, 0.35), inset 0 0 0 4px #C99A1E; animation: pop 0.3s; }
.soma-sum { font-size: 24px; font-weight: 900; }
.soma-thr { font-size: 17px; font-weight: 800; opacity: 0.8; }
.n-line { min-height: 26px; font-size: 20px; font-weight: 900; }

/* ---------- 3×3 rasm va qatlamlar ---------- */
.sgrid { display: grid; grid-template-columns: repeat(3, 32px); gap: 3px; padding: 5px; border-radius: 10px; background: #fff; box-shadow: 0 2px 0 var(--soya); }
.scell { width: 32px; height: 32px; padding: 0; border: none; border-radius: 6px; background: #EFE9DC; box-shadow: inset 0 0 0 1px #DCD3C0; }
.scell.on { background: var(--matn); }
button.scell { width: 48px; height: 48px; }
.sgrid:has(button.scell) { grid-template-columns: repeat(3, 48px); }
/* Tor ekranda qatlamlar yuqoridan pastga, kengida — chapdan o'ngga */
.layers { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
.layer { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.layer-nodes { display: flex; flex-direction: row; align-items: center; gap: 8px; }
.layer-name { font-size: 15px; font-weight: 800; opacity: 0.75; white-space: nowrap; }
.l-arrow { font-size: 22px; font-weight: 900; color: #A89F90; transform: rotate(90deg); }
@media (min-width: 460px) {
  .layers { flex-direction: row; gap: 8px; }
  .layer-nodes { flex-direction: column; }
  .l-arrow { transform: none; }
}
.hnode {
  display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%;
  background: #EFE9DC; box-shadow: inset 0 0 0 3px #C9BFA6;
}
.hnode.fired { background: #F0C040; box-shadow: 0 0 0 5px rgba(240, 192, 64, 0.35), inset 0 0 0 3px #C99A1E; }
.bar-v { width: 6px; height: 26px; border-radius: 3px; background: var(--matn); }
.bar-h { width: 26px; height: 6px; border-radius: 3px; background: var(--matn); }
.onode {
  min-width: 78px; padding: 6px 8px; border-radius: 10px; background: #EFE9DC; box-shadow: inset 0 0 0 2px #C9BFA6;
  font-size: 17px; font-weight: 900; text-align: center;
}
.onode.fired { background: var(--togri); color: #fff; box-shadow: none; animation: pop 0.3s; }

/* ---------- Jadval ---------- */
.ttable { display: flex; flex-direction: column; gap: 4px; width: 100%; max-width: 340px; }
.trow { display: grid; grid-template-columns: 34px 34px 1fr 1fr; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 10px; background: #fff; font-size: 17px; font-weight: 800; }
.trow.head { background: none; font-size: 15px; opacity: 0.7; }
.trow.good { box-shadow: inset 0 0 0 2px var(--togri); }
.trow.bad { box-shadow: inset 0 0 0 2px var(--yana); }
.lamp-dot { width: 22px; height: 22px; border-radius: 50%; background: #D9D2C3; }
.lamp-dot.on { background: #F0C040; box-shadow: 0 0 0 3px rgba(240, 192, 64, 0.35); }
.count-line { font-size: 18px; font-weight: 800; text-align: center; }
.answer { font-size: 19px; font-weight: 900; color: var(--togri); text-align: center; }

/* ---------- Hikoya va tabrik ---------- */
.story { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.story-art { width: min(240px, 66vw); }
.story-art.small { width: min(110px, 28vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }

/* Yotiq telefon */
@media (orientation: landscape) and (max-height: 500px) {
  .play.compact { grid-template-columns: minmax(150px, 24%) minmax(0, 1fr); }
  .soma { width: 72px; height: 72px; }
  .lamp-in { width: 44px; height: 44px; }
  .n-inputs { gap: 4px; }
  .story-art { width: min(190px, 36vh); }
}
```

---

### 3-vazifa: Sahnalar

- [x] **1-qadam: `js/scenes/common.js`**

```js
// Koʻp qatlamli tarmoq: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "nbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  QK.common = { box, answerLine, line };
})(window);
```

- [x] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: bitta neyron (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { neural, ui, sound, art, neuralUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "10-oʻyinda belgini biz tanlagan edik: boʻyalgan kataklar soni.");
    await ui.say("apprentice", "Robot belgini oʻzi topa oladimi?");
    await ui.say("elder", "Ha — neyronlar yordamida. Neyron 4-oʻyindagi chiroqqa oʻxshaydi.");
  }

  // 4.1: chiroqlarni yoqib, neyron qachon yonishini ko'rish
  async function neuronDemo() {
    const el = common.box(true);
    let sawOn = false;
    let sawOff = false;
    ui.bubble("elder", "Chapdagi chiroqlarni bosib yoq. Katta doira — neyron. U qachon yonadi?");
    await ui.settle((done) => {
      neuralUi.neuronView(el, {
        weights: neural.DEMO.weights,
        threshold: neural.DEMO.threshold,
        editable: true,
        onChange: (inputs) => {
          const fired = neural.fire(inputs, neural.DEMO.weights, neural.DEMO.threshold);
          if (fired) sawOn = true;
          else if (inputs.some((x) => x)) sawOff = true;
          if (fired) sound.play("correct");
          if (sawOn && sawOff) setTimeout(done, 700);
        },
      });
    });
    await ui.say("elder", "Koʻrdingmi? Har chiroqning ogʻirligi bor: yashil +1 yonishga yordam beradi, sariq −1 xalaqit beradi.");
  }

  async function explain() {
    const el = common.box(false);
    neuralUi.neuronView(el, { inputs: [1, 1, 0], weights: neural.DEMO.weights, threshold: neural.DEMO.threshold });
    await ui.say("elder", "Neyron yoniq kirishlarni ogʻirligi bilan qoʻshadi: +1 +1 = 2.");
    await ui.say("elder", "Yigʻindi chegaraga yetsa — neyron yonadi. Yetmasa — yonmaydi.");
  }

  // 4.3: mashq — neyron yonadimi?
  function fireTask(task) {
    const el = common.box(true);
    const view = neuralUi.neuronView(el, { inputs: task.inputs, weights: task.weights, threshold: task.threshold, hideLine: true });
    ui.bubble("elder", "Bu neyron yonadimi?");
    const options = ["Yonadi", "Yonmaydi"];
    return practice.tries({
      setup: (submit) => neuralUi.choiceButtons(options, submit),
      check: (index) => (index === 0) === task.answer,
      hint: () => {
        view.showLine();
        ui.bubble("elder", "↻ Faqat yoniq chiroqlarning ogʻirligini qoʻsh va chegara bilan solishtir.");
      },
      solution: () => {
        view.showLine();
        el.append(common.answerLine(task.answer ? "Yonadi: yigʻindi chegaraga yetdi" : "Yonmaydi: yigʻindi chegaraga yetmadi"));
      },
    });
  }

  async function stage1() {
    await neuronDemo();
    await explain();
    await ui.say("elder", "Endi oʻzing hisobla: neyron yonadimi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => neural.makeFireTask(prev),
      run: fireTask,
      praise: (task) => `Yigʻindi ${neural.weightedSum(task.inputs, task.weights)}, chegara ${task.threshold} — ${task.answer ? "yonadi" : "yonmaydi"}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [x] **3-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: qatlamlar — chiziqdan shaklga (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { neural, ui, sound, neuralUi, practice, common } = QK;

  // 5.1–5.2: bola 3×3 rasm chizadi, qatlamlar yonadi
  async function layersDemo() {
    const el = common.box(true);
    let goal = "tik";
    let view = null;
    await ui.settle((done) => {
      view = neuralUi.layerView(el, {
        editable: true,
        onChange: (cells) => {
          const h = neural.hidden(cells);
          if (goal === "tik" && h.tik) {
            goal = "krest";
            sound.play("correct");
            ui.bubble("elder", "Tik chiziq neyroni yondi! Endi oʻrta qatorni ham boʻya.");
          } else if (goal === "krest" && neural.output(cells) === "krest") {
            sound.play("win");
            done();
          }
        },
      });
      ui.bubble("elder", "Rasmning oʻrta ustunini boʻya — tik chiziq chiz.");
    });
    await ui.say("elder", "Ikkala chiziq neyroni yondi — 2-qatlam «krest» dedi!");
    return view;
  }

  async function explain() {
    const el = common.box(false);
    const view = neuralUi.layerView(el, {});
    view.set([0, 1, 0, 1, 1, 1, 0, 1, 0]);
    await ui.say("elder", "1-qatlam kichik belgilarni topadi: tik chiziq, yotiq chiziq.");
    await ui.say("elder", "2-qatlam ulardan shakl yasaydi. Qatlam koʻp boʻlsa — tarmoq chuqur boʻladi.");
  }

  // 5.4: mashq
  function stageTask(task) {
    const el = common.box(true);
    const view = neuralUi.layerView(el, { showHidden: task.type !== "hidden", showOutput: false });
    view.set(task.image);
    const labels = task.options;
    ui.bubble("elder", task.type === "hidden" ? "1-qatlamda qaysi neyronlar yonadi?" : "Tarmoq bu rasmni nima deydi?");
    return practice.tries({
      setup: (submit) => neuralUi.choiceButtons(labels, submit),
      check: (index) => labels[index] === task.answer,
      hint: () => ui.bubble("elder", task.type === "hidden"
        ? "↻ Tik neyron oʻrta ustun toʻliq boʻlsa yonadi, yotiq — oʻrta qator toʻliq boʻlsa."
        : "↻ Ikkalasi yonsa — krest, bittasi — chiziq, hech biri — boshqa."),
      solution: () => {
        view.reveal("hidden");
        view.reveal("output");
        el.append(common.answerLine(`Javob: ${task.answer}`));
      },
    });
  }

  async function stage2() {
    await layersDemo();
    await explain();
    await ui.say("elder", "Endi oʻzing ayt! 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev, correct) => neural.makeStage2Task(correct, prev),
      run: stageTask,
      praise: (task) => `Javob: ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [x] **4-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: nega chuqur, o'rganish va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { neural, ui, sound, art, neuralUi, practice, common } = QK;

  const SCENES = [
    { art: "layers", lines: ["Rasm taniydigan tarmoqlarda yuzlab qatlam va millionlab ogʻirlik bor.", "Chatbotlarda esa milliardlab!"] },
    { art: "brain", lines: ["Neyron gʻoyasi miyadan olingan.", "Lekin tarmoq miya emas — u faqat sonlarni qoʻshadi va solishtiradi."] },
    { art: "blackbox", lines: ["Tarmoq nega aynan shunday qaror qilganini tushuntirish qiyin.", "Shuning uchun uning javobini odam tekshirib turadi."] },
    { art: "robot", lines: ["Chuqur oʻrganish — mashinali oʻrganishning ichidagi qism.", "Keyingi oʻyinda hammasini bitta xaritaga joylaymiz!"] },
  ];

  const TASK = neural.TABLES.faqatBittasi;

  // 6.1: bitta neyron bu ishni uddalay olmaydi — robot barcha og'irliklarni sinaydi
  async function oneFails() {
    const el = common.box(true);
    el.append(common.line("Ish: ikki chiroqdan faqat bittasi yoniq boʻlsa — yon"));
    const table = neuralUi.truthTable(el);
    table.set(TASK, null);
    const note = common.line(" ");
    el.append(note);
    await ui.say("elder", "Yangi ish: ikki chiroqdan faqat bittasi yoniq boʻlsa, neyron yonsin.");
    ui.bubble("elder", "Bitta neyron buni uddalaydimi? Robot barcha ogʻirlik va chegaralarni sinasin.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Hammasini sina", () => { ui.clearControl(); done(); }, "big"));
    });
    let tried = 0;
    for (let w1 = -2; w1 <= 2; w1++) {
      for (let w2 = -2; w2 <= 2; w2++) {
        for (let t = -2; t <= 3; t += 2) {
          tried++;
          table.set(TASK, (x) => neural.fire(x, [w1, w2], t));
          note.textContent = `Sinaldi: ${tried} ta neyron`;
          await ui.sleep(45);
        }
      }
    }
    const best = neural.bestOneNeuron(TASK);
    table.set(TASK, (x) => neural.fire(x, best.weights, best.threshold));
    note.textContent = `Eng yaxshisi ham ${best.errors} ta xato qiladi`;
    sound.play("retry");
    await ui.say("elder", `Hech bir neyron uddalay olmadi — eng yaxshisi ham ${best.errors} ta xato qiladi.`);
  }

  // 6.2: ikki qatlam uddalaydi
  async function twoWork() {
    const el = common.box(true);
    el.append(common.line("1-qatlam: «faqat A» va «faqat B» neyronlari → 2-qatlam: «bittasi yondimi?»"));
    const table = neuralUi.truthTable(el);
    table.set(TASK, null);
    ui.bubble("elder", "Endi ikki qatlamli tarmoq sinab koʻrsin. «Sina»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Sina", () => { ui.clearControl(); done(); }, "big"));
    });
    table.set(TASK, (x) => neural.twoLayer(x).out);
    sound.play("correct");
    await ui.say("elder", "Hammasi toʻgʻri! Ikki qatlam bitta neyron uddalay olmagan ishni bajardi.");
    await ui.say("elder", "Qiyin ish — koʻp qatlam. Shuning uchun uni chuqur oʻrganish deyishadi.");
  }

  // 6.3: og'irliklarni tarmoq o'zi o'rganadi
  async function learning() {
    const el = common.box(true);
    const table = neuralUi.truthTable(el);
    const note = common.line(" ");
    el.append(note);
    const threshold = neural.THRESHOLDS.va;
    await ui.say("elder", "Ogʻirliklarni kim tanlaydi? Tarmoqning oʻzi — misollardan!");
    await ui.say("elder", "Qoida: yonishi kerak edi-yu yonmasa — ogʻirlik oshiriladi. Yonmasligi kerak edi-yu yonsa — kamaytiriladi.");
    ui.bubble("elder", "Ish: ikkala chiroq yoniq boʻlsa — yon. «Oʻrgat»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Oʻrgat", () => { ui.clearControl(); done(); }, "big"));
    });
    const steps = neural.trainNeuron(neural.TABLES.va, [0, 0], threshold);
    for (let i = 0; i < steps.length; i++) {
      const w = steps[i].weights;
      table.set(neural.TABLES.va, (x) => neural.fire(x, w, threshold));
      note.textContent = `${i}-qadam · ogʻirliklar: ${neuralUi.sign(w[0])}, ${neuralUi.sign(w[1])} · xato: ${steps[i].errors}`;
      sound.play(steps[i].errors ? "tap" : "correct");
      await ui.sleep(900);
    }
    await ui.say("elder", "Xato 0! Tarmoq ogʻirliklarni oʻzi topdi — biz faqat misol berdik.");
  }

  // 6.4: mashq — og'irlikni oshiramizmi yoki kamaytiramizmi?
  function updateTask(task) {
    const el = common.box(true);
    neuralUi.neuronView(el, { inputs: task.inputs, weights: task.weights, threshold: task.threshold });
    el.append(common.line(task.target ? "Neyron YONISHI kerak edi, lekin yonmadi" : "Neyron YONMASLIGI kerak edi, lekin yondi"));
    ui.bubble("elder", "Neyron xato qildi. Yoniq kirishlarning ogʻirligini nima qilamiz?");
    const options = ["Oshiramiz", "Kamaytiramiz"];
    return practice.tries({
      setup: (submit) => neuralUi.choiceButtons(options, submit),
      check: (index) => (index === 0 ? "oshir" : "kamaytir") === task.answer,
      hint: () => ui.bubble("elder", task.target
        ? "↻ Yonishi uchun yigʻindi kattaroq boʻlishi kerak."
        : "↻ Yonmasligi uchun yigʻindi kichikroq boʻlishi kerak."),
      solution: () => el.append(common.answerLine(task.answer === "oshir"
        ? "Oshiramiz — yigʻindi kattalashib, chegaraga yetadi"
        : "Kamaytiramiz — yigʻindi kichrayib, chegaradan tushadi")),
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: scene.art === "robot" ? art.robot() : art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await oneFails();
    await twoWork();
    await learning();
    await ui.say("elder", "Endi sen oʻrgat: ogʻirlikni oshiramizmi yoki kamaytiramizmi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => neural.makeUpdateTask(prev),
      run: updateTask,
      praise: (task) => (task.answer === "oshir" ? "Oshirdik — endi yonadi." : "Kamaytirdik — endi yonmaydi."),
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
    await ui.say("elder", goingOn
      ? `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`
      : `${s}-bosqich tugadi! Barakalla!`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi sen neyron tarmoq qanday ishlashini bilasan!");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Neyron: yigʻindi chegaraga yetsa — yonadi" }),
        ui.h("div", { text: "Qatlamlar: chiziq → shakl → javob" }),
        ui.h("div", { text: "Xato boʻlsa — ogʻirlik oʻzgaradi" }))));
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
// 11-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Koʻp qatlamli tarmoq",
  storageKey: "kop-qatlamli-tarmoq:v1",
  stageTitles: ["Bitta neyron", "Qatlamlar", "Nega chuqur?"],
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
  assert.equal(captured.storageKey, "kop-qatlamli-tarmoq:v1");
  assert.equal(captured.title, "Koʻp qatlamli tarmoq");
  assert.deepEqual(captured.stageTitles, ["Bitta neyron", "Qatlamlar", "Nega chuqur?"]);
});
```

---

### 4-vazifa: Bosh sahifa, offline va tekshiruv

- [x] **1-qadam: bosh sahifaga 11-o'yin (`tarmoq` ikonkasi)**
- [x] **2-qadam: offline ro'yxati** — `python3 bosh/sw-royxat.py --bump`
- [x] **3-qadam: barcha testlar va brauzerda 5 marta to'liq o'ynab chiqish** (`scratchpad/play11.js`)
- [x] **4-qadam: commit, main'ga birlashtirish va GitHub'ga yuklash**
