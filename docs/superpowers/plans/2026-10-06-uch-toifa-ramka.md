# Uch toifa: ramka — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Saytni sinf boʻyicha uch toifaga (1–4 / 5–8 / 9–11) ajratish: har oʻyin bitta toifada, bosh sahifada almashtirgich, kattalar uchun vaqtinchalik koʻrinish.

**Architecture:** Katalog (`bosh/js/bosh.js`) har oʻyinga `toifa` beradi. Koʻrinishni `<html data-toifa>` va `data-maskot` belgilaydi: oʻyin sahifalarida ular faylga yozilgan (`bosh/tools/toifa-yoz.js` katalogdan yozadi), bosh sahifa va asboblarda `<head>` dagi `umumiy/js/toifa.js` oʻquvchi tanlovidan qoʻyadi. Kattalar uslublari `asos.css` oxirida bitta selektor ostida.

**Tech Stack:** oddiy HTML + CSS + JS (`<script>`, modul emas), Node `node --test`, Python (`bosh/sw-royxat.py`).

**Spec:** `docs/superpowers/specs/2026-10-06-uch-toifa-ramka-design.md`

## Global Constraints

- Kutubxona, yigʻish (build) yoʻq. Skriptlar oddiy `<script>`; `root.QK` ga yoziladi.
- Kod va oʻzgaruvchilar inglizcha/lotin, izohlar oʻzbekcha. Ekrandagi matnda `oʻ`, `gʻ` (U+02BB), `ʼ` (U+02BC).
- Bosiladigan narsa kamida 48×48 px; eng tor ekran 360 px, gorizontal aylantirish yoʻq.
- Toifa id lari: `boshlangich`, `orta`, `yuqori`, `hammasi`. Kalit: `qabila:toifa:v2`.
- Taqsimot: `boshlangich` — 02, 23, 26, 46, 47, 53, 62, 63, 64; `yuqori` — 38–45, 54–57; qolgani `orta` (9 / 43 / 12).
- Kattalar selektori: `:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot])`.
- Kattalar foni `#FBFAF7`, bolalar foni `#FFF6E5` (`theme-color` ham shu).
- 3D qirra, radius va oʻyin matnlari oʻzgarmaydi.
- `umumiy/` oʻzgarsa — barcha oʻyin testlari ishga tushiriladi.

---

### Task 1: `QK.toifa` — tanlovni saqlash va `<html>` ga qoʻyish

**Files:**
- Create: `oyinlar/umumiy/js/toifa.js`
- Test: `oyinlar/umumiy/tests/toifa.test.js`

**Interfaces:**
- Produces: `QK.toifa = { KALIT, IDS, oqi(): string|null, yoz(id: string): void, qolla(): void }`.
  `oqi()` — saqlangan id yoki `null`. `yoz(id)` — yozadi (notoʻgʻri id — oʻchiradi). `qolla()` — `<html data-toifa>` va `theme-color` ni tanlovga moslaydi; faylda `data-toifa` yozilgan sahifaga tegmaydi.

- [ ] **Step 1: Test yoziladi** — `oyinlar/umumiy/tests/toifa.test.js`

