# 09 — Qoida yoki misol?: ish rejasi

**Maqsad:** 9-o'yin: qoida yozilgan dastur va misoldan o'rganadigan dastur farqi (AI ↔ ML).

**Arxitektura:** oldingi o'yinlardagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/`. Sof hisob `js/rules.js` (Node testlari), ekran qismlari `js/rules-ui.js`, rasmlar `js/game-art.js`, sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi; bloklar tayyor fayllardan olingan (TDD: avval `tests/rules.test.js`, keyin `js/rules.js`).

## Nomlar va interfeyslar

- `QK.rules`: `FEATURES` (`size`, `dots`), `OPS` (`>`, `<`), `FEATURE_NAMES`, `CASES` (hayotdan misollar), `test(rule, item)`, `wrongOnes`, `errorsOf`, `allRules()`, `bestRule(items)`, `dist`, `nearest`, `nnErrors`, `makeRuleTask(prev, rng?)`, `makeFuzzyTask(rng?)`, `makeSetKindTask(k, prev, rng?)`, `makeKindTask(prev, rng?)`.
- `QK.rulesUi`: `thingCard(item, opts)`, `board(host, items, opts)` → `{run(rule), runExamples(examples), clear, truth}`, `ruleBuilder(host, onChange)` → `{get, set}`, `errorBadge(host)`, `choiceButtons(options, onPick)`.
- `QK.common`: `box(compact)`, `answerLine`, `line`, `ruleScreen(items)` → `{el, view, badge, builder}` (yasagich boshqaruv zonasida).
- `QK.art.thing(size, dots)`, `QK.art.story(name)`: `calculator | cats | circles`.

---

### 1-vazifa: Hisob moduli (`js/rules.js`) — TDD

- [x] **1-qadam: muvaffaqiyatsiz testlar — `tests/rules.test.js`**

```js
// rules.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../js/rules.js");

const item = (size, dots, yes) => ({ size, dots, yes });

test("qoida: belgi, amal va son bo'yicha tekshiriladi", () => {
  assert.equal(R.test({ feature: "size", op: ">", value: 5 }, item(7, 2)), true);
  assert.equal(R.test({ feature: "size", op: ">", value: 5 }, item(5, 2)), false);
  assert.equal(R.test({ feature: "dots", op: "<", value: 4 }, item(9, 2)), true);
  assert.equal(R.test({ feature: "dots", op: "<", value: 4 }, item(1, 4)), false);
});

test("errorsOf: qoida nechta narsada xato qiladi", () => {
  const items = [item(7, 2, true), item(8, 1, true), item(2, 5, false), item(6, 9, true)];
  assert.equal(R.errorsOf(items, { feature: "size", op: ">", value: 5 }), 0);
  assert.equal(R.errorsOf(items, { feature: "size", op: ">", value: 7 }), 2);
  assert.deepEqual(R.wrongOnes(items, { feature: "size", op: ">", value: 7 }).map((x) => x.size).sort(), [6, 7]);
});

test("allRules va bestRule: hamma qoida sinaladi", () => {
  assert.equal(R.allRules().length, R.FEATURES.length * R.OPS.length * 9);
  const clean = [item(7, 2, true), item(8, 1, true), item(9, 4, true), item(2, 5, false), item(3, 9, false), item(1, 6, false)];
  const best = R.bestRule(clean);
  assert.equal(best.errors, 0);
  assert.equal(R.errorsOf(clean, best.rule), 0);
});

test("nearest: eng yaqin misol bo'yicha bashorat", () => {
  const train = [item(2, 2, false), item(8, 8, true)];
  assert.equal(R.nearest(train, { size: 3, dots: 2 }).yes, false);
  assert.equal(R.nearest(train, { size: 7, dots: 9 }).yes, true);
  assert.equal(R.nnErrors(train, [item(3, 3, false), item(9, 9, true)]), 0);
  assert.equal(R.nnErrors(train, [item(3, 3, true)]), 1);
});

test("makeRuleTask: qoida bilan 0 xato bo'ladi, ikki xil javob bor", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = R.makeRuleTask(prev);
    assert.equal(task.items.length, 8);
    assert.ok(task.items.some((x) => x.yes) && task.items.some((x) => !x.yes));
    assert.equal(R.errorsOf(task.items, task.answer), 0);
    assert.equal(R.bestRule(task.items).errors, 0);
    if (prev) assert.notDeepEqual(task.answer, prev.answer);
    prev = task;
  }
});

test("makeFuzzyTask: hech bir qoida to'g'ri ishlamaydi, misollar esa yetarli", () => {
  for (let i = 0; i < 60; i++) {
    const task = R.makeFuzzyTask();
    assert.equal(task.items.length, 8);
    assert.equal(task.examples.length, 6);
    assert.ok(R.bestRule(task.items).errors >= 2, "qoida bilan yechib bo'ldi");
    assert.equal(R.nnErrors(task.examples, task.items), 0, "misollar bilan yechilmadi");
  }
});

test("makeSetKindTask: qoidali to'plam — «qoida», chalkash — «misol»", () => {
  let prev = null;
  let qoida = 0;
  for (let i = 0; i < 100; i++) {
    const task = R.makeSetKindTask(i % 2, prev);
    const solvable = R.bestRule(task.items).errors === 0;
    assert.equal(task.answer, solvable ? "qoida" : "misol");
    if (task.answer === "qoida") qoida++;
    prev = task;
  }
  assert.ok(qoida > 20 && qoida < 80, `muvozanat buzilgan: ${qoida}`);
});

test("makeKindTask: hayotdan misollar, javobi ro'yxatdagidek", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = R.makeKindTask(prev);
    const found = R.CASES.find((c) => c.text === task.text);
    assert.ok(found, task.text);
    assert.equal(task.answer, found.kind);
    assert.ok(task.why.length > 5);
    seen.add(task.text);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.ok(seen.size >= 6, "misollar takrorlanib qolyapti");
});

test("hayotdan misollar ro'yxati: ikki turi ham yetarli", () => {
  const qoida = R.CASES.filter((c) => c.kind === "qoida").length;
  const misol = R.CASES.filter((c) => c.kind === "misol").length;
  assert.ok(qoida >= 5 && misol >= 5, `${qoida} / ${misol}`);
  for (const c of R.CASES) assert.ok(c.text && c.why && ["qoida", "misol"].includes(c.kind));
});
```

