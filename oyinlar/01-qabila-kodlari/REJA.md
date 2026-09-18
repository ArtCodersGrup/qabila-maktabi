# 01 — Qabila kodlari: ish rejasi

> **Agentlar uchun:** bu rejani bajarishda `superpowers:subagent-driven-development` (tavsiya) yoki `superpowers:executing-plans` skill'idan foydalaning. Qadamlar `- [ ]` belgisi bilan kuzatiladi.

**Maqsad:** 8–12 yoshli bolalar uchun "Qabila kodlari" 2D brauzer o'yinini yasash: 3 bosqich (aynan i harfli so'zlar, i harfgacha so'zlar, eng kamida nechta harf), final (0 va 1) va tabrik ekrani.

**Arxitektura:** Bitta `index.html`, oddiy `<script>` fayllar (modul emas). Har bir fayl `window.QK` ga o'z qismini yozadi: `QK.logic` (sof hisob, Node'da test qilinadi), `QK.storage`, `QK.sound`, `QK.art` (SVG satrlar), `QK.ui` (ekran elementlari va kutish), `QK.common` + `QK.scenes` (bosqichlar ssenariysi), `main.js` (bosh ekran va oqim). Sahnalar `async` funksiyalar: har bir `await` bolaning bosishini kutadi. Bosh ekranga qaytilganda eski sahna "muzlaydi" — uning promise'lari hech qachon hal bo'lmaydi.