```js
// Toifa tanlovi: saqlash, o'qish va <html data-toifa> ga qo'yish.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("./helpers.js");

// Soxta brauzer: localStorage, <html> atributlari va theme-color meta
function yasa({ ls = {}, attrs = {}, yopiq = false } = {}) {
  const meta = { content: "#FFF6E5", setAttribute(k, v) { this[k] = v; } };
  const el = {
    hasAttribute: (k) => k in attrs,
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    setAttribute: (k, v) => { attrs[k] = v; },
    removeAttribute: (k) => { delete attrs[k]; },
  };
  const store = {
    getItem: (k) => (k in ls ? ls[k] : null),
    setItem: (k, v) => { ls[k] = String(v); },
    removeItem: (k) => { delete ls[k]; },
  };
  const win = { document: { documentElement: el, querySelector: () => meta } };
  Object.defineProperty(win, "localStorage", { get() { if (yopiq) throw new Error("yopiq"); return store; } });
  loadScript(path.join(__dirname, "../js/toifa.js"), win);
  return { T: win.QK.toifa, ls, attrs, meta };
}

test("oqi: faqat ma'lum id; yoz → oqi; eski kalit o'chadi", () => {
  const { T, ls } = yasa({ ls: { "qabila:toifa:v1": "katta", "qabila:toifa:v2": "nimadir" } });
  assert.equal(T.KALIT, "qabila:toifa:v2");
  assert.deepEqual(T.IDS, ["boshlangich", "orta", "yuqori", "hammasi"]);
  assert.equal(T.oqi(), null);
  T.yoz("orta");
  assert.equal(T.oqi(), "orta");
  assert.ok(!("qabila:toifa:v1" in ls));
  T.yoz("");
  assert.equal(T.oqi(), null);
});

test("yuklanganda tanlov <html> ga qo'yiladi; kattalarda theme-color almashadi", () => {
  const a = yasa({ ls: { "qabila:toifa:v2": "yuqori" } });
  assert.equal(a.attrs["data-toifa"], "yuqori");
  assert.equal(a.meta.content, "#FBFAF7");
  const b = yasa({ ls: { "qabila:toifa:v2": "boshlangich" } });
  assert.equal(b.attrs["data-toifa"], "boshlangich");
  assert.equal(b.meta.content, "#FFF6E5");
});

test("hammasi va tanlov yo'q — atribut qo'yilmaydi (bolalar ko'rinishi)", () => {
  assert.ok(!("data-toifa" in yasa().attrs));
  const h = yasa({ ls: { "qabila:toifa:v2": "hammasi" } });
  assert.ok(!("data-toifa" in h.attrs));
  h.T.yoz("orta"); h.T.qolla();
  assert.equal(h.attrs["data-toifa"], "orta");
  h.T.yoz("hammasi"); h.T.qolla();
  assert.ok(!("data-toifa" in h.attrs));
  assert.equal(h.meta.content, "#FFF6E5");
});

test("faylda yozilgan data-toifa (o'yin sahifasi) o'zgarmaydi", () => {
  const { T, attrs, meta } = yasa({ ls: { "qabila:toifa:v2": "yuqori" }, attrs: { "data-toifa": "boshlangich" } });
  T.qolla();
  assert.equal(attrs["data-toifa"], "boshlangich");
  assert.equal(meta.content, "#FFF6E5");
});

test("xotira yopiq bo'lsa xato tashlamaydi", () => {
  const { T, attrs } = yasa({ yopiq: true });
  assert.equal(T.oqi(), null);
  T.yoz("orta");
  T.qolla();
  assert.ok(!("data-toifa" in attrs));
});
```

- [ ] **Step 2: Test yiqilishini koʻrish**

Run: `node --test oyinlar/umumiy/tests/toifa.test.js`
Expected: FAIL — `ENOENT … toifa.js`

- [ ] **Step 3: `oyinlar/umumiy/js/toifa.js`**

```js
// Toifa — o'quvchi tanlagan sinf guruhi: boshlangich (1–4), orta (5–8), yuqori (9–11); "hammasi" — o'qituvchi.
// <head> da ulanadi (bosh sahifa va asboblar): tanlovni <html data-toifa> ga sahifa chizilishidan OLDIN
// qo'yadi — sahifa avval bolalar ko'rinishida chiqib, keyin almashmaydi.
// O'yin sahifalarida atribut faylning o'zida yozilgan (o'yinning o'z toifasi) — unga tegilmaydi.
(function (root) {
  "use strict";

  const KALIT = "qabila:toifa:v2";
  const ESKI = "qabila:toifa:v1"; // yosh bo'yicha (8–11 / 12–16) edi — sinflarga to'g'ri kelmaydi
  const IDS = ["boshlangich", "orta", "yuqori", "hammasi"];
  const BOLA_FON = "#FFF6E5";
  const KATTA_FON = "#FBFAF7"; // asos.css dagi kattalar --fon bilan bir xil

  const el = root.document ? root.document.documentElement : null;
  const yozilgan = !!(el && el.hasAttribute("data-toifa"));

  function oqi() {
    try {
      const v = root.localStorage.getItem(KALIT);
      return IDS.includes(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function yoz(id) {
    try {
      if (IDS.includes(id)) root.localStorage.setItem(KALIT, id);
      else root.localStorage.removeItem(KALIT);
      root.localStorage.removeItem(ESKI);
    } catch (e) { /* xotira yopiq — tanlov faqat shu sahifada amal qiladi */ }
  }

  // "hammasi" va tanlov yo'q — atributsiz, ya'ni bolalar ko'rinishi
  function qolla() {
    if (!el || yozilgan) return;
    const id = oqi();
    const katta = id === "orta" || id === "yuqori";
    if (id && id !== "hammasi") el.setAttribute("data-toifa", id);
    else el.removeAttribute("data-toifa");
    const meta = root.document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", katta ? KATTA_FON : BOLA_FON);
  }

  root.QK = root.QK || {};
  root.QK.toifa = { KALIT, IDS, oqi, yoz, qolla };
  qolla();
})(window);
```

- [ ] **Step 4:** Run: `node --test oyinlar/umumiy/tests/toifa.test.js` — Expected: 5 ta PASS
- [ ] **Step 5: Commit** — `git add oyinlar/umumiy/js/toifa.js oyinlar/umumiy/tests/toifa.test.js && git commit -m "Toifa: tanlovni saqlash va <html data-toifa> ga qoʻyish (QK.toifa)"`

---

### Task 2: Katalog — har oʻyin bitta toifada

**Files:**
- Modify: `bosh/js/bosh.js` (`TOIFALAR`, `GAMES`/`MASHQLAR`/`CONTESTS` maydonlari, `mos`, `yoshYorligi` → `toifaYorligi`, eksport)
- Test: `bosh/tests/bosh.test.js`