- [x] **2-qadam: `js/rules.js`**

```js
// Qoida yoki misol? — sof hisob: narsalar, qoidalar, qoidani baholash va topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const FEATURES = ["size", "dots"];      // kattaligi va dog'lari soni
  const OPS = [">", "<"];
  const FEATURE_NAMES = { size: "kattaligi", dots: "dogʻlari" };

  // Hayotdan misollar: qoida yozib bo'ladimi yoki misol kerakmi
  const CASES = [
    { text: "Kalkulyator: 7 + 5 ni hisoblash", kind: "qoida", why: "Qoʻshish qoidasi aniq: hamma vaqt bir xil ishlaydi." },
    { text: "Budilnik: soat 7:00 boʻlsa jiringlash", kind: "qoida", why: "Shart aniq: soat 7:00 boʻldimi yoki yoʻqmi." },
    { text: "Narxning 20 foiz chegirmasini hisoblash", kind: "qoida", why: "Formula aniq, oʻrganish kerak emas." },
    { text: "Sonning juftligini aniqlash", kind: "qoida", why: "Ikkiga boʻlinsa — juft. Bu aniq qoida." },
    { text: "Parol toʻgʻri kiritilganini tekshirish", kind: "qoida", why: "Ikki yozuvni solishtirish — aniq amal." },
    { text: "Svetofor: 30 soniyadan keyin yashil yonishi", kind: "qoida", why: "Vaqt boʻyicha aniq shart." },
    { text: "Doʻstingning yuzini rasmdan tanish", kind: "misol", why: "Yuzni qoida bilan yozib boʻlmaydi — misollar kerak." },
    { text: "Ovozni matnga aylantirish", kind: "misol", why: "Har kim boshqacha gapiradi — koʻp misol kerak." },
    { text: "Qoʻlda yozilgan raqamni oʻqish", kind: "misol", why: "Har kimning qoʻl yozuvi boshqacha." },
    { text: "Rasmda mushuk bor-yoʻqligini aytish", kind: "misol", why: "Mushuklar har xil: rang, holat, yorugʻlik." },
    { text: "Gapni boshqa tilga tarjima qilish", kind: "misol", why: "Til qoidalari juda koʻp va istisnoli — misollardan oʻrganiladi." },
    { text: "Rentgen rasmidan kasallikni topish", kind: "misol", why: "Belgilar mayin va har xil — shifokor misollari kerak." },
  ];

  const test = (rule, item) => (rule.op === ">" ? item[rule.feature] > rule.value : item[rule.feature] < rule.value);

  const wrongOnes = (items, rule) => items.filter((item) => test(rule, item) !== item.yes);
  const errorsOf = (items, rule) => wrongOnes(items, rule).length;

  // Barcha mumkin bo'lgan qoidalar (belgi × amal × son)
  function allRules() {
    const out = [];
    for (const feature of FEATURES) {
      for (const op of OPS) {
        for (let value = 1; value <= 9; value++) out.push({ feature, op, value });
      }
    }
    return out;
  }

  // Eng kam xato qiladigan qoida
  function bestRule(items) {
    let best = null;
    for (const rule of allRules()) {
      const errors = errorsOf(items, rule);
      if (!best || errors < best.errors) best = { rule, errors };
    }
    return best;
  }

  const dist = (a, b) => Math.hypot(a.size - b.size, a.dots - b.dots);
  const nearest = (examples, q) => examples.slice().sort((a, b) => dist(a, q) - dist(b, q))[0];
  const nnErrors = (examples, items) => items.filter((item) => nearest(examples, item).yes !== item.yes).length;

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  function take(arr, k, rng) {
    const rest = arr.slice();
    const out = [];
    while (out.length < k && rest.length) out.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
    return out;
  }

  const key = (item) => `${item.size}:${item.dots}`;

  // 1-bosqich: aniq qoida bilan yechiladigan to'plam
  function makeRuleTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const rule = { feature: pick(FEATURES, rng), op: pick(OPS, rng), value: randInt(3, 7, rng) };
      const other = rule.feature === "size" ? "dots" : "size";
      const pool = [];
      for (let a = 1; a <= 9; a++) {
        for (let b = 1; b <= 9; b++) {
          const item = { size: rule.feature === "size" ? a : b, dots: rule.feature === "size" ? b : a };
          if (item[rule.feature] === rule.value) continue; // chegaradagi narsa chalkashtiradi
          pool.push({ size: item.size, dots: item.dots, yes: test(rule, item) });
        }
      }
      const yes = pool.filter((x) => x.yes);
      const no = pool.filter((x) => !x.yes);
      if (yes.length < 4 || no.length < 4) continue;
      const items = take(yes, 4, rng).concat(take(no, 4, rng));
      if (new Set(items.map(key)).size !== 8) continue;
      if (bestRule(items).errors !== 0) continue;
      const last = prev && prev.type === "rule" ? prev.answer : null; // oldingi vazifa boshqa turdan boʻlishi mumkin
      if (last && last.feature === rule.feature && last.op === rule.op && last.value === rule.value) continue;
      return { type: "rule", items: take(items, items.length, rng), answer: rule, other };
    }
  }

  // 2-bosqich: hech bir qoida yechmaydigan, lekin misollar bilan yechiladigan to'plam
  function makeFuzzyTask(rng) {
    rng = rng || Math.random;
    for (;;) {
      const band = randInt(9, 11, rng); // yashirin qoida: kattaligi + dogʻlari yigʻindisi
      const pool = [];
      for (let size = 1; size <= 9; size++) {
        for (let dots = 1; dots <= 9; dots++) {
          const sum = size + dots;
          if (Math.abs(sum - band) < 2) continue;
          pool.push({ size, dots, yes: sum > band });
        }
      }
      const yes = pool.filter((x) => x.yes);
      const no = pool.filter((x) => !x.yes);
      if (yes.length < 7 || no.length < 7) continue;
      const items = take(yes, 4, rng).concat(take(no, 4, rng));
      const rest = pool.filter((p) => !items.some((i) => key(i) === key(p)));
      const examples = take(rest.filter((x) => x.yes), 3, rng).concat(take(rest.filter((x) => !x.yes), 3, rng));
      if (examples.length < 6) continue;
      if (bestRule(items).errors < 2) continue;
      if (nnErrors(examples, items) !== 0) continue;
      return { type: "fuzzy", items: take(items, items.length, rng), examples, band };
    }
  }

  // 2-bosqich mashqi: to'plamga qarab "qoida" yoki "misol"
  function makeSetKindTask(k, prev, rng) {
    rng = rng || Math.random;
    const useRule = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    const task = useRule ? makeRuleTask(prev && prev.base, rng) : makeFuzzyTask(rng); // makeRuleTask tur nomini oʻzi tekshiradi
    return { type: "setKind", items: task.items, answer: useRule ? "qoida" : "misol", base: task };
  }

  // 3-bosqich mashqi: hayotdan misol
  function makeKindTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const item = pick(CASES, rng);
      if (prev && prev.text === item.text) continue;
      return { type: "kind", text: item.text, answer: item.kind, why: item.why };
    }
  }

  const api = {
    FEATURES, OPS, FEATURE_NAMES, CASES,
    test, wrongOnes, errorsOf, allRules, bestRule, dist, nearest, nnErrors,
    makeRuleTask, makeFuzzyTask, makeSetKindTask, makeKindTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.rules = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

---

### 2-vazifa: Rasmlar va ekran qismlari

- [x] **1-qadam: `js/game-art.js`**

```js
// 9-o'yinga xos SVG rasmlar: narsa (meva), hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Narsa: kattaligi (1–9) radiusni, dog'lari soni nuqtalarni belgilaydi
  function thing(size, dots) {
    const r = 10 + size * 1.8;
    let spots = "";
    for (let k = 0; k < dots; k++) {
      const angle = (k * 2.399) % (Math.PI * 2); // oltin burchak — nuqtalar teng tarqaladi
      const rad = r * 0.62 * Math.sqrt((k + 0.6) / Math.max(dots, 1));
      const x = 32 + Math.cos(angle) * rad;
      const y = 34 + Math.sin(angle) * rad;
      spots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.12).toFixed(1)}" fill="#7A4E2A"/>`;
    }
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M32 ${34 - r} q3 -8 9 -10 q-4 6 -5 10" fill="#1A9E77"/>
  <circle cx="32" cy="34" r="${r}" fill="#E8A33D" stroke="${INK}" stroke-width="3"/>
  ${spots}
