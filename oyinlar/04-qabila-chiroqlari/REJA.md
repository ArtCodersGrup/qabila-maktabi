# 04 — Qabila chiroqlari: ish rejasi

> **Agentlar uchun:** `superpowers:executing-plans`. Qadamlar `- [ ]` bilan.

**Maqsad:** 4-o'yin "Qabila chiroqlari": chiroq naqshlari (2ⁿ), ikkilik sonlar (4-2-1), rangli chiroqlar va "nechta chiroq kerak", bit/bayt/piksel hikoyasi.

**Arxitektura:** 1–3-o'yindagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/`. Sof hisob `js/lamps.js` (Node testlari), ekran qismlari `js/lamps-ui.js`, rasmlar `js/game-art.js`, sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

## Umumiy cheklovlar

- Kutubxona/yig'ish yo'q; `index.html` ikki marta bosib ochiladi; internet kerak emas.
- Ekrandagi matn o'zbek lotin (`ʻ` U+02BB, `ʼ` U+02BC), bolaga "sen", pufakda ≤ 2 qisqa gap.
- Bosiladigan element ≥ 48×48 px; matn ≥ 18 px; 360 px; gorizontal scroll yo'q; xato uchun qizil yo'q, ✓/↻.
- Xato: 1-xato maslahat, 2-xato yechim + yangi misol (xato qilingani hisoblanmaydi). 3 ta to'g'ri javob — bosqich tugaydi.
- Rasm ichiga o'zgaruvchan matn yozilmaydi (izoh HTML'da).
- Commit: `-m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"`. Branch: `oyin/04-qabila-chiroqlari`.

## Nomlar va interfeyslar