**Interfaces:**
- Produces: `QK.bosh.TOIFALAR` — `{ id, title, qisqa, sarlavha, note }`; `GAMES[i].toifa: string`; `MASHQLAR[i].toifalar`, `CONTESTS[i].toifalar: string[]`; `mos(item, toifa): boolean`; `toifaYorligi(item): string` (`"5–8"`; asbobda `""`); `oyinlar(toifa)`, `number(game, toifa)` — oʻzgarmaydi.

- [ ] **Step 1: Testlar** — `bosh/tests/bosh.test.js` da 13-satrdagi importni va toifa testlarini almashtirish.

13-satr:
```js
const { GAMES, SECTIONS, CONTESTS, MASHQLAR, TOIFALAR, mos, oyinlar, toifaYorligi, number } = win.QK.bosh;
const toifa = (id) => TOIFALAR.find((t) => t.id === id);
```

`"har toifada raqamlar 1 dan ketma-ket…"` testining oxirgi ikki satri oʻrniga:
```js
  assert.equal(number(GAMES.find((g) => g.dir === "23-on-barmoq"), toifa("boshlangich")), 1, "klaviatura — birinchi");
```

`"har bo'limda kamida bitta o'yin bor…"` testida `katta` oʻrniga `toifa("yuqori")` (xabar: `"yuqori toifada hamma bo'lim to'lgan — filtr ishlamayaptimi?"`).

`"yosh oralig'i: …"` va `"ikki toifada turadigan…"` testlari oʻrniga:
```js
const UCH = ["boshlangich", "orta", "yuqori"];

test("toifa: har o'yin aynan bitta toifada, taqsimot 9 / 43 / 12", () => {
  for (const g of GAMES) assert.ok(UCH.includes(g.toifa), g.dir + ": " + g.toifa);
  const soni = (id) => oyinlar(toifa(id)).length;
  assert.deepEqual(UCH.map(soni), [9, 43, 12]);
  assert.equal(soni("hammasi"), GAMES.length);
  assert.deepEqual(GAMES.filter((g) => g.toifa === "boshlangich").map((g) => g.n).sort((a, b) => a - b), [2, 23, 26, 46, 47, 53, 62, 63, 64]);
  assert.deepEqual(GAMES.filter((g) => g.toifa === "yuqori").map((g) => g.n).sort((a, b) => a - b), [38, 39, 40, 41, 42, 43, 44, 45, 54, 55, 56, 57]);
  // Blok qoidalari: sun'iy intellekt va Python — 5–8; kombinatorika va C++ — 9–11
  for (const g of GAMES) {
    if (["ai", "ai2", "python"].includes(g.topic)) assert.equal(g.toifa, "orta", g.dir);
    if (["kombinatorika", "cpp"].includes(g.topic)) assert.equal(g.toifa, "yuqori", g.dir);
  }
  assert.equal(toifaYorligi(GAMES.find((g) => g.n === 38)), "9–11");
  assert.equal(toifaYorligi(MASHQLAR[0]), "");
});

test("asbob va musobaqalar: toifalar ro'yxati bor va to'g'ri", () => {
  for (const item of [...MASHQLAR, ...CONTESTS]) {
    assert.ok(Array.isArray(item.toifalar) && item.toifalar.length > 0, item.dir);
    for (const id of item.toifalar) assert.ok(UCH.includes(id), item.dir + ": " + id);
    assert.ok(mos(item, toifa("hammasi")), item.dir);
  }
  const kim = (dir) => [...MASHQLAR, ...CONTESTS].find((x) => x.dir === dir).toifalar;
  assert.deepEqual(kim("masalalar"), ["orta", "yuqori"]);
  assert.deepEqual(kim("cpp-shpargalka"), ["yuqori"]);
  assert.deepEqual(kim("tank-onlayn"), ["orta", "yuqori"]);
  assert.deepEqual(kim("tog"), ["boshlangich", "orta"]);
  assert.deepEqual(kim("poyga"), UCH);
});
```

- [ ] **Step 2:** Run: `node --test bosh/tests/bosh.test.js` — Expected: FAIL (`toifaYorligi is not a function`, `g.toifa` undefined)

- [ ] **Step 3: `bosh/js/bosh.js`**

Fayl boshidagi izoh (4–5-satrlar):
```js
// toifa — o'yin qaysi sinf guruhiga tegishli: boshlangich (1–4), orta (5–8), yuqori (9–11).
// Har o'yin AYNAN BITTA toifada. Asbob va musobaqalarda toifalar: [...] — ular bir nechtasida ko'rinadi.
```