**Texnologiya:** HTML, CSS, JavaScript (ES2017+), SVG, Web Audio. Testlar: Node `node:test` (Node 26 o'rnatilgan). Brauzer tekshiruvi: Playwright MCP (skrinshotlar).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Bajaruvchi ikkalasini ham o'qiydi.

## Umumiy cheklovlar

Har bir vazifa shu cheklovlarga amal qiladi:

- Kutubxona, yig'ish (build), `npm install` — **yo'q**. Skriptlar oddiy `<script src>` bilan ulanadi. `index.html` ikki marta bosib ochilganda ham ishlaydi.
- O'yin ishlashi uchun internet **kerak emas** (shrift ham lokal fayl).
- Ekrandagi barcha matn **o'zbek tilida, lotin yozuvida**; `oʻ`, `gʻ` uchun **ʻ (U+02BB)** ishlatiladi. Bolaga "sen" deb murojaat qilinadi.
- Kod nomlari (fayllar, funksiyalar, o'zgaruvchilar) **inglizcha**, kod ichidagi izohlar **o'zbekcha**.
- Bosiladigan har bir element kamida **48×48 px**. Hover'ga bog'liq funksiya yo'q. Sudrash yo'q — faqat bosish.
- Eng tor ekran **360 px**, gorizontal scroll yo'q. Telefon tik/yotiq va kompyuterda ishlaydi.
- Matn kamida **18 px**. Nutq pufagida ko'pi bilan 2 ta qisqa gap.
- Ranglar: `fon #FFF6E5`, `matn #2B2B3A`, `asosiy #2F6FDE`, `togri #1A9E77`, `yana #F08A24`, `pufak #FFFFFF`. Harf ranglari tartib bo'yicha: `#2F6FDE`, `#F08A24`, `#1A9E77`, `#8E5BD0`. Xato javob va ogohlantirish uchun qizil rang ishlatilmaydi.
- `localStorage` faqat `try/catch` ichida; u ishlamasa ham o'yin to'liq ishlaydi.
- Barcha buyruqlar o'yin papkasida bajariladi: `cd /Users/bicoder/Documents/Information/oyinlar/01-qabila-kodlari`.
- Testlar: `node --test tests/*.test.js`.

## Fayllar xaritasi

| Fayl | Vazifasi | Qaysi vazifada |
|---|---|---|
| `js/logic.js` | Sof hisob: sanash, so'zlar ro'yxati, eng kamida nechta harf, tasodifiy misollar | 1 |
| `tests/logic.test.js` | `logic.js` testlari | 1 |
| `tests/helpers.js` | Brauzer skriptini Node'da yuklash | 2 |
| `js/storage.js` | Progress va ovoz tanlovini saqlash | 2 |
| `tests/storage.test.js` | `storage.js` testlari | 2 |
| `js/art.js` | SVG: qahramonlar, odam, baraban, ikonkalar, daraxt | 3 |
| `tests/art.test.js` | Daraxt va SVG testlari | 3 |
| `js/sound.js` | Tovush effektlari (Web Audio) | 3 |
| `index.html` | Sahifa, zonalar, skriptlar | 4 |
| `css/style.css` | Ranglar, joylashuv, animatsiyalar | 4 |
| `fonts/Nunito.woff2`, `fonts/OFL.txt` | Shrift va litsenziya | 4 |
| `js/ui.js` | Pufak, tugmalar, kataklar, klaviatura, hisoblagich, progress | 4 |
| `js/main.js` | Ishga tushirish, bosh ekran, bosqichlar oqimi | 4 |
| `js/scenes/common.js` | Mashq sikli, qo'lda yasash, daraxt sahnalari | 5 |
| `js/scenes/stage1.js` | Kirish + 1-bosqich | 5 |
| `js/scenes/stage2.js` | 2-bosqich | 6 |
| `js/scenes/stage3.js` | 3-bosqich | 7 |
| `js/scenes/final.js` | Bosqich tugashi, final, tabrik | 8 |

## Nomlar va interfeyslar (barcha vazifalar uchun)

- `type` qiymatlari: `"exact"` (aynan i harfli) va `"upto"` (i harfgacha).
- Mashq obyekti (`ex`):
  - 1–2-bosqich: `{ stage, type, a, i, letters: string[], answer }`
  - 3-bosqich: `{ stage: 3, type, i, people, answer }` (`answer` — eng kamida nechta harf)
- `who` qiymatlari: `"elder"` (Oqsoqol), `"apprentice"` (Shogird).
- Holat (`storage`): `{ done: [bool, bool, bool], muted: bool }`.

---

### 1-vazifa: Hisob-kitob moduli (`logic.js`)

**Fayllar:**
- Yaratish: `js/logic.js`
- Test: `tests/logic.test.js`

**Interfeyslar:**
- Oldingi vazifalardan: yo'q.
- Keyingilarga beradi (`QK.logic`, Node'da `require`):
  - `LETTER_POOL: string[]`, `STAGE_PAIRS: [a, i][]`, `MAX_PEOPLE: number`
  - `countExact(a, i) → number`, `countUpTo(a, i) → number`, `countWords(a, i, type) → number`
  - `listWords(letters, i, type) → string[]`
  - `minLetters(people, i, type) → number`
  - `stage3Steps(people, i, type) → { a, count, enough }[]`
  - `stage3Range(type, i, a) → [lo, hi] | null`
  - `makeRng(seed) → () => number`, `pickLetters(a, rng) → string[]`
  - `exerciseKey(ex) → string`, `makeExercise(stage, prev, rng?) → ex`
  - `checkAnswer(ex, value) → boolean`
  - `productText(a, i) → string` (`"4 × 4 × 4"`), `sumText(a, i) → string` (`"4 + 4 × 4 + 4 × 4 × 4"`)

- [ ] **1-qadam: git holatini tekshirish**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/01-qabila-kodlari && git status --short && git log --oneline -3
```
Kutilgan natija: ishchi papka toza, oxirgi commit — reja va dizayn.

- [ ] **2-qadam: muvaffaqiyatsiz testlarni yozish**

`tests/logic.test.js`:

```js
// logic.js uchun testlar. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

test("countExact: aⁱ", () => {
  assert.equal(L.countExact(3, 3), 27);
  assert.equal(L.countExact(2, 5), 32);
  assert.equal(L.countExact(4, 3), 64);
  assert.equal(L.countExact(1, 2), 1);
});

test("countUpTo: a + a² + … + aⁱ", () => {
  assert.equal(L.countUpTo(3, 3), 39);
  assert.equal(L.countUpTo(2, 2), 6);
  assert.equal(L.countUpTo(4, 3), 84);
  assert.equal(L.countUpTo(1, 2), 2);
});

test("countWords turga qarab tanlaydi", () => {
  assert.equal(L.countWords(3, 2, "exact"), 9);
  assert.equal(L.countWords(3, 2, "upto"), 12);
});

test("STAGE_PAIRS: 8 ta juftlik, hammasi chegarada", () => {
  assert.equal(L.STAGE_PAIRS.length, 8);
  for (const [a, i] of L.STAGE_PAIRS) {
    assert.ok(a >= 2 && a <= 4, `a=${a}`);
    assert.ok(L.countExact(a, i) <= 64, `${a}^${i}`);
    assert.ok(L.countUpTo(a, i) <= 84, `sum ${a},${i}`);
  }
});

test("listWords exact: to'liq, takrorsiz, tartibli", () => {
  assert.deepEqual(L.listWords(["A", "U"], 2, "exact"), ["AA", "AU", "UA", "UU"]);
  const w = L.listWords(["A", "U", "F"], 2, "exact");
  assert.equal(w.length, 9);
  assert.equal(new Set(w).size, 9);
});

test("listWords upto: avval qisqalari", () => {
  assert.deepEqual(L.listWords(["A", "U"], 2, "upto"), ["A", "U", "AA", "AU", "UA", "UU"]);
  assert.equal(L.listWords(["A", "U", "F"], 3, "upto").length, 39);
});

test("listWords: harf yo'q bo'lsa — bo'sh ro'yxat", () => {
  assert.deepEqual(L.listWords([], 2, "exact"), []);
  assert.deepEqual(L.listWords([], 2, "upto"), []);
});

test("minLetters: dizayndagi 3-bosqich misollari", () => {
  assert.equal(L.minLetters(5, 2, "upto"), 2);
  assert.equal(L.minLetters(5, 2, "exact"), 3);
  assert.equal(L.minLetters(20, 3, "exact"), 3);
});

test("stage3Steps: 1 dan javobgacha", () => {
  assert.deepEqual(L.stage3Steps(5, 2, "upto"), [
    { a: 1, count: 2, enough: false },
    { a: 2, count: 6, enough: true },
  ]);
});

test("stage3Range: odamlar soni oralig'i", () => {
  assert.deepEqual(L.stage3Range("exact", 2, 2), [2, 4]);
  assert.deepEqual(L.stage3Range("exact", 3, 4), [28, 30]);
  assert.deepEqual(L.stage3Range("upto", 3, 3), [15, 30]);
  assert.equal(L.stage3Range("upto", 3, 4), null);
});

test("makeRng: bir xil urug' — bir xil ketma-ketlik", () => {
  const r1 = L.makeRng(42);
  const r2 = L.makeRng(42);
  for (let k = 0; k < 5; k++) {
    const v = r1();
    assert.equal(v, r2());
    assert.ok(v >= 0 && v < 1);
  }
});

test("pickLetters: har xil harflar, to'plamdan", () => {
  const rng = L.makeRng(1);
  for (let k = 0; k < 200; k++) {
    const ls = L.pickLetters(4, rng);
    assert.equal(new Set(ls).size, 4);
    for (const l of ls) assert.ok(L.LETTER_POOL.includes(l));
  }
  assert.ok(!L.LETTER_POOL.includes("O"));
});

test("makeExercise: 1000 marta — chegaralar, yagona javob, ketma-ket takror yo'q", () => {
  const rng = L.makeRng(7);
  for (const stage of [1, 2, 3]) {
    let prev = null;
    for (let k = 0; k < 1000; k++) {
      const ex = L.makeExercise(stage, prev, rng);
      assert.equal(ex.stage, stage);
      if (stage < 3) {
        assert.equal(ex.type, stage === 1 ? "exact" : "upto");
        assert.ok(L.STAGE_PAIRS.some(([a, i]) => a === ex.a && i === ex.i));
        assert.equal(ex.letters.length, ex.a);
        assert.equal(ex.answer, L.countWords(ex.a, ex.i, ex.type));
      } else {
        assert.ok(ex.people >= 2 && ex.people <= 30, `people=${ex.people}`);
        assert.ok([2, 3, 4].includes(ex.answer));
        assert.ok([2, 3].includes(ex.i));
        assert.equal(L.minLetters(ex.people, ex.i, ex.type), ex.answer);
      }
      if (prev) assert.notEqual(L.exerciseKey(ex), L.exerciseKey(prev));
      prev = ex;
    }
  }
});

test("checkAnswer: son yoki satr", () => {
  const ex = { answer: 27 };
  assert.equal(L.checkAnswer(ex, 27), true);
  assert.equal(L.checkAnswer(ex, "27"), true);
  assert.equal(L.checkAnswer(ex, 26), false);
});

test("productText va sumText", () => {
  assert.equal(L.productText(4, 3), "4 × 4 × 4");
  assert.equal(L.productText(3, 1), "3");
  assert.equal(L.sumText(4, 3), "4 + 4 × 4 + 4 × 4 × 4");
});
```

- [ ] **3-qadam: testlar muvaffaqiyatsiz ekanini ko'rish**

Buyruq: `node --test tests/*.test.js`
Kutilgan natija: FAIL — `Cannot find module '../js/logic.js'`.

- [ ] **4-qadam: `js/logic.js` ni yozish**

```js
// Qabila kodlari — sof hisob-kitob. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Tasodifiy misollar uchun harflar. "O" yo'q — finaldagi 0 bilan chalkashmasin.
  const LETTER_POOL = ["A", "U", "F", "K", "M", "S", "T", "R"];
  // 1- va 2-bosqich juftliklari (a, i): aⁱ ≤ 64 va a + … + aⁱ ≤ 84
  const STAGE_PAIRS = [[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [4, 2], [4, 3]];
  const MAX_PEOPLE = 30;

  function countExact(a, i) {
    return Math.pow(a, i);
  }

  function countUpTo(a, i) {
    let sum = 0;
    for (let k = 1; k <= i; k++) sum += Math.pow(a, k);
    return sum;
  }

  function countWords(a, i, type) {
    return type === "exact" ? countExact(a, i) : countUpTo(a, i);
  }

  // Barcha so'zlar. Tartib: avval qisqalari, bir xil uzunlikda — alifbo tartibida.
  function listWords(letters, i, type) {
    let result = [];
    for (let len = type === "exact" ? i : 1; len <= i; len++) {
      let level = [""];
      for (let k = 0; k < len; k++) {
        const next = [];
        for (const w of level) for (const l of letters) next.push(w + l);
        level = next;
      }
      result = result.concat(level);
    }
    return result;
  }

  // Eng kamida nechta harf kerak: so'zlar soni odamlar sonidan kam bo'lmasligi uchun
  function minLetters(people, i, type) {
    let a = 1;
    while (countWords(a, i, type) < people) a++;
    return a;
  }

  // 3-bosqich tushuntirishi: 1 dan javobgacha har bir harflar soni uchun so'zlar soni
  function stage3Steps(people, i, type) {
    const answer = minLetters(people, i, type);
    const steps = [];
    for (let a = 1; a <= answer; a++) {
      const count = countWords(a, i, type);
      steps.push({ a, count, enough: count >= people });
    }
    return steps;
  }

  // Javob aynan `a` bo'lishi uchun odamlar soni oralig'i: (a−1) ta harf yetmaydi, a ta yetadi
  function stage3Range(type, i, a) {
    const lo = Math.max(2, countWords(a - 1, i, type) + 1);
    const hi = Math.min(MAX_PEOPLE, countWords(a, i, type));
    return lo <= hi ? [lo, hi] : null;
  }

  // Urug'li tasodifiy sonlar (mulberry32) — testlarda bir xil natija olish uchun
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  function pickLetters(a, rng) {
    const pool = LETTER_POOL.slice();
    const out = [];
    for (let k = 0; k < a; k++) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    return out;
  }

  // Ikki misol "bir xil"mi — harflar hisobga olinmaydi
  function exerciseKey(ex) {
    return [ex.stage, ex.type, ex.a, ex.i, ex.people].join("|");
  }

  function makeOne(stage, rng) {
    if (stage === 1 || stage === 2) {
      const [a, i] = pick(rng, STAGE_PAIRS);
      const type = stage === 1 ? "exact" : "upto";
      return { stage, type, a, i, letters: pickLetters(a, rng), answer: countWords(a, i, type) };
    }
    for (;;) {
      const type = rng() < 0.5 ? "exact" : "upto";
      const i = randInt(rng, 2, 3);
      const answer = randInt(rng, 2, 4);
      const range = stage3Range(type, i, answer);
      if (range) return { stage: 3, type, i, people: randInt(rng, range[0], range[1]), answer };
    }
  }

  function makeExercise(stage, prev, rng) {
    rng = rng || Math.random;
    let ex;
    do {
      ex = makeOne(stage, rng);
    } while (prev && exerciseKey(ex) === exerciseKey(prev));
    return ex;
  }

  function checkAnswer(ex, value) {
    return Number(value) === ex.answer;
  }

  function productText(a, i) {
    return Array(i).fill(a).join(" × ");
  }

  function sumText(a, i) {
    const parts = [];
    for (let k = 1; k <= i; k++) parts.push(productText(a, k));
    return parts.join(" + ");
  }

  const api = {
    LETTER_POOL, STAGE_PAIRS, MAX_PEOPLE,
    countExact, countUpTo, countWords, listWords, minLetters, stage3Steps, stage3Range,
    makeRng, pickLetters, exerciseKey, makeExercise, checkAnswer, productText, sumText,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.logic = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

- [ ] **5-qadam: testlar o'tishini tekshirish**

Buyruq: `node --test tests/*.test.js`
Kutilgan natija: barcha testlar PASS, `fail 0`.

- [ ] **6-qadam: commit**

```bash
git add js/logic.js tests/logic.test.js
git commit -m "01-qabila-kodlari: hisob-kitob moduli va testlari" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 2-vazifa: Saqlash moduli (`storage.js`)

**Fayllar:**
- Yaratish: `js/storage.js`, `tests/helpers.js`
- Test: `tests/storage.test.js`

**Interfeyslar:**
- Oldingi vazifalardan: yo'q.
- Keyingilarga beradi:
  - `QK.storage.load() → { done: [bool, bool, bool], muted: bool }` — xato, bo'sh yoki buzilgan ma'lumotda standart holat qaytaradi.
  - `QK.storage.save(state)` — hech qachon xato tashlamaydi.
  - `tests/helpers.js`: `loadScript(relPath, window) → window` — `window.QK` ga yozadigan brauzer skriptini Node'da (shu realm'da) ishga tushiradi.

- [ ] **1-qadam: yordamchi `tests/helpers.js`**

```js
// Brauzer skriptini (window.QK ga yozadigan) Node'da yuklash uchun yordamchi.
// new Function ishlatiladi — obyektlar shu realm'da yaratiladi, deepEqual to'g'ri ishlaydi.
const fs = require("node:fs");
const path = require("node:path");

function loadScript(relPath, window) {
  const code = fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
  new Function("window", code)(window);
  return window;
}

module.exports = { loadScript };
```

- [ ] **2-qadam: muvaffaqiyatsiz testlarni yozish**

`tests/storage.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadScript } = require("./helpers.js");

const KEY = "qabila-kodlari:v1";
const DEFAULTS = { done: [false, false, false], muted: false };

function fakeLocalStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
  };
}

const storageWith = (localStorage) => loadScript("js/storage.js", { localStorage }).QK.storage;

test("bo'sh xotira — standart holat", () => {
  assert.deepEqual(storageWith(fakeLocalStorage()).load(), DEFAULTS);
});

test("saqlash va qayta o'qish", () => {
  const s = storageWith(fakeLocalStorage());
  s.save({ done: [true, false, false], muted: true });
  assert.deepEqual(s.load(), { done: [true, false, false], muted: true });
});

test("localStorage xato tashlasa — standart holat, o'yin to'xtamaydi", () => {
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  const s = storageWith(broken);
  assert.doesNotThrow(() => s.save({ done: [true, true, true], muted: false }));
  assert.deepEqual(s.load(), DEFAULTS);
});

test("localStorage umuman yo'q — standart holat", () => {
  const s = loadScript("js/storage.js", {}).QK.storage;
  assert.deepEqual(s.load(), DEFAULTS);
  assert.doesNotThrow(() => s.save(DEFAULTS));
});

test("buzilgan yoki eski ma'lumot — standart holat", () => {
  const ls = fakeLocalStorage();
  const s = storageWith(ls);
  ls.setItem(KEY, "{buzuq");
  assert.deepEqual(s.load(), DEFAULTS);
  ls.setItem(KEY, JSON.stringify({ done: [true], muted: 1 }));
  assert.deepEqual(s.load(), DEFAULTS);
});
```

- [ ] **3-qadam: testlar muvaffaqiyatsiz ekanini ko'rish**

Buyruq: `node --test tests/*.test.js`
Kutilgan natija: `storage.test.js` FAIL — `ENOENT ... js/storage.js`. `logic.test.js` PASS.

- [ ] **4-qadam: `js/storage.js` ni yozish**

```js
// Tugagan bosqichlar va ovoz tanlovini brauzerda saqlash. Xato bo'lsa jim o'tkazib yuboradi.
(function (root) {
  "use strict";

  const KEY = "qabila-kodlari:v1";
  const defaults = () => ({ done: [false, false, false], muted: false });

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      if (!raw) return defaults();
      const data = JSON.parse(raw);
      const ok = Array.isArray(data.done) && data.done.length === 3 && typeof data.muted === "boolean";
      return ok ? { done: data.done.map(Boolean), muted: data.muted } : defaults();
    } catch (e) {
      return defaults();
    }
  }

  function save(state) {
    try {
      root.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Saqlab bo'lmadi (maxfiy rejim va h.k.) — o'yin baribir ishlaydi
    }
  }

  root.QK = root.QK || {};
  root.QK.storage = { load, save };
})(window);
```

- [ ] **5-qadam: testlar o'tishini tekshirish**

Buyruq: `node --test tests/*.test.js`
Kutilgan natija: barcha testlar PASS, `fail 0`.

- [ ] **6-qadam: commit**

```bash
git add js/storage.js tests/helpers.js tests/storage.test.js
git commit -m "01-qabila-kodlari: saqlash moduli va testlari" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 3-vazifa: Rasmlar (`art.js`) va tovush (`sound.js`)

**Fayllar:**
- Yaratish: `js/art.js`, `js/sound.js`
- Test: `tests/art.test.js`

**Interfeyslar:**
- Oldingi vazifalardan: `tests/helpers.js` → `loadScript`.
- Keyingilarga beradi:
  - `QK.art.LETTER_COLORS: string[4]`
  - `QK.art.elder() → string` — `<svg class="actor-svg">`; ichida `.body`, `.head`, `.eyes`, `.mouth`, `.arm` guruhlari.
  - `QK.art.apprentice() → string` — ichida `.paper` (qog'oz guruhi), `.paper-text` (qog'ozdagi yozuv), `.arms-down`, `.arms-up`.
  - `QK.art.person(happy: bool, index: number) → string` — kichik qabila odami.
  - `QK.art.drum() → string`, `QK.art.icon(name: "home" | "sound-on" | "sound-off") → string`
  - `QK.art.tree(letters, depth, opts) → string` — `opts = { lit?: Set<string>, compact?: bool, animateLevel?: number, levelCounts?: number[] }`. Chapdan o'ngga o'sadi. Tugun **yonadi**, agar `lit` dagi biror so'z shu tugun so'zi bilan boshlansa. Barglar 9 tadan ko'p bo'lsa (yoki `compact: true`), barg so'zi rangli kvadratchalar bilan chiziladi.
  - `QK.sound.unlock()`, `QK.sound.play(name)` (`"tap" | "correct" | "retry" | "win" | "tak" | "dum"`), `QK.sound.setMuted(bool)`, `QK.sound.isMuted() → bool`

- [ ] **1-qadam: muvaffaqiyatsiz testlarni yozish**

`tests/art.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadScript } = require("./helpers.js");

const art = loadScript("js/art.js", {}).QK.art;
const count = (s, re) => (s.match(re) || []).length;

test("tree: 3 harf, 2 qavat — 12 tugun + ildiz, 12 chiziq, harfli yozuv", () => {
  const svg = art.tree(["A", "U", "F"], 2, { lit: new Set() });
  assert.equal(count(svg, /<circle/g), 13);
  assert.equal(count(svg, /<line/g), 12);
  assert.equal(count(svg, /<rect/g), 0);
});

test("tree: 27 barg — avtomatik ixcham, rangli kvadratchalar", () => {
  const svg = art.tree(["A", "U", "F"], 3, {});
  assert.equal(count(svg, /<rect/g), 81);
});

test("tree: yongan so'z yo'li rangli, qolgani kulrang", () => {
  const svg = art.tree(["A", "U"], 2, { lit: new Set(["AU"]) });
  assert.ok(svg.includes('fill="#2F6FDE"'), "A — ko'k");
  assert.ok(svg.includes('fill="#F08A24"'), "AU dagi U — to'q sariq");
  assert.ok(svg.includes('fill="#D9D2C3"'), "qolganlari kulrang");
});

test("tree: hech narsa yonmasa — rangli tugun yo'q", () => {
  const svg = art.tree(["A", "U"], 2, {});
  for (const c of art.LETTER_COLORS) assert.ok(!svg.includes(`fill="${c}"`), c);
});

test("tree: qavat sarlavhasi va o'sish animatsiyasi", () => {
  const svg = art.tree(["0", "1"], 3, { levelCounts: [3], animateLevel: 3, compact: false });
  assert.ok(svg.includes(">8 ta<"));
  assert.ok(svg.includes("grow"));
  assert.equal(count(svg, /<rect/g), 0);
});

test("qahramonlar, odam, baraban, ikonkalar SVG qaytaradi", () => {
  assert.match(art.elder(), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.elder(), /class="eyes"/);
  assert.match(art.apprentice(), /class="paper-text"/);
  assert.match(art.apprentice(), /class="arms-up"/);
  assert.match(art.person(true, 0), /^<svg/);
  assert.notEqual(art.person(true, 0), art.person(false, 0));
  assert.match(art.drum(), /^<svg/);
  for (const n of ["home", "sound-on", "sound-off"]) assert.match(art.icon(n), /^<svg[\s\S]*<path/);
});
```

- [ ] **2-qadam: testlar muvaffaqiyatsiz ekanini ko'rish**

Buyruq: `node --test tests/*.test.js`
Kutilgan natija: `art.test.js` FAIL — `ENOENT ... js/art.js`.

- [ ] **3-qadam: `js/art.js` ni yozish**

```js
// SVG rasmlar: qahramonlar, odam, baraban, ikonkalar va so'zlar daraxti.
// Hammasi SVG satr qaytaradi va DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const LETTER_COLORS = ["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"];
  const OFF = "#D9D2C3";
  const INK = "#2B2B3A";

  // Oqsoqol: tayoq, chopon, oq soqol, patli bosh bog'ich
  function elder() {
    return `<svg class="actor-svg" viewBox="0 0 120 150" aria-hidden="true">
  <g class="body">
    <rect x="14" y="40" width="6" height="108" rx="3" fill="#8A5A2B"/>
    <circle cx="17" cy="38" r="7" fill="#A8743F"/>
    <path d="M32 150 L40 88 Q60 78 80 88 L88 150 Z" fill="#7A4E9A"/>
    <path d="M56 84 L60 150 L64 84 Z" fill="#5E3A7A"/>
    <rect x="38" y="112" width="44" height="7" rx="3" fill="#E0B04A"/>
    <path d="M42 92 Q28 100 20 96" stroke="#7A4E9A" stroke-width="10" stroke-linecap="round" fill="none"/>
    <circle cx="19" cy="95" r="5" fill="#E2A77E"/>
    <g class="arm">
      <path d="M78 92 Q92 104 94 118" stroke="#7A4E9A" stroke-width="10" stroke-linecap="round" fill="none"/>
      <circle cx="94" cy="120" r="5" fill="#E2A77E"/>
    </g>
    <g class="head">
      <circle cx="60" cy="56" r="22" fill="#E2A77E"/>
      <path d="M40 58 Q42 98 60 100 Q78 98 80 58 Q72 70 60 70 Q48 70 40 58 Z" fill="#F4F1EA"/>
      <path d="M50 66 Q60 61 70 66" stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" fill="none"/>
      <ellipse class="mouth" cx="60" cy="72" rx="4" ry="2" fill="#7A3B2E"/>
      <g class="eyes">
        <ellipse cx="52" cy="53" rx="2.6" ry="3" fill="${INK}"/>
        <ellipse cx="68" cy="53" rx="2.6" ry="3" fill="${INK}"/>
      </g>
      <path d="M46 46 Q52 43 57 46 M63 46 Q68 43 74 46" stroke="#F4F1EA" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M37 42 Q60 24 83 42 L83 36 Q60 18 37 36 Z" fill="#C8553D"/>
      <path d="M78 34 Q92 12 86 4 Q80 18 73 32 Z" fill="#1A9E77"/>
    </g>
  </g>
</svg>`;
  }

  // Shogird: qog'oz ushlaydi; .pose-raise da qo'llar va qog'oz tepaga ko'tariladi (CSS)
  function apprentice() {
    return `<svg class="actor-svg" viewBox="0 0 120 150" aria-hidden="true">
  <g class="body">
    <path d="M38 150 L44 100 Q60 92 76 100 L82 150 Z" fill="#C8553D"/>
    <rect x="42" y="126" width="36" height="6" rx="3" fill="#8A5A2B"/>
    <g class="head">
      <circle cx="60" cy="74" r="20" fill="#C98B5E"/>
      <path d="M40 72 Q42 50 60 52 Q78 50 80 72 Q74 60 60 60 Q48 60 40 72 Z" fill="#3A2A1E"/>
      <g class="eyes">
        <ellipse cx="53" cy="74" rx="2.6" ry="3" fill="${INK}"/>
        <ellipse cx="67" cy="74" rx="2.6" ry="3" fill="${INK}"/>
      </g>
      <path class="mouth" d="M54 83 Q60 88 66 83" stroke="#7A3B2E" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    </g>
    <g class="arms-down">
      <path d="M46 104 Q38 112 37 122" stroke="#C8553D" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M74 104 Q82 112 83 122" stroke="#C8553D" stroke-width="9" stroke-linecap="round" fill="none"/>
    </g>
    <g class="arms-up">
      <path d="M46 104 Q34 76 37 30" stroke="#C8553D" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M74 104 Q86 76 83 30" stroke="#C8553D" stroke-width="9" stroke-linecap="round" fill="none"/>
    </g>
    <g class="paper">
      <rect x="34" y="104" width="52" height="38" rx="4" fill="#FFFFFF" stroke="#C9C2B4" stroke-width="2"/>
      <text class="paper-text" x="60" y="131" text-anchor="middle" font-size="22" font-weight="900" fill="${INK}"></text>
      <circle cx="36" cy="124" r="5" fill="#C98B5E"/>
      <circle cx="84" cy="124" r="5" fill="#C98B5E"/>
    </g>
  </g>
</svg>`;
  }

  const TUNICS = ["#C8553D", "#7A4E9A", "#3E7CB1", "#8A5A2B", "#1A9E77"];

  // Kichik qabila odami (3-bosqich): ismi bor — kulib turadi, yo'q — xafa
  function person(happy, index) {
    const mouth = happy ? "M16 22 Q20 26 24 22" : "M16 25 Q20 21 24 25";
    return `<svg class="person-svg" viewBox="0 0 40 50" aria-hidden="true">
  <path d="M8 50 L12 32 Q20 27 28 32 L32 50 Z" fill="${TUNICS[index % TUNICS.length]}"/>
  <circle cx="20" cy="18" r="10" fill="#D9A07A"/>
  <circle cx="16.5" cy="17" r="1.4" fill="${INK}"/>
  <circle cx="23.5" cy="17" r="1.4" fill="${INK}"/>
  <path d="${mouth}" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
</svg>`;
  }

  function drum() {
    return `<svg class="drum" viewBox="0 0 100 80" aria-hidden="true">
  <path d="M14 20 L20 68 Q50 80 80 68 L86 20 Z" fill="#C8553D" stroke="#8A5A2B" stroke-width="3"/>
  <path d="M22 30 L34 66 M50 32 L50 72 M78 30 L66 66" stroke="#F4E3C3" stroke-width="3"/>
  <ellipse cx="50" cy="20" rx="36" ry="10" fill="#F4E3C3" stroke="#8A5A2B" stroke-width="3"/>
</svg>`;
  }

  const ICONS = {
    home: '<path d="M3 11 L12 3 L21 11 V21 H14 V15 H10 V21 H3 Z" fill="currentColor"/>',
    "sound-on": '<path d="M3 9 H7 L12 5 V19 L7 15 H3 Z" fill="currentColor"/><path d="M16 8 Q19 12 16 16 M18.5 5.5 Q23 12 18.5 18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
    "sound-off": '<path d="M3 9 H7 L12 5 V19 L7 15 H3 Z" fill="currentColor"/><path d="M16 9 L22 15 M22 9 L16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

  // Barg yozuvi: oddiy holatda harflar, ixcham holatda rangli kvadratchalar
  function leafLabel(word, letters, lx, ly, on, compact, grow) {
    let s = `<g class="leaf${grow}">`;
    [...word].forEach((ch, k) => {
      const color = on ? LETTER_COLORS[letters.indexOf(ch) % 4] : OFF;
      if (compact) s += `<rect x="${lx + k * 11}" y="${ly - 5}" width="9" height="9" rx="2" fill="${color}"/>`;
      else s += `<text x="${lx + k * 22}" y="${ly + 7}" font-size="20" font-weight="900" fill="${color}">${ch}</text>`;
    });
    return s + "</g>";
  }

  // So'zlar daraxti. Qavat L dagi j-tugun so'zi — j ning a asosli L xonali yozuvi.
  function tree(letters, depth, opts) {
    opts = opts || {};
    const lit = opts.lit || new Set();
    const a = letters.length;
    const leaves = Math.pow(a, depth);
    const compact = opts.compact != null ? opts.compact : leaves > 9;
    const rowH = compact ? 16 : 40;
    const colW = compact ? 56 : 84;
    const r = compact ? 6 : 14;
    const top = 30;
    const left = 16;
    const labelW = compact ? depth * 11 + 12 : depth * 22 + 20;
    const W = left + depth * colW + r + labelW + 8;
    const H = top + leaves * rowH + 4;

    const isOn = (word) => {
      for (const w of lit) if (w.startsWith(word)) return true;
      return false;
    };
    const x = (L) => left + L * colW;
    const y = (L, j) => top + (j + 0.5) * Math.pow(a, depth - L) * rowH;

    let edges = "";
    let nodes = "";
    let labels = "";
    let level = [""];
    for (let L = 1; L <= depth; L++) {
      const next = [];
      const grow = opts.animateLevel === L ? " grow" : "";
      level.forEach((parent, pj) => {
        letters.forEach((ch, k) => {
          const j = pj * a + k;
          const word = parent + ch;
          const on = isOn(word);
          const color = on ? LETTER_COLORS[k % 4] : OFF;
          edges += `<line class="edge${grow}" x1="${x(L - 1)}" y1="${y(L - 1, pj)}" x2="${x(L)}" y2="${y(L, j)}" stroke="${color}" stroke-width="${compact ? 1.5 : 3}"/>`;
          nodes += `<g class="node${grow}"><circle cx="${x(L)}" cy="${y(L, j)}" r="${r}" fill="${color}"/>`;
          if (!compact) nodes += `<text x="${x(L)}" y="${y(L, j) + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#FFFFFF">${ch}</text>`;
          nodes += "</g>";
          if (L === depth) labels += leafLabel(word, letters, x(L) + r + 8, y(L, j), on, compact, grow);
          next.push(word);
        });
      });
      level = next;
    }

    let heads = "";
    for (const L of opts.levelCounts || []) {
      heads += `<text x="${x(L)}" y="18" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">${Math.pow(a, L)} ta</text>`;
    }
    const rootDot = `<circle cx="${x(0)}" cy="${y(0, 0)}" r="${compact ? 4 : 7}" fill="${INK}"/>`;
    return `<svg class="tree" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Soʻzlar daraxti">${edges}${rootDot}${nodes}${labels}${heads}</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.art = { LETTER_COLORS, elder, apprentice, person, drum, icon, tree };
})(window);
```

- [ ] **4-qadam: testlar o'tishini tekshirish**

Buyruq: `node --test tests/*.test.js`
Kutilgan natija: barcha testlar PASS, `fail 0`.

- [ ] **5-qadam: `js/sound.js` ni yozish**

```js
// Tovush effektlari — Web Audio bilan yasaladi, tayyor fayl kerak emas.
// Brauzer talabi: AudioContext bola birinchi marta bosgandan keyin yaratiladi (unlock).
(function (root) {
  "use strict";

  let ctx = null;
  let muted = false;

  function unlock() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return;
    }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
  }

  // Bitta nota: chastota (Hz), boshlanishi va davomiyligi (soniya), to'lqin turi, balandligi
  function tone(freq, start, dur, type, vol) {
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const SOUNDS = {
    tap: () => tone(660, 0, 0.06, "triangle", 0.15),
    correct: () => {
      tone(523, 0, 0.12, "triangle", 0.25);
      tone(784, 0.1, 0.2, "triangle", 0.25);
    },
    retry: () => {
      tone(392, 0, 0.12, "sine", 0.2);
      tone(330, 0.12, 0.18, "sine", 0.2);
    },
    win: () => [523, 659, 784, 1047].forEach((f, k) => tone(f, k * 0.12, 0.25, "triangle", 0.25)),
    tak: () => tone(420, 0, 0.08, "square", 0.12),
    dum: () => tone(110, 0, 0.25, "sine", 0.5),
  };

  function play(name) {
    if (muted || !ctx || !SOUNDS[name]) return;
    try {
      SOUNDS[name]();
    } catch (e) {
      // Ovoz chiqmasa ham o'yin davom etadi
    }
  }

  root.QK = root.QK || {};
  root.QK.sound = {
    unlock,
    play,
    setMuted: (m) => { muted = !!m; },
    isMuted: () => muted,
  };
})(window);
```

- [ ] **6-qadam: sintaksisni tekshirish**

Buyruq: `node --check js/sound.js && node --check js/art.js && echo OK`
Kutilgan natija: `OK`. (Ovozning o'zi 5-vazifada brauzerda tekshiriladi.)

- [ ] **7-qadam: commit**

```bash
git add js/art.js js/sound.js tests/art.test.js
git commit -m "01-qabila-kodlari: SVG rasmlar, daraxt va tovushlar" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 4-vazifa: Sahifa, uslublar, UI elementlari va bosh ekran

**Fayllar:**
- Yaratish: `index.html`, `css/style.css`, `fonts/Nunito.woff2`, `fonts/OFL.txt`, `js/ui.js`, `js/main.js`

**Interfeyslar:**
- Oldingi vazifalardan: `QK.logic`, `QK.storage`, `QK.sound`, `QK.art` (1–3-vazifalar).
- Keyingilarga beradi (`QK.ui`):
  - Sahnani to'xtatish: `newRun()`, `onCleanup(fn)`, `settle(executor) → Promise`, `sleep(ms) → Promise`
  - Elementlar: `h(tag, props, ...children) → HTMLElement` (`props`: `class`, `text`, `html`, `onClick`, qolganlari atribut; `false`/`null` o'tkazib yuboriladi, `true` → bo'sh atribut), `button(label, onClick, cls?)`
  - Zonalar: `work()`, `control()`, `clearWork()`, `clearControl()`, `setCompact(on)`
  - Qahramonlar: `pose(who, name, ms?)` (`name`: `talk | happy | think | point | drum`), `resetPoses()`, `paper(text)` (bo'sh satr — qog'oz yashiriladi), `raisePaper(on)`
  - Pufak: `bubble(who, content)` (kutmaydi), `say(who, content) → Promise` ("Davom" yoki pufak bosilguncha kutadi). `content` — satr yoki element.
  - Harflar: `tile(letter, colorIndex, size?)` (`size`: `"" | "sm" | "xs" | "big"`), `wordChip(word, letters)`, `lettersLine(before, letters, after?)`, `toast(text)`, `sup(n) → "³"`
  - Kiritish: `buildWords({ letters, len, allowShort, targets, slotsHost, onFound }) → Promise`, `askNumber(maxLen = 3) → Promise<number>`, `counter(host, { start, min, max, onChange }) → { disable() }` (`onChange(start)` darhol bir marta chaqiriladi), `choice([{ label, value, secondary? }]) → Promise<value>`
  - Progress: `setProgress(total, filled)`, `hideProgress()`
- `main.js` sahnalarni `QK.scenes` dan chaqiradi: `intro()`, `stage1()`, `stage2()`, `stage3()`, `stageDone(s)`, `finale()`, `congrats() → "replay" | "home"`. Ular 5–8-vazifalarda yoziladi.

- [ ] **1-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Qabila kodlari</title>
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
  <script src="js/logic.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/sound.js"></script>
  <script src="js/art.js"></script>
  <script src="js/ui.js"></script>
  <!-- sahnalar (5–8-vazifalar) shu yerga, main.js dan oldin qo'shiladi -->
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **2-qadam: shriftni yuklab olish**

```bash
mkdir -p fonts
curl -fL -o fonts/Nunito.woff2 "https://cdn.jsdelivr.net/npm/@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2"
curl -fL -o fonts/OFL.txt "https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/OFL.txt"
file fonts/Nunito.woff2 && ls -l fonts
```
Kutilgan natija: `Web Open Font Format (Version 2)`, hajmi 20 KB dan katta; `OFL.txt` — "SIL Open Font License" matni.
Agar birinchi manzil 404 bersa, fayl nomini ro'yxatdan toping:
`curl -s https://cdn.jsdelivr.net/npm/@fontsource-variable/nunito/files/ | grep -o 'nunito-latin-[a-z-]*\.woff2' | sort -u` — `latin` + `wght` + `normal` bo'lganini oling.

- [ ] **3-qadam: `css/style.css`**

```css
/* Qabila kodlari — ranglar, joylashuv va animatsiyalar. Ranglar: QOIDALAR.md, 6-bo'lim. */
:root {
  --fon: #FFF6E5;
  --matn: #2B2B3A;
  --asosiy: #2F6FDE;
  --togri: #1A9E77;
  --yana: #F08A24;
  --pufak: #FFFFFF;
  --c0: #2F6FDE;
  --c1: #F08A24;
  --c2: #1A9E77;
  --c3: #8E5BD0;
  --chiziq: #D9D2C3;
  --soya: rgba(43, 43, 58, 0.18);
}

@font-face {
  font-family: "Nunito";
  src: url("../fonts/Nunito.woff2") format("woff2");
  font-weight: 200 1000;
  font-display: swap;
}

* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: var(--fon); color: var(--matn); }
body {
  font-family: "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 18px;
  line-height: 1.35;
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}
button { font: inherit; color: inherit; cursor: pointer; touch-action: manipulation; }
button:disabled { cursor: default; opacity: 0.45; }

/* ---------- Asosiy joylashuv ---------- */
#app { display: flex; flex-direction: column; height: 100vh; height: 100dvh; max-width: 1200px; margin: 0 auto; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; }
.icon-btn {
  width: 48px; height: 48px; padding: 10px; border: none; border-radius: 14px;
  background: #fff; color: var(--asosiy); box-shadow: 0 3px 0 var(--soya);
  display: grid; place-items: center;
}
.icon-btn svg { width: 100%; height: 100%; }
.progress { display: flex; gap: 8px; }
.dot { width: 18px; height: 18px; border-radius: 50%; border: 3px solid var(--togri); }
.dot.on { background: var(--togri); }

.play {
  position: relative; flex: 1; min-height: 0;
  display: grid; gap: 8px; padding: 0 16px 16px;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas: "stage" "work" "control";
}
.zone-stage {
  grid-area: stage; display: grid; gap: 4px;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "bubble bubble" "elder apprentice";
  align-items: end; justify-items: center;
}
#actor-elder { grid-area: elder; }
#actor-apprentice { grid-area: apprentice; }
.actor { height: 120px; aspect-ratio: 120 / 150; transition: height 0.3s; }
.actor-svg { width: 100%; height: 100%; overflow: visible; }
.zone-work {
  grid-area: work; min-height: 0; overflow: auto;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
/* justify-content: center o'rniga — mazmun sig'maganda tepasi kesilib qolmaydi */
.zone-work > :first-child { margin-top: auto; }
.zone-work > :last-child { margin-bottom: auto; }
.zone-control { grid-area: control; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.zone-control:empty { display: none; }

@media (orientation: landscape) {
  .play {
    grid-template-columns: minmax(200px, 34%) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
    grid-template-areas: "stage work" "stage control";
  }
  .zone-stage { align-content: center; }
  .actor { height: min(150px, 30vh); }
}
/* Daraxt ko'rsatilganda qahramonlar kichrayadi (media'dan keyin — ustun turadi) */
.compact .actor { height: 64px; }

/* ---------- Nutq pufagi ---------- */
.bubble {
  grid-area: bubble; position: relative; width: 100%;
  min-height: 56px; padding: 12px 16px; border-radius: 18px;
  background: var(--pufak); box-shadow: 0 3px 0 var(--soya); font-weight: 700;
}
.bubble[hidden] { display: none; }
.bubble::after {
  content: ""; position: absolute; bottom: -12px;
  border: 12px solid transparent; border-top-color: var(--pufak); border-bottom: 0;
}
.bubble.from-elder::after { left: 20%; }
.bubble.from-apprentice::after { right: 20%; }
.bubble-line { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }

/* ---------- Tugmalar ---------- */
.btn {
  min-height: 52px; min-width: 52px; padding: 10px 22px; border: none; border-radius: 14px;
  background: var(--asosiy); color: #fff; font-size: 20px; font-weight: 800;
  box-shadow: 0 4px 0 var(--soya);
}
.btn.secondary { background: #fff; color: var(--asosiy); }
.btn.big { font-size: 24px; padding: 14px 40px; }
.btn:active, .key:active, .tile.big:active, .card:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--soya); }
.choice-row, .pad-extras { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }

/* ---------- Harflar, kataklar, devor ---------- */
.tile {
  display: inline-grid; place-items: center; width: 40px; height: 40px;
  border: none; border-radius: 10px; color: #fff; font-size: 22px; font-weight: 900;
}
.tile.sm { width: 34px; height: 34px; font-size: 20px; }
.tile.xs { width: 26px; height: 26px; font-size: 18px; border-radius: 7px; }
.tile.big { width: 64px; height: 64px; font-size: 32px; box-shadow: 0 4px 0 var(--soya); }
.letter-pad { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.slots { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.slot {
  width: 60px; height: 60px; padding: 0; border: 3px dashed var(--chiziq); border-radius: 12px;
  background: #fff; color: #fff; font-size: 30px; font-weight: 900;
}
.slot.filled { border-style: solid; border-color: transparent; }
.slots.hint .slot { animation: flash 0.4s 3; }
.word {
  display: inline-flex; gap: 3px; padding: 4px; border-radius: 10px;
  background: #fff; box-shadow: 0 2px 0 var(--soya); animation: pop 0.3s;
}
.chip-row { display: flex; gap: 10px; }
.wall { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 520px; }
.wall-col { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 120px; }
.wall-title { font-weight: 800; }

/* Harf ranglari — .slot dan KEYIN turishi shart (oq fonni ustidan yozadi) */
.c0 { background: var(--c0); }
.c1 { background: var(--c1); }
.c2 { background: var(--c2); }
.c3 { background: var(--c3); }

.toast {
  position: absolute; left: 0; right: 0; top: 45%; z-index: 5;
  width: max-content; max-width: 90%; margin: 0 auto; padding: 10px 18px; border-radius: 12px;
  background: var(--matn); color: #fff; font-weight: 800; animation: pop 0.25s;
}

/* ---------- Raqam klaviaturasi va hisoblagich ---------- */
.keypad-wrap { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 6px; }
.num-display {
  height: 52px; border-radius: 12px; background: #fff; box-shadow: inset 0 0 0 3px var(--chiziq);
  display: grid; place-items: center; font-size: 32px; font-weight: 900;
}
.keypad { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
.key {
  min-height: 52px; min-width: 48px; border: none; border-radius: 12px; background: #fff;
  font-size: 24px; font-weight: 900; box-shadow: 0 3px 0 var(--soya);
}
.key.ok { background: var(--togri); color: #fff; }
.key.del { color: var(--yana); }
.counter { display: flex; align-items: center; gap: 12px; }
.counter .key { width: 56px; }
.counter-val { min-width: 110px; text-align: center; font-size: 22px; font-weight: 900; }

/* ---------- Formula ---------- */
.formula-box { display: flex; flex-direction: column; align-items: center; gap: 10px; max-width: 100%; text-align: center; }
.formula { font-size: clamp(22px, 6vw, 36px); font-weight: 900; overflow-wrap: anywhere; animation: pop 0.3s; }
.formula.big { color: var(--asosiy); font-size: clamp(28px, 8vw, 44px); }
.formula-row { font-size: 22px; font-weight: 800; animation: pop 0.3s; }
.legend { font-size: 18px; }
.slot-f { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.slot-cap { font-size: 18px; font-weight: 700; }
.hint-title { font-weight: 800; border-bottom: 3px solid var(--yana); }

/* ---------- Daraxt ---------- */
.tree-box { width: 100%; flex: 1; min-height: 0; display: flex; justify-content: center; }
.tree { width: 100%; height: 100%; max-width: 560px; }
.tree .grow { animation: fade-in 0.6s ease-out both; }

/* ---------- Odamlar (3-bosqich) ---------- */
.people { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 560px; }
.person { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 52px; }
.person-svg { width: 40px; height: 50px; }
.people.small .person { min-width: 40px; }
.people.small .person-svg { width: 28px; height: 35px; }
.noname { font-size: 18px; font-weight: 900; color: var(--yana); }
.hasname { font-size: 18px; font-weight: 900; color: var(--togri); }
.people-info { text-align: center; font-weight: 800; }

/* ---------- Baraban, pauza, final ---------- */
.pause-box { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.drum { width: 110px; }
.pause-options { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px; }
.pause-opt { display: flex; flex-direction: column; align-items: center; gap: 6px; font-weight: 800; }
.pause-or { font-weight: 800; }
.beats { display: flex; gap: 8px; min-height: 40px; }

/* ---------- Bosh ekran ---------- */
.cards { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 460px; }
.card {
  display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 10px 14px;
  border: none; border-radius: 16px; background: #fff; box-shadow: 0 3px 0 var(--soya); text-align: left;
}
.card-num {
  flex: none; width: 40px; height: 40px; border-radius: 50%;
  display: grid; place-items: center; background: var(--asosiy); color: #fff; font-weight: 900;
}
.card.done .card-num { background: var(--togri); }
.card-title { flex: 1; font-weight: 800; }
.card-state { font-size: 22px; }

/* ---------- Qahramonlar harakati ---------- */
.actor-svg .body { animation: breathe 3s ease-in-out infinite; }
.actor-svg .eyes { animation: blink 4s infinite; transform-box: fill-box; transform-origin: center; }
.actor-svg .mouth, .actor-svg .head, .actor-svg .arm { transform-box: fill-box; }
.actor-svg .mouth { transform-origin: center; }
.actor-svg .head { transform-origin: 50% 100%; transition: transform 0.2s; }
.actor-svg .arm { transform-origin: 0 0; transition: transform 0.3s; }
.pose-talk .mouth { animation: talk 0.25s 3; }
.pose-happy { animation: hop 0.45s 2; }
.pose-think .head { transform: rotate(-8deg); }
.pose-point .arm { transform: rotate(-35deg); }
.pose-drum .body { animation: none; transform: translateY(2px); }
.arms-up { display: none; }
.pose-raise .arms-up { display: inline; }
.pose-raise .arms-down { display: none; }
.paper { transition: transform 0.35s; }
.pose-raise .paper { transform: translateY(-96px); }

@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
@keyframes breathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(1.5px); } }
@keyframes talk { 50% { transform: scaleY(2.2); } }
@keyframes hop { 50% { transform: translateY(-10px); } }
@keyframes shake { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
@keyframes pop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes flash { 50% { opacity: 0.35; } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.shake { animation: shake 0.35s; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **4-qadam: `js/ui.js`**

```js
// Umumiy ekran elementlari: pufak, tugmalar, kataklar, klaviatura, hisoblagich, progress.
// Kutish funksiyalari Promise qaytaradi. Bosh ekranga qaytilganda (newRun) eski Promise'lar
// hech qachon hal bo'lmaydi — eski sahna shu joyda "muzlaydi" va davom etmaydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const $ = (id) => document.getElementById(id);

  // ---------- Sahnani to'xtatish ----------
  let runId = 0;
  let cleanups = [];

  function newRun() {
    runId++;
    cleanups.forEach((fn) => fn());
    cleanups = [];
    return runId;
  }

  function onCleanup(fn) {
    cleanups.push(fn);
  }

  // Promise faqat shu sahna hali davom etayotgan bo'lsa hal bo'ladi
  function settle(executor) {
    const id = runId;
    return new Promise((resolve) => executor((value) => {
      if (id === runId) resolve(value);
    }));
  }

  const sleep = (ms) => settle((done) => setTimeout(done, ms));

  // ---------- Element yasash ----------
  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value === false || value == null) continue;
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else if (key === "html") el.innerHTML = value;
      else if (key === "onClick") el.addEventListener("click", value);
      else el.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children) if (child != null) el.append(child);
    return el;
  }

  function button(label, onClick, cls) {
    return h("button", {
      class: "btn " + (cls || ""),
      type: "button",
      text: label,
      onClick: () => { QK.sound.play("tap"); onClick(); },
    });
  }

  // ---------- Zonalar ----------
  const work = () => $("zone-work");
  const control = () => $("zone-control");
  const clearWork = () => { work().innerHTML = ""; };
  const clearControl = () => { control().innerHTML = ""; };
  const setCompact = (on) => $("play").classList.toggle("compact", !!on);

  // ---------- Qahramonlar ----------
  const actorSvg = (who) => $("actor-" + who).querySelector("svg");

  function pose(who, name, ms) {
    const svg = actorSvg(who);
    if (!svg) return;
    svg.classList.add("pose-" + name);
    if (ms) setTimeout(() => svg.classList.remove("pose-" + name), ms);
  }

  function resetPoses() {
    ["elder", "apprentice"].forEach((who) => {
      const svg = actorSvg(who);
      if (svg) svg.setAttribute("class", "actor-svg");
    });
  }

  // Shogird qog'ozidagi yozuv; bo'sh satr — qog'oz yashiriladi
  function paper(text) {
    const box = $("actor-apprentice");
    const t = box.querySelector(".paper-text");
    const p = box.querySelector(".paper");
    if (t) t.textContent = text;
    if (p) p.style.visibility = text ? "visible" : "hidden";
  }

  function raisePaper(on) {
    const svg = actorSvg("apprentice");
    if (svg) svg.classList.toggle("pose-raise", !!on);
  }

  // ---------- Nutq pufagi ----------
  function bubble(who, content) {
    const b = $("bubble");
    b.hidden = false;
    b.className = "bubble from-" + who;
    b.onclick = null;
    b.textContent = "";
    if (typeof content === "string") b.textContent = content;
    else b.append(content);
    pose(who, "talk", 900);
  }

  // Gap + "Davom" tugmasi; bola tugmani yoki pufakni bosguncha kutadi
  function say(who, content) {
    bubble(who, content);
    clearControl();
    return settle((done) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        $("bubble").onclick = null;
        clearControl();
        done();
      };
      control().append(button("Davom ▶", finish));
      $("bubble").onclick = finish;
    });
  }

  // ---------- Harflar ----------
  function tile(letter, colorIndex, size) {
    return h("span", { class: `tile c${colorIndex % 4} ${size || ""}`, text: letter });
  }

  function wordChip(word, letters) {
    const chip = h("span", { class: "word" });
    for (const ch of word) chip.append(tile(ch, letters.indexOf(ch), "xs"));
    return chip;
  }

  // Pufak ichida: matn + rangli harf kartochkalari (+ ixtiyoriy ikkinchi qator)
  function lettersLine(before, letters, after) {
    const line = h("div", { class: "bubble-line" }, h("span", { text: before }));
    letters.forEach((l, k) => line.append(tile(l, k, "sm")));
    return h("div", null, line, after ? h("div", { text: after }) : null);
  }

  function toast(text) {
    const t = h("div", { class: "toast", text });
    $("play").append(t);
    setTimeout(() => t.remove(), 1400);
  }

  const SUP = { 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 8: "⁸" };
  const sup = (n) => SUP[n] || "^" + n;

  // ---------- Qo'lda so'z yasash ----------
  // Harfni bosish → birinchi bo'sh katakka; to'lgan katakni bosish → bo'shatish.
  // Barcha `targets` topilganda hal bo'ladi.
  function buildWords({ letters, len, allowShort, targets, slotsHost, onFound }) {
    const found = new Set();
    const cells = [];

    function setCell(cell, letter) {
      cell.dataset.letter = letter || "";
      cell.textContent = letter || "";
      cell.className = "slot" + (letter ? ` filled c${letters.indexOf(letter) % 4}` : "");
    }
    const current = () => cells.map((c) => c.dataset.letter).join("");
    const clear = () => cells.forEach((c) => setCell(c, null));
    const isFull = () => cells.every((c) => c.dataset.letter);

    slotsHost.innerHTML = "";
    for (let k = 0; k < len; k++) {
      const cell = h("button", { class: "slot", type: "button", "aria-label": `${k + 1}-katak` });
      cell.addEventListener("click", () => {
        if (!cell.dataset.letter) return;
        QK.sound.play("tap");
        setCell(cell, null);
      });
      setCell(cell, null);
      cells.push(cell);
      slotsHost.append(cell);
    }

    return settle((done) => {
      function submit() {
        const word = current();
        if (!word || (!allowShort && word.length !== len)) return;
        if (found.has(word)) {
          QK.sound.play("retry");
          slotsHost.classList.remove("shake");
          void slotsHost.offsetWidth; // animatsiyani qaytadan boshlash
          slotsHost.classList.add("shake");
          toast("Bu soʻz bor edi! Boshqasini yasa.");
          setTimeout(clear, 400);
          return;
        }
        if (!targets.includes(word)) return;
        found.add(word);
        QK.sound.play("correct");
        onFound(word);
        clear();
        if (found.size === targets.length) {
          clearControl();
          done();
        }
      }

      const pad = h("div", { class: "letter-pad" });
      letters.forEach((l, k) => {
        pad.append(h("button", {
          class: `tile big c${k % 4}`,
          type: "button",
          text: l,
          onClick: () => {
            const empty = cells.find((c) => !c.dataset.letter);
            if (!empty) return;
            QK.sound.play("tap");
            setCell(empty, l);
            if (isFull()) setTimeout(() => { if (isFull()) submit(); }, 250);
          },
        }));
      });

      const extras = h("div", { class: "pad-extras" });
      if (allowShort) extras.append(button("Tayyor", submit));
      extras.append(button("Yordam", () => {
        const missing = targets.find((w) => !found.has(w));
        if (!missing) return;
        clear();
        [...missing].forEach((ch, k) => setCell(cells[k], ch));
        slotsHost.classList.add("hint");
        setTimeout(() => { slotsHost.classList.remove("hint"); clear(); }, 1200);
      }, "secondary"));

      clearControl();
      control().append(pad, extras);
    });
  }

  // ---------- Raqam klaviaturasi ----------
  // 2 qator × 6 tugma: 1–9, 0, ⌫, ✓. Kompyuterda klaviatura raqamlari, Backspace, Enter ham ishlaydi.
  function askNumber(maxLen = 3) {
    clearControl();
    let value = "";
    const display = h("div", { class: "num-display", "aria-live": "polite" });
    const render = () => { display.textContent = value || " "; };
    render();

    return settle((done) => {
      function press(k) {
        if (k === "ok") {
          if (!value) return;
          cleanup();
          clearControl();
          done(Number(value));
          return;
        }
        if (k === "del") value = value.slice(0, -1);
        else if (value.length < maxLen) value = (value === "0" ? "" : value) + k;
        QK.sound.play("tap");
        render();
      }

      function onKey(e) {
        if (/^[0-9]$/.test(e.key)) press(e.key);
        else if (e.key === "Backspace") press("del");
        else if (e.key === "Enter") {
          e.preventDefault();
          press("ok");
        }
      }
      const cleanup = () => document.removeEventListener("keydown", onKey);
      document.addEventListener("keydown", onKey);
      onCleanup(cleanup);

      const keys = h("div", { class: "keypad" });
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "del", "ok"].forEach((k) => {
        keys.append(h("button", {
          class: "key" + (k === "ok" ? " ok" : k === "del" ? " del" : ""),
          type: "button",
          text: k === "del" ? "⌫" : k === "ok" ? "✓" : k,
          "aria-label": k === "del" ? "Oʻchirish" : k === "ok" ? "Javob berish" : k,
          onClick: () => press(k),
        }));
      });
      control().append(h("div", { class: "keypad-wrap" }, display, keys));
    });
  }

  // ---------- Harflar soni hisoblagichi (3-bosqich) ----------
  function counter(host, { start, min, max, onChange }) {
    let a = start;
    const val = h("div", { class: "counter-val" });
    const minus = h("button", { class: "key", type: "button", text: "−", "aria-label": "Bitta kam" });
    const plus = h("button", { class: "key", type: "button", text: "+", "aria-label": "Bitta koʻp" });
    const render = () => {
      val.textContent = `${a} ta harf`;
      minus.disabled = a <= min;
      plus.disabled = a >= max;
    };
    const change = (d) => {
      a += d;
      QK.sound.play("tap");
      render();
      onChange(a);
    };
    minus.addEventListener("click", () => { if (a > min) change(-1); });
    plus.addEventListener("click", () => { if (a < max) change(1); });
    host.append(h("div", { class: "counter" }, minus, val, plus));
    render();
    onChange(a);
    return {
      disable() {
        minus.disabled = true;
        plus.disabled = true;
      },
    };
  }

  // ---------- Tanlov tugmalari ----------
  function choice(options) {
    clearControl();
    return settle((done) => {
      const row = h("div", { class: "choice-row" });
      options.forEach((o) => {
        row.append(button(o.label, () => { clearControl(); done(o.value); }, o.secondary ? "secondary" : ""));
      });
      control().append(row);
    });
  }

  // ---------- Progress ----------
  function setProgress(total, filled) {
    const p = $("progress");
    p.innerHTML = "";
    for (let k = 0; k < total; k++) p.append(h("span", { class: "dot" + (k < filled ? " on" : "") }));
  }

  const hideProgress = () => { $("progress").innerHTML = ""; };

  QK.ui = {
    newRun, onCleanup, settle, sleep, h, button,
    work, control, clearWork, clearControl, setCompact,
    pose, resetPoses, paper, raisePaper,
    bubble, say, tile, wordChip, lettersLine, toast, sup,
    buildWords, askNumber, counter, choice, setProgress, hideProgress,
  };
})(window);
```

- [ ] **5-qadam: `js/main.js`**

```js
// Ishga tushirish: qahramonlar, bosh ekran va bosqichlar oqimi.
(function (root) {
  "use strict";

  const { storage, sound, art, ui } = root.QK;
  const $ = (id) => document.getElementById(id);
  const TITLES = ["Aynan i harfli soʻzlar", "i harfgacha soʻzlar", "Nechta harf kerak?"];

  const state = storage.load();
  sound.setMuted(state.muted);
  const saveState = () => storage.save(state);

  function updateSoundButton() {
    const b = $("btn-sound");
    b.innerHTML = art.icon(state.muted ? "sound-off" : "sound-on");
    b.setAttribute("aria-label", state.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }

  function home() {
    ui.newRun();
    ui.resetPoses();
    ui.setCompact(false);
    ui.hideProgress();
    ui.paper("");
    ui.clearWork();
    ui.clearControl();
    ui.bubble("elder", "Salom! Bu — «Qabila kodlari». Qaysi bosqichni oʻynaymiz?");

    const cards = ui.h("div", { class: "cards" });
    TITLES.forEach((title, k) => {
      const open = k === 0 || state.done[k - 1];
      cards.append(ui.h("button", {
        class: "card" + (state.done[k] ? " done" : ""),
        type: "button",
        disabled: !open,
        onClick: () => { sound.play("tap"); play(k + 1); },
      },
      ui.h("span", { class: "card-num", text: String(k + 1) }),
      ui.h("span", { class: "card-title", text: title }),
      ui.h("span", { class: "card-state", text: state.done[k] ? "✓" : open ? "" : "🔒" })));
    });
    ui.work().append(cards);

    const next = state.done.indexOf(false);
    const start = next === -1 ? 1 : next + 1;
    ui.control().append(ui.button(next === -1 ? "Qayta oʻynash" : "Boshlash", () => play(start), "big"));
  }

  async function play(stage) {
    const scenes = root.QK.scenes;
    ui.newRun();
    ui.resetPoses();
    ui.hideProgress();
    ui.clearControl();
    if (stage === 1 && !state.done[0]) await scenes.intro();
    for (let s = stage; s <= 3; s++) {
      await scenes["stage" + s]();
      state.done[s - 1] = true;
      saveState();
      if (s < 3) await scenes.stageDone(s);
    }
    await scenes.finale();
    const next = await scenes.congrats();
    if (next === "replay") play(1);
    else home();
  }

  $("actor-elder").innerHTML = art.elder();
  $("actor-apprentice").innerHTML = art.apprentice();
  $("btn-home").innerHTML = art.icon("home");
  updateSoundButton();

  $("btn-home").addEventListener("click", () => { sound.play("tap"); home(); });
  $("btn-sound").addEventListener("click", () => {
    state.muted = !state.muted;
    sound.setMuted(state.muted);
    saveState();
    updateSoundButton();
    sound.play("tap");
  });
  // Brauzer talabi: ovoz faqat birinchi bosishdan keyin
  document.addEventListener("pointerdown", () => sound.unlock());
  document.addEventListener("keydown", () => sound.unlock());

  // O'qituvchi va sinov uchun: ?bosqich=2 — shu bosqichdan boshlash
  const direct = Number(new URLSearchParams(root.location.search).get("bosqich"));
  if (direct >= 1 && direct <= 3) play(direct);
  else home();
})(window);
```

- [ ] **6-qadam: lokal serverni ishga tushirish**

Fon rejimida (Bash `run_in_background: true`):
```bash
cd /Users/bicoder/Documents/Information/oyinlar/01-qabila-kodlari && python3 -m http.server 8765
```
Keyingi vazifalarda ham shu server ishlatiladi.

- [ ] **7-qadam: bosh ekranni brauzerda tekshirish (Playwright MCP)**

Har bir o'lcham uchun: `browser_resize` → `browser_navigate` `http://localhost:8765/` → `browser_take_screenshot` → skrinshotni ko'rib chiqish.
O'lchamlar: 375×667 (telefon tik), 667×375 (telefon yotiq), 1280×800 (kompyuter).

Tekshiriladi:
- Oqsoqol va Shogird ko'rinadi, ko'zlarini qisadi; pufakda "Salom! Bu — «Qabila kodlari»…" matni, `ʻ` belgisi to'g'ri chiqadi.
- 3 ta bosqich kartasi: 1-ochiq, 2 va 3 — 🔒 va bosilmaydi. "Boshlash" tugmasi bor.
- Tepada uy va ovoz ikonkalari.
- `browser_evaluate`: `document.documentElement.scrollWidth <= innerWidth` → `true` (gorizontal scroll yo'q).
- `browser_evaluate`: `document.fonts.check('18px Nunito')` → `true`.
- `browser_console_messages`: xato yo'q.
- Ovoz tugmasini bosish → ikonka "sound-off" ga almashadi; sahifani yangilash → holat saqlangan.

Rasm yoki joylashuvda nuqson bo'lsa (qahramon qismlari joyidan siljigan, pufak qahramonni yopib qo'ygan va h.k.), `art.js` yoki `style.css` da tuzatib, skrinshotni qaytadan oling. `art.js` o'zgarsa, `node --test tests/*.test.js` qayta ishga tushiriladi.

- [ ] **8-qadam: commit**

```bash
git add index.html css/style.css fonts/Nunito.woff2 fonts/OFL.txt js/ui.js js/main.js
git commit -m "01-qabila-kodlari: sahifa, uslublar, UI elementlari va bosh ekran" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 5-vazifa: Umumiy sahna qismlari va 1-bosqich

**Fayllar:**
- Yaratish: `js/scenes/common.js`, `js/scenes/stage1.js`
- O'zgartirish: `index.html` (skriptlar ro'yxati)

**Interfeyslar:**
- Oldingi vazifalardan: `QK.logic`, `QK.ui`, `QK.sound`, `QK.art`.
- Keyingilarga beradi (`QK.common`):
  - `exercises(stage, spec) → Promise` — 3 ta to'g'ri javobgacha; `spec = { show(ex), hint(ex), solution(ex) }`. Joriy misol `QK.current` ga yoziladi (brauzerda tekshirish uchun).
  - `askUntilCorrect(answer, hint: () => void) → Promise<bool>` — ko'rsatish qismidagi bitta savol; `true` — bola o'zi topdi.
  - `hintTitle() → HTMLElement`, `variantSlots(a, i) → HTMLElement`, `paperText(type, i) → string`
  - `stage12Spec(type) → spec` — 1- va 2-bosqich mashqlari uchun.
  - `manualWall(letters, len, allowShort) → Promise`, `manualTree(letters, depth) → Promise`, `growTree(letters, depth) → Promise`, `treeLevels(letters, depth) → Promise`
- `QK.scenes.intro()`, `QK.scenes.stage1()`.

- [ ] **1-qadam: `js/scenes/common.js`**

```js
// Bosqichlar uchun umumiy sahna qismlari: mashq sikli, qo'lda yasash, daraxt sahnalari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, art } = QK;

  const PRAISE = ["Barakalla!", "Zoʻr!", "Toʻppa-toʻgʻri!", "Ofarin!"];

  // Mashq: 3 ta to'g'ri javobgacha tasodifiy misollar (QOIDALAR 4.4, 4.5).
  // 1-xato — maslahat (spec.hint), 2-xato — yechim (spec.solution) va yangi misol, u hisobga olinmaydi.
  async function exercises(stage, spec) {
    let prev = null;
    let correct = 0;
    ui.setProgress(3, 0);
    while (correct < 3) {
      const ex = logic.makeExercise(stage, prev);
      prev = ex;
      QK.current = ex; // brauzerda tekshirish uchun
      spec.show(ex);
      for (let wrong = 0; ; ) {
        const value = await ui.askNumber();
        if (logic.checkAnswer(ex, value)) {
          correct++;
          ui.setProgress(3, correct);
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          await ui.say("elder", PRAISE[(correct - 1) % PRAISE.length]);
          break;
        }
        wrong++;
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        if (wrong === 1) {
          spec.hint(ex);
        } else {
          spec.solution(ex);
          await ui.say("elder", `Toʻgʻri javob: ${ex.answer}. Endi yangi misol.`);
          break;
        }
      }
    }
    ui.hideProgress();
  }

  // Ko'rsatish qismidagi bitta savol. true — bola o'zi topdi, false — 2 xatodan keyin javob aytildi.
  async function askUntilCorrect(answer, hint) {
    QK.current = { answer }; // brauzerda tekshirish uchun
    for (let wrong = 0; ; ) {
      const value = await ui.askNumber();
      if (value === answer) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        return true;
      }
      wrong++;
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      if (wrong === 1) {
        hint();
      } else {
        await ui.say("elder", `Toʻgʻri javob: ${answer}.`);
        return false;
      }
    }
  }

  const hintTitle = () => ui.h("div", { class: "hint-title", text: "Maslahat:" });

  // □ □ □ kataklari, har birining tagida variantlar soni
  function variantSlots(a, i) {
    const row = ui.h("div", { class: "slots" });
    const caption = i <= 3 ? `${a} ta variant` : `${a} ta`;
    for (let k = 0; k < i; k++) {
      row.append(ui.h("div", { class: "slot-f" },
        ui.h("div", { class: "slot" }),
        ui.h("div", { class: "slot-cap", text: caption })));
    }
    return row;
  }

  const paperText = (type, i) => (type === "exact" ? String(i) : `1–${i}`);

  // 1- va 2-bosqich mashqlari (DIZAYN 4.3, 5.3)
  function stage12Spec(type) {
    return {
      show(ex) {
        ui.setCompact(false);
        ui.clearWork();
        ui.paper(paperText(type, ex.i));
        ui.raisePaper(true);
        const question = type === "exact"
          ? `Aynan ${ex.i} harfli nechta soʻz bor?`
          : `${ex.i} harfgacha (1, 2, …, ${ex.i} harfli) nechta soʻz bor?`;
        ui.bubble("elder", ui.lettersLine("Harflar:", ex.letters, question));
      },
      hint(ex) {
        ui.clearWork();
        const box = ui.h("div", { class: "formula-box" }, hintTitle());
        if (type === "exact") {
          box.append(
            variantSlots(ex.a, ex.i),
            ui.h("div", { class: "formula", text: `${logic.productText(ex.a, ex.i)} = ?` }));
        } else {
          for (let k = 1; k <= ex.i; k++) {
            box.append(ui.h("div", { class: "formula-row", text: `${k} harfli: ${logic.productText(ex.a, k)}` }));
          }
          box.append(ui.h("div", { class: "formula", text: `${logic.sumText(ex.a, ex.i)} = ?` }));
        }
        ui.work().append(box);
      },
      solution(ex) {
        ui.clearWork();
        const text = type === "exact"
          ? `${logic.productText(ex.a, ex.i)} = ${ex.answer}`
          : `${logic.sumText(ex.a, ex.i)} = ${ex.answer}`;
        ui.work().append(ui.h("div", { class: "formula-box" }, ui.h("div", { class: "formula", text })));
      },
    };
  }

  // Qo'lda yasash + devor. allowShort — 1..len harfli so'zlar (2-bosqich), devor ikki ustunli
  async function manualWall(letters, len, allowShort) {
    ui.setCompact(false);
    ui.clearWork();
    const slots = ui.h("div", { class: "slots" });
    const wall = ui.h("div", { class: "wall" });
    const cols = {};
    if (allowShort) {
      for (let k = 1; k <= len; k++) {
        cols[k] = ui.h("div", { class: "wall-col" }, ui.h("div", { class: "wall-title", text: `${k} harfli` }));
        wall.append(cols[k]);
      }
    }
    ui.work().append(slots, wall);
    await ui.buildWords({
      letters,
      len,
      allowShort,
      targets: logic.listWords(letters, len, allowShort ? "upto" : "exact"),
      slotsHost: slots,
      onFound: (w) => (allowShort ? cols[w.length] : wall).append(ui.wordChip(w, letters)),
    });
  }

  // Qo'lda yasash + daraxt: topilgan so'zning yo'li rangga kiradi (DIZAYN 1.2)
  async function manualTree(letters, depth) {
    ui.setCompact(true);
    ui.clearWork();
    const slots = ui.h("div", { class: "slots" });
    const box = ui.h("div", { class: "tree-box" });
    ui.work().append(slots, box);
    const lit = new Set();
    const draw = () => { box.innerHTML = art.tree(letters, depth, { lit }); };
    draw();
    await ui.buildWords({
      letters,
      len: depth,
      allowShort: false,
      targets: logic.listWords(letters, depth, "exact"),
      slotsHost: slots,
      onFound: (w) => { lit.add(w); draw(); },
    });
  }

  // Daraxt bir qavat o'sadi: depth−1 dan depth ga (DIZAYN 1.3)
  async function growTree(letters, depth) {
    ui.setCompact(true);
    ui.clearWork();
    const box = ui.h("div", { class: "tree-box" });
    ui.work().append(box);
    box.innerHTML = art.tree(letters, depth - 1, { lit: new Set(logic.listWords(letters, depth - 1, "exact")) });
    await ui.sleep(900);
    box.innerHTML = art.tree(letters, depth, {
      lit: new Set(logic.listWords(letters, depth, "exact")),
      animateLevel: depth,
    });
    await ui.sleep(1200);
  }

  // Har bir tugun — so'z: qavatlar birin-ketin yonadi, tepasida "{n} ta" (DIZAYN 2.2)
  async function treeLevels(letters, depth) {
    ui.setCompact(true);
    ui.clearWork();
    const box = ui.h("div", { class: "tree-box" });
    ui.work().append(box);
    const levels = [];
    for (let lv = 1; lv <= depth; lv++) {
      levels.push(lv);
      box.innerHTML = art.tree(letters, depth, {
        lit: new Set(logic.listWords(letters, lv, "upto")),
        levelCounts: levels.slice(),
        animateLevel: lv,
      });
      await ui.sleep(900);
    }
  }

  QK.common = {
    PRAISE, exercises, askUntilCorrect, hintTitle, variantSlots, paperText, stage12Spec,
    manualWall, manualTree, growTree, treeLevels,
  };
})(window);
```

- [ ] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish sahnasi va 1-bosqich: aynan i harfli so'zlar (DIZAYN.md, 4-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, common } = QK;
  const AU = ["A", "U"];
  const AUF = ["A", "U", "F"];

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.paper("");
    await ui.say("elder", "Salom! Men qabila oqsoqoliman.");
    await ui.say("elder", "Qabilamizda endigina yozuv paydo boʻldi. Lekin alifbomizda bir nechta harf bor, xolos.");
    await ui.say("apprentice", "Har bir narsaga nom kerak. Nechta soʻz yasay olamiz? Keling, bilib olamiz!");
  }

  // 4.2: kataklar → ko'paytma → daraja → ta'rif → umumiy formula
  async function formulaExact(a, i) {
    ui.setCompact(false);
    ui.clearWork();
    const n = logic.countExact(a, i);
    const box = ui.h("div", { class: "formula-box" }, common.variantSlots(a, i));
    ui.work().append(box);
    await ui.say("elder", `Har bir katakka ${a} xil harf qoʻyish mumkin.`);
    box.append(ui.h("div", { class: "formula", text: `${logic.productText(a, i)} = ${n}` }));
    await ui.say("elder", "Shuning uchun ularni koʻpaytiramiz.");
    box.append(ui.h("div", { class: "formula", html: `Qisqacha: ${a}<sup>${i}</sup> = ${n}` }));
    await ui.say("elder", `${a} ni ${i} marta koʻpaytirish qisqacha ${a}${ui.sup(i)} deb yoziladi.`);
    box.append(
      ui.h("div", { class: "formula big", html: "N = a<sup>i</sup>" }),
      ui.h("div", { class: "legend", text: "a — harflar soni, i — soʻz uzunligi, N — soʻzlar soni" }));
    await ui.say("elder", "Qoida: alifboda nechta harf boʻlsa, shu sonni soʻz uzunligicha marta koʻpaytiramiz.");
  }

  async function stage1() {
    // 1.1 — qo'lda yasash: A, U, aynan 2 harfli
    ui.setCompact(false);
    ui.clearWork();
    ui.paper("2");
    ui.raisePaper(true);
    await ui.say("elder", ui.lettersLine("Alifbomizda 2 ta harf bor:", AU));
    await ui.say("apprentice", "Qogʻozimda 2 yozilgan. Demak, soʻz aynan 2 harfli boʻladi.");
    ui.bubble("elder", "Harflarni bosib soʻz yasa. Hammasini top!");
    await common.manualWall(AU, 2, false);
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", "Barakalla! 2 ta harfdan aynan 2 harfli 4 ta soʻz chiqdi.");

    // 1.2 — qo'lda yasash + daraxt: A, U, F
    await ui.say("elder", ui.lettersLine("Endi harflar 3 ta:", AUF));
    ui.bubble("elder", "Soʻz yasagan sari daraxt rangga kiradi. Hammasini top!");
    await common.manualTree(AUF, 2);
    sound.play("win");
    await ui.say("elder", "Ajoyib, 9 ta soʻz! Har bir shox yana 3 taga boʻlinadi.");

    // 1.3 — daraxt o'sadi: aynan 3 harfli
    ui.paper("3");
    await ui.say("apprentice", "Qogʻozimda endi 3. Soʻz aynan 3 harfli!");
    ui.bubble("elder", "Hammasini yasash uzoq. Daraxtga qara!");
    ui.pose("elder", "point", 2000);
    await common.growTree(AUF, 3);
    ui.bubble("elder", "Nechta soʻz boʻldi?");
    const ok = await common.askUntilCorrect(27, () => {
      ui.bubble("elder", "9 ta bargning har biridan 3 ta yangi barg chiqdi. Nechta boʻldi?");
    });
    if (ok) await ui.say("elder", "Toʻgʻri, 27 ta!");

    await formulaExact(3, 3);

    await ui.say("elder", "Endi oʻzing hisobla! 3 ta toʻgʻri javob — bosqich tugaydi.");
    await common.exercises(1, common.stage12Spec("exact"));
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [ ] **3-qadam: skriptlarni `index.html` ga ulash**

`index.html` dagi `<!-- sahnalar (5–8-vazifalar) shu yerga, main.js dan oldin qo'shiladi -->` qatoridan keyin qo'shing:

```html
  <script src="js/scenes/common.js"></script>
  <script src="js/scenes/stage1.js"></script>
```

- [ ] **4-qadam: sintaksis va eski testlar**

Buyruq: `node --check js/scenes/common.js && node --check js/scenes/stage1.js && node --test tests/*.test.js`
Kutilgan natija: xatosiz, testlar PASS.

- [ ] **5-qadam: 1-bosqichni brauzerda o'ynab chiqish (Playwright MCP)**

Server ishlab turibdi (4-vazifa, 6-qadam). O'lcham 375×667.
1. `browser_navigate` `http://localhost:8765/` → `browser_evaluate` `localStorage.clear()` → `browser_navigate` `http://localhost:8765/?bosqich=1`.
2. Kirish: 3 marta "Davom" (bir marta pufakni bosib ham ko'ring).
3. **1.1:** A,A → devorda `AA`; yana A,A → "Bu soʻz bor edi!" va silkinish; "Yordam" → yetishmayotgan so'z kataklarda miltillaydi; qolganlari (AU, UA, UU) → tabrik. Skrinshot.
4. **1.2:** 9 ta so'z (AA … FF) — har bir so'zdan keyin daraxtda yo'l rangga kiradi. Skrinshot (qahramonlar kichraygan).
5. **1.3:** daraxt 27 bargga o'sadi, barglar rangli kvadratchalar. Skrinshot. Javob `20` → maslahat pufagi; `27` → "Toʻgʻri, 27 ta!".
6. **Formula:** kataklar → `3 × 3 × 3 = 27` → `Qisqacha: 3³ = 27` → `N = aⁱ`. Skrinshot.
7. **Mashq:** javobni `browser_evaluate` `QK.current.answer` bilan bilib oling.
   - 1-misol: to'g'ri javob → 1-doira to'ladi.
   - 2-misol: 1 marta xato → "Maslahat:" bloki (kataklar + `a × a × … = ?`), keyin to'g'ri javob. Skrinshot.
   - 3-misol: 2 marta xato → yechim va "Toʻgʻri javob: …" → yangi misol, doiralar soni o'zgarmagan.
   - Kompyuter klaviaturasini ham tekshiring: `browser_press_key` bilan raqamlar va `Enter`.
   - Yana 2 ta to'g'ri javob → 3 ta doira.
8. Bosqich tugagach konsolda `scenes.stageDone is not a function` xatosi chiqadi — **bu kutilgan**, `final.js` 8-vazifada qo'shiladi. `browser_evaluate` `localStorage.getItem('qabila-kodlari:v1')` → `done[0] === true`.
9. Uy tugmasi → bosh ekran: 1-karta ✓, 2-karta ochiq. O'yin o'rtasida uy tugmasini bosib ko'ring: eski sahna davom etmasligi kerak (pufak va tugmalar bosh ekranniki bo'lib qoladi).
10. 1.2, 1.3 va formula ekranlarini 667×375 va 1280×800 da ham skrinshot qiling (`?bosqich=1`, "Davom"lar orqali). Gorizontal scroll yo'q (`scrollWidth <= innerWidth`).

Nuqsonlar topilsa — tuzating va shu qadamni qaytaring.

- [ ] **6-qadam: commit**

```bash
git add index.html js/scenes/common.js js/scenes/stage1.js
git commit -m "01-qabila-kodlari: umumiy sahnalar, kirish va 1-bosqich" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 6-vazifa: 2-bosqich (i harfgacha so'zlar)

**Fayllar:**
- Yaratish: `js/scenes/stage2.js`
- O'zgartirish: `index.html`

**Interfeyslar:**
- Oldingi vazifalardan: `QK.common.manualWall`, `treeLevels`, `askUntilCorrect`, `exercises`, `stage12Spec` (5-vazifa); `QK.art.drum`; `QK.ui`.
- Keyingilarga beradi: `QK.scenes.stage2()`.

- [ ] **1-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: i harfgacha so'zlar (DIZAYN.md, 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, art, common } = QK;
  const AU = ["A", "U"];
  const AUF = ["A", "U", "F"];

  // 2.3: pauzasiz xabarni ikki xil tushunish mumkin (baholanmaydi)
  async function pauseScene() {
    ui.setCompact(false);
    ui.clearWork();
    ui.raisePaper(false);
    const box = ui.h("div", { class: "pause-box", html: art.drum() });
    const beats = ui.h("div", { class: "beats" });
    box.append(beats);
    ui.work().append(box);
    await ui.say("apprentice", "Barabanda xabar chalaman: A — tak, U — dum. Tingla!");
    ui.pose("apprentice", "drum", 200);
    sound.play("tak");
    beats.append(ui.tile("A", 0, "sm"));
    await ui.sleep(300);
    ui.pose("apprentice", "drum", 200);
    sound.play("dum");
    beats.append(ui.tile("U", 1, "sm"));
    await ui.sleep(500);
    box.append(ui.h("div", { class: "pause-options" },
      ui.h("div", { class: "pause-opt" }, ui.wordChip("AU", AU), ui.h("div", { text: "bitta soʻz" })),
      ui.h("div", { class: "pause-or", text: "yoki" }),
      ui.h("div", { class: "pause-opt" },
        ui.h("div", { class: "chip-row" }, ui.wordChip("A", AU), ui.wordChip("U", AU)),
        ui.h("div", { text: "ikkita soʻz" }))));
    await ui.say("elder", "Bu «AU» degan bitta soʻzmi yoki «A» va «U» degan ikkita soʻzmi? Bilib boʻlmaydi!");
    await ui.say("elder", "Shuning uchun soʻzlar orasiga pauza qoʻyamiz. Morze alifbosida ham shunday.");
  }

  // 5.2: har bir uzunlik alohida → yig'indi → umumiy formula
  async function formulaUpTo(a, i) {
    ui.setCompact(false);
    ui.clearWork();
    const box = ui.h("div", { class: "formula-box" });
    ui.work().append(box);
    for (let k = 1; k <= i; k++) {
      const text = k === 1
        ? `1 harfli: ${a}`
        : `${k} harfli: ${logic.productText(a, k)} = ${logic.countExact(a, k)}`;
      box.append(ui.h("div", { class: "formula-row", text }));
    }
    await ui.say("elder", "Har bir uzunlikni 1-bosqichdagidek alohida hisoblaymiz.");
    const parts = [];
    for (let k = 1; k <= i; k++) parts.push(logic.countExact(a, k));
    box.append(ui.h("div", { class: "formula", text: `${parts.join(" + ")} = ${logic.countUpTo(a, i)}` }));
    await ui.say("elder", "Keyin hammasini qoʻshamiz.");
    box.append(ui.h("div", { class: "formula big", html: "N = a<sup>1</sup> + a<sup>2</sup> + … + a<sup>i</sup>" }));
    await ui.say("elder", "Qoida: har bir uzunlik uchun 1-bosqichdagidek hisoblaymiz, keyin hammasini qoʻshamiz.");
  }

  async function stage2() {
    // 2.1 — qo'lda yasash: A, U, 2 harfgacha
    ui.setCompact(false);
    ui.clearWork();
    ui.paper("1–2");
    ui.raisePaper(true);
    await ui.say("elder", "Endi soʻz 1 harfli ham, 2 harfli ham boʻlishi mumkin.");
    await ui.say("apprentice", "Qogʻozimda 1–2. Demak, soʻz 2 harfgacha.");
    ui.bubble("elder", "1 harfli soʻz uchun bitta harf qoʻyib, «Tayyor»ni bos. Hammasini top!");
    await common.manualWall(AU, 2, true);
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", "Barakalla! 2 + 4 = 6 ta soʻz.");

    // 2.2 — daraxtdagi hamma tugunlar
    ui.bubble("elder", "Daraxtga qara: endi har bir tugun — soʻz.");
    ui.pose("elder", "point", 2000);
    await common.treeLevels(AU, 2);
    await ui.say("elder", "1-qavatda 2 ta, 2-qavatda 4 ta. Hammasi 6 ta.");
    ui.paper("1–3");
    await ui.say("elder", ui.lettersLine("Endi harflar:", AUF, "Soʻz 3 harfgacha."));
    ui.bubble("elder", "Qavatlarni kuzat!");
    await common.treeLevels(AUF, 3);
    ui.bubble("elder", "Hammasi boʻlib nechta soʻz?");
    const ok = await common.askUntilCorrect(39, () => {
      ui.bubble("elder", "Har bir qavatdagi sonlarni qoʻsh: 3 + 9 + 27.");
    });
    if (ok) await ui.say("elder", "Toʻgʻri, 39 ta!");

    // 2.3 va formula
    await pauseScene();
    await formulaUpTo(3, 3);

    await ui.say("elder", "Endi oʻzing hisobla! 3 ta toʻgʻri javob — bosqich tugaydi.");
    await common.exercises(2, common.stage12Spec("upto"));
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [ ] **2-qadam: `index.html` ga ulash**

`<script src="js/scenes/stage1.js"></script>` qatoridan keyin:

```html
  <script src="js/scenes/stage2.js"></script>
```

- [ ] **3-qadam: sintaksis va testlar**

Buyruq: `node --check js/scenes/stage2.js && node --test tests/*.test.js`
Kutilgan natija: xatosiz, testlar PASS.

- [ ] **4-qadam: 2-bosqichni brauzerda o'ynab chiqish (Playwright MCP)**

O'lcham 375×667, manzil `http://localhost:8765/?bosqich=2`.
1. **2.1:** Qog'ozda `1–2`. A → "Tayyor" → devorning "1 harfli" ustunida `A`; U → "Tayyor"; keyin AA, AU, UA, UU (avtomatik). Bo'sh kataklarda "Tayyor" hech narsa qilmaydi. Tabrik. Skrinshot.
2. **2.2:** A,U daraxtida qavatlar birin-ketin yonadi, tepada "2 ta", "4 ta". Keyin A,U,F daraxti: "3 ta", "9 ta", "27 ta". Skrinshot. Javob `30` → maslahat; `39` → "Toʻgʻri, 39 ta!".
3. **2.3:** baraban, `A` va `U` kartochkalari paydo bo'ladi, keyin "bitta soʻz / yoki / ikkita soʻz". Skrinshot.
4. **Formula:** `1 harfli: 3`, `2 harfli: 3 × 3 = 9`, `3 harfli: 3 × 3 × 3 = 27`, `3 + 9 + 27 = 39`, `N = a¹ + a² + … + aⁱ`. Skrinshot.
5. **Mashq:** qog'ozda `1–{i}`. 1 marta xato → maslahat: har bir uzunlik alohida qatorda va `… = ?`. Skrinshot. 2 marta xato → yechim va yangi misol. `QK.current.answer` bilan 3 ta to'g'ri javob.
6. Konsolda faqat kutilgan `stageDone` xatosi (8-vazifagacha). `done[1] === true`.
7. 2.2 va formula ekranlarini 667×375 va 1280×800 da skrinshot qiling; gorizontal scroll yo'q.

- [ ] **5-qadam: commit**

```bash
git add index.html js/scenes/stage2.js
git commit -m "01-qabila-kodlari: 2-bosqich" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 7-vazifa: 3-bosqich (eng kamida nechta harf)

**Fayllar:**
- Yaratish: `js/scenes/stage3.js`
- O'zgartirish: `index.html`

**Interfeyslar:**
- Oldingi vazifalardan: `QK.logic.LETTER_POOL`, `listWords`, `countWords`, `stage3Steps`; `QK.ui.counter`, `settle`; `QK.common.exercises`, `hintTitle`, `paperText`; `QK.art.person`.
- Keyingilarga beradi: `QK.scenes.stage3()`.

- [ ] **1-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: eng kamida nechta harf kerak (DIZAYN.md, 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, art, common } = QK;

  const condText = (type, i) => (type === "exact" ? `aynan ${i} harfli` : `${i} harfgacha`);

  // a ta harfdan yasalgan ismlar odamlarga birma-bir beriladi. a = 0 — hech kimda ism yo'q.
  // Odam ko'p bo'lsa (12 dan ortiq), ism o'rniga ✓ ko'rsatiladi — ekranga sig'ishi uchun.
  function renderCrowd(crowd, info, people, i, type, a) {
    const letters = logic.LETTER_POOL.slice(0, a);
    const names = logic.listWords(letters, i, type);
    const small = people > 12;
    crowd.innerHTML = "";
    crowd.classList.toggle("small", small);
    for (let p = 0; p < people; p++) {
      const name = names[p];
      let label;
      if (!name) label = ui.h("div", { class: "noname", text: "?" });
      else if (small) label = ui.h("div", { class: "hasname", text: "✓" });
      else label = ui.wordChip(name, letters);
      crowd.append(ui.h("div", { class: "person" }, ui.h("div", { html: art.person(!!name, p) }), label));
    }
    if (info) {
      const n = names.length;
      info.textContent = n >= people
        ? `${a} ta harf → ${n} ta ism. Hammaga yetdi ✓`
        : `${a} ta harf → ${n} ta ism. ${people - n} kishiga yetmadi.`;
    }
  }

  // "1 ta harf → 1 ta soʻz — yetmaydi" qatorlari (qoida va 2-xatodagi yechim uchun)
  function stepsBox(title, people, i, type) {
    const box = ui.h("div", { class: "formula-box" }, ui.h("div", { class: "formula-row", text: title }));
    for (const s of logic.stage3Steps(people, i, type)) {
      box.append(ui.h("div", {
        class: "formula-row",
        text: `${s.a} ta harf → ${s.count} ta soʻz ${s.enough ? "✓ yetadi" : "— yetmaydi"}`,
      }));
    }
    return box;
  }

  // 6.1: bola "+" ni bosib harflar sonini oshiradi; yetgan birinchi son — javob
  async function peopleDemo(people, i, type) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper(common.paperText(type, i));
    ui.raisePaper(true);
    const crowd = ui.h("div", { class: "people" });
    const info = ui.h("div", { class: "people-info" });
    const tools = ui.h("div");
    ui.work().append(crowd, info, tools);
    renderCrowd(crowd, null, people, i, type, 0);
    await ui.say("elder", `Qabilada ${people} ta odam bor. Har biriga boshqa-boshqa ism kerak.`);
    ui.bubble("elder", `Ism ${condText(type, i)}. «+» ni bosib, eng kamida nechta harf kerakligini top.`);
    const answer = await ui.settle((done) => {
      let c = null;
      c = ui.counter(tools, {
        start: 1,
        min: 1,
        max: 4,
        onChange: (a) => {
          renderCrowd(crowd, info, people, i, type, a);
          if (logic.countWords(a, i, type) >= people) {
            if (c) c.disable();
            done(a);
          }
        },
      });
    });
    sound.play("correct");
    ui.pose("apprentice", "happy", 900);
    await ui.say("elder", `${answer - 1} ta harf yetmadi, ${answer} ta yetdi. Demak, eng kamida ${answer} ta.`);
    return answer;
  }

  // 6.2: qoida
  async function ruleStage3() {
    ui.setCompact(false);
    ui.clearWork();
    ui.raisePaper(false);
    ui.work().append(stepsBox("5 ta odam, ism aynan 2 harfli:", 5, 2, "exact"));
    await ui.say("elder", "Qoida: harflar sonini 1 dan boshlab bittadan oshiramiz.");
    await ui.say("elder", "Soʻzlar soni odamlar sonidan kam boʻlmay qolgan birinchi son — javob.");
  }

  // 6.3: mashq
  const stage3Spec = {
    show(ex) {
      ui.setCompact(false);
      ui.clearWork();
      ui.paper(common.paperText(ex.type, ex.i));
      ui.raisePaper(true);
      ui.bubble("elder", `${ex.people} ta odam bor, ism ${condText(ex.type, ex.i)}. Eng kamida nechta harf kerak?`);
      const crowd = ui.h("div", { class: "people" });
      ui.work().append(crowd);
      renderCrowd(crowd, null, ex.people, ex.i, ex.type, 0);
    },
    hint(ex) {
      ui.clearWork();
      const crowd = ui.h("div", { class: "people" });
      const info = ui.h("div", { class: "people-info" });
      const tools = ui.h("div");
      // Hisoblagich tepada — odamlar ko'p bo'lsa ham ko'rinib turadi
      ui.work().append(common.hintTitle(), tools, info, crowd);
      ui.counter(tools, {
        start: 1,
        min: 1,
        max: 4,
        onChange: (a) => renderCrowd(crowd, info, ex.people, ex.i, ex.type, a),
      });
    },
    solution(ex) {
      ui.clearWork();
      ui.work().append(stepsBox(`${ex.people} ta odam, ism ${condText(ex.type, ex.i)}:`, ex.people, ex.i, ex.type));
    },
  };

  async function stage3() {
    await peopleDemo(5, 2, "upto");
    await peopleDemo(5, 2, "exact");
    await ui.say("elder", "Savol deyarli bir xil, lekin javoblar har xil: 2 va 3. «Aynan» va «gacha» soʻzlariga diqqat qil!");
    await ruleStage3();
    await ui.say("elder", "Endi oʻzing top! 3 ta toʻgʻri javob — bosqich tugaydi.");
    await common.exercises(3, stage3Spec);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
```

- [ ] **2-qadam: `index.html` ga ulash**

`<script src="js/scenes/stage2.js"></script>` qatoridan keyin:

```html
  <script src="js/scenes/stage3.js"></script>
```

- [ ] **3-qadam: sintaksis va testlar**

Buyruq: `node --check js/scenes/stage3.js && node --test tests/*.test.js`
Kutilgan natija: xatosiz, testlar PASS.

- [ ] **4-qadam: 3-bosqichni brauzerda o'ynab chiqish (Playwright MCP)**

O'lcham 375×667, manzil `http://localhost:8765/?bosqich=3`.
1. **3.1:** 5 ta odam, hammasida "?". Qog'ozda `1–2`. "+" bosilmagan holatda: "1 ta harf → 2 ta ism. 3 kishiga yetmadi." — 2 kishida ism (`A`, `AA`), 3 kishi xafa. Skrinshot. "+" → 2 ta harf, 6 ta ism, hammaga yetdi ✓ → "1 ta harf yetmadi, 2 ta yetdi…". Hisoblagich o'chadi.
2. **3.2:** qog'ozda `2`. 1 → 1 ta ism; "+" → 4 ta ism, 1 kishi qoldi; "+" → 9 ta, yetdi → "eng kamida 3 ta". Skrinshot.
3. "javoblar har xil: 2 va 3" pufagi, keyin qoida: `1 ta harf → 1 ta soʻz — yetmaydi`, `2 ta harf → 4 ta soʻz — yetmaydi`, `3 ta harf → 9 ta soʻz ✓ yetadi`. Skrinshot.
4. **Mashq:** savol pufagida odamlar soni va shart; odamlar "?" bilan chizilgan (12 dan ko'p bo'lsa — kichik). 1 marta xato → maslahat: tepada hisoblagich, odamlar birga o'zgaradi. Skrinshot (ko'p odamli misolda ham). 2 marta xato → qadamlar ro'yxati va yangi misol. `QK.current.answer` bilan 3 ta to'g'ri javob.
5. Konsolda faqat kutilgan `stageDone` xatosi. `done[2] === true`.
6. 3.1 va maslahat ekranlarini 667×375 va 1280×800 da skrinshot qiling; gorizontal scroll yo'q; ish maydoni scroll bo'lganda eng yuqori qismi ham ko'rinadi.

- [ ] **5-qadam: commit**

```bash
git add index.html js/scenes/stage3.js
git commit -m "01-qabila-kodlari: 3-bosqich" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 8-vazifa: Final, tabrik va to'liq tekshiruv

**Fayllar:**
- Yaratish: `js/scenes/final.js`
- O'zgartirish: `index.html`, `DIZAYN.md` (holati)

**Interfeyslar:**
- Oldingi vazifalardan: `QK.logic.listWords`; `QK.art.drum`, `tree`; `QK.ui.say`, `bubble`, `choice`, `tile`, `sleep`.
- Keyingilarga beradi: `QK.scenes.stageDone(s)`, `QK.scenes.finale()`, `QK.scenes.congrats() → "replay" | "home"` (`main.js` shularni chaqiradi).

- [ ] **1-qadam: `js/scenes/final.js`**

```js
// Bosqich tugashi, final (kompyuter alifbosi: 0 va 1) va tabrik ekrani (DIZAYN.md, 8-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, art } = QK;
  const BITS = ["0", "1"];

  async function stageDone(s) {
    ui.setCompact(false);
    ui.clearWork();
    ui.raisePaper(false);
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    await ui.say("elder", `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`);
  }

  async function finale() {
    ui.setCompact(false);
    ui.clearWork();
    ui.hideProgress();
    ui.raisePaper(false);
    ui.paper("");
    await ui.say("elder", "Bizning alifbomizda bir nechta harf bor edi.");
    await ui.say("elder", "Kompyuter alifbosida esa faqat 2 ta belgi bor: 0 va 1.");

    // Baraban: tak — 0, dum — 1
    const box = ui.h("div", { class: "pause-box", html: art.drum() });
    const beats = ui.h("div", { class: "beats" });
    box.append(beats);
    ui.work().append(box);
    await ui.say("apprentice", "Men chalaman: tak — 0, dum — 1. Tingla!");
    for (const b of "101") {
      ui.pose("apprentice", "drum", 200);
      sound.play(b === "0" ? "tak" : "dum");
      beats.append(ui.tile(b, Number(b), "sm"));
      await ui.sleep(450);
    }
    await ui.say("apprentice", "Men hozir «101» degan soʻzni chaldim!");

    // 0 va 1 daraxti: 3 qavat → 8 ta so'z
    ui.setCompact(true);
    ui.clearWork();
    const treeBox = ui.h("div", { class: "tree-box" });
    ui.work().append(treeBox);
    treeBox.innerHTML = art.tree(BITS, 3, {
      lit: new Set(logic.listWords(BITS, 3, "exact")),
      levelCounts: [3],
      animateLevel: 3,
    });
    await ui.say("elder", "0 va 1 dan aynan 3 belgili soʻzlar: 2³ = 8 ta.");
    await ui.say("elder", "Kompyuter koʻpincha har bir harfni 8 ta 0 yoki 1 bilan yozadi. 2⁸ = 256 xil soʻz — hamma harf va raqamlarga yetadi!");
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Sen kodlash sirlarini oʻrganding!");
    ui.work().append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", html: "Aynan i harfli: <b>a<sup>i</sup></b>" }),
      ui.h("div", { class: "formula-row", html: "i harfgacha: <b>a<sup>1</sup> + … + a<sup>i</sup></b>" }),
      ui.h("div", { class: "formula-row", text: "Eng kamida nechta harf: 1 dan boshlab sinab koʻr" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, finale, congrats });
})(window);
```

- [ ] **2-qadam: `index.html` ga ulash**

`<script src="js/scenes/stage3.js"></script>` qatoridan keyin:

```html
  <script src="js/scenes/final.js"></script>
```

- [ ] **3-qadam: sintaksis va testlar**

Buyruq: `node --check js/scenes/final.js && node --test tests/*.test.js`
Kutilgan natija: xatosiz, testlar PASS.

- [ ] **4-qadam: boshidan oxirigacha o'ynab chiqish (375×667)**

1. `localStorage.clear()` → `http://localhost:8765/` → bosh ekranda faqat 1-karta ochiq.
2. "Boshlash" → kirish → 1, 2, 3-bosqichlar (javoblar `QK.current.answer` orqali) → har bosqichdan keyin "{s}-bosqich tugadi!".
3. Final: baraban, `1 0 1` kartochkalari, "«101» degan soʻz", 8 bargli 0/1 daraxti ("8 ta"). Skrinshot.
4. Tabrik ekrani: 3 ta qoida, "Qayta oʻynash" va "Bosh ekran". Skrinshot.
5. `browser_console_messages` — **hech qanday xato yo'q**.
6. "Bosh ekran" → 3 ta karta ✓, tugma "Qayta oʻynash". Uni bosish → kirish sahnasi **chiqmaydi**, darhol 1-bosqich.

- [ ] **5-qadam: kutilmagan holatlar (DIZAYN 11-bo'lim)**

1. **localStorage bloklangan:** `browser_run_code_unsafe`:
   ```js
   async (page) => {
     await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }));
     await page.goto("http://localhost:8765/");
   }
   ```
   Bosh ekran chiqadi, "Boshlash" ishlaydi, konsolda xato yo'q. Keyin yangi sahifada (init skriptsiz) davom eting.
2. **Buzilgan saqlangan ma'lumot:** `localStorage.setItem('qabila-kodlari:v1', '{"done":[true]}')` → yangilash → faqat 1-karta ochiq.
3. **Ekranni burish:** 1.2 (daraxtli qo'lda yasash) paytida 2–3 ta so'z topib, `browser_resize` 375×667 → 667×375 → topilgan so'zlar daraxtda saqlangan, yasashni davom ettirsa bo'ladi.
4. **Sahifani yangilash** bosqich o'rtasida → bosh ekran, tugagan bosqichlar ✓ bilan.
5. **O'rtada bosh ekranga qaytish:** 2.2 da daraxt qavatlari yonayotganda uy tugmasi → 3 soniyadan keyin skrinshot: bosh ekran buzilmagan (eski daraxt yoki pufak paydo bo'lmagan).
6. **Klaviatura:** raqam oynasiga `1234` yozish → `123` ko'rinadi; `⌫` oxirgi raqamni o'chiradi; bo'sh holda `✓` hech narsa qilmaydi.
7. **Ovoz tugmasi:** o'chirib, sahifani yangilash → o'chiq holatda qoladi.

- [ ] **6-qadam: qoidalarga moslikni tekshirish (QOIDALAR 3, 5, 8)**

Bosh ekranda, 1-bosqich mashqida (klaviatura ochiq) va 3-bosqich maslahatida `browser_evaluate` bilan:

```js
// 1) 18 px dan kichik matn (SVG ichidagilardan tashqari) — kutilgan natija: []
[...document.querySelectorAll("body *")]
  .filter((e) => !e.closest("svg") && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
  .filter((e) => parseFloat(getComputedStyle(e).fontSize) < 18)
  .map((e) => e.className + ": " + e.textContent.slice(0, 20))
```

```js
// 2) 48×48 px dan kichik tugmalar — kutilgan natija: []
[...document.querySelectorAll("button")]
  .map((b) => [b, b.getBoundingClientRect()])
  .filter(([, r]) => r.width > 0 && (r.width < 48 || r.height < 48))
  .map(([b, r]) => `${b.className} ${b.textContent} ${Math.round(r.width)}×${Math.round(r.height)}`)
```

```js
// 3) Gorizontal scroll yo'q — kutilgan natija: true
document.documentElement.scrollWidth <= innerWidth
```

4) `browser_network_requests` — barcha so'rovlar faqat `localhost:8765` ga (tashqi internet yo'q).
5) 360×640 o'lchamda ham bosh ekran va mashq ekranining skrinshoti — hech narsa kesilmagan.

Topilgan har bir nuqsonni tuzating va tegishli tekshiruvni qaytaring.

- [ ] **7-qadam: yakuniy skrinshotlar to'plami**

375×667, 667×375, 1280×800 o'lchamlarida: bosh ekran, 1.2 daraxt, 1-bosqich mashqi, 2.3 pauza, 3-bosqich maslahati, final daraxti, tabrik. Skrinshotlarni loyiha papkasiga emas, sessiyaning vaqtinchalik (scratchpad) papkasiga saqlang.

- [ ] **8-qadam: `index.html` ni to'g'ridan-to'g'ri ochish**

`browser_navigate` `file:///Users/bicoder/Documents/Information/oyinlar/01-qabila-kodlari/index.html` — bosh ekran chiqadi, "Boshlash" ishlaydi. (Agar Playwright `file://` manzilni bloklasa, bu qadamni o'tkazib yuborib, hisobotda ayting.)

- [ ] **9-qadam: dizayn holatini yangilash**

`DIZAYN.md` 6-qatorida:
`**Holati:** tasdiqlangan (2026-09-19)` → `**Holati:** tayyor — bolalarda sinovni kutmoqda`

- [ ] **10-qadam: serverni to'xtatish va commit**

Fon rejimidagi `python3 -m http.server 8765` jarayonini to'xtating.

```bash
git add index.html js/scenes/final.js DIZAYN.md
git commit -m "01-qabila-kodlari: final, tabrik va to'liq tekshiruv" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git status --short
```
Kutilgan natija: ishchi papka toza.

---

## Tugagandan keyin

O'yinni ochish: `oyinlar/01-qabila-kodlari/index.html` faylini ikki marta bosish (yoki brauzerga sudrab tashlash).
O'qituvchi uchun: brauzer manzilining oxiriga `?bosqich=2` qo'shilsa, o'yin shu bosqichdan boshlanadi.
Keyingi qadam — muallif o'yinni bolalarga o'ynatib ko'radi (QOIDALAR 10-bo'lim, 6-qadam).
