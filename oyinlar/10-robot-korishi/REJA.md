# 10 — Robot nimani koʻradi?: ish rejasi

**Maqsad:** 10-o'yin: kompyuter ko'rish — rasm robot uchun kataklar va sonlar; shablon bilan tanish; surilganda nima bo'ladi va belgi nima uchun kerak.

**Arxitektura:** oldingi o'yinlardagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/`. Sof hisob `js/vision.js` (Node testlari), ekran qismlari `js/vision-ui.js`, rasmlar `js/game-art.js`, sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi; bloklar tayyor fayllardan olingan (TDD: avval `tests/vision.test.js`, keyin `js/vision.js`).

## Nomlar va interfeyslar

- `QK.vision`: `SIZE` (6), `CELLS` (36), `NAMES` (`kvadrat`, `uchburchak`, `krest`), `TEMPLATES`, `gridFrom`, `empty`, `filled`, `matchScore(a, b)`, `bestMatch(grid)` → `{name, score, list}`, `byFeature(grid)`, `shift(grid, dx, dy)`, `addNoise`, `addCells`, `makeReadTask(prev, rng?)`, `makeMatchTask(prev, rng?)`, `makeMethodTask(prev, rng?)`.
- `QK.visionUi`: `grid(host, {editable, size, onChange})` → `{get, set, flash}`, `numbers(host)`, `scores(host)` → `{set(list, bestName), clear}`, `shapeButtons(onPick)`, `optionGrids(options, onPick)`, `featureLine(host)`.
- `QK.common`: `box(compact)`, `answerLine`, `line`.
- `QK.art.story(name)`: `camera | roadsign | xray`.

---

### 1-vazifa: Hisob moduli (`js/vision.js`) — TDD

- [x] **1-qadam: muvaffaqiyatsiz testlar — `tests/vision.test.js`**

```js
// vision.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../js/vision.js");

test("to'r va shablonlar: 6×6, uch xil shakl", () => {
  assert.equal(V.SIZE, 6);
  assert.deepEqual(V.NAMES, ["kvadrat", "uchburchak", "krest"]);
  for (const name of V.NAMES) {
    const grid = V.TEMPLATES[name];
    assert.equal(grid.length, 36, name);
    assert.ok(grid.every((c) => c === 0 || c === 1), name);
  }
  assert.equal(V.filled(V.TEMPLATES.kvadrat), 32);
  assert.equal(V.filled(V.TEMPLATES.uchburchak), 24);
  assert.equal(V.filled(V.TEMPLATES.krest), 20);
});

test("matchScore: bir xil rasmda 36, farq qilganda kamayadi", () => {
  assert.equal(V.matchScore(V.TEMPLATES.krest, V.TEMPLATES.krest), 36);
  assert.ok(V.matchScore(V.TEMPLATES.krest, V.TEMPLATES.kvadrat) < 36);
  const one = V.TEMPLATES.krest.slice();
  one[0] = one[0] ? 0 : 1;
  assert.equal(V.matchScore(V.TEMPLATES.krest, one), 35);
});

test("shift: rasm suriladi, chetdagi kataklar yo'qoladi", () => {
  const grid = new Array(36).fill(0);
  grid[0] = 1;   // chap-yuqori
  grid[35] = 1;  // o'ng-past
  const right = V.shift(grid, 1, 0);
  assert.equal(right[1], 1, "o'ngga surilmadi");
  assert.equal(right[0], 0);
  assert.equal(V.filled(right), 1, "o'ng chekkadagi katak yo'qolishi kerak");
  const down = V.shift(grid, 0, 1);
  assert.equal(down[6], 1);
});

test("bestMatch: eng ko'p mos kelgan shablon", () => {
  const best = V.bestMatch(V.TEMPLATES.uchburchak);
  assert.equal(best.name, "uchburchak");
  assert.equal(best.score, 36);
  assert.equal(best.list.length, 3);
  assert.ok(best.list[0].score >= best.list[1].score);
});

test("byFeature: bo'yalgan kataklar soniga eng yaqin shablon", () => {
  assert.equal(V.byFeature(V.TEMPLATES.krest), "krest");
  assert.equal(V.byFeature(V.shift(V.TEMPLATES.krest, 1, 0)), "krest", "surilganda ham belgi ishlaydi");
  assert.equal(V.byFeature(V.TEMPLATES.kvadrat), "kvadrat");
});

test("addNoise: aytilgancha katak o'zgaradi", () => {
  const noisy = V.addNoise(V.TEMPLATES.krest, 4, Math.random);
  assert.equal(V.matchScore(V.TEMPLATES.krest, noisy), 32);
});

test("makeReadTask: uch variantdan bittasi to'g'ri", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = V.makeReadTask(prev);
    assert.equal(task.options.length, 3);
    assert.deepEqual(task.options[task.answer], task.image);
    const keys = task.options.map((g) => g.join(""));
    assert.equal(new Set(keys).size, 3, "variantlar takrorlandi");
    if (prev) assert.notEqual(task.image.join(""), prev.image.join(""));
    prev = task;
  }
});

test("makeMatchTask: robot shablon bilan to'g'ri javob topadi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = V.makeMatchTask(prev);
    const best = V.bestMatch(task.image);
    assert.equal(best.name, task.answer);
    assert.ok(best.list[0].score - best.list[1].score >= 3, "javob ikkilanarli");
    seen.add(task.answer);
    prev = task;
  }
  assert.equal(seen.size, 3, "uchala shakl ham chiqishi kerak");
});

test("makeMethodTask: faqat bitta usul to'g'ri javob beradi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 300; i++) {
    const task = V.makeMethodTask(prev);
    const byPixels = V.bestMatch(task.image).name === task.truth;
    const byFeature = V.byFeature(task.image) === task.truth;
    assert.notEqual(byPixels, byFeature, "ikkala usul ham bir xil natija berdi");
    assert.equal(task.answer, byPixels ? "shablon" : "belgi");
    assert.ok(V.NAMES.includes(task.truth));
    seen.add(task.answer);
    prev = task;
  }
  assert.equal(seen.size, 2, "ikkala javob turi ham chiqishi kerak");
});
```