`TOIFALAR`:
```js
  // O'quvchi kirishda sinfini tanlaydi; "hammasi" — o'qituvchi uchun (hech narsa yashirilmaydi).
  // id lar umumiy/js/toifa.js dagi IDS bilan bir xil.
  const TOIFALAR = [
    { id: "boshlangich", title: "1–4-sinf", qisqa: "1–4", sarlavha: "Qabila maktabi", note: "Klaviatura, robotga buyruq va sirli xabarlar" },
    { id: "orta", title: "5–8-sinf", qisqa: "5–8", sarlavha: "5–8-sinf informatikasi", note: "Kod, sonlar, internet, sunʼiy intellekt va Python" },
    { id: "yuqori", title: "9–11-sinf", qisqa: "9–11", sarlavha: "Olimpiada dasturlash", note: "Algoritmlar, kombinatorika, C++ va masalalar" },
    { id: "hammasi", title: "Hammasi", qisqa: "hammasi", sarlavha: "Qabila maktabi", note: "Oʻqituvchi uchun — barcha oʻyinlar" },
  ];
```

`GAMES` — bir martalik almashtirish:
```bash
node -e '
const fs = require("fs"); const p = "bosh/js/bosh.js"; let s = fs.readFileSync(p, "utf8");
const B = ["02","23","26","46","47","53","62","63","64"], Y = ["38","39","40","41","42","43","44","45","54","55","56","57"];
s = s.replace(/(dir: "(\d\d)-[^\n]*?)yosh: \[\d+, \d+\]/g, (m, a, n) => a + `toifa: "${B.includes(n) ? "boshlangich" : Y.includes(n) ? "yuqori" : "orta"}"`);
fs.writeFileSync(p, s);'
```

`MASHQLAR` / `CONTESTS` — `yosh: [...]` oʻrniga: `masalalar` → `toifalar: ["orta", "yuqori"]`; `cpp-shpargalka` → `["yuqori"]`; `musobaqa`, `tog` → `["boshlangich", "orta"]`; `poyga`, `onlayn`, `yozuv-poygasi` → `["boshlangich", "orta", "yuqori"]`; `tank-duel`, `tank-onlayn` → `["orta", "yuqori"]`.

`mos` va yorliq (`yoshYorligi` oʻrniga):
```js
  // O'yin shu toifadami: "hammasi" — har doim; o'yinda bitta toifa, asbob va musobaqada ro'yxat
  const mos = (item, toifa) => toifa.id === "hammasi" || (item.toifa ? item.toifa === toifa.id : item.toifalar.includes(toifa.id));
  const toifaById = (id) => TOIFALAR.find((t) => t.id === id) || null;
  const toifaYorligi = (item) => (item.toifa ? toifaById(item.toifa).qisqa : "");
```
Eksportda `yoshYorligi` → `toifaYorligi`. Kartalardagi `yoshYorligi(...)` chaqiruvlari 3-vazifada almashtiriladi; shu vazifada test oʻtishi uchun ularni `toifaYorligi(...)` ga oʻzgartirish kifoya.

- [ ] **Step 4:** Run: `node --test bosh/tests/bosh.test.js` — Expected: PASS
- [ ] **Step 5: Commit** — `git commit -am "Katalog: har oʻyin bitta toifada (1–4 / 5–8 / 9–11), asbob va musobaqalarda toifalar roʻyxati"`

---

### Task 3: Bosh sahifa — sinf tanlash va almashtirgich

**Files:**
- Modify: `bosh/js/bosh.js` (`saqlangan`, `saqla`, `card`, `yoshEkrani` → `sinfEkrani`, `royxat`), `bosh/style.css`, `index.html`

**Interfaces:**
- Consumes: `QK.toifa.oqi()`, `QK.toifa.yoz(id)`, `QK.toifa.qolla()` (Task 1); `TOIFALAR[i].sarlavha`, `toifaYorligi` (Task 2).

- [ ] **Step 1: `index.html`** — `<meta name="theme-color" …>` dan keyin `<script src="oyinlar/umumiy/js/toifa.js"></script>`; `<p class="bosh-sub">…</p>` → `<div class="bosh-sub">…</div>` (ichiga tugmalar guruhi qoʻyiladi).

- [ ] **Step 2: `bosh/js/bosh.js`** — saqlash `QK.toifa` orqali (`KALIT`, `try/catch` bloklari oʻchadi):

```js
  // Tanlov umumiy/js/toifa.js da saqlanadi (bosh sahifa uni <head> da ulaydi); ko'rinish ham shu yerda yangilanadi
  const saqlangan = () => toifaById(root.QK.toifa.oqi());
  function saqla(id) {
    root.QK.toifa.yoz(id);
    root.QK.toifa.qolla();
  }
```

`card(game, toifa, davom)` oxirgi qatori — yorliq faqat "Hammasi" da:
```js
      h("span", { class: "bosh-state" }, progress, toifa.id === "hammasi" ? h("span", { class: "bosh-age", text: toifaYorligi(game) }) : null, game.pc ? pcBelgi() : null));
```
Mashqlar kartasida: `h("span", { class: "bosh-state" }, m.pc ? pcBelgi() : null)`.