- `QK.lamps` (Node'da `require`): `PLAIN` (2), `COLOR` (3), `MEANINGS` (8), `THINGS`, `count(states, n)`, `allPatterns(states, n)`, `fromNumber(v, n, states?)`, `toNumber(pattern, states?)`, `patternKey(p)`, `placeValues(n)`, `sumText(bits)`, `minLamps(items, states)`, `lampSteps(items, states)`, `makeCodeTask(prev, rng?)` → `{ type: "decode"|"encode", meaning }`, `makeBinaryTask(k, prev, rng?)` → `{ type: "toNumber"|"toLamps", lamps, value }`, `makeLampsQuestion(prev, rng?)` → `{ thing, text, items, states, answer }`.
- `QK.art.lamp(state)`, `QK.art.story(name)` (`hills | bits | byte | pixel | screen`).
- `QK.lampsUi`: `patternView(pattern, states?, big?)`, `lampRow(host, { count, states, values?, bits?, sum?, onChange? })` → `{ get, set, lock, shake }`, `wall(host, states)` → `{ add(pattern, label?) }`, `codeTable(host)` → `{ highlight(i) }`, `meaningButtons(onPick)`.
- `QK.common`: `PRAISE`, `findAll({ count, states, labelFor? })`, `tries({ setup, check, hint, solution })`, `numberTries({ answer, hint, solution })`, `exercises({ next, run, praise })`.

---

### 1-vazifa: Chiroq hisobi (`lamps.js`)

- [ ] **1-qadam: branch**

```bash
cd /Users/bicoder/Documents/Information && git status --short && git checkout -b oyin/04-qabila-chiroqlari
```

- [ ] **2-qadam: muvaffaqiyatsiz testlar — `tests/lamps.test.js`**

```js
// lamps.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/lamps.js");

test("count: holatlar soni ^ chiroqlar soni", () => {
  assert.equal(L.count(2, 3), 8);
  assert.equal(L.count(3, 2), 9);
  assert.equal(L.count(2, 8), 256);
  assert.equal(L.count(3, 4), 81);
});

test("allPatterns: tartib bilan, takrorsiz", () => {
  assert.deepEqual(L.allPatterns(2, 2).map(L.patternKey), ["00", "01", "10", "11"]);
  const p3 = L.allPatterns(2, 3).map(L.patternKey);
  assert.equal(new Set(p3).size, 8);
  assert.equal(p3[5], "101");
  assert.deepEqual(L.allPatterns(3, 2).map(L.patternKey), ["00", "01", "02", "10", "11", "12", "20", "21", "22"]);
});

test("fromNumber / toNumber bir-birining teskarisi", () => {
  assert.deepEqual(L.fromNumber(5, 3), [1, 0, 1]);
  assert.deepEqual(L.fromNumber(13, 4), [1, 1, 0, 1]);
  assert.equal(L.toNumber([1, 1, 0]), 6);
  for (const states of [2, 3]) {
    for (let n = 1; n <= 4; n++) {
      for (let v = 0; v < L.count(states, n); v++) assert.equal(L.toNumber(L.fromNumber(v, n, states), states), v);
    }
  }
});

test("placeValues va sumText", () => {
  assert.deepEqual(L.placeValues(3), [4, 2, 1]);
  assert.deepEqual(L.placeValues(4), [8, 4, 2, 1]);
  assert.equal(L.sumText([1, 0, 1]), "4 + 1");
  assert.equal(L.sumText([1, 1, 0, 1]), "8 + 4 + 1");
  assert.equal(L.sumText([0, 0, 0]), "0");
});

test("minLamps: eng kamida nechta chiroq", () => {
  assert.equal(L.minLamps(29, 2), 5);
  assert.equal(L.minLamps(29, 3), 4);
  assert.equal(L.minLamps(8, 2), 3);
  assert.equal(L.minLamps(9, 3), 2);
  assert.equal(L.minLamps(10, 3), 3);
  assert.equal(L.minLamps(50, 2), 6);
  assert.equal(L.minLamps(2, 2), 1);
});

test("lampSteps: 1 dan javobgacha", () => {
  assert.deepEqual(L.lampSteps(5, 2), [
    { lamps: 1, count: 2, enough: false },
    { lamps: 2, count: 4, enough: false },
    { lamps: 3, count: 8, enough: true },
  ]);
});

test("ma'nolar va narsalar", () => {
  assert.equal(L.MEANINGS.length, 8);
  assert.equal(L.MEANINGS[5], "Mehmon");
  assert.equal(L.MEANINGS[6], "Xavf");
  for (const t of L.THINGS) {
    for (const s of [L.PLAIN, L.COLOR]) {
      const a = L.minLamps(t.n, s);
      assert.ok(a >= 2 && a <= 6, `${t.text} ${s}: ${a}`);
    }
  }
});

test("makeCodeTask: ma'no ketma-ket takrorlanmaydi, ikki turi ham chiqadi", () => {
  let prev = null;
  const types = new Set();
  for (let k = 0; k < 1000; k++) {
    const t = L.makeCodeTask(prev);
    assert.ok(t.meaning >= 0 && t.meaning < 8);
    if (prev) assert.notEqual(t.meaning, prev.meaning);
    types.add(t.type);
    prev = t;
  }
  assert.deepEqual([...types].sort(), ["decode", "encode"]);
});

test("makeBinaryTask: 1–2-misol 3 chiroq (1–7), 3-misol 4 chiroq (1–15)", () => {
  let prev = null;
  const types = new Set();
  for (let k = 0; k < 1000; k++) {
    const idx = k % 3;
    const t = L.makeBinaryTask(idx, prev);
    assert.equal(t.lamps, idx === 2 ? 4 : 3);
    assert.ok(t.value >= 1 && t.value < L.count(2, t.lamps));
    if (prev) assert.notEqual(t.value, prev.value);
    types.add(t.type);
    prev = t;
  }
  assert.deepEqual([...types].sort(), ["toLamps", "toNumber"]);
});

test("makeLampsQuestion: javob to'g'ri, ketma-ket bir xil savol yo'q", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const q = L.makeLampsQuestion(prev);
    assert.ok(q.states === L.PLAIN || q.states === L.COLOR);
    assert.equal(q.items, L.THINGS[q.thing].n);
    assert.equal(q.answer, L.minLamps(q.items, q.states));
    if (prev) assert.ok(q.thing !== prev.thing || q.states !== prev.states);
    prev = q;
  }
  assert.deepEqual(L.makeLampsQuestion(null, () => 0), { thing: 0, text: "29 ta harf", items: 29, states: 2, answer: 5 });
});
```

Buyruq: `(cd oyinlar/04-qabila-chiroqlari && node --test tests/*.test.js)` → FAIL `Cannot find module '../js/lamps.js'`.

- [ ] **3-qadam: `js/lamps.js`**

```js
// Qabila chiroqlari — sof hisob: naqshlar, ikkilik sonlar, nechta chiroq kerak, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const PLAIN = 2; // oddiy chiroq: o'chiq / yoniq
  const COLOR = 3; // rangli chiroq: o'chiq / sariq / ko'k

  // 3 ta oddiy chiroq naqshlarining ma'nosi: naqsh ikkilik son (o'chiq = 0, yoniq = 1) → shu indeks
  const MEANINGS = ["Tinchlik", "Suv", "Olov", "Ov", "Yomgʻir", "Mehmon", "Xavf", "Bayram"];

  // "Nechta chiroq kerak?" savollari
  const THINGS = [
    { text: "29 ta harf", n: 29 },
    { text: "10 ta raqam", n: 10 },
    { text: "12 ta oy", n: 12 },
    { text: "7 ta hafta kuni", n: 7 },
    { text: "20 ta hayvon", n: 20 },
    { text: "50 ta soʻz", n: 50 },
  ];

  const count = (states, lamps) => Math.pow(states, lamps);

  // Son → chiroqlar holati (chapdagi chiroq — eng katta xona). fromNumber(5, 3) → [1, 0, 1]
  function fromNumber(value, lamps, states) {
    states = states || PLAIN;
    const out = [];
    for (let k = lamps - 1; k >= 0; k--) out.push(Math.floor(value / Math.pow(states, k)) % states);
    return out;
  }

  // Chiroqlar holati → son. toNumber([1, 0, 1]) → 5
  const toNumber = (pattern, states) => pattern.reduce((acc, s) => acc * (states || PLAIN) + s, 0);

  // Hamma naqshlar tartib bilan: 0, 1, 2, …
  function allPatterns(states, lamps) {
    const out = [];
    for (let v = 0; v < count(states, lamps); v++) out.push(fromNumber(v, lamps, states));
    return out;
  }

  const patternKey = (p) => p.join("");

  // Oddiy chiroqlar qiymatlari (chapdan): 3 ta → [4, 2, 1]
  function placeValues(lamps) {
    const out = [];
    for (let k = lamps - 1; k >= 0; k--) out.push(Math.pow(2, k));
    return out;
  }

  // Yoniq chiroqlar qiymatlari yig'indisi matni: [1, 0, 1] → "4 + 1"; hammasi o'chiq → "0"
  function sumText(bits) {
    const vals = placeValues(bits.length).filter((_, k) => bits[k] === 1);
    return vals.length ? vals.join(" + ") : "0";
  }

  // Eng kamida nechta chiroq: holatlar^n ≥ narsalar soni
  function minLamps(items, states) {
    let n = 1;
    while (count(states, n) < items) n++;
    return n;
  }

  // Yechim qadamlari: 1 dan javobgacha
  function lampSteps(items, states) {
    const steps = [];
    for (let n = 1; n <= minLamps(items, states); n++) {
      steps.push({ lamps: n, count: count(states, n), enough: count(states, n) >= items });
    }
    return steps;
  }

  const pickIndex = (len, rng) => Math.floor(rng() * len);

  // 1-bosqich mashqi: naqshni o'qish (decode) yoki yuborish (encode); ma'no oldingisidan boshqa
  function makeCodeTask(prev, rng) {
    rng = rng || Math.random;
    let meaning;
    do {
      meaning = pickIndex(MEANINGS.length, rng);
    } while (prev && meaning === prev.meaning);
    return { type: rng() < 0.5 ? "decode" : "encode", meaning };
  }

  // 2-bosqich mashqi: k — nechanchi misol (0, 1 → 3 chiroq; 2 → 4 chiroq). 0 chiqmaydi, oldingisidan boshqa
  function makeBinaryTask(k, prev, rng) {
    rng = rng || Math.random;
    const lamps = k >= 2 ? 4 : 3;
    let value;
    do {
      value = pickIndex(count(PLAIN, lamps), rng);
    } while (value === 0 || (prev && value === prev.value));
    return { type: rng() < 0.5 ? "toNumber" : "toLamps", lamps, value };
  }

  // 3-bosqich mashqi: narsalar va chiroq turi (oldingi savoldan boshqa)
  function makeLampsQuestion(prev, rng) {
    rng = rng || Math.random;
    let thing;
    let states;
    do {
      thing = pickIndex(THINGS.length, rng);
      states = rng() < 0.5 ? PLAIN : COLOR;
    } while (prev && thing === prev.thing && states === prev.states);
    const items = THINGS[thing].n;
    return { thing, text: THINGS[thing].text, items, states, answer: minLamps(items, states) };
  }

  const api = {
    PLAIN, COLOR, MEANINGS, THINGS,
    count, allPatterns, fromNumber, toNumber, patternKey, placeValues, sumText, minLamps, lampSteps,
    makeCodeTask, makeBinaryTask, makeLampsQuestion,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.lamps = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

Buyruq: `(cd oyinlar/04-qabila-chiroqlari && node --test tests/*.test.js)` → 10 ta test PASS.

- [ ] **4-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information && git add oyinlar/04-qabila-chiroqlari/js/lamps.js oyinlar/04-qabila-chiroqlari/tests/lamps.test.js
git commit -m "04-qabila-chiroqlari: chiroq hisobi va testlari" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 2-vazifa: Sahifa, uslublar, rasmlar va ekran qismlari

- [ ] **1-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Qabila chiroqlari</title>
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
  <script src="js/lamps.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="js/lamps-ui.js"></script>
  <script src="js/scenes/common.js"></script>
  <script src="js/scenes/stage1.js"></script>
  <script src="js/scenes/stage2.js"></script>
  <script src="js/scenes/stage3.js"></script>
  <script src="js/scenes/final.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **2-qadam: `css/style.css`**

```css
/* Qabila chiroqlari — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.lbox { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }

/* ---------- Bosiladigan chiroqlar ---------- */
.lamp-row { display: flex; justify-content: center; gap: 12px; }
.lamp-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.lamp-btn {
  width: 64px; height: 76px; padding: 4px; border: none; border-radius: 14px;
  background: #fff; box-shadow: 0 3px 0 var(--soya);
}
.lamp-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--soya); }
.lamp-row.locked .lamp-btn { cursor: default; }
.lamp-svg { display: block; width: 100%; height: 100%; }
.lamp-val { font-size: 22px; font-weight: 900; color: var(--asosiy); }
.lamp-bit { font-size: 22px; font-weight: 900; }
.lamp-sum { font-size: 22px; font-weight: 800; text-align: center; }