- [x] **2-qadam: `js/vision.js`**

```js
// Robot nimani ko'radi? — sof hisob: 6×6 to'r, shablonlar, moslik, belgilar va topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const SIZE = 6;
  const CELLS = SIZE * SIZE;

  // Shablonlar 6×6: "#" — bo'yalgan katak
  const PATTERNS = {
    kvadrat: [
      ".####.",
      "######",
      "######",
      "######",
      "######",
      ".####.",
    ],
    uchburchak: [
      "..##..",
      "..##..",
      ".####.",
      ".####.",
      "######",
      "######",
    ],
    krest: [
      "..##..",
      "..##..",
      "######",
      "######",
      "..##..",
      "..##..",
    ],
  };

  const gridFrom = (rows) => rows.join("").split("").map((ch) => (ch === "#" ? 1 : 0));

  const NAMES = Object.keys(PATTERNS);
  const TEMPLATES = {};
  for (const name of NAMES) TEMPLATES[name] = gridFrom(PATTERNS[name]);

  const empty = () => new Array(CELLS).fill(0);
  const filled = (grid) => grid.reduce((sum, cell) => sum + cell, 0);

  // Nechta katak mos keladi (36 tadan)
  const matchScore = (a, b) => a.reduce((sum, cell, i) => sum + (cell === b[i] ? 1 : 0), 0);

  // Eng ko'p mos kelgan shablon va barcha mosliklar
  function bestMatch(grid) {
    const list = NAMES.map((name) => ({ name, score: matchScore(grid, TEMPLATES[name]) }))
      .sort((a, b) => b.score - a.score);
    return { name: list[0].name, score: list[0].score, list };
  }

  // Belgi bo'yicha: bo'yalgan kataklar soni eng yaqin shablon (surilganda o'zgarmaydi)
  function byFeature(grid) {
    const n = filled(grid);
    let best = null;
    for (const name of NAMES) {
      const diff = Math.abs(filled(TEMPLATES[name]) - n);
      if (!best || diff < best.diff) best = { name, diff };
    }
    return best.name;
  }

  // Rasmni surish: chetdan chiqqan kataklar yo'qoladi
  function shift(grid, dx, dy) {
    const out = empty();
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) continue;
        out[ny * SIZE + nx] = grid[y * SIZE + x];
      }
    }
    return out;
  }

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  // n ta tasodifiy katakni almashtirish
  function addNoise(grid, n, rng) {
    rng = rng || Math.random;
    const out = grid.slice();
    const spots = [];
    while (spots.length < n) {
      const i = randInt(0, CELLS - 1, rng);
      if (!spots.includes(i)) spots.push(i);
    }
    for (const i of spots) out[i] = out[i] ? 0 : 1;
    return out;
  }

  // Faqat bo'sh kataklarni bo'yash (belgi — bo'yalgan kataklar soni — ortadi)
  function addCells(grid, n, rng) {
    rng = rng || Math.random;
    const out = grid.slice();
    const free = [];
    out.forEach((cell, i) => {
      if (!cell) free.push(i);
    });
    for (let k = 0; k < n && free.length; k++) out[free.splice(Math.floor(rng() * free.length), 1)[0]] = 1;
    return out;
  }

  // 1-bosqich: "Robot shu sonlarni ko'rdi — bu qaysi rasm?"
  function makeReadTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const name = pick(NAMES, rng);
      const image = addNoise(TEMPLATES[name], randInt(1, 3, rng), rng);
      const others = NAMES.filter((n) => n !== name).map((n) => addNoise(TEMPLATES[n], randInt(1, 3, rng), rng));
      const options = [image].concat(others);
      const keys = options.map((g) => g.join(""));
      if (new Set(keys).size !== 3) continue;
      if (prev && prev.image.join("") === image.join("")) continue;
      // tasodifiy tartib
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = options[i];
        options[i] = options[j];
        options[j] = tmp;
      }
      return { type: "read", image, options, answer: options.findIndex((g) => g.join("") === image.join("")), truth: name };
    }
  }

  // 2-bosqich: "Robot nima deydi?" — shablon bilan aniq javob bo'lsin
  function makeMatchTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const name = pick(NAMES, rng);
      const image = addNoise(TEMPLATES[name], randInt(2, 4, rng), rng);
      const best = bestMatch(image);
      if (best.name !== name) continue;
      if (best.list[0].score - best.list[1].score < 3) continue;
      if (prev && prev.answer === name && prev.image.join("") === image.join("")) continue;
      return { type: "match", image, answer: name, truth: name };
    }
  }

  // 3-bosqich: "Qaysi usul to'g'ri javob beradi?" — faqat bittasi to'g'ri bo'lsin
  function makeMethodTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const name = pick(NAMES, rng);
      const useShift = rng() < 0.5;
      const image = useShift
        ? shift(TEMPLATES[name], pick([1, -1], rng), pick([0, 1, -1], rng))
        : addCells(TEMPLATES[name], randInt(3, 5, rng), rng);
      const byPixels = bestMatch(image).name === name;
      const byFeatureOk = byFeature(image) === name;
      if (byPixels === byFeatureOk) continue; // faqat bitta usul to'g'ri bo'lsin
      const answer = byPixels ? "shablon" : "belgi";
      if (prev && prev.answer === answer && prev.image.join("") === image.join("")) continue;
      return { type: "method", image, truth: name, answer, changed: useShift ? "surildi" : "kataklar qoʻshildi" };
    }
  }

  const api = {
    SIZE, CELLS, NAMES, TEMPLATES, PATTERNS,
    gridFrom, empty, filled, matchScore, bestMatch, byFeature, shift, addNoise, addCells,
    makeReadTask, makeMatchTask, makeMethodTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.vision = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

---

### 2-vazifa: Rasmlar va ekran qismlari

- [x] **1-qadam: `js/game-art.js`**

```js
// 10-o'yinga xos SVG rasmlar: hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Telefon kamerasi yuzni topadi
  const camera = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="56" y="6" width="88" height="108" rx="12" fill="#2B2B3A"/>
  <rect x="64" y="16" width="72" height="88" rx="6" fill="#DCE8FA"/>
  <circle cx="100" cy="52" r="18" fill="#E2A77E" stroke="${INK}" stroke-width="2"/>
  <path d="M84 44 Q100 30 116 44 Q100 38 84 44 Z" fill="#4A3B2E"/>
  <circle cx="94" cy="52" r="2.2" fill="${INK}"/>
  <circle cx="106" cy="52" r="2.2" fill="${INK}"/>
  <path d="M82 72 Q100 84 118 72 L118 96 L82 96 Z" fill="#1A9E77"/>
  <path d="M76 34 h12 M76 34 v12 M124 34 h-12 M124 34 v12 M76 82 h12 M76 82 v-12 M124 82 h-12 M124 82 v-12" stroke="#F08A24" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

  // Yo'l belgisi va mashina
  const roadsign = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="0" y="96" width="200" height="24" fill="#8A929A"/>
  <path d="M10 108 h30 M60 108 h30 M110 108 h30 M160 108 h30" stroke="#FFFFFF" stroke-width="4"/>
  <rect x="44" y="52" width="6" height="46" fill="#8A929A"/>
  <circle cx="47" cy="38" r="26" fill="#E0524A" stroke="#FFFFFF" stroke-width="5"/>
  <rect x="33" y="33" width="28" height="9" rx="2" fill="#FFFFFF"/>
  <path d="M112 92 L120 66 h44 l10 26 z" fill="#2F6FDE" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="124" y="70" width="18" height="16" rx="3" fill="#DCE8FA"/>
  <rect x="146" y="70" width="18" height="16" rx="3" fill="#DCE8FA"/>
  <circle cx="126" cy="94" r="8" fill="${INK}"/>
  <circle cx="166" cy="94" r="8" fill="${INK}"/>