Kirish ekrani:
```js
  const sarlavha = (matn) => {
    const el = root.document.querySelector(".bosh-title");
    if (el) el.textContent = matn;
  };
  const tanla = (id) => {
    saqla(id);
    render();
    root.scrollTo({ top: 0 });
  };

  // Kirish ekrani: o'quvchi sinfini tanlaydi. Tanlov saqlanadi; keyin almashtirgich bilan o'zgartiriladi.
  function sinfEkrani(list) {
    const bubble = root.document.querySelector(".bubble");
    if (bubble) bubble.textContent = "Salom! Nechanchi sinfda oʻqiysan?";
    sarlavha("Qabila maktabi");
    const sub = root.document.querySelector(".bosh-sub");
    if (sub) sub.textContent = "Informatika oʻyinlari";
    const top = root.document.querySelector(".bosh-top");
    if (top) top.classList.remove("royxat");
    const tanlov = h("div", { class: "bosh-sinf" });
    for (const t of TOIFALAR) {
      const b = h("button", { class: "bosh-sinf-btn" + (t.id === "hammasi" ? " kichik" : ""), type: "button" },
        h("span", { class: "bosh-sinf-nom", text: t.title }),
        h("span", { class: "bosh-sinf-izoh", text: t.note }),
        h("span", { class: "bosh-sinf-soni", text: oyinlar(t).length + " ta oʻyin" }));
      b.addEventListener("click", () => tanla(t.id));
      tanlov.append(b);
    }
    list.append(h("section", { class: "bosh-section" }, tanlov));
  }

  // Almashtirgich: sarlavha ostida doim ko'rinadi, bir bosishda boshqa toifaga o'tadi
  function almashtirgich(joriy) {
    const guruh = h("div", { class: "bosh-toifa", role: "group", "aria-label": "Sinf" });
    for (const t of TOIFALAR.filter((x) => x.id !== "hammasi")) {
      const b = h("button", { class: "bosh-toifa-btn", type: "button", "aria-pressed": String(t.id === joriy.id), text: t.title });
      b.addEventListener("click", () => tanla(t.id));
      guruh.append(b);
    }
    const hamma = h("button", { class: "bosh-toifa-hamma", type: "button", "aria-pressed": String(joriy.id === "hammasi"), text: "Hammasi" });
    hamma.addEventListener("click", () => tanla("hammasi"));
    return h("div", { class: "bosh-toifa-qator" }, guruh, hamma);
  }
```

`royxat(list, toifa)` boshi (`sub` bloki oʻrniga):
```js
    sarlavha(toifa.sarlavha);
    const sub = root.document.querySelector(".bosh-sub");
    if (sub) {
      sub.innerHTML = "";
      sub.append(almashtirgich(toifa));
    }
```
`render()` da `yoshEkrani(list)` → `sinfEkrani(list)`.

- [ ] **Step 3: `bosh/style.css`** — `.bosh-yosh*` qoidalari `.bosh-sinf*` ga qayta nomlanadi; `.bosh-almash` oʻrniga:

```css
/* Toifa almashtirgich: sarlavha ostida doim ko'rinadi; "Hammasi" — o'qituvchi uchun, alohida */
.bosh-toifa-qator { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2); }
.bosh-toifa { display: inline-flex; border: 2px solid var(--chiziq-kuchli); border-radius: var(--r-pill); background: var(--yuza); overflow: hidden; }
.bosh-toifa-btn {
  min-height: 48px; padding: 6px 12px; border: 0; border-left: 2px solid var(--chiziq); background: transparent;
  font: inherit; font-size: var(--t-1); font-weight: 800; color: var(--matn-2); white-space: nowrap;
}
.bosh-toifa-btn:first-child { border-left: 0; }
.bosh-toifa-btn[aria-pressed="true"] { background: var(--asosiy); color: #fff; }
.bosh-toifa-hamma {
  min-height: 48px; padding: 6px 12px; border: 2px dashed var(--chiziq-kuchli); border-radius: var(--r-pill); background: transparent;
  font: inherit; font-size: var(--t-1); font-weight: 800; color: var(--matn-3);
}
.bosh-toifa-hamma[aria-pressed="true"] { border-style: solid; border-color: var(--asosiy); color: var(--asosiy-matn); }
.bosh-toifa-btn:focus-visible { outline-offset: -3px; }
```
Izohlardagi "Yosh" soʻzlari "Sinf" ga toʻgʻrilanadi.

- [ ] **Step 4:** Run: `node --test bosh/tests/*.test.js` — Expected: PASS
- [ ] **Step 5: Commit** — `git commit -am "Bosh sahifa: sinf tanlash ekrani va doim koʻrinadigan toifa almashtirgich"`

---

### Task 4: Oʻyin sahifalari — `data-toifa` va `data-maskot` faylda

