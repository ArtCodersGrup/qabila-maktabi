# 12 — AI xaritasi: ish rejasi

**Maqsad:** 12-o'yin: AI, ML, DL va kompyuter ko'rish farqlari — ichma-ich xarita (oddiy dastur ⊃ AI ⊃ ML ⊃ DL), usul va vazifa, real misollar va 6–11-o'yinlarning o'rni.

**Arxitektura:** oldingi o'yinlardagidek. Sof ma'lumot va topshiriqlar `js/atlas.js` (Node testlari), xarita va tugmalar `js/atlas-ui.js` (yozuvlar HTML'da), sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi; bloklar tayyor fayllardan olingan. Aniqlik uchun 9-o'yindagi "ikkalasi ham sunʼiy intellekt" jumlasi ham to'g'rilandi: oddiy qoidali dastur (kalkulyator) sunʼiy intellekt emas.

## Nomlar va interfeyslar

- `QK.atlas`: `ZONES` (`plain`, `ai`, `ml`, `dl`), `ORDER`, `DEFS`, `TASKS` (`korish`, `til`, `harakat`, `hisob`), `JOBS`, `EXAMPLES`, `GAMES` (6–11), `inside(a, b)`, `zoneName`, `taskName`, `makeDefTask`, `makeJobTask`, `makeExampleTask`.
- `QK.atlasUi`: `mapView(host)` → `{show(ids), highlight(id), add(id, text)}`, `card(host, text)` → `{mark(key)}`, `listButtons(options, labelOf, onPick)`, `zoneLabel(id)`.

---

### 1-vazifa: Ma'lumot moduli (`js/atlas.js`) — TDD

- [x] **1-qadam: testlar — `tests/atlas.test.js`**

```js
// atlas.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const A = require("../js/atlas.js");

test("xarita zonalari: oddiy dastur, AI ⊃ ML ⊃ DL", () => {
  assert.deepEqual(A.ZONES.map((z) => z.id), ["plain", "ai", "ml", "dl"]);
  for (const z of A.ZONES) assert.ok(z.name && z.short && z.def, z.id);
  assert.equal(A.inside("dl", "ml"), true);
  assert.equal(A.inside("dl", "ai"), true);
  assert.equal(A.inside("ml", "dl"), false);
  assert.equal(A.inside("ai", "plain"), true, "hamma narsa dastur");
});

test("ta'riflar: har doira uchun kamida 2 ta, kalit so'z matnda bor", () => {
  for (const id of ["ai", "ml", "dl"]) assert.ok(A.DEFS.filter((d) => d.circle === id).length >= 2, id);
  for (const d of A.DEFS) assert.ok(d.text.includes(d.key), `${d.text} — ${d.key}`);
});

test("vazifalar: har biriga kamida 2 ta ish", () => {
  assert.deepEqual(A.TASKS.map((t) => t.id), ["korish", "til", "harakat", "hisob"]);
  for (const t of A.TASKS) assert.ok(A.JOBS.filter((j) => j.task === t.id).length >= 2, t.id);
});

test("real misollar: har zonada kamida 3 ta, vazifasi va sababi bor", () => {
  for (const z of A.ZONES) assert.ok(A.EXAMPLES.filter((e) => e.zone === z.id).length >= 3, z.id);
  for (const e of A.EXAMPLES) {
    assert.ok(A.TASKS.some((t) => t.id === e.task), e.text);
    assert.ok(e.why.length > 10, e.text);
  }
  assert.equal(A.EXAMPLES.find((e) => e.text.startsWith("Kalkulyator")).zone, "plain", "kalkulyator AI emas");
});

test("6–11-o'yinlar xaritada", () => {
  assert.deepEqual(A.GAMES.map((g) => g.n), [6, 7, 8, 9, 10, 11]);
  assert.equal(A.GAMES.find((g) => g.n === 11).zone, "dl");
  for (const g of A.GAMES) assert.ok(A.ZONES.some((z) => z.id === g.zone), g.n);
});

test("makeDefTask: javob ta'rifning doirasi, ketma-ket takrorlanmaydi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = A.makeDefTask(prev);
    const def = A.DEFS.find((d) => d.text === task.text);
    assert.equal(task.answer, def.circle);
    assert.deepEqual(task.options, ["ai", "ml", "dl"]);
    seen.add(task.answer);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.equal(seen.size, 3);
});

test("makeJobTask: javob ishning vazifasi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = A.makeJobTask(prev);
    assert.equal(task.answer, A.JOBS.find((j) => j.text === task.text).task);
    seen.add(task.answer);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.equal(seen.size, 4);
});

test("makeExampleTask: javob misolning zonasi, to'rtala zona chiqadi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 300; i++) {
    const task = A.makeExampleTask(prev);
    const ex = A.EXAMPLES.find((e) => e.text === task.text);
    assert.equal(task.answer, ex.zone);
    assert.equal(task.why, ex.why);
    assert.deepEqual(task.options, ["plain", "ai", "ml", "dl"]);
    seen.add(task.answer);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.equal(seen.size, 4);
});
```

- [x] **2-qadam: `js/atlas.js`**

```js
// AI xaritasi — sof ma'lumot va topshiriqlar: zonalar, ta'riflar, vazifalar, real misollar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Tashqaridan ichkariga: oddiy dastur ⊃ sun'iy intellekt ⊃ mashinali o'rganish ⊃ chuqur o'rganish
  const ZONES = [
    { id: "plain", name: "Oddiy dastur", short: "Dastur", def: "Qoidani bajaradi, aql talab qilmaydi." },
    { id: "ai", name: "Sunʼiy intellekt", short: "AI", def: "Aql talab qiladigan ishni bajaradi — qoida va qidiruv bilan ham, oʻrganib ham." },
    { id: "ml", name: "Mashinali oʻrganish", short: "ML", def: "Qoida yozilmaydi — misollardan oʻrganadi." },
    { id: "dl", name: "Chuqur oʻrganish", short: "DL", def: "Koʻp qatlamli neyron tarmoq bilan oʻrganadi." },
  ];
  const ORDER = ZONES.map((z) => z.id);

  // a zona b zonaning ichidami (o'zi ham hisoblanadi)
  const inside = (a, b) => ORDER.indexOf(a) >= ORDER.indexOf(b);

  // 1-bosqich: ta'rif → doira (kalit so'z matnda bor — maslahatda yoritiladi)
  const DEFS = [
    { text: "Qoida yozilmaydi — mashina misollardan oʻrganadi.", circle: "ml", key: "misollardan" },
    { text: "Koʻp misol koʻrib, xatosini kamaytirib boradi.", circle: "ml", key: "misol" },
    { text: "Koʻp qatlamli neyron tarmoq ishlatiladi.", circle: "dl", key: "qatlamli" },
    { text: "Tarmoq belgilarni qatlam-qatlam oʻzi topadi.", circle: "dl", key: "qatlam" },
    { text: "Mashina aql talab qiladigan ishni bajaradi — oʻrganmasa ham, qidirib topsa ham.", circle: "ai", key: "aql" },
    { text: "Eng katta doira: hamma aqlli dasturlar shu yerda.", circle: "ai", key: "katta" },
  ];

  const TASKS = [
    { id: "korish", name: "koʻrish" },
    { id: "til", name: "til" },
    { id: "harakat", name: "harakat" },
    { id: "hisob", name: "hisob" },
  ];

  // 2-bosqich: ish → vazifa turi
  const JOBS = [
    { text: "Rasmdan yuzni tanish", task: "korish" },
    { text: "Yoʻl belgisini oʻqish", task: "korish" },
    { text: "Qoʻlda yozilgan raqamni oʻqish", task: "korish" },
    { text: "Gapni boshqa tilga tarjima qilish", task: "til" },
    { text: "Savolga chatbot javob yozishi", task: "til" },
    { text: "Ovozni matnga aylantirish", task: "til" },
    { text: "Robotning yurishi", task: "harakat" },
    { text: "Oʻzi yuradigan mashinaning rulni burishi", task: "harakat" },
    { text: "Dronning muvozanat saqlab uchishi", task: "harakat" },
    { text: "Xaridlar narxini qoʻshish", task: "hisob" },
    { text: "Eng qisqa yoʻlni topish", task: "hisob" },
    { text: "Shaxmatda yurishlarni sanab chiqish", task: "hisob" },
  ];

  // 3-bosqich: real misol → xaritadagi joyi
  const EXAMPLES = [
    { text: "Kalkulyator", zone: "plain", task: "hisob", why: "Qoidani bajaradi xolos — aql ham, oʻrganish ham kerak emas." },
    { text: "Budilnik", zone: "plain", task: "hisob", why: "Soat kelsa jiringlaydi — oddiy qoida." },
    { text: "Svetofor taymeri", zone: "plain", task: "hisob", why: "Vaqt boʻyicha rang almashadi — oddiy qoida." },
    { text: "Shaxmat dasturi (yurishlarni sanab chiqadi)", zone: "ai", task: "hisob", why: "Aqlli ish, lekin oʻrganmaydi — yurishlarni qidirib, eng yaxshisini tanlaydi." },
    { text: "Navigator: eng qisqa yoʻlni topish", zone: "ai", task: "hisob", why: "Yoʻllarni qidirib, eng qisqasini topadi — oʻrganmasdan." },
    { text: "Oʻyindagi qoidali raqib-bot", zone: "ai", task: "hisob", why: "Oʻyinchini qoidalar bilan taqlid qiladi — oʻrganmaydi." },
    { text: "Spam xatlarni ajratish", zone: "ml", task: "til", why: "Minglab xat misolidan spamni tanishni oʻrganadi." },
    { text: "Doʻkondagi «sizga yoqishi mumkin» tavsiyalari", zone: "ml", task: "hisob", why: "Odamlarning xaridlari misolidan oʻrganadi." },
    { text: "Uy narxini oʻxshash uylarga qarab bashorat qilish", zone: "ml", task: "hisob", why: "Sotilgan uylar misolidan oʻrganadi." },
    { text: "Telefonning yuzni tanishi", zone: "dl", task: "korish", why: "Koʻp qatlamli tarmoq rasm belgilarini oʻzi topadi." },
    { text: "Chatbot", zone: "dl", task: "til", why: "Milliardlab ogʻirlikli koʻp qatlamli tarmoq." },
    { text: "Ovozni matnga aylantiruvchi dastur", zone: "dl", task: "til", why: "Ovoz belgilarini koʻp qatlamli tarmoq topadi." },
    { text: "Rasm chizadigan dastur", zone: "dl", task: "korish", why: "Juda chuqur neyron tarmoq rasm yasaydi." },
  ];

  // 6–11-o'yinlar xaritada
  const GAMES = [
    { n: 6, title: "Robotni oʻrgatamiz", zone: "ml", note: "misollardan oʻrgandi" },
    { n: 7, title: "Keyingi soʻz", zone: "ml", note: "soʻz juftliklarini sanab oʻrgandi" },
    { n: 8, title: "Sehrli qutilar", zone: "ml", note: "mukofot bilan oʻrgandi" },
    { n: 9, title: "Qoida yoki misol?", zone: "ml", note: "qoida — oddiy dastur, misol — ML" },
    { n: 10, title: "Robot nimani koʻradi?", zone: "ai", note: "shablon bilan solishtirdi — oʻrganmadi" },
    { n: 11, title: "Koʻp qatlamli tarmoq", zone: "dl", note: "neyronlar qatlam-qatlam oʻrgandi" },
  ];

  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  function makeFrom(list, type, answerOf, options, prev, rng, extra) {
    rng = rng || Math.random;
    for (;;) {
      const item = pick(list, rng);
      if (prev && prev.text === item.text) continue;
      return Object.assign({ type, text: item.text, answer: answerOf(item), options }, extra ? extra(item) : {});
    }
  }

  const makeDefTask = (prev, rng) => makeFrom(DEFS, "def", (d) => d.circle, ["ai", "ml", "dl"], prev, rng, (d) => ({ key: d.key }));
  const makeJobTask = (prev, rng) => makeFrom(JOBS, "job", (j) => j.task, TASKS.map((t) => t.id), prev, rng);
  const makeExampleTask = (prev, rng) => makeFrom(EXAMPLES, "example", (e) => e.zone, ORDER.slice(), prev, rng, (e) => ({ why: e.why, task: e.task }));

  const zoneName = (id) => (ZONES.find((z) => z.id === id) || {}).name;
  const taskName = (id) => (TASKS.find((t) => t.id === id) || {}).name;

  const api = {
    ZONES, ORDER, DEFS, TASKS, JOBS, EXAMPLES, GAMES,
    inside, zoneName, taskName, makeDefTask, makeJobTask, makeExampleTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.atlas = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

---

### 2-vazifa: Rasm va ekran qismlari

- [x] **1-qadam: `js/game-art.js`**

```js
// 12-o'yinga xos SVG rasm: buklangan xarita (kirish uchun). Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  const map = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <path d="M20 22 L70 10 L130 22 L180 10 L180 108 L130 120 L70 108 L20 120 Z" fill="#FDEFD4" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M70 10 V108 M130 22 V120" stroke="#D9C9A6" stroke-width="3"/>
  <ellipse cx="100" cy="66" rx="62" ry="40" fill="#DCE8FA" stroke="#2F6FDE" stroke-width="3"/>
  <ellipse cx="104" cy="72" rx="40" ry="28" fill="#D6F0E4" stroke="#1A9E77" stroke-width="3"/>
  <ellipse cx="108" cy="78" rx="20" ry="15" fill="#EFE0FA" stroke="#8E5BD0" stroke-width="3"/>
  <path d="M40 34 l6 6 M46 34 l-6 6" stroke="#F08A24" stroke-width="3" stroke-linecap="round"/>
</svg>`;

  const STORY = { map };
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

test("xarita rasmi: uch ichma-ich doira, matnsiz", () => {
  const svg = art.story("map");
  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  assert.equal((svg.match(/<ellipse /g) || []).length, 3);
  assert.ok(!svg.includes("<text"));
  assert.equal(art.story("yoq"), "");
});
```

- [x] **3-qadam: `js/atlas-ui.js`**

```js
// AI xaritasi: ichma-ich zonalar (yozuvlar HTML'da), kartochka va javob tugmalari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { atlas, ui, sound } = QK;

  // Xarita: oddiy dastur ⊃ AI ⊃ ML ⊃ DL. Har zonada nomi va kartochkalar joyi.
  function mapView(host) {
    const zones = {};
    let inner = null;
    for (const z of atlas.ZONES.slice().reverse()) {
      const chips = ui.h("div", { class: "zchips" });
      const box = ui.h("div", { class: `zone z-${z.id}` }, ui.h("div", { class: "zname", text: z.name }), chips);
      if (inner) box.append(inner);
      zones[z.id] = { box, chips };
      inner = box;
    }
    const el = ui.h("div", { class: "atlas" }, inner);
    host.append(el);
    return {
      el,
      // Faqat berilgan zonalar ko'rinadi (qolganlari hali "chizilmagan")
      show(ids) {
        for (const id of Object.keys(zones)) zones[id].box.classList.toggle("hidden-zone", !ids.includes(id));
      },
      highlight(id) {
        for (const key of Object.keys(zones)) zones[key].box.classList.toggle("hl", key === id);
      },
      add(id, text) {
        const chip = ui.h("span", { class: "zchip", text });
        zones[id].chips.append(chip);
        return chip;
      },
    };
  }

  // Katta matnli kartochka; key — maslahatda yoritiladigan so'z
  function card(host, text) {
    const el = ui.h("div", { class: "acard", text });
    host.append(el);
    return {
      el,
      mark(key) {
        const at = text.indexOf(key);
        if (at < 0) return;
        el.textContent = "";
        el.append(text.slice(0, at), ui.h("mark", { text: key }), text.slice(at + key.length));
      },
    };
  }

  // Javob tugmalari (ustma-ust, uzun nomlar sig'sin)
  function listButtons(options, labelOf, onPick) {
    const col = ui.h("div", { class: "alist" });
    options.forEach((value, i) => {
      col.append(ui.h("button", {
        class: `btn secondary abtn z-${value}`, type: "button", text: labelOf(value),
        onClick: () => { sound.play("tap"); onPick(i); },
      }));
    });
    ui.clearControl();
    ui.control().append(col);
  }

  const zoneLabel = (id) => {
    const z = atlas.ZONES.find((item) => item.id === id);
    return z.id === "plain" ? z.name : `${z.name} (${z.short})`;
  };

  QK.atlasUi = { mapView, card, listButtons, zoneLabel };
})(window);
```

- [x] **4-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>AI xaritasi</title>
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
  <script src="js/atlas.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="../umumiy/js/practice.js"></script>
  <script src="js/atlas-ui.js"></script>
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
/* AI xaritasi — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.abox { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }

/* ---------- Xarita: ichma-ich zonalar ---------- */
.atlas { width: 100%; max-width: 460px; }
.zone {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 10px 12px; border-radius: 28px; transition: box-shadow 0.2s;
}
.zone.hidden-zone { display: none; }
.zone.hl { box-shadow: 0 0 0 4px var(--yana); }
.z-plain { background: #F4EEE2; border: 3px dashed #B5AC98; border-radius: 16px; }
.z-ai { width: 100%; background: #DCE8FA; border: 3px solid #2F6FDE; }
.z-ml { width: 100%; background: #D6F0E4; border: 3px solid #1A9E77; }
.z-dl { width: 100%; background: #EFE0FA; border: 3px solid #8E5BD0; }
.zname { font-size: 17px; font-weight: 900; }
.z-plain > .zname { color: #7A7262; }
.z-ai > .zname { color: #2F6FDE; }
.z-ml > .zname { color: #137A5C; }
.z-dl > .zname { color: #6E3FAE; }
.zchips { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; }
.zchip { padding: 2px 8px; border-radius: 999px; background: #fff; box-shadow: 0 1px 0 var(--soya); font-size: 15px; font-weight: 800; animation: pop 0.3s; }

/* ---------- Kartochka va tugmalar ---------- */
.acard {
  max-width: 420px; padding: 14px 16px; border-radius: 14px; background: #fff; box-shadow: 0 3px 0 var(--soya);
  font-size: 21px; font-weight: 800; text-align: center;
}
.acard mark { background: #FFE3B8; color: inherit; border-radius: 4px; padding: 0 2px; }
.alist { display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 380px; }
.abtn { width: 100%; min-height: 52px; font-size: 18px; }
.abtn.z-ai { box-shadow: 0 3px 0 var(--soya), inset 5px 0 0 #2F6FDE; }
.abtn.z-ml { box-shadow: 0 3px 0 var(--soya), inset 5px 0 0 #1A9E77; }
.abtn.z-dl { box-shadow: 0 3px 0 var(--soya), inset 5px 0 0 #8E5BD0; }
.abtn.z-plain { box-shadow: 0 3px 0 var(--soya), inset 5px 0 0 #B5AC98; }

/* ---------- Vazifalar va usullar ---------- */
.tasks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; width: 100%; max-width: 360px; }
.task { padding: 18px 10px; border-radius: 14px; background: #fff; box-shadow: 0 3px 0 var(--soya); font-size: 21px; font-weight: 900; text-align: center; }
.t-korish { color: #2F6FDE; }
.t-til { color: #1A9E77; }
.t-harakat { color: #F08A24; }
.t-hisob { color: #8E5BD0; }
.ways { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 420px; }
.way { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; border-radius: 12px; background: #fff; box-shadow: 0 2px 0 var(--soya); font-size: 17px; font-weight: 700; animation: pop 0.3s; }
.way-zone { font-size: 15px; font-weight: 900; }
.way.z-plain .way-zone { color: #7A7262; }
.way.z-ml .way-zone { color: #137A5C; }
.way.z-dl .way-zone { color: #6E3FAE; }
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
  .alist { flex-direction: row; flex-wrap: wrap; max-width: none; }
  .abtn { width: auto; flex: 1 1 45%; }
  .zone { padding: 4px 8px 8px; }
  .story-art { width: min(190px, 36vh); }
}
```

---

### 3-vazifa: Sahnalar

- [x] **1-qadam: `js/scenes/common.js`**

```js
// AI xaritasi: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "abox" });
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
// Kirish va 1-bosqich: uch doira (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { atlas, ui, sound, art, atlasUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("map") }));
    await ui.say("elder", "Sen robot bilan koʻp ish qilding: misol koʻrsatding, soʻz sanatding, mukofot berding.");
    await ui.say("apprentice", "Ularning nomi bormi?");
    await ui.say("elder", "Bor! Keling, hammasini bitta xaritaga joylaymiz.");
  }

  // 4.1–4.4: zonalar birma-bir chiziladi
  async function buildMap() {
    const el = common.box(true);
    const map = atlasUi.mapView(el);
    const steps = [
      { id: "plain", chip: "kalkulyator", line: "Eng tashqarida — oddiy dastur. Kalkulyator, budilnik: qoidani bajaradi, aql talab qilmaydi." },
      { id: "ai", chip: "shaxmat dasturi", line: "Ichkarida — sunʼiy intellekt: aql talab qiladigan ish. Masalan, shaxmat dasturi yurishlarni sanab, eng yaxshisini tanlaydi." },
      { id: "ml", chip: "6–9-oʻyinlar", line: "Uning ichida — mashinali oʻrganish: qoida yozilmaydi, mashina misollardan oʻrganadi." },
      { id: "dl", chip: "11-oʻyin", line: "Eng ichkarida — chuqur oʻrganish: koʻp qatlamli neyron tarmoq bilan oʻrganadi." },
    ];
    const shown = [];
    for (const step of steps) {
      shown.push(step.id);
      map.show(shown);
      map.highlight(step.id);
      map.add(step.id, step.chip);
      sound.play("tap");
      await ui.say("elder", step.line);
    }
    map.highlight(null);
    await ui.say("elder", "Koʻrdingmi? Har doira oldingisining ichida. Chuqur oʻrganish — ham ML, ham AI.");
  }

  // 4.5: mashq — ta'rif qaysi doiraga tegishli?
  function defTask(task) {
    const el = common.box(true);
    const view = atlasUi.card(el, task.text);
    ui.bubble("elder", "Bu qaysi doira haqida?");
    return practice.tries({
      setup: (submit) => atlasUi.listButtons(task.options, atlasUi.zoneLabel, submit),
      check: (index) => task.options[index] === task.answer,
      hint: () => {
        view.mark(task.key);
        ui.bubble("elder", "↻ Belgilangan soʻzga qara: qoida, misol yoki qatlam?");
      },
      solution: () => {
        view.mark(task.key);
        el.append(common.answerLine(atlasUi.zoneLabel(task.answer)));
      },
    });
  }

  async function stage1() {
    await buildMap();
    await ui.say("elder", "Endi oʻzing top: qaysi doira haqida gap ketyapti? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => atlas.makeDefTask(prev),
      run: defTask,
      praise: (task) => `Bu — ${atlasUi.zoneLabel(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [x] **3-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: usul va vazifa (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { atlas, ui, sound, atlasUi, practice, common } = QK;

  // 5.1: vazifalar — ko'rish, til, harakat, hisob
  async function tasksIntro() {
    const el = common.box(false);
    const grid = ui.h("div", { class: "tasks" });
    for (const t of atlas.TASKS) grid.append(ui.h("div", { class: `task t-${t.id}`, text: t.name }));
    el.append(grid);
    await ui.say("elder", "Doiralar — bu usullar: ish qanday qilinadi.");
    await ui.say("elder", "Koʻrish, til, harakat, hisob esa — vazifalar: nima qilinadi.");
  }

  // 5.2: bitta vazifa — uch usul
  async function oneTaskThreeWays() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "acard", text: "Vazifa (koʻrish): rasmda krest bormi?" }));
    const ways = [
      { zone: "plain", text: "Qoida: oʻrta ustun va oʻrta qator toʻliqmi? (9-oʻyin)" },
      { zone: "ml", text: "Misol: eng oʻxshash rasmga qarab (6-oʻyin)" },
      { zone: "dl", text: "Neyron tarmoq: chiziq → shakl (11-oʻyin)" },
    ];
    const list = ui.h("div", { class: "ways" });
    el.append(list);
    for (const way of ways) {
      list.append(ui.h("div", { class: `way z-${way.zone}` },
        ui.h("span", { class: "way-zone", text: atlas.zoneName(way.zone) }),
        ui.h("span", { text: way.text })));
      sound.play("tap");
      await ui.sleep(500);
    }
    await ui.say("elder", "Vazifa bitta — koʻrish. Usul esa uch xil boʻlishi mumkin!");
    await ui.say("elder", "Shuning uchun «kompyuter koʻrish» — bu doira emas, vazifa.");
  }

  // 5.3: mashq — bu ish qaysi vazifa?
  function jobTask(task) {
    const el = common.box(true);
    atlasUi.card(el, task.text);
    ui.bubble("elder", "Bu ish qaysi vazifa?");
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        task.options.forEach((id, i) => row.append(ui.button(atlas.taskName(id), () => submit(i), i % 2 ? "secondary" : "")));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", "↻ Mashina nima qiladi: koʻradimi, gapiradimi, harakatlanadimi yoki hisoblaydimi?"),
      solution: () => el.append(common.answerLine(`Vazifa: ${atlas.taskName(task.answer)}`)),
    });
  }

  async function stage2() {
    await tasksIntro();
    await oneTaskThreeWays();
    await ui.say("elder", "Endi oʻzing ayt: bu ish qaysi vazifa? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => atlas.makeJobTask(prev),
      run: jobTask,
      praise: (task) => `Vazifa — ${atlas.taskName(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [x] **4-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: xaritani to'ldir va yakun (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { atlas, ui, sound, atlasUi, practice, common } = QK;

  // 6.1: 6–11-o'yinlar xaritada
  async function yourGames() {
    const el = common.box(true);
    const map = atlasUi.mapView(el);
    map.show(atlas.ORDER);
    ui.bubble("elder", "Oʻzing oʻynagan oʻyinlarni xaritaga qoʻyamiz.");
    await ui.sleep(700);
    for (const game of atlas.GAMES) {
      map.highlight(game.zone);
      map.add(game.zone, `${game.n}. ${game.title}`);
      sound.play("tap");
      await ui.say("elder", `${game.n}-oʻyin — ${atlas.zoneName(game.zone)}: ${game.note}.`);
    }
    map.highlight(null);
  }

  // 6.2: mashq — real misol xaritaning qayerida?
  function exampleTask(task) {
    const el = common.box(true);
    atlasUi.card(el, task.text);
    ui.bubble("elder", "Bu xaritaning qayerida?");
    return practice.tries({
      setup: (submit) => atlasUi.listButtons(task.options, atlasUi.zoneLabel, submit),
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", "↻ Savol ber: u oʻrganadimi? Oʻrgansa — koʻp qatlamli tarmoqmi? Oʻrganmasa — aql kerakmi?"),
      solution: () => el.append(common.answerLine(`${atlasUi.zoneLabel(task.answer)}: ${task.why}`)),
    });
  }

  async function wrapUp() {
    const el = common.box(false);
    const map = atlasUi.mapView(el);
    map.show(atlas.ORDER);
    for (const z of atlas.ZONES) map.add(z.id, z.short);
    await ui.say("elder", "Katta doira — sunʼiy intellekt. Ichida — misoldan oʻrganish. Eng ichida — neyron tarmoqlar.");
    await ui.say("elder", "Koʻrish, til va harakat — ular bajaradigan ishlar. Endi sen bu soʻzlarning farqini bilasan!");
  }

  async function stage3() {
    await yourGames();
    await ui.say("elder", "Endi hayotdan misollar: xaritaning qayerida? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => atlas.makeExampleTask(prev),
      run: exampleTask,
      praise: (task) => task.why,
    });
    await wrapUp();
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
    ui.bubble("elder", "Tabriklayman! Endi sen sunʼiy intellekt xaritasini bilasan!");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Oddiy dastur · AI ⊃ ML ⊃ DL" }),
        ui.h("div", { text: "ML — misoldan oʻrganish, DL — koʻp qatlamli tarmoq" }),
        ui.h("div", { text: "Koʻrish, til, harakat — vazifalar" }))));
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
// 12-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "AI xaritasi",
  storageKey: "ai-xaritasi:v1",
  stageTitles: ["Uch doira", "Usul va vazifa", "Xaritani toʻldir"],
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
  assert.equal(captured.storageKey, "ai-xaritasi:v1");
  assert.equal(captured.title, "AI xaritasi");
  assert.deepEqual(captured.stageTitles, ["Uch doira", "Usul va vazifa", "Xaritani toʻldir"]);
});
```

---

### 4-vazifa: Bosh sahifa, offline va tekshiruv

- [x] Bosh sahifa: 12-o'yin (`xarita` ikonkasi), bo'lim nomi "Koʻrish, tarmoqlar va xarita"
- [x] Offline ro'yxati: `python3 bosh/sw-royxat.py --bump`
- [x] Barcha testlar va brauzerda 5 marta to'liq o'ynab chiqish (`scratchpad/play12.js`)
- [x] Commit, main'ga birlashtirish va GitHub'ga yuklash