</svg>`;

  // Rentgen rasmi va lupa
  const xray = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="26" y="8" width="100" height="104" rx="8" fill="#1E3A5F" stroke="${INK}" stroke-width="3"/>
  <path d="M76 24 v72" stroke="#9FC6E8" stroke-width="5"/>
  <path d="M56 40 q20 -12 40 0 M52 56 q24 -10 48 0 M56 72 q20 -8 40 0" stroke="#9FC6E8" stroke-width="4" fill="none"/>
  <circle cx="92" cy="60" r="7" fill="#F08A24"/>
  <circle cx="140" cy="60" r="28" fill="rgba(47,111,222,0.12)" stroke="${INK}" stroke-width="4"/>
  <line x1="160" y1="80" x2="182" y2="102" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
</svg>`;

  const STORY = { camera, roadsign, xray };

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
  for (const name of ["camera", "roadsign", "xray"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
  assert.match(art.robot(), /^<svg[\s\S]*<\/svg>$/);
});
```

- [x] **3-qadam: `js/vision-ui.js`**

```js
// Robot nimani ko'radi?: to'r, sonlar jadvali, moslik ustunchalari va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound } = QK;

  // 6×6 to'r. editable — kataklar bosiladi; size: "" | "sm" | "xs"
  function grid(host, opts) {
    const o = opts || {};
    let cells = vision.empty();
    const el = ui.h("div", { class: "vgrid" + (o.size ? " " + o.size : "") });
    const nodes = [];
    for (let i = 0; i < vision.CELLS; i++) {
      const node = o.editable
        ? ui.h("button", { class: "vcell", type: "button", "aria-label": `${Math.floor(i / vision.SIZE) + 1}-qator, ${(i % vision.SIZE) + 1}-katak` })
        : ui.h("span", { class: "vcell" });
      if (o.editable) {
        node.addEventListener("click", () => {
          cells[i] = cells[i] ? 0 : 1;
          render();
          sound.play("tap");
          if (o.onChange) o.onChange(cells.slice());
        });
      }
      nodes.push(node);
      el.append(node);
    }
    function render() {
      nodes.forEach((node, i) => node.classList.toggle("on", !!cells[i]));
    }
    host.append(el);
    render();
    return {
      el,
      get: () => cells.slice(),
      set(next) {
        cells = next.slice();
        render();
      },
      flash() {
        el.classList.remove("flash");
        void el.offsetWidth;
        el.classList.add("flash");
      },
    };
  }

  // Robot ko'radigan sonlar: 1 va 0
  function numbers(host) {
    const el = ui.h("div", { class: "vnums" });
    host.append(el);
    return {
      el,
      set(cells) {
        el.innerHTML = "";
        cells.forEach((cell) => el.append(ui.h("span", { class: "vnum" + (cell ? " one" : ""), text: cell ? "1" : "0" })));
      },
    };
  }

  // Moslik ustunchalari: har shablon uchun 36 tadan nechtasi mos
  function scores(host) {
    const el = ui.h("div", { class: "vscores" });
    host.append(el);
    return {
      el,
      clear() { el.innerHTML = ""; },
      set(list, bestName) {
        el.innerHTML = "";
        for (const item of list) {
          el.append(ui.h("div", { class: "vscore" + (item.name === bestName ? " best" : "") },
            ui.h("span", { class: "vs-name", text: item.name }),
            ui.h("span", { class: "vs-bar", style: `width:${Math.round((item.score / vision.CELLS) * 120)}px` }),
            ui.h("span", { class: "vs-n", text: `${item.score} / ${vision.CELLS}` })));
        }
      },
    };
  }

  // Shakl tugmalari (kichik rasm bilan)
  function shapeButtons(onPick) {
    const row = ui.h("div", { class: "choice-row" });
    vision.NAMES.forEach((name) => {
      const button = ui.h("button", { class: "btn secondary shape-btn", type: "button", "aria-label": name, onClick: () => { sound.play("tap"); onPick(name); } });
      const mini = grid(button, { size: "xs" });
      mini.set(vision.TEMPLATES[name]);
      button.append(ui.h("span", { class: "shape-name", text: name }));
      row.append(button);
    });
    ui.clearControl();
    ui.control().append(row);
  }

  // Variant rasmlari (1-bosqich mashqi)
  function optionGrids(options, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((cells, i) => {
      const button = ui.h("button", { class: "btn secondary shape-btn", type: "button", "aria-label": `${i + 1}-rasm`, onClick: () => { sound.play("tap"); onPick(i); } });
      const mini = grid(button, { size: "xs" });
      mini.set(cells);
      row.append(button);
    });
    ui.clearControl();
    ui.control().append(row);
  }

  // "Bo'yalgan kataklar: N"
  function featureLine(host) {
    const el = ui.h("div", { class: "vfeature" });
    host.append(el);
    return {
      el,
      set(cells) { el.textContent = `Boʻyalgan kataklar: ${vision.filled(cells)}`; },
      clear() { el.textContent = ""; },
    };
  }

  QK.visionUi = { grid, numbers, scores, shapeButtons, optionGrids, featureLine };
})(window);
```

- [x] **4-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Robot nimani koʻradi?</title>
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
  <script src="js/vision.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="../umumiy/js/practice.js"></script>
  <script src="js/vision-ui.js"></script>
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
/* Robot nimani ko'radi? — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.vbox { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }

/* ---------- 6×6 to'r ---------- */
.vgrid {
  display: grid; grid-template-columns: repeat(6, 36px); gap: 3px; padding: 6px;
  border-radius: 12px; background: #fff; box-shadow: 0 2px 0 var(--soya);
}
.vgrid.sm { grid-template-columns: repeat(6, 22px); gap: 2px; padding: 4px; }
.vgrid.xs { grid-template-columns: repeat(6, 13px); gap: 1px; padding: 3px; box-shadow: none; background: none; }
.vcell {
  width: 36px; height: 36px; padding: 0; border: none; border-radius: 6px;
  background: #EFE9DC; box-shadow: inset 0 0 0 1px #DCD3C0;
}
.vgrid.sm .vcell { width: 22px; height: 22px; border-radius: 4px; }
.vgrid.xs .vcell { width: 13px; height: 13px; border-radius: 3px; }
.vcell.on { background: var(--matn); }
button.vcell:active { transform: scale(0.92); }
.vgrid.flash { animation: flash 0.3s 2; }

/* ---------- Sonlar jadvali ---------- */
.vnums { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0 8px; max-width: 190px; line-height: 1.25; }
.vnum { font-size: 17px; font-weight: 800; text-align: center; color: #A89F90; }
.vnum.one { color: var(--matn); }

/* ---------- Moslik ustunchalari ---------- */
.vscores { display: flex; flex-direction: column; gap: 4px; width: 100%; max-width: 330px; min-height: 24px; }
.vscore { display: flex; align-items: center; gap: 8px; padding: 2px 6px; border-radius: 8px; }
.vscore.best { background: rgba(26, 158, 119, 0.14); }
.vs-name { width: 92px; font-size: 17px; font-weight: 800; }
.vs-bar { height: 12px; border-radius: 6px; background: var(--asosiy); }
.vscore.best .vs-bar { background: var(--togri); }
.vs-n { font-size: 16px; font-weight: 800; }
.vfeature { font-size: 19px; font-weight: 900; color: var(--asosiy); min-height: 24px; }

/* ---------- Shablonlar qatori va tugmalar ---------- */
.vrow { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.vtile { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.vtile-name { font-size: 17px; font-weight: 800; }
.shape-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 10px; min-height: 64px; }
.shape-name { font-size: 16px; font-weight: 800; }
.count-line { font-size: 18px; font-weight: 800; text-align: center; }
.answer { font-size: 19px; font-weight: 900; color: var(--togri); text-align: center; }

/* ---------- Hikoya va tabrik ---------- */
.story { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.story-art { width: min(240px, 66vw); }
.story-art.small { width: min(110px, 28vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }

/* Keng ekran: to'r kattaroq bo'ladi */
@media (min-width: 700px) {
  .vgrid { grid-template-columns: repeat(6, 44px); }
  .vcell { width: 44px; height: 44px; }
}

/* Yotiq telefon */
@media (orientation: landscape) and (max-height: 500px) {
  .play.compact { grid-template-columns: minmax(150px, 24%) minmax(0, 1fr); }
  .vgrid { grid-template-columns: repeat(6, 30px); }
  .vcell { width: 30px; height: 30px; }
  .vnums { max-width: 160px; }
  .vnum { font-size: 16px; }
  .story-art { width: min(190px, 36vh); }
}
```