/* ---------- Naqsh, devor, kod jadvali, ma'no tugmalari ---------- */
.pattern { display: inline-flex; gap: 2px; }
.plamp { display: inline-block; width: 22px; height: 26px; }
.plamp svg { display: block; width: 100%; height: 100%; }
.pattern.big { gap: 10px; }
.pattern.big .plamp { width: 56px; height: 67px; }
.found-count { font-size: 20px; font-weight: 800; }
.pwall { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 520px; }
.pitem {
  display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px;
  border-radius: 10px; background: #fff; box-shadow: 0 2px 0 var(--soya); animation: pop 0.3s;
}
.plabel { font-size: 18px; font-weight: 800; }
.ctable4 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; width: 100%; max-width: 420px; }
.crow { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 10px; background: #fff; }
.crow.hl { outline: 3px solid var(--yana); outline-offset: -3px; }
.cmean { font-size: 18px; font-weight: 800; }
.mgrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; width: 100%; max-width: 480px; }
.mgrid .key { padding: 4px; font-size: 18px; }
.answer { font-size: 22px; font-weight: 900; color: var(--togri); }

/* ---------- Formula, hikoya, tabrik ---------- */
.formula-box { display: flex; flex-direction: column; align-items: center; gap: 10px; max-width: 100%; text-align: center; }
.formula-row { font-size: 22px; font-weight: 800; animation: pop 0.3s; }
.story { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.story-art { width: min(260px, 70vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.story-caption { font-size: 26px; font-weight: 900; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }
```

- [ ] **3-qadam: muvaffaqiyatsiz testlar — `tests/game-art.test.js`, `tests/main.test.js`**

`tests/game-art.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("chiroq: 3 holat har xil rangda, yoniqda nur bor", () => {
  assert.match(art.lamp(0), /#D9D2C3/);
  assert.ok(!art.lamp(0).includes("lamp-glow"));
  assert.match(art.lamp(1), /#F0C040/);
  assert.ok(art.lamp(1).includes("lamp-glow"));
  assert.match(art.lamp(2), /#2F6FDE/);
  assert.match(art.lamp(2), /data-state="2"/);
});

test("hikoya rasmlari SVG qaytaradi", () => {
  for (const n of ["hills", "bits", "byte", "pixel", "screen"]) {
    assert.match(art.story(n), /^<svg[\s\S]*<\/svg>$/, n);
  }
  assert.equal(art.story("yoq"), "");
});
```

`tests/main.test.js`:

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
  assert.equal(captured.storageKey, "qabila-chiroqlari:v1");
  assert.equal(captured.title, "Qabila chiroqlari");
  assert.deepEqual(captured.stageTitles, ["Chiroq naqshlari", "Ikkilik sonlar", "Rangli chiroqlar"]);
});
```

- [ ] **4-qadam: `js/game-art.js`**

```js
// 4-o'yinga xos SVG rasmlar: chiroq (holatlari) va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  // Holat ranglari: 0 — o'chiq, 1 — yoniq (sariq), 2 — ko'k
  const LAMP_COLORS = ["#D9D2C3", "#F0C040", "#2F6FDE"];

  // Chiroq: o'chiqda kulrang, yoniqda rangli va atrofida nur
  function lamp(state) {
    const fill = LAMP_COLORS[state];
    const glow = state ? `<circle class="lamp-glow" cx="30" cy="27" r="28" fill="${fill}" opacity="0.3"/>` : "";
    const wire = state ? "#FFFFFF" : "#A89F90";
    return `<svg class="lamp-svg" viewBox="0 0 60 72" data-state="${state}" aria-hidden="true">${glow}
  <path d="M30 5 C16 5 8 15 8 27 C8 36 14 41 18 47 L42 47 C46 41 52 36 52 27 C52 15 44 5 30 5 Z" fill="${fill}" stroke="${INK}" stroke-width="3"/>
  <path d="M23 36 L27 28 L30 34 L33 28 L37 36" stroke="${wire}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="19" y="49" width="22" height="8" rx="2" fill="#8A8A8A"/>
  <rect x="21" y="58" width="18" height="7" rx="2" fill="#6A6A6A"/>
</svg>`;
  }

  // Doira-chiroqlar qatori (hikoya rasmlari uchun)
  const dots = (states, x0, step, r) => states
    .map((s, k) => `<circle cx="${x0 + k * step}" cy="40" r="${r}" fill="${LAMP_COLORS[s]}" stroke="${INK}" stroke-width="2"/>`)
    .join("");

  const STORY = {
    // Tunda ikki tepalik va chiroqli ustunlar
    hills: `<svg viewBox="0 0 200 110" aria-hidden="true">
  <rect width="200" height="110" rx="8" fill="${INK}"/>
  <circle cx="170" cy="22" r="10" fill="#F4E3C3"/>
  <path d="M0 110 Q40 50 90 110 Z" fill="#3E7CB1"/>
  <path d="M100 110 Q150 40 200 110 Z" fill="#1A9E77"/>
  <rect x="42" y="62" width="4" height="22" fill="#8A5A2B"/>
  <circle cx="44" cy="58" r="6" fill="#F0C040"/>
  <rect x="150" y="54" width="4" height="22" fill="#8A5A2B"/>
  <circle cx="152" cy="50" r="6" fill="#F0C040"/>
  <path d="M56 56 Q98 30 140 50" stroke="#F0C040" stroke-width="2" stroke-dasharray="4 6" fill="none"/>
</svg>`,
    // Bitlar: yoniq/o'chiq chiroqlar
    bits: `<svg viewBox="0 0 200 80" aria-hidden="true">${dots([1, 0, 1, 1, 0, 1], 20, 32, 12)}</svg>`,
    // Bayt: 8 ta bit bir ramkada
    byte: `<svg viewBox="0 0 200 80" aria-hidden="true">
  <rect x="4" y="22" width="192" height="36" rx="10" fill="none" stroke="#8E5BD0" stroke-width="3"/>
  ${dots([0, 1, 0, 0, 0, 0, 0, 1], 16, 24, 9)}
</svg>`,
    // Piksel: qizil, yashil, ko'k kichik chiroqlar
    pixel: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="40" y="10" width="120" height="100" rx="8" fill="${INK}"/>
  <rect x="52" y="20" width="28" height="80" rx="4" fill="#E0524A"/>
  <rect x="86" y="20" width="28" height="80" rx="4" fill="#1A9E77"/>
  <rect x="120" y="20" width="28" height="80" rx="4" fill="#2F6FDE"/>
</svg>`,
    // Rangli ekran
    screen: `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="20" y="8" width="160" height="96" rx="8" fill="${INK}"/>
  <rect x="30" y="18" width="23" height="76" fill="#E0524A"/>
  <rect x="53" y="18" width="23" height="76" fill="#F08A24"/>
  <rect x="76" y="18" width="23" height="76" fill="#F0C040"/>
  <rect x="99" y="18" width="24" height="76" fill="#1A9E77"/>
  <rect x="123" y="18" width="23" height="76" fill="#2F6FDE"/>
  <rect x="146" y="18" width="24" height="76" fill="#8E5BD0"/>
  <rect x="90" y="104" width="20" height="14" fill="#6A6A6A"/>
  <rect x="70" y="118" width="60" height="8" rx="3" fill="#6A6A6A"/>
</svg>`,
  };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { lamp, story });
})(window);
```

- [ ] **5-qadam: `js/lamps-ui.js`**

```js
// Chiroq ekran qismlari: chiroqlar qatori, naqsh, devor, kod jadvali, ma'no tugmalari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, sound, art } = QK;

  const STATE_NAMES = { 2: ["oʻchiq", "yoniq"], 3: ["oʻchiq", "sariq", "koʻk"] };
  const describe = (pattern, states) => pattern.map((s) => STATE_NAMES[states][s]).join(", ");

  // Kichik naqsh (faqat ko'rish uchun); big — katta chiroqlar
  function patternView(pattern, states, big) {
    const row = ui.h("span", {
      class: "pattern" + (big ? " big" : ""),
      role: "img",
      "aria-label": describe(pattern, states || lamps.PLAIN),
    });
    pattern.forEach((s) => row.append(ui.h("span", { class: "plamp", html: art.lamp(s) })));
    return row;
  }

  // Bosiladigan chiroqlar qatori: har bosishda keyingi holat.
  // values — chiroq ustidagi qiymatlar (4 2 1), bits — ostida 1/0, sum — pastda jonli yig'indi.
  function lampRow(host, { count, states, values, bits, sum, onChange }) {
    let cur = Array(count).fill(0);
    let locked = false;
    const wrap = ui.h("div", { class: "lamp-row" });
    const buttons = [];
    const bitEls = [];
    for (let k = 0; k < count; k++) {
      const btn = ui.h("button", {
        class: "lamp-btn",
        type: "button",
        onClick: () => {
          if (locked) return;
          cur[k] = (cur[k] + 1) % states;
          sound.play("tap");
          render();
          if (onChange) onChange(cur.slice());
        },
      });
      buttons.push(btn);
      const col = ui.h("div", { class: "lamp-col" });
      if (values) col.append(ui.h("div", { class: "lamp-val", text: String(values[k]) }));
      col.append(btn);
      if (bits) {
        const b = ui.h("div", { class: "lamp-bit" });
        bitEls.push(b);
        col.append(b);
      }
      wrap.append(col);
    }
    host.append(wrap);
    const sumEl = sum ? ui.h("div", { class: "lamp-sum", "aria-live": "polite" }) : null;
    if (sumEl) host.append(sumEl);

    function render() {
      buttons.forEach((b, k) => {
        b.innerHTML = art.lamp(cur[k]);
        b.setAttribute("aria-label", `${k + 1}-chiroq: ${STATE_NAMES[states][cur[k]]}`);
      });
      bitEls.forEach((b, k) => { b.textContent = String(cur[k]); });
      if (sumEl) sumEl.textContent = `Hozir: ${lamps.sumText(cur)} = ${lamps.toNumber(cur)}`;
    }
    render();

    return {
      get: () => cur.slice(),
      set(next) {
        cur = next.slice();
        render();
      },
      lock() {
        locked = true;
        wrap.classList.add("locked");
      },
      shake() {
        wrap.classList.remove("shake");
        void wrap.offsetWidth; // animatsiyani qaytadan boshlash
        wrap.classList.add("shake");
      },
    };
  }

  // Topilgan naqshlar devori
  function wall(host, states) {
    const el = ui.h("div", { class: "pwall" });
    host.append(el);
    return {
      add(pattern, label) {
        el.append(ui.h("div", { class: "pitem" },
          patternView(pattern, states),
          label ? ui.h("div", { class: "plabel", text: label }) : null));
      },
    };
  }

  // Kod jadvali: 8 ta naqsh va ma'nosi (2 ustun); highlight(i) — i-qator yonadi
  function codeTable(host) {
    const el = ui.h("div", { class: "ctable4" });
    const rows = lamps.allPatterns(lamps.PLAIN, 3).map((p, i) => {
      const row = ui.h("div", { class: "crow" }, patternView(p), ui.h("span", { class: "cmean", text: lamps.MEANINGS[i] }));
      el.append(row);
      return row;
    });
    host.append(el);
    return {
      highlight(i) { rows.forEach((r, k) => r.classList.toggle("hl", k === i)); },
    };
  }

  // Ma'no tugmalari (boshqaruv zonasida, 4 × 2): onPick(indeks)
  function meaningButtons(onPick) {
    const grid = ui.h("div", { class: "mgrid" });
    lamps.MEANINGS.forEach((m, i) => {
      grid.append(ui.h("button", {
        class: "key",
        type: "button",
        text: m,
        onClick: () => { sound.play("tap"); onPick(i); },
      }));
    });
    ui.clearControl();
    ui.control().append(grid);
  }

  QK.lampsUi = { patternView, lampRow, wall, codeTable, meaningButtons };
})(window);
```

- [ ] **6-qadam: `js/main.js`**

```js
// 4-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Qabila chiroqlari",
  storageKey: "qabila-chiroqlari:v1",
  stageTitles: ["Chiroq naqshlari", "Ikkilik sonlar", "Rangli chiroqlar"],
});
```

- [ ] **7-qadam: tekshirish va commit**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/04-qabila-chiroqlari
for f in js/*.js; do node --check "$f" || echo "FAIL $f"; done
node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
cd /Users/bicoder/Documents/Information && git add oyinlar/04-qabila-chiroqlari/index.html oyinlar/04-qabila-chiroqlari/css oyinlar/04-qabila-chiroqlari/js oyinlar/04-qabila-chiroqlari/tests
git commit -m "04-qabila-chiroqlari: sahifa, uslublar, chiroq rasmi va ekran qismlari" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
Kutilgan natija: `pass 13`, `fail 0`.

---

### 3-vazifa: Umumiy sahna qismlari va 1-bosqich

- [ ] **1-qadam: `js/scenes/common.js`**

```js
// Naqshlarni topish, urinishlar va mashq sikli (QOIDALAR 4.4, 4.5).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, sound, lampsUi } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  // Barcha naqshlarni topish: bola chiroqlarni yoqib "Saqlash"ni bosadi; takror — "bor edi".
  // labelFor(pattern) — devorda naqsh ostidagi yozuv (ixtiyoriy).
  function findAll({ count, states, labelFor }) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const total = lamps.count(states, count);
    const found = new Set();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    const row = lampsUi.lampRow(box, { count, states });
    const counter = ui.h("div", { class: "found-count" });
    box.append(counter);
    const wallEl = lampsUi.wall(box, states);
    const renderCount = () => { counter.textContent = `Topilgan naqshlar: ${found.size}`; };
    renderCount();

    return ui.settle((done) => {
      const save = () => {
        const p = row.get();
        const key = lamps.patternKey(p);
        if (found.has(key)) {
          sound.play("retry");
          row.shake();
          ui.toast("Bu naqsh bor edi! Boshqasini yasa.");
          return;
        }
        found.add(key);
        sound.play("correct");
        wallEl.add(p, labelFor ? labelFor(p) : null);
        renderCount();
        if (found.size === total) {
          ui.clearControl();
          done();
        }
      };
      const help = () => {
        const missing = lamps.allPatterns(states, count).find((p) => !found.has(lamps.patternKey(p)));
        if (!missing) return;
        row.set(missing);
        ui.toast("Mana bittasi — «Saqlash»ni bos!");
      };
      ui.control().append(ui.h("div", { class: "choice-row" },
        ui.button("Saqlash", save),
        ui.button("Yordam", help, "secondary")));
    });
  }

  // Bitta vazifaga ikki urinish. setup(submit) — ekranni chizadi; check(qiymat) → bool.
  // 1-xato — hint(), 2-xato — solution(). Natija: true — bola o'zi topdi.
  function tries({ setup, check, hint, solution }) {
    let wrong = 0;
    return ui.settle((finish) => {
      setup((value) => {
        if (check(value)) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          ui.clearControl();
          finish(true);
          return;
        }
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        wrong++;
        if (wrong === 1) {
          hint();
        } else {
          ui.clearControl();
          solution();
          finish(false);
        }
      });
    });
  }

  // Raqam klaviaturasi bilan javob: 1-xato — hint(), 2-xato — solution()
  async function numberTries({ answer, hint, solution }) {
    for (let wrong = 0; ; ) {
      const value = await ui.askNumber(2);
      if (value === answer) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        return true;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      wrong++;
      if (wrong === 1) {
        hint();
      } else {
        solution();
        return false;
      }
    }
  }

  // Mashq: 3 ta to'g'ri javob; next(prev, correct) → vazifa; run(vazifa) → Promise<bool>.
  // Xato qilingan vazifa hisoblanmaydi, yangisi beriladi.
  async function exercises({ next, run, praise }) {
    let correct = 0;
    let prev = null;
    ui.setProgress(3, 0);
    while (correct < 3) {
      const task = next(prev, correct);
      prev = task;
      QK.current = task; // tekshirish uchun
      const ok = await run(task);
      if (ok) {
        correct++;
        ui.setProgress(3, correct);
        await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} ${praise(task)}`);
      } else {
        await ui.say("elder", "Toʻgʻri javob ekranda. Endi yangi misol.");
      }
    }
    ui.hideProgress();
  }

  QK.common = { PRAISE, findAll, tries, numberTries, exercises };
})(window);
```

- [ ] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: chiroq naqshlari (DIZAYN 4, 5-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, art, lampsUi, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("hills") }));
    await ui.say("elder", "Qabilaga elektr chiroqlari keldi!");
    await ui.say("apprentice", "Qoʻshni qabila togʻ ortida. Tunda ularga qanday xabar yuboramiz?");
    await ui.say("elder", "Chiroqlar bilan! Kel, oʻrganamiz.");
  }

  // 5.1: bitta chiroq — faqat 2 ta xabar
  async function oneLamp() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    const meaning = ui.h("div", { class: "lamp-sum" });
    const show = (p) => { meaning.textContent = p[0] ? "Yoniq — «Keling»" : "Oʻchiq — «Kelmang»"; };
    lampsUi.lampRow(box, { count: 1, states: lamps.PLAIN, onChange: show });
    box.append(meaning);
    show([0]);
    await ui.say("elder", "Chiroqni bosib koʻr. Yoniq — «Keling», oʻchiq — «Kelmang».");
    await ui.say("elder", "Faqat 2 ta xabar — bu kam!");
  }

  // 5.4: ta'rif
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "formula-box" });
    ui.work().append(box);
    ["1 chiroq: 2", "2 chiroq: 2 × 2 = 4", "3 chiroq: 2 × 2 × 2 = 8"].forEach((t) => {
      box.append(ui.h("div", { class: "formula-row", text: t }));
    });
    await ui.say("elder", "Har bir chiroq 2 xil boʻladi. Chiroqlar soni qancha boʻlsa, 2 ni shuncha marta koʻpaytiramiz.");
    await ui.say("elder", "1-oʻyindagi harflarni esla — xuddi shunday!");
  }

  // 5.5: naqshni o'qish yoki yuborish; kod jadvali ko'rinib turadi
  function codeTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const pattern = lamps.fromNumber(task.meaning, 3);
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    let row = null;
    if (task.type === "decode") {
      ui.bubble("elder", "Qoʻshni qabila chiroq yoqdi. Nima deyapti?");
      box.append(lampsUi.patternView(pattern, lamps.PLAIN, true));
    } else {
      ui.bubble("elder", `Qoʻshni qabilaga «${lamps.MEANINGS[task.meaning]}» deb yubor.`);
      row = lampsUi.lampRow(box, { count: 3, states: lamps.PLAIN });
    }
    const table = lampsUi.codeTable(box);
    return common.tries({
      setup: (submit) => {
        if (task.type === "decode") lampsUi.meaningButtons((i) => submit(i));
        else ui.control().append(ui.button("Yuborish", () => submit(row.get())));
      },
      check: (v) => (task.type === "decode" ? v === task.meaning : lamps.toNumber(v) === task.meaning),
      hint: () => {
        table.highlight(task.meaning);
        if (row) row.shake();
        ui.bubble("elder", "↻ Jadvalga qara — kerakli qator yonib turibdi.");
      },
      solution: () => {
        table.highlight(task.meaning);
        if (row) {
          row.set(pattern);
          row.lock();
        }
        box.append(ui.h("div", { class: "answer", text: `Javob: ${lamps.MEANINGS[task.meaning]}` }));
      },
    });
  }

  async function stage1() {
    await oneLamp();
    ui.bubble("elder", "Endi 2 ta chiroq. Naqsh yasab «Saqlash»ni bos — hammasini top!");
    await common.findAll({ count: 2, states: lamps.PLAIN });
    await ui.say("elder", "2 ta chiroq — 4 ta naqsh.");
    ui.bubble("elder", "Endi 3 ta chiroq. Har bir naqshga maʼno beramiz!");
    await common.findAll({ count: 3, states: lamps.PLAIN, labelFor: (p) => lamps.MEANINGS[lamps.toNumber(p)] });
    await ui.say("elder", "3 ta chiroq — 8 ta naqsh. Har biriga maʼno berdik!");
    await explain();
    await ui.say("elder", "Endi qoʻshni qabila bilan gaplashamiz. 3 ta toʻgʻri javob kerak!");
    await common.exercises({
      next: (prev) => lamps.makeCodeTask(prev),
      run: codeTask,
      praise: (t) => `Bu — «${lamps.MEANINGS[t.meaning]}».`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [ ] **3-qadam: tekshirish va commit**

```bash
cd /Users/bicoder/Documents/Information
node --check oyinlar/04-qabila-chiroqlari/js/scenes/common.js && node --check oyinlar/04-qabila-chiroqlari/js/scenes/stage1.js && echo OK
git add oyinlar/04-qabila-chiroqlari/js/scenes
git commit -m "04-qabila-chiroqlari: sahna qismlari, kirish va 1-bosqich" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 4-vazifa: 2-, 3-bosqich, tabrik va yakuniy tekshiruv

- [ ] **1-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: ikkilik sonlar (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, sound, lampsUi, common } = QK;

  // 6.1: 4-2-1 qiymatlari va "5 ni yasa"
  async function makeFive() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    await ui.say("elder", "Chiroqlar bilan son ham yuborsa boʻladi!");
    ui.bubble("elder", "Har bir chiroqning oʻz qiymati bor. 5 ni yasa: yoniq chiroqlar qiymati 5 boʻlsin.");
    await ui.settle((done) => {
      lampsUi.lampRow(box, {
        count: 3,
        states: lamps.PLAIN,
        values: lamps.placeValues(3),
        bits: true,
        sum: true,
        onChange: (p) => { if (lamps.toNumber(p) === 5) done(); },
      });
    });
    sound.play("correct");
    await ui.say("elder", "Toʻgʻri: 4 + 1 = 5!");
  }

  // 6.3: ta'rif
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    const row = lampsUi.lampRow(box, { count: 3, states: lamps.PLAIN, values: lamps.placeValues(3), bits: true });
    row.set([1, 0, 1]);
    row.lock();
    await ui.say("elder", "Yoniq — 1, oʻchiq — 0. Kompyuter 5 ni 101 deb yozadi — bu ikkilik son.");
    await ui.say("elder", "Esingdami, «Mehmon» naqshi? U ham 101, yaʼni 5!");
  }

  // 6.4: naqsh → son yoki son → naqsh
  function binaryTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const pattern = lamps.fromNumber(task.value, task.lamps);
    const values = lamps.placeValues(task.lamps);
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    if (task.type === "toNumber") {
      ui.bubble("elder", "Qoʻshni qabila son yubordi. Qaysi son?");
      const shown = lampsUi.lampRow(box, { count: task.lamps, states: lamps.PLAIN, values, bits: true });
      shown.set(pattern);
      shown.lock();
      const note = ui.h("div", { class: "lamp-sum" });
      box.append(note);
      return common.numberTries({
        answer: task.value,
        hint: () => {
          note.textContent = `${lamps.sumText(pattern)} = ?`;
          ui.bubble("elder", "↻ Yoniq chiroqlar qiymatini qoʻsh.");
        },
        solution: () => { note.textContent = `${lamps.sumText(pattern)} = ${task.value}`; },
      });
    }
    ui.bubble("elder", `${task.value} ni yubor: yoniq chiroqlar qiymati ${task.value} boʻlsin.`);
    const row = lampsUi.lampRow(box, { count: task.lamps, states: lamps.PLAIN, values, bits: true, sum: true });
    return common.tries({
      setup: (submit) => ui.control().append(ui.button("Yuborish", () => submit(row.get()))),
      check: (p) => lamps.toNumber(p) === task.value,
      hint: () => {
        row.shake();
        ui.bubble("elder", "↻ Eng katta qiymatli chiroqdan boshla.");
      },
      solution: () => {
        row.set(pattern);
        row.lock();
      },
    });
  }

  async function stage2() {
    await makeFive();
    await explain();
    await ui.say("elder", "Endi oʻzing! Oxirgi misolda chiroqlar 4 ta boʻladi: 8, 4, 2, 1.");
    await common.exercises({
      next: (prev, correct) => lamps.makeBinaryTask(correct, prev),
      run: binaryTask,
      praise: (t) => `${lamps.patternKey(lamps.fromNumber(t.value, t.lamps))} — bu ${t.value}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [ ] **2-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: rangli chiroqlar, nechta chiroq kerak, hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, art, common } = QK;

  // Hikoya: art — rasm (QK.art.story), caption — rasm ostidagi yozuv, lines — Oqsoqol gaplari
  const SCENES = [
    { art: "bits", caption: "1 0 1 1 0 1", lines: ["Kompyuterda millionlab juda kichik «chiroqlar» bor — ular bit deyiladi.", "Yoqilgan — 1, oʻchgan — 0."] },
    { art: "byte", caption: "8 bit = 1 bayt", lines: ["8 ta bit — 1 bayt.", "U 256 xil boʻladi: 2 ni 8 marta koʻpaytiramiz."] },
    { art: "pixel", lines: ["Ekrandagi har bir nuqta — 3 ta kichik chiroq: qizil, yashil va koʻk."] },
    { art: "screen", lines: ["Har biri 256 xil yorugʻlikda yonadi.", "Shuning uchun ekran millionlab rangni koʻrsata oladi!"] },
  ];

  // 7.2: ta'rif — oddiy va rangli chiroqlar naqshlari
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const row = (states) => [1, 2, 3, 4].map((n) => lamps.count(states, n)).join(", ");
    ui.work().append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "1, 2, 3, 4 ta chiroq:" }),
      ui.h("div", { class: "formula-row", text: `Oddiy: ${row(lamps.PLAIN)}` }),
      ui.h("div", { class: "formula-row", text: `Rangli: ${row(lamps.COLOR)}` })));
    await ui.say("elder", "Holatlar sonini chiroqlar sonicha koʻpaytiramiz.");
    await ui.say("elder", "Holat koʻp boʻlsa — chiroq kam kerak.");
  }

  // 1-xato maslahati: 1, 2, 3… ta chiroq naqshlari (belgisiz)
  function hintRows(q) {
    const max = q.states === lamps.PLAIN ? 6 : 4;
    const box = ui.h("div", { class: "formula-box" });
    for (let n = 1; n <= max; n++) box.append(ui.h("div", { class: "formula-row", text: `${n} ta chiroq: ${lamps.count(q.states, n)} ta naqsh` }));
    return box;
  }

  // 2-xato yechimi: qadamlar ✓ / — bilan
  function solutionRows(q) {
    const box = ui.h("div", { class: "formula-box" });
    for (const s of lamps.lampSteps(q.items, q.states)) {
      box.append(ui.h("div", { class: "formula-row", text: `${s.lamps} ta chiroq: ${s.count} ta naqsh ${s.enough ? "✓ yetadi" : "— yetmaydi"}` }));
    }
    return box;
  }

  // 7.3: nechta chiroq kerak?
  function lampsTask(q) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const kind = q.states === lamps.PLAIN ? "oddiy" : "rangli";
    ui.bubble("elder", `${q.text} uchun eng kamida nechta ${kind} chiroq kerak?`);
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    return common.numberTries({
      answer: q.answer,
      hint: () => {
        box.innerHTML = "";
        box.append(hintRows(q));
        ui.bubble("elder", `↻ Naqshlar soni ${q.items} dan kam boʻlmagan birinchi qatorni top.`);
      },
      solution: () => {
        box.innerHTML = "";
        box.append(solutionRows(q));
      },
    });
  }

  async function showScene(sc) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: art.story(sc.art) }),
      sc.caption ? ui.h("div", { class: "story-caption", text: sc.caption }) : null));
    for (const line of sc.lines) await ui.say("elder", line);
  }

  async function stage3() {
    ui.bubble("elder", "Qabilaga rangli chiroqlar keldi: oʻchiq, sariq, koʻk — 3 xil! 2 ta chiroq bilan hamma naqshni top.");
    await common.findAll({ count: 2, states: lamps.COLOR });
    await ui.say("elder", "2 ta rangli chiroq — 9 ta naqsh: 3 × 3.");
    await explain();
    await ui.say("elder", "Endi hisoblaymiz: nechta chiroq kerak? 3 ta toʻgʻri javob!");
    await common.exercises({
      next: (prev) => lamps.makeLampsQuestion(prev),
      run: lampsTask,
      praise: (q) => `${q.answer} ta chiroq yetadi.`,
    });
    for (const sc of SCENES) await showScene(sc);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
```

- [ ] **3-qadam: `js/scenes/final.js`**

```js
// Bosqich tugashi va tabrik ekrani. 4-o'yinda finale yo'q.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

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
    ui.bubble("elder", "Tabriklayman! Endi sen chiroqlar tilini bilasan!");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { html: "n ta chiroq — 2<sup>n</sup> ta naqsh" }),
      ui.h("div", { text: "Yoniq — 1, oʻchiq — 0: ikkilik son" }),
      ui.h("div", { text: "Holat koʻp boʻlsa — chiroq kam kerak" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
```

- [ ] **4-qadam: yakuniy tekshiruv (brauzersiz)**

```bash
cd /Users/bicoder/Documents/Information/oyinlar
for g in 01-qabila-kodlari 02-qabila-morzesi 03-sezar-maktubi 04-qabila-chiroqlari; do (cd $g && python3 - <<'PY'
import re, pathlib
html = pathlib.Path("index.html").read_text()
refs = [r for r in re.findall(r'(?:src|href)="([^"]+)"', html) if not r.startswith("data:")]
missing = [r for r in refs if not pathlib.Path(r).exists()]
print(pathlib.Path.cwd().name, len(refs), "ta yo'l; yo'q:", missing)
assert not missing
PY
); done
for f in umumiy/js/*.js */js/*.js */js/scenes/*.js; do node --check "$f" || echo "FAIL $f"; done
for g in umumiy 01-qabila-kodlari 02-qabila-morzesi 03-sezar-maktubi 04-qabila-chiroqlari; do (cd $g && echo "$g: $(node --test tests/*.test.js 2>&1 | grep -E '^ℹ (pass|fail)' | tr '\n' ' ')"); done
python3 - <<'PY'
import re, pathlib
read = lambda p: pathlib.Path(p).read_text()
def block(text, pattern):
    return set(re.findall(r"\w+", re.search(pattern, text, re.S).group(1)))
ex = {
    "ui": block(read("umumiy/js/ui.js"), r"QK\.ui = \{(.*?)\};"),
    "sound": block(read("umumiy/js/sound.js"), r"root\.QK\.sound = \{(.*?)\};"),
    "lamps": block(read("04-qabila-chiroqlari/js/lamps.js"), r"const api = \{(.*?)\};"),
    "lampsUi": block(read("04-qabila-chiroqlari/js/lamps-ui.js"), r"QK\.lampsUi = \{(.*?)\};"),
    "common": block(read("04-qabila-chiroqlari/js/scenes/common.js"), r"QK\.common = \{(.*?)\};"),
    "art": block(read("umumiy/js/art.js"), r"root\.QK\.art = \{(.*?)\};") | block(read("04-qabila-chiroqlari/js/game-art.js"), r"Object\.assign\(root\.QK\.art, \{(.*?)\}\)"),
}
scenes = set()
files = list(pathlib.Path("04-qabila-chiroqlari/js").rglob("*.js"))
for p in files:
    for m in re.finditer(r"Object\.assign\(QK\.scenes, \{(.*?)\}\)", read(p)):
        scenes |= set(re.findall(r"\w+", m.group(1)))
bad = []
for p in files:
    text = read(p)
    for mod, names in ex.items():
        for name in set(re.findall(rf"\b{mod}\.(\w+)", text)) - names:
            bad.append(f"{p}: {mod}.{name}")
need = {"intro", "stage1", "stage2", "stage3", "stageDone", "congrats"}
print("sahnalar:", sorted(scenes), "| yetishmaydi:", need - scenes)
print("\n".join(bad) or "Barcha chaqiruvlar eksportlarga mos")
assert not bad and not (need - scenes)
PY
```
Kutilgan natija: to'rtala o'yinda `yo'q: []`; `FAIL` yo'q; hamma testlar `fail 0` (04: 13); `Barcha chaqiruvlar eksportlarga mos`.

- [ ] **5-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information
git add oyinlar/04-qabila-chiroqlari/js/scenes
git commit -m "04-qabila-chiroqlari: ikkilik sonlar, rangli chiroqlar, hikoya va tabrik" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