</svg>`;
  }

  // Kalkulyator: qoida yozilgan dastur
  function calculator() {
    let keys = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        keys += `<rect x="${72 + c * 22}" y="${52 + r * 20}" width="17" height="15" rx="3" fill="#CED6DC" stroke="${INK}" stroke-width="2"/>`;
      }
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="62" y="10" width="76" height="104" rx="10" fill="#8A929A" stroke="${INK}" stroke-width="3"/>
  <rect x="72" y="20" width="56" height="24" rx="4" fill="#DCEFE6" stroke="${INK}" stroke-width="2"/>
  ${keys}
</svg>`;
  }

  // Mushuk rasmlari: qoida yozib bo'lmaydi
  const catFace = (cx, cy, r, fur) => `
  <path d="M${cx - r * 0.75} ${cy - r * 0.45} L${cx - r * 0.4} ${cy - r * 1.25} L${cx + r * 0.05} ${cy - r * 0.75} Z" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <path d="M${cx + r * 0.75} ${cy - r * 0.45} L${cx + r * 0.4} ${cy - r * 1.25} L${cx - r * 0.05} ${cy - r * 0.75} Z" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <circle cx="${cx - r * 0.35}" cy="${cy - r * 0.12}" r="${r * 0.13}" fill="${INK}"/>
  <circle cx="${cx + r * 0.35}" cy="${cy - r * 0.12}" r="${r * 0.13}" fill="${INK}"/>`;

  const cats = `<svg viewBox="0 0 200 120" aria-hidden="true">
  ${catFace(42, 46, 18, "#F4F1EA")}
  ${catFace(100, 60, 22, "#C9945A")}
  ${catFace(158, 44, 16, "#4A4A55")}
  ${catFace(70, 96, 14, "#8A929A")}
  ${catFace(132, 98, 15, "#E8DCC0")}
</svg>`;

  // Ichma-ich doiralar: AI ⊃ ML ⊃ (misollardan o'rganish); yozuvlar HTML'da
  const circles = `<svg viewBox="0 0 200 140" aria-hidden="true">
  <ellipse cx="100" cy="70" rx="94" ry="64" fill="#DCE8FA" stroke="#2F6FDE" stroke-width="3"/>
  <ellipse cx="100" cy="78" rx="62" ry="46" fill="#D6F0E4" stroke="#1A9E77" stroke-width="3"/>
  <ellipse cx="100" cy="86" rx="32" ry="26" fill="#EFE0FA" stroke="#8E5BD0" stroke-width="3"/>
</svg>`;

  const STORY = { calculator: calculator(), cats, circles };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { thing, story });
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