**Files:**
- Create: `bosh/tools/toifa-yoz.js`
- Modify: `oyinlar/NN-*/index.html` (64 ta, asbob yozadi)
- Test: `bosh/tests/bosh.test.js`

**Interfaces:**
- Consumes: `QK.bosh.GAMES[i].toifa` (Task 2).
- Produces: `require("bosh/tools/toifa-yoz.js")` → `{ maskotKerak(dir: string): boolean, kattami(game): boolean, yoz(): number }`. `maskotKerak` — oʻyin papkasi nomi (`"01-qabila-kodlari"`); `kattami` — oʻyin kattalar koʻrinishidami; `yoz()` — oʻzgargan fayllar soni.

- [ ] **Step 1: Testlar** — `bosh/tests/bosh.test.js` oxiriga:

```js
// Ko'rinish <html> atributlaridan olinadi va o'yin faylida YOZILGAN bo'ladi (JS kutilmaydi).
// Atributlarni bosh/tools/toifa-yoz.js katalogdan yozadi: node bosh/tools/toifa-yoz.js
const { maskotKerak, kattami } = require("../tools/toifa-yoz.js");

test("o'yin sahifasi: data-toifa katalogga teng, data-maskot — faqat qog'oz/baraban ishlatadiganlarda", () => {
  for (const g of GAMES) {
    const html = fs.readFileSync(path.join(ROOT, "oyinlar", g.dir, "index.html"), "utf8");
    const teg = html.match(/<html[^>]*>/)[0];
    assert.equal((teg.match(/data-toifa="([^"]*)"/) || [])[1], g.toifa, g.dir);
    assert.equal(/\sdata-maskot[\s>]/.test(teg), maskotKerak(g.dir), g.dir + ": data-maskot");
    assert.match(html, new RegExp('name="theme-color" content="' + (kattami(g) ? "#FBFAF7" : "#FFF6E5") + '"'), g.dir);
  }
  const maskotli = GAMES.filter((g) => maskotKerak(g.dir)).map((g) => g.n).sort((a, b) => a - b);
  assert.deepEqual(maskotli, [1, 2, 3], "qog'oz yoki baraban ishlatadigan o'yinlar");
});
```

- [ ] **Step 2:** Run: `node --test bosh/tests/bosh.test.js` — Expected: FAIL (`Cannot find module '../tools/toifa-yoz.js'`)

- [ ] **Step 3: `bosh/tools/toifa-yoz.js`**

```js
#!/usr/bin/env node
// O'yin sahifalariga ko'rinish atributlarini katalogdan yozadi:
//   <html lang="uz" data-toifa="orta">  yoki  <html lang="uz" data-toifa="orta" data-maskot>
// va <meta name="theme-color"> ni shunga moslaydi. Bu yig'ish (build) emas — bir martalik yozuv:
// o'yin toifasi o'zgarsa yoki yangi o'yin qo'shilsa ishga tushiriladi (loyiha ildizida):
//   node bosh/tools/toifa-yoz.js
// Tekshiruvi: node --test bosh/tests/bosh.test.js
const fs = require("node:fs");
const path = require("node:path");
const { loadScript } = require("../../oyinlar/umumiy/tests/helpers.js");

const ROOT = path.join(__dirname, "../..");
const BOLA_FON = "#FFF6E5";
const KATTA_FON = "#FBFAF7";

const jsFayllar = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? jsFayllar(p) : e.name.endsWith(".js") ? [p] : [];
}) : []);

// O'yin shogirdning qog'ozi yoki barabanini HAQIQATAN ishlatadimi (ui.paper("") — faqat tozalash, hisobga kirmaydi).
// Bunday o'yin qahramonsiz tushunarsiz — toifasidan qat'i nazar bolalar ko'rinishida qoladi.
function maskotKerak(dir) {
  return jsFayllar(path.join(ROOT, "oyinlar", dir, "js")).some((p) => {
    const src = fs.readFileSync(p, "utf8");
    if (/raisePaper\(|"drum"/.test(src)) return true;
    return (src.match(/ui\.paper\([^)]*\)/g) || []).some((m) => !/^ui\.paper\(\s*""\s*\)$/.test(m));
  });
}

const kattami = (game) => game.toifa !== "boshlangich" && !maskotKerak(game.dir);

function yoz() {
  const win = {};
  loadScript(path.join(ROOT, "bosh/js/bosh.js"), win);
  let soni = 0;
  for (const game of win.QK.bosh.GAMES) {
    const p = path.join(ROOT, "oyinlar", game.dir, "index.html");
    const eski = fs.readFileSync(p, "utf8");
    const teg = `<html lang="uz" data-toifa="${game.toifa}"${maskotKerak(game.dir) ? " data-maskot" : ""}>`;
    const yangi = eski
      .replace(/<html[^>]*>/, teg)
      .replace(/(<meta name="theme-color" content=")[^"]*(")/, `$1${kattami(game) ? KATTA_FON : BOLA_FON}$2`);
    if (yangi !== eski) {
      fs.writeFileSync(p, yangi);
      soni++;
    }
  }
  return soni;
}

module.exports = { maskotKerak, kattami, yoz };
if (require.main === module) console.log(`toifa-yoz: ${yoz()} ta fayl yangilandi`);
```