---

### 3-vazifa: Sahnalar

- [x] **1-qadam: `js/scenes/common.js`**

```js
// Robot nimani ko'radi?: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "vbox" });
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
// Kirish va 1-bosqich: rasm — bu sonlar (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound, art, visionUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robotga koʻz berdik!");
    await ui.say("apprentice", "Endi u rasmni koʻradimi?");
    await ui.say("elder", "Koʻradi, lekin boshqacha. U faqat kataklardagi sonlarni koʻradi.");
  }

  // 4.1: bola chizadi, sonlar jonli o'zgaradi
  async function draw() {
    const el = common.box(true);
    const nums = visionUi.numbers(el);
    const board = visionUi.grid(el, { editable: true, onChange: (cells) => nums.set(cells) });
    el.insertBefore(board.el, nums.el);
    nums.set(board.get());
    ui.bubble("elder", "Kataklarni bosib rasm chiz. Pastdagi sonlarga qara!");
    let painted = 0;
    await ui.settle((done) => {
      ui.control().append(ui.button("Tayyor", () => {
        painted = vision.filled(board.get());
        if (painted < 6) {
          sound.play("retry");
          ui.toast("Kamida 6 ta katakni boʻya.");
          return;
        }
        ui.clearControl();
        done();
      }, "big"));
    });
    await ui.say("elder", `Sen ${painted} ta katakni boʻyading. Robot buni 1 va 0 lar qatori deb koʻradi.`);
    await ui.say("elder", "Har katak — bitta piksel. 4-oʻyindagi chiroqlarni esla: yoniq — 1, oʻchiq — 0.");
  }

  // 4.3: mashq — sonlarga qarab rasmni topish
  function readTask(task) {
    const el = common.box(true);
    const nums = visionUi.numbers(el);
    nums.set(task.image);
    ui.bubble("elder", "Robot mana shu sonlarni koʻrdi. Bu qaysi rasm?");
    return practice.tries({
      setup: (submit) => visionUi.optionGrids(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        el.append(common.line("Birinchi qatorni solishtir: 0 — boʻsh, 1 — boʻyalgan"));
        ui.bubble("elder", "↻ Birinchi qatorni sana: qaysi rasmda xuddi shunday?");
      },
      solution: () => {
        const right = visionUi.grid(el, { size: "sm" });
        right.set(task.image);
        el.append(common.answerLine("Mana shu rasm"));
      },
    });
  }

  async function stage1() {
    await draw();
    await ui.say("elder", "Endi oʻzing top: sonlar qaysi rasmga tegishli? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => vision.makeReadTask(prev),
      run: readTask,
      praise: () => "Sonlar va rasm — bir narsa.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [x] **3-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: shablon bilan tanish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound, visionUi, practice, common } = QK;

  // 5.1: robot xotirasidagi uchta shablon
  async function showTemplates() {
    const el = common.box(false);
    const row = ui.h("div", { class: "vrow" });
    el.append(row);
    for (const name of vision.NAMES) {
      const holder = ui.h("div", { class: "vtile" });
      const mini = visionUi.grid(holder, { size: "sm" });
      mini.set(vision.TEMPLATES[name]);
      holder.append(ui.h("div", { class: "vtile-name", text: name }));
      row.append(holder);
    }
    await ui.say("elder", "Robot xotirasida uchta shablon bor: kvadrat, uchburchak va krest.");
    await ui.say("elder", "Yangi rasm kelsa, u har shablon bilan solishtiradi.");
  }

  // 5.2: moslikni sanash
  async function matchDemo() {
    const task = vision.makeMatchTask(null);
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(task.image);
    const list = visionUi.scores(el);
    ui.bubble("elder", "Yangi rasm keldi. «Solishtir»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Solishtir", () => { ui.clearControl(); done(); }, "big"));
    });
    const best = vision.bestMatch(task.image);
    for (let i = 1; i <= best.list.length; i++) {
      list.set(best.list.slice(0, i), null);
      sound.play("tap");
      await ui.sleep(700);
    }
    list.set(best.list, best.name);
    sound.play("correct");
    await ui.say("elder", `Eng koʻp moslik — ${best.name}: 36 tadan ${best.score} ta katak mos keldi.`);
    await ui.say("elder", "Robot uchun «tanish» degani — eng oʻxshash shablonni topish.");
  }

  // 5.4: mashq — robot nima deydi?
  function matchTask(task) {
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(task.image);
    const list = visionUi.scores(el);
    ui.bubble("elder", "Robot bu rasmni nima deb oʻylaydi?");
    return practice.tries({
      setup: (submit) => visionUi.shapeButtons(submit),
      check: (name) => name === task.answer,
      hint: () => {
        list.set(vision.bestMatch(task.image).list, null);
        ui.bubble("elder", "↻ Mosliklarni ochdim: qaysi shablonda eng koʻp katak mos kelgan?");
      },
      solution: () => {
        const best = vision.bestMatch(task.image);
        list.set(best.list, best.name);
        el.append(common.answerLine(`${best.name}: ${best.score} / ${vision.CELLS}`));
      },
    });
  }

  async function stage2() {
    await showTemplates();
    await matchDemo();
    await ui.say("elder", "Endi oʻzing ayt: robot nima deydi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => vision.makeMatchTask(prev),
      run: matchTask,
      praise: (task) => `Eng oʻxshashi — ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [x] **4-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: surilsa nima bo'ladi, belgi va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound, art, visionUi, practice, common } = QK;

  const SCENES = [
    { art: "camera", lines: ["Telefon kamerasi yuzni shunday topadi: kataklar, belgilar va taqqoslash."] },
    { art: "roadsign", lines: ["Mashina yoʻl belgisini oʻqiydi.", "Lekin qor yoki soya tushsa, piksellar oʻzgaradi va u adashishi mumkin."] },
    { art: "xray", lines: ["Shifokorga rasmdagi shubhali joyni koʻrsatib beradi.", "Oxirgi qarorni baribir shifokor qabul qiladi."] },
    { art: "robot", lines: ["Koʻrish — bu vazifa. Uni qoida bilan ham, misol bilan ham yechsa boʻladi.", "Bugungi dasturlar belgilarni oʻzi topadi — bu keyingi oʻyinda."] },
  ];

  // 6.1–6.2: rasm suriladi, shablon adashadi, belgi qutqaradi
  async function shiftDemo() {
    const name = vision.NAMES[1];
    const original = vision.TEMPLATES[name];
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(original);
    const feature = visionUi.featureLine(el); // belgi toʻr ostida — ekranda koʻrinib tursin
    const list = visionUi.scores(el);
    list.set(vision.bestMatch(original).list, name);
    feature.set(original);
    await ui.say("elder", `Mana toza rasm: robot uni ${name} deb tanidi — 36 tadan 36 ta mos.`);
    ui.bubble("elder", "Endi rasmni bir katak oʻngga suramiz. «Sur»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Sur ▶︎", () => { ui.clearControl(); done(); }, "big"));
    });
    const moved = vision.shift(original, 1, 0);
    board.set(moved);
    board.flash();
    const best = vision.bestMatch(moved);
    list.set(best.list, best.name);
    feature.set(moved);
    sound.play("retry");
    await ui.say("elder", `Koʻzga deyarli bir xil, lekin mosliklar tushib ketdi: eng yaxshisi ${best.score} ta.`);
    await ui.say("elder", "Robot uchun surilgan rasm — butunlay boshqa sonlar.");
    await ui.say("elder", `Endi belgiga qaraymiz: boʻyalgan kataklar ${vision.filled(original)} ta edi, endi ${vision.filled(moved)} ta — deyarli oʻzgarmadi.`);
    el.append(common.answerLine(`Belgi boʻyicha javob: ${vision.byFeature(moved)}`));
    sound.play("correct");
    await ui.say("elder", "Belgi — rasmdagi muhim xususiyat. U surilganda ham saqlanadi.");
  }

  // 6.4: mashq — qaysi usul to'g'ri javob beradi?
  function methodTask(task) {
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(task.image);
    el.append(common.line(`Haqiqiy shakl: ${task.truth} · rasm ${task.changed}`));
    ui.bubble("elder", "Qaysi usul toʻgʻri javob beradi?");
    const options = ["Shablon (piksel)", "Belgi (kataklar soni)"];
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        options.forEach((label, i) => row.append(ui.button(label, () => submit(i), i ? "secondary" : "")));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (index) => (index === 0 ? "shablon" : "belgi") === task.answer,
      hint: () => {
        const best = vision.bestMatch(task.image);
        el.append(common.line(`Shablon: ${best.name} · Belgi: ${vision.byFeature(task.image)}`));
        ui.bubble("elder", "↻ Ikkala usul natijasini ochdim. Qaysi biri haqiqiy shaklga toʻgʻri keldi?");
      },
      solution: () => {
        el.append(common.answerLine(task.answer === "belgi"
          ? "Belgi toʻgʻri: kataklar soni surilganda oʻzgarmaydi"
          : "Shablon toʻgʻri: piksellar deyarli oʻzgarmagan"));
      },
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
    await shiftDemo();
    await ui.say("elder", "Endi oʻzing ayt: qaysi usul ishlaydi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => vision.makeMethodTask(prev),
      run: methodTask,
      praise: (task) => (task.answer === "belgi" ? "Belgi surilishga chidamli." : "Piksellar saqlangan — shablon yetarli."),
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
    ui.bubble("elder", "Tabriklayman! Endi sen robot rasmni qanday koʻrishini bilasan!");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Rasm — kataklar va sonlar" }),
        ui.h("div", { text: "Tanish — eng oʻxshashini topish" }),
        ui.h("div", { text: "Belgi surilganda deyarli oʻzgarmaydi" }))));
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
// 10-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Robot nimani koʻradi?",
  storageKey: "robot-korishi:v1",
  stageTitles: ["Rasm — bu sonlar", "Shablon bilan tanish", "Surilsa nima boʻladi?"],
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
  assert.equal(captured.storageKey, "robot-korishi:v1");
  assert.equal(captured.title, "Robot nimani koʻradi?");
  assert.deepEqual(captured.stageTitles, ["Rasm — bu sonlar", "Shablon bilan tanish", "Surilsa nima boʻladi?"]);
});
```

---

### 4-vazifa: Bosh sahifa, offline va tekshiruv

- [x] **1-qadam: bosh sahifada yangi bo'lim "Koʻrish va tarmoqlar" va 10-o'yin (`koz` ikonkasi)**

- [x] **2-qadam: offline ro'yxati**

```bash
cd /Users/bicoder/Documents/Information && python3 bosh/sw-royxat.py --bump && node --test bosh/tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
```

- [x] **3-qadam: barcha testlar va brauzerda to'liq o'ynab chiqish** (`scratchpad/play10.js`)

```bash
cd /Users/bicoder/Documents/Information/oyinlar && for d in 1*/ 0*/ umumiy/; do (cd "$d" && printf "%-30s " "$d" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' '; echo); done
```

- [x] **4-qadam: commit, main'ga birlashtirish va GitHub'ga yuklash**