test("narsa rasmi: kattaligi radiusni, dog'lari nuqtalar sonini belgilaydi", () => {
  assert.match(art.thing(5, 3), /^<svg[\s\S]*<\/svg>$/);
  const small = art.thing(2, 1);
  const big = art.thing(9, 1);
  const radius = (svg) => Number(svg.match(/circle cx="32" cy="34" r="([\d.]+)"/)[1]);
  assert.ok(radius(big) > radius(small), "katta narsa kattaroq chizilmadi");
  const spots = (svg) => (svg.match(/fill="#7A4E2A"/g) || []).length;
  assert.equal(spots(art.thing(5, 4)), 4);
  assert.equal(spots(art.thing(5, 7)), 7);
});

test("hikoya rasmlari SVG va matnsiz", () => {
  for (const name of ["calculator", "cats", "circles"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
  assert.ok(!art.thing(5, 3).includes("<text"));
});
```

- [x] **3-qadam: `js/rules-ui.js`**

```js
// Qoida yoki misol?: narsalar taxtasi, qoida yasagich, xato hisoblagichi va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { rules, ui, sound, art } = QK;

  const OP_NAMES = { ">": "dan katta", "<": "dan kichik" };

  // Narsa kartochkasi: rasm, belgilari va javobi
  function thingCard(item, opts) {
    const o = opts || {};
    const card = ui.h("div", { class: "thing" + (o.small ? " sm" : "") });
    card.append(ui.h("div", { class: "thing-art", html: art.thing(item.size, item.dots) }));
    card.append(ui.h("div", { class: "thing-nums", text: `${item.size} · ${item.dots}` }));
    const mark = ui.h("div", { class: "thing-mark" });
    card.append(mark);
    const view = {
      el: card,
      // Haqiqiy javob: HA yoki YO'Q
      truth() {
        mark.textContent = item.yes ? "HA" : "YOʻQ";
        mark.className = "thing-mark " + (item.yes ? "yes" : "no");
      },
      // Qoidaning javobi to'g'ri chiqdimi
      check(ok) {
        card.classList.toggle("wrong", !ok);
        card.classList.toggle("right", ok);
        mark.textContent = item.yes ? "HA" : "YOʻQ";
        mark.className = "thing-mark " + (item.yes ? "yes" : "no") + (ok ? "" : " miss");
      },
      // Qoidaning javobini olib tashlaydi, lekin haqiqiy javob (HA/YOʻQ) joyida qoladi
      clear() {
        card.classList.remove("wrong", "right");
        if (o.truth) view.truth();
        else {
          mark.textContent = "";
          mark.className = "thing-mark";
        }
      },
    };
    if (o.truth) view.truth();
    return view;
  }

  // Narsalar taxtasi
  function board(host, items, opts) {
    const el = ui.h("div", { class: "things" });
    host.append(el);
    const cards = items.map((item) => {
      const card = thingCard(item, opts);
      el.append(card.el);
      return card;
    });
    return {
      el,
      cards,
      // Qoidani ishga tushirish: har kartaga ✓ yoki ↻
      run(rule) {
        items.forEach((item, i) => cards[i].check(rules.test(rule, item) === item.yes));
        return rules.errorsOf(items, rule);
      },
      // Misollar bilan (eng yaqin misol) bashorat
      runExamples(examples) {
        items.forEach((item, i) => cards[i].check(rules.nearest(examples, item).yes === item.yes));
        return rules.nnErrors(examples, items);
      },
      clear() { cards.forEach((card) => card.clear()); },
      truth() { cards.forEach((card) => card.truth()); },
    };
  }

  // Qoida yasagich: uch tugma — belgi, amal, son
  function ruleBuilder(host, onChange) {
    let rule = { feature: "size", op: ">", value: 5 };
    const featureBtn = ui.h("button", { class: "key wide", type: "button" });
    const opBtn = ui.h("button", { class: "key", type: "button" });
    const valueBtn = ui.h("button", { class: "key", type: "button" });
    const render = () => {
      featureBtn.textContent = rules.FEATURE_NAMES[rule.feature];
      opBtn.textContent = rule.op;
      valueBtn.textContent = String(rule.value);
      featureBtn.setAttribute("aria-label", `Belgi: ${rules.FEATURE_NAMES[rule.feature]}`);
      opBtn.setAttribute("aria-label", `Amal: ${OP_NAMES[rule.op]}`);
      valueBtn.setAttribute("aria-label", `Son: ${rule.value}`);
      if (onChange) onChange(Object.assign({}, rule));
    };
    const cycle = (what) => {
      sound.play("tap");
      if (what === "feature") rule.feature = rules.FEATURES[(rules.FEATURES.indexOf(rule.feature) + 1) % rules.FEATURES.length];
      else if (what === "op") rule.op = rules.OPS[(rules.OPS.indexOf(rule.op) + 1) % rules.OPS.length];
      else rule.value = (rule.value % 9) + 1;
      render();
    };
    featureBtn.addEventListener("click", () => cycle("feature"));
    opBtn.addEventListener("click", () => cycle("op"));
    valueBtn.addEventListener("click", () => cycle("value"));
    const el = ui.h("div", { class: "rule-line" },
      ui.h("span", { class: "rule-word", text: "Agar" }),
      featureBtn, opBtn, valueBtn,
      ui.h("span", { class: "rule-word", text: "boʻlsa — HA" }));
    host.append(el);
    render();
    return {
      el,
      get: () => Object.assign({}, rule),
      set(next) {
        rule = Object.assign({}, next);
        render();
      },
    };
  }

  // "Xato: N" hisoblagichi
  function errorBadge(host) {
    const badge = ui.h("div", { class: "err-badge", "aria-live": "polite" });
    host.append(badge);
    return {
      el: badge,
      set(n) {
        badge.textContent = n === 0 ? "Xato: 0 ✓" : `Xato: ${n}`;
        badge.classList.toggle("ok", n === 0);
      },
      clear() {
        badge.textContent = "";
        badge.classList.remove("ok");
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

  QK.rulesUi = { OP_NAMES, thingCard, board, ruleBuilder, errorBadge, choiceButtons };
})(window);
```

- [x] **4-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Qoida yoki misol?</title>
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
  <script src="js/rules.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="../umumiy/js/practice.js"></script>
  <script src="js/rules-ui.js"></script>
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
/* Qoida yoki misol? — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.rbox { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }

/* ---------- Narsalar taxtasi ---------- */
.things { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; width: 100%; max-width: 420px; }
.thing {
  display: flex; flex-direction: column; align-items: center; gap: 2px; width: 76px; padding: 4px;
  border-radius: 12px; background: #fff; box-shadow: 0 2px 0 var(--soya);
}
.thing.sm { width: 62px; }
.thing.right { box-shadow: 0 2px 0 var(--soya), inset 0 0 0 3px var(--togri); }
.thing.wrong { box-shadow: 0 2px 0 var(--soya), inset 0 0 0 3px var(--yana); animation: pop 0.3s; }
.thing-art { width: 46px; height: 46px; }
.thing.sm .thing-art { width: 38px; height: 38px; }
.thing-art svg { display: block; width: 100%; height: 100%; }
.thing-nums { font-size: 16px; font-weight: 800; opacity: 0.8; }
.thing-mark { min-height: 22px; font-size: 17px; font-weight: 900; }
.thing-mark.yes { color: var(--togri); }
.thing-mark.no { color: #8A929A; }
.thing-mark.miss::after { content: " ↻"; color: var(--yana); }

/* ---------- Qoida yasagich ---------- */
.rule-line {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px;
  width: 100%; max-width: 460px; padding: 8px 10px; border-radius: 14px;
  background: #fff; box-shadow: inset 0 0 0 3px var(--chiziq);
}
.rule-word { font-size: 19px; font-weight: 800; }
.rule-line .key { min-width: 56px; padding: 0 10px; font-size: 20px; }
.rule-line .key.wide { min-width: 116px; }
.err-badge { font-size: 22px; font-weight: 900; color: var(--yana); min-height: 28px; }
.err-badge.ok { color: var(--togri); }
.count-line { font-size: 18px; font-weight: 800; text-align: center; }
.answer { font-size: 19px; font-weight: 900; color: var(--togri); text-align: center; }
.case-text {
  max-width: 420px; padding: 14px 16px; border-radius: 14px; background: #fff; box-shadow: 0 3px 0 var(--soya);
  font-size: 21px; font-weight: 800; text-align: center;
}

/* ---------- Qiyoslash va doiralar ---------- */
.compare { display: flex; gap: 10px; width: 100%; max-width: 480px; }
.col {
  flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 10px;
  border-radius: 14px; background: #fff; box-shadow: 0 2px 0 var(--soya); font-size: 17px; font-weight: 700;
}
.col-head { font-size: 19px; font-weight: 900; }
.rule-col .col-head { color: var(--asosiy); }
.ex-col .col-head { color: var(--togri); }
.legend { display: flex; flex-direction: column; gap: 6px; font-size: 17px; font-weight: 800; }
.leg { display: flex; align-items: center; gap: 8px; }
.leg span:first-child { width: 16px; height: 16px; border-radius: 50%; }
.dot-ai { background: #DCE8FA; box-shadow: inset 0 0 0 3px #2F6FDE; }
.dot-ml { background: #D6F0E4; box-shadow: inset 0 0 0 3px #1A9E77; }
.dot-dl { background: #EFE0FA; box-shadow: inset 0 0 0 3px #8E5BD0; }

/* ---------- Hikoya va tabrik ---------- */
.story { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.story-art { width: min(240px, 66vw); }
.story-art.small { width: min(110px, 28vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }

/* Yotiq telefon */
@media (orientation: landscape) and (max-height: 500px) {
  .play.compact { grid-template-columns: minmax(150px, 24%) minmax(0, 1fr); }
  .thing { width: 70px; }
  .thing-art { width: 44px; height: 44px; }
  .rule-line .key { min-height: 46px; }
  .story-art { width: min(190px, 36vh); }
}
```

---

### 3-vazifa: Sahnalar

- [x] **1-qadam: `js/scenes/common.js`**

```js
// Qoida yoki misol?: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, rulesUi } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "rbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  // Qoida ekrani: narsalar taxtasi ish maydonida, qoida yasagich — boshqaruv zonasida (doim koʻrinadi)
  function ruleScreen(items) {
    const el = box(true);
    const view = rulesUi.board(el, items, { truth: true });
    const badge = rulesUi.errorBadge(el);
    const builder = rulesUi.ruleBuilder(ui.control(), () => {
      view.clear();
      badge.clear();
    });
    return { el, view, badge, builder };
  }

  QK.common = { box, answerLine, line, ruleScreen };
})(window);
```

- [x] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: qoida yozamiz (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { rules, ui, sound, art, rulesUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robotga ish buyuramiz: mevalarni ajratsin.");
    await ui.say("apprentice", "Unga qanday tushuntiramiz?");
    await ui.say("elder", "Ikki yoʻl bor: qoida yozamiz yoki misol koʻrsatamiz. Avval qoidani sinaymiz.");
  }

  // 4.1–4.2: qoidani qo'lda yasash (xato 0 boʻlguncha, xato hisoblanmaydi)
  async function guidedRule(task, lead) {
    const { view, badge, builder } = common.ruleScreen(task.items);
    ui.bubble("elder", lead);
    let tries = 0;
    await ui.settle((done) => {
      ui.control().append(ui.button("Ishga tushir", () => {
        const errors = view.run(builder.get());
        badge.set(errors);
        if (errors === 0) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          ui.clearControl();
          done();
          return;
        }
        sound.play("retry");
        tries++;
        ui.bubble("elder", tries === 1
          ? `↻ ${errors} ta xato. Belgilangan narsalarga qara: qoida ularni notoʻgʻri ajratdi.`
          : `↻ Belgini yoki sonni oʻzgartirib koʻr. Kerakli belgi — ${rules.FEATURE_NAMES[task.answer.feature]}.`);
      }, "big"));
    });
    await ui.say("elder", `✓ Qoida topildi: agar ${rules.FEATURE_NAMES[task.answer.feature]} ${task.answer.op} ${task.answer.value} boʻlsa — HA.`);
  }

  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Biz robotga qoida yozdik. U qoidani soʻzsiz bajaradi — bu oddiy dastur.");
    await ui.say("elder", "Qoida aniq boʻlsa, robot hech qachon adashmaydi.");
  }

  // 4.4: mashq — qoidani o'zi topadi
  function ruleTask(task) {
    const { view, badge, builder } = common.ruleScreen(task.items);
    ui.bubble("elder", "Shu narsalarni ajratadigan qoidani top. Keyin «Ishga tushir»ni bos.");
    return practice.tries({
      setup: (submit) => {
        ui.control().append(ui.button("Ishga tushir", () => {
          const errors = view.run(builder.get());
          badge.set(errors);
          submit(errors);
        }, "big"));
      },
      check: (errors) => errors === 0,
      hint: () => ui.bubble("elder", `↻ Belgilangan narsalar notoʻgʻri ajratildi. «${rules.FEATURE_NAMES[task.answer.feature]}» belgisini sinab koʻr.`),
      solution: () => {
        builder.set(task.answer);
        view.run(task.answer);
        badge.set(0);
        view.el.parentNode.append(common.answerLine(
          `Agar ${rules.FEATURE_NAMES[task.answer.feature]} ${task.answer.op} ${task.answer.value} boʻlsa — HA`));
      },
    });
  }

  async function stage1() {
    const first = rules.makeRuleTask(null);
    await guidedRule(first, "Qoidani yasa: uchta tugmani bosib oʻzgartir, keyin «Ishga tushir».");
    const second = rules.makeRuleTask(first);
    await guidedRule(second, "Yana bitta ish. Bu safar boshqa qoida kerak boʻlishi mumkin.");
    await explain();
    await ui.say("elder", "Endi oʻzing qoida yoz. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev) => rules.makeRuleTask(prev),
      run: ruleTask,
      praise: (task) => `Qoida: ${rules.FEATURE_NAMES[task.answer.feature]} ${task.answer.op} ${task.answer.value}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [x] **3-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: qoida ishlamaydigan ish va misollardan o'rganish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { rules, ui, sound, rulesUi, practice, common } = QK;

  // 5.1–5.2: bola qoida topmoqchi bo'ladi, keyin robot hamma qoidani sinaydi
  async function fuzzyTry(task) {
    const { el, view, badge, builder } = common.ruleScreen(task.items);
    await ui.say("elder", "Yangi ish. Bu safar narsalar chalkashroq — qoidani topa olasanmi?");
    ui.bubble("elder", "Qoidani yasab, «Ishga tushir»ni bos.");
    let tries = 0;
    await ui.settle((done) => {
      ui.control().append(ui.h("div", { class: "choice-row" },
        ui.button("Ishga tushir", () => {
          const errors = view.run(builder.get());
          badge.set(errors);
          sound.play(errors === 0 ? "correct" : "retry");
          tries++;
          ui.bubble("elder", tries < 2
            ? `↻ ${errors} ta xato. Boshqa qoidani sinab koʻr.`
            : "Qiyin, toʻgʻrimi? Robot hamma qoidani oʻzi sinab koʻrsin.");
        }, "big"),
        ui.button("Hamma qoidani sina", () => { ui.clearControl(); done(); }, "secondary")));
    });
    // Robot barcha qoidalarni sinaydi
    ui.bubble("elder", "Robot barcha qoidalarni birma-bir sinayapti…");
    const all = rules.allRules();
    let best = null;
    for (let i = 0; i < all.length; i += 2) {
      const rule = all[i];
      builder.set(rule);
      const errors = view.run(rule);
      badge.set(errors);
      if (!best || errors < best.errors) best = { rule, errors };
      sound.play("tap");
      await ui.sleep(90);
    }
    const found = rules.bestRule(task.items);
    builder.set(found.rule);
    view.run(found.rule);
    badge.set(found.errors);
    sound.play("retry");
    el.append(common.line(`Eng yaxshi qoida ham ${found.errors} ta xato qiladi`));
    await ui.say("elder", `Hamma qoida sinaldi. Eng yaxshisi ham ${found.errors} ta xato qiladi — qoida bu yerda yetmaydi.`);
    return el;
  }

  // 5.3: misollar bilan o'rgatish
  async function withExamples(task) {
    const el = common.box(true);
    el.append(common.line("Robotga koʻrsatilgan misollar:"));
    rulesUi.board(el, task.examples, { truth: true, small: true });
    el.append(common.line("Sinov narsalari:"));
    const view = rulesUi.board(el, task.items, { truth: true });
    const badge = rulesUi.errorBadge(el);
    await ui.say("elder", "Unda boshqacha qilamiz: robotga 6 ta misol koʻrsatamiz.");
    ui.bubble("elder", "«Misollarga qarab ishlasin»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Misollarga qarab ishlasin", () => { ui.clearControl(); done(); }, "big"));
    });
    const errors = view.runExamples(task.examples);
    badge.set(errors);
    sound.play("correct");
    await ui.say("elder", "Xato 0! Robot har bir narsani eng oʻxshash misolga qarab ajratdi.");
    await ui.say("elder", "Qoida yozib boʻlmasa — misol koʻrsatamiz. Buni mashinali oʻrganish deyishadi.");
  }

  // 5.5: mashq — bu to'plamga qoida yetadimi?
  function setKindTask(task) {
    const el = common.box(true);
    rulesUi.board(el, task.items, { truth: true });
    ui.bubble("elder", "Shu narsalar uchun qoida yetadimi yoki misol koʻrsatish kerakmi?");
    const options = ["Qoida yozamiz", "Misol koʻrsatamiz"];
    return practice.tries({
      setup: (submit) => rulesUi.choiceButtons(options, submit),
      check: (index) => options[index] === (task.answer === "qoida" ? "Qoida yozamiz" : "Misol koʻrsatamiz"),
      hint: () => ui.bubble("elder", "↻ Bitta belgi (kattaligi yoki dogʻlari) boʻyicha aniq chegara bormi? Boʻlsa — qoida."),
      solution: () => {
        const best = rules.bestRule(task.items);
        el.append(common.answerLine(task.answer === "qoida"
          ? `Qoida yetadi: ${rules.FEATURE_NAMES[best.rule.feature]} ${best.rule.op} ${best.rule.value}`
          : `Qoida yetmaydi: eng yaxshisi ham ${best.errors} ta xato qiladi`));
      },
    });
  }

  async function stage2() {
    const task = rules.makeFuzzyTask();
    await fuzzyTry(task);
    await withExamples(task);
    await ui.say("elder", "Endi oʻzing ayt: qoida yetadimi yoki misol kerakmi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev, correct) => rules.makeSetKindTask(correct, prev),
      run: setKindTask,
      praise: (task) => (task.answer === "qoida" ? "Aniq chegara bor — qoida yetadi." : "Chalkash — misol kerak."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [x] **4-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: qaysi biri kerak, hayotdan misollar va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { rules, ui, art, rulesUi, practice, common } = QK;

  const SCENES = [
    { art: "calculator", lines: ["Kalkulyator — qoida yozilgan dastur.", "U hech narsa oʻrganmaydi, lekin adashmaydi ham."] },
    { art: "cats", lines: ["Mushukni tanish uchun qoida yozib boʻlmaydi.", "Shuning uchun unga minglab misol koʻrsatiladi."] },
    { art: "circles", caption: true, lines: ["Sunʼiy intellekt — katta doira: mashina aql talab qiladigan ishni bajaradi.", "Uning ichidagi qism — misollardan oʻrganish, yaʼni mashinali oʻrganish."] },
    { art: "robot", lines: ["Sen 6-, 7- va 8-oʻyinlarda aynan mashinali oʻrganishni qilgansan!", "Robotni misol, soʻz va mukofot bilan oʻrgatding."] },
  ];

  // 6.1: ikki ustunli qiyoslash
  async function compare() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "compare" },
      ui.h("div", { class: "col rule-col" },
        ui.h("div", { class: "col-head", text: "Qoida yozamiz" }),
        ui.h("div", { text: "Belgi aniq" }),
        ui.h("div", { text: "Chegara aniq" }),
        ui.h("div", { text: "Holatlar kam" })),
      ui.h("div", { class: "col ex-col" },
        ui.h("div", { class: "col-head", text: "Misol koʻrsatamiz" }),
        ui.h("div", { text: "Belgilar chalkash" }),
        ui.h("div", { text: "Juda koʻp holat" }),
        ui.h("div", { text: "Rasm, ovoz, matn" }))));
    await ui.say("elder", "Demak ikki yoʻl bor: qoida yozish va misol koʻrsatish.");
    await ui.say("elder", "Ikkalasi ham sunʼiy intellekt. Misoldan oʻrganadigani — mashinali oʻrganish.");
  }

  // 6.3: hayotdan misol — qoidami yoki misolmi?
  function kindTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "case-text", text: task.text }));
    ui.bubble("elder", "Bu ishga qoida yozamizmi yoki misol koʻrsatamizmi?");
    const options = ["Qoida yozamiz", "Misol koʻrsatamiz"];
    return practice.tries({
      setup: (submit) => rulesUi.choiceButtons(options, submit),
      check: (index) => options[index] === (task.answer === "qoida" ? "Qoida yozamiz" : "Misol koʻrsatamiz"),
      hint: () => ui.bubble("elder", "↻ Oʻzing aniq qoida yoza olasanmi? Yoza olsang — qoida, yoza olmasang — misol."),
      solution: () => el.append(common.answerLine(task.why)),
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const holder = ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: scene.art === "robot" ? art.robot() : art.story(scene.art) }));
    if (scene.caption) {
      holder.append(ui.h("div", { class: "legend" },
        ui.h("div", { class: "leg ai" }, ui.h("span", { class: "dot-ai" }), ui.h("span", { text: "Sunʼiy intellekt" })),
        ui.h("div", { class: "leg ml" }, ui.h("span", { class: "dot-ml" }), ui.h("span", { text: "Mashinali oʻrganish" })),
        ui.h("div", { class: "leg dl" }, ui.h("span", { class: "dot-dl" }), ui.h("span", { text: "Chuqur oʻrganish — 11-oʻyinda" }))));
    }
    ui.work().append(holder);
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await compare();
    await ui.say("elder", "Endi hayotdan misollar. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev) => rules.makeKindTask(prev),
      run: kindTask,
      praise: (task) => task.why,
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
    ui.bubble("elder", "Tabriklayman! Endi sen qoida bilan misolni ajrata olasan!");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Aniq chegara boʻlsa — qoida yozamiz" }),
        ui.h("div", { text: "Chalkash boʻlsa — misol koʻrsatamiz" }),
        ui.h("div", { text: "Misoldan oʻrganish — mashinali oʻrganish" }))));
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
// 9-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Qoida yoki misol?",
  storageKey: "qoida-yoki-misol:v1",
  stageTitles: ["Qoida yozamiz", "Qoida ishlamaydi", "Qaysi biri kerak?"],
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
  assert.equal(captured.storageKey, "qoida-yoki-misol:v1");
  assert.equal(captured.title, "Qoida yoki misol?");
  assert.deepEqual(captured.stageTitles, ["Qoida yozamiz", "Qoida ishlamaydi", "Qaysi biri kerak?"]);
});
```

---

### 4-vazifa: Bosh sahifa, offline ro'yxati va tekshiruv

- [x] **1-qadam: bosh sahifaga 9-o'yin (`qoida` ikonkasi), AI bo'limi nomi yangilandi**

- [x] **2-qadam: offline ro'yxati yangilanadi (yangi fayllar keshga qo'shiladi)**

```bash
cd /Users/bicoder/Documents/Information && python3 bosh/sw-royxat.py --bump && node --test bosh/tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
```

- [x] **3-qadam: barcha testlar**

```bash
cd /Users/bicoder/Documents/Information/oyinlar && for d in 0*/ umumiy/; do (cd "$d" && printf "%-30s " "$d" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' '; echo); done
```

- [x] **4-qadam: brauzerda to'liq o'ynab chiqish** (`scratchpad/play9.js`: 4 ta ekran + ataylab xato)

- [x] **5-qadam: commit, main'ga birlashtirish va GitHub'ga yuklash**

```bash
cd /Users/bicoder/Documents/Information && git add -A && git commit -m "09-qoida-yoki-misol: qoida va misol farqi" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" && git checkout main && git merge --no-ff oyin/09-qoida-yoki-misol && git branch -d oyin/09-qoida-yoki-misol && git push
```