- [ ] **Step 4:** Run: `node bosh/tools/toifa-yoz.js` — Expected: `toifa-yoz: 64 ta fayl yangilandi`; qayta ishga tushirilsa — `0 ta`.
- [ ] **Step 5:** Run: `node --test bosh/tests/bosh.test.js` — Expected: PASS
- [ ] **Step 6: Commit** — `git add -A bosh/tools bosh/tests oyinlar && git commit -m "Oʻyin sahifalari: data-toifa va data-maskot faylda yozilgan (bosh/tools/toifa-yoz.js)"`

---

### Task 5: Kattalar koʻrinishi

**Files:**
- Modify: `oyinlar/umumiy/css/asos.css` (oxiriga boʻlim), `bosh/style.css` (oxiriga), `oyinlar/umumiy/js/ui.js` (`celebrate`), `oyinlar/{masalalar,cpp-shpargalka,tank-duel,tank-onlayn}/index.html` (`<head>`)
- Test: `oyinlar/umumiy/tests/toifa.test.js`

**Interfaces:**
- Produces: `QK.ui.kattalar(el?): boolean` — sahifa kattalar koʻrinishidami (`el` — `<html>`, sukut boʻyicha `document.documentElement`).

- [ ] **Step 1: Test** — `oyinlar/umumiy/tests/toifa.test.js` oxiriga:

```js
// ui.js: kattalar ko'rinishi sharti asos.css dagi selektor bilan bir xil
test("ui.kattalar: orta/yuqori va data-maskot yo'q", () => {
  const win = {};
  loadScript(path.join(__dirname, "../js/ui.js"), win);
  const el = (attrs) => ({ getAttribute: (k) => (k in attrs ? attrs[k] : null), hasAttribute: (k) => k in attrs });
  assert.equal(win.QK.ui.kattalar(el({})), false);
  assert.equal(win.QK.ui.kattalar(el({ "data-toifa": "boshlangich" })), false);
  assert.equal(win.QK.ui.kattalar(el({ "data-toifa": "orta" })), true);
  assert.equal(win.QK.ui.kattalar(el({ "data-toifa": "yuqori" })), true);
  assert.equal(win.QK.ui.kattalar(el({ "data-toifa": "orta", "data-maskot": "" })), false);
});
```

- [ ] **Step 2:** Run: `node --test oyinlar/umumiy/tests/toifa.test.js` — Expected: FAIL (`kattalar is not a function`)

- [ ] **Step 3: `oyinlar/umumiy/js/ui.js`** — `celebrate` dan oldin:

```js
  // Kattalar ko'rinishi (5–8, 9–11): shart asos.css oxiridagi bo'lim selektori bilan bir xil
  function kattalar(el) {
    const html = el || document.documentElement;
    const t = html.getAttribute("data-toifa");
    return !!t && t !== "boshlangich" && !html.hasAttribute("data-maskot");
  }
```
`celebrate(big)` ichida `lastParty = now;` dan keyin:
```js
    if (kattalar()) { // konfeti yo'q — faqat katta ✓
      if (big && !host.querySelector(".ok-belgi")) {
        host.append(h("div", { class: "ok-belgi", "aria-hidden": "true", text: "✓" }));
        setTimeout(() => host.querySelectorAll(".ok-belgi").forEach((e) => e.remove()), 1000);
      }
      return;
    }
```
Eksportga `kattalar` qoʻshiladi.

- [ ] **Step 4: `oyinlar/umumiy/css/asos.css`** — fayl oxiriga:

```css
/* ================= Kattalar ko'rinishi (5–8 va 9–11) — VAQTINCHALIK =================
   Shart: <html data-toifa="orta|yuqori"> va data-maskot YO'Q (qog'oz/baraban ishlatadigan o'yin bolalar
   ko'rinishida qoladi). O'yinlarda atribut faylda yozilgan (bosh/tools/toifa-yoz.js), bosh sahifa va asboblarda
   umumiy/js/toifa.js qo'yadi. Bu bo'lim faqat bolalarcha belgilarni olib tashlaydi: qum fon, dumaloq shrift,
   qahramonlar, pufak dumi. 3D qirra va radius o'zgarmaydi — o'yinlarning o'z CSS'larida qattiq yozilgan.
   Haqiqiy dizayn — 5–8 bosqichida. */
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) {
  --fon: #FBFAF7; --matn: #1E2230; --pufak: #FFFFFF;
  --matn-2: #55524A; --matn-3: #6A665C;
  --yuza: #FFFFFF; --yuza-2: #F6F4EE; --panel: #F1EEE6;
  --chiziq: #DAD6CB; --chiziq-kuchli: #8B8676; --soya: #DAD6CB; --oq-qora: #DAD6CB;
}
:root[data-toifa="yuqori"]:not([data-maskot]) {
  --asosiy: #33408A; --asosiy-qora: #232D63; --asosiy-matn: #33408A; --asosiy-och: #E8EAF6;
}
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
/* Qahramonlar yo'q: ko'rsatma — oddiy panel; yotiq holatda chap ustunning tepasida */
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .zone-stage .actor { display: none; }
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .zone-stage {
  grid-template-columns: minmax(0, 1fr); grid-template-areas: "bubble"; align-content: start;
}
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .bubble { border-width: 1px; box-shadow: none; font-weight: 600; }
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .bubble::after { display: none; }
/* Ikki ovoz: oqsoqol — asosiy matn (yorliqsiz), shogird gapi — och ko'k panel va "Shogird" yozuvi */
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .bubble.from-apprentice::before {
  content: "Shogird"; display: block; margin-bottom: 2px; font-size: var(--t-1); font-weight: 800; color: var(--matn-2);
}
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .bubble.from-apprentice:not(.ok):not(.yana) {
  background: var(--asosiy-och); border-color: var(--asosiy);
}
```

- [ ] **Step 5: `bosh/style.css`** — fayl oxiriga:

```css
/* Kattalar ko'rinishi (asos.css oxiridagi bo'lim bilan bir xil shart): qahramonlar va pufak yo'q */
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .bosh-actors,
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .bosh-top .bubble { display: none; }
:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot]) .bosh-title { font-weight: 800; }
```

- [ ] **Step 6: asboblar** — `oyinlar/masalalar/index.html`, `oyinlar/cpp-shpargalka/index.html`, `oyinlar/tank-duel/index.html`, `oyinlar/tank-onlayn/index.html`: `<meta name="theme-color" content="#FFF6E5">` dan keyingi satrga `<script src="../umumiy/js/toifa.js"></script>`.

- [ ] **Step 7:** Run: `node --test oyinlar/umumiy/tests/*.test.js bosh/tests/*.test.js` — Expected: PASS
- [ ] **Step 8: Commit** — `git commit -am "Kattalar koʻrinishi (vaqtinchalik): oq-iliq fon, tizim shrifti, qahramonsiz panel, konfeti oʻrniga ✓"`

---

### Task 6: Hujjatlar, offline roʻyxati, toʻliq tekshiruv

**Files:**
- Modify: `QOIDALAR.md` (§2, §9), `README.md`, `bosh/DIZAYN.md`, `sw.js` (asbob orqali)

- [ ] **Step 1: `QOIDALAR.md`**
  - §2 "Yosh" bandi → uch toifa: 1–4-sinf (asosiy, bolalar koʻrinishi), 5–8, 9–11; kartada yosh yozilmaydi.
  - §9: "Yosh toifalari" bandi → "Toifalar": har oʻyinda `toifa`, **aynan bitta toifada**; asbob va musobaqada `toifalar`; yangi oʻyin qoʻshilgach `node bosh/tools/toifa-yoz.js`; koʻrinish `<html data-toifa>` + `data-maskot` dan; kattalar oʻyinida `ui.paper` ga matn yozilmaydi (aks holda oʻyin bolalar koʻrinishida qoladi).
  - §9 "Bosh sahifadagi tartib" bandida "tanlangan yosh toifasi" → "tanlangan toifa".
- [ ] **Step 2: `README.md`, `bosh/DIZAYN.md`** — yosh toifalari tilga olingan joylar yangi toifalarga moslanadi; `DIZAYN.md` ga "Toifalar va almashtirgich" boʻlimi (spec'ga havola bilan).
- [ ] **Step 3:** Run: `python3 bosh/sw-royxat.py --bump` — Expected: `sw.js: … ta yozuv, kesh nomi v101`
- [ ] **Step 4: Toʻliq testlar**

```bash
node --test bosh/tests/*.test.js oyinlar/umumiy/tests/*.test.js
for d in oyinlar/*/; do [ -d "$d/tests" ] && (cd "$d" && node --test tests/*.test.js >/dev/null 2>&1 || echo "YIQILDI: $d"); done
```
Expected: hammasi PASS, `YIQILDI` satri yoʻq.

- [ ] **Step 5: Brauzer koʻrigi (bitta, yakuniy)** — mahalliy serverda: bosh sahifa uch toifada va 360 px da; `27-birinchi-buyruq` (orta), `54-cpp-birinchi-dastur` (yuqori), `01-qabila-kodlari` (maskotli), `masalalar`. Tekshiriladi: gorizontal aylantirish yoʻq, almashtirgich ishlaydi, kattalarda qahramon yoʻq, shogird gapida "Shogird" yozuvi bor.
- [ ] **Step 6: Commit va push** — `git commit -am "Toifalar: qoidalar va hujjatlar; sw v101"`; `main` ga birlashtirish, `git push`.
