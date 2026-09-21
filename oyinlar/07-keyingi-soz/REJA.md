# 07 — Keyingi soʻz: ish rejasi

**Maqsad:** 7-o'yin: til modeli — chatbot keyingi so'zni qanday tanlaydi (juftliklarni sanash → gap yozish → ko'proq matn va ma'no).

**Arxitektura:** oldingi o'yinlardagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/`. Sof hisob `js/words.js` (Node testlari), ekran qismlari `js/words-ui.js`, hikoya rasmlari `js/game-art.js`, sahnalar `js/scenes/`. Robot rasmi ikki o'yinda ishlatilgani uchun `umumiy/js/art.js` ga chiqarildi (QOIDALAR 9).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi; bloklar tayyor fayllardan olingan (TDD: avval `tests/words.test.js`, keyin `js/words.js`).

## Nomlar va interfeyslar

- `QK.words`: `BASE`, `EXTRA`, `ALL`, `table(sentences)`, `nextList(t, word)`, `best`, `total`, `starters`, `vocabulary`, `sample(t, word, rng)`, `write(t, start, {random, rng, maxLen})`, `canWrite(t, words, starts?)`, `makeBestTask(sentences, prev, rng?)`, `makeSentenceTask`, `makeFollowTask`, `makeStage3Task(sentences, k, prev, rng?)`.
- `QK.wordsUi`: `chip`, `corpus(host, sentences, {onPick})` → `{add, mark, markSentence, done}`, `pairTable(host)` → `{set(table, list), highlight(word)}`, `robotLine(host)` → `{set, add, clear}`, `wordButtons(options, onPick)`, `sentenceButtons(options, onPick)`.
- `QK.common`: `box(compact)`, `answerLine`, `line`, `animateWrite(table, start, opts, rline, ptable)`.
- `QK.art.story(name)`: `books | thinking | check`; robot — `QK.art.robot()` (umumiy).

---

### 1-vazifa: Hisob moduli (`js/words.js`) — TDD

- [x] **1-qadam: muvaffaqiyatsiz testlar — `tests/words.test.js`**

```js
// words.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const W = require("../js/words.js");

const T = W.table(W.BASE);
const TALL = W.table(W.ALL);

test("matn: gaplar 3 so'zdan, qo'shimcha matn base ustiga qo'shiladi", () => {
  assert.equal(W.BASE.length, 7);
  assert.equal(W.EXTRA.length, 4);
  assert.deepEqual(W.ALL, W.BASE.concat(W.EXTRA));
  for (const s of W.ALL) assert.equal(s.length, 3, s.join(" "));
});

test("table: juftliklar to'g'ri sanaladi", () => {
  assert.deepEqual(T["olov"], { yoqdi: 3, "koʻrdi": 1 });
  assert.deepEqual(T["bola"], { olov: 2, suv: 1 });
  assert.deepEqual(T["suv"], { ichdi: 3 });
  assert.equal(T["yoqdi"], undefined, "gap oxiridan keyin juftlik yo'q");
  assert.deepEqual(TALL["ovchi"], { olov: 1, suv: 1, "togʻga": 1, ovga: 1 });
  assert.deepEqual(TALL["ovga"], { chiqdi: 2 });
});

test("nextList: ko'pdan kamga, teng bo'lsa alifbo bo'yicha", () => {
  assert.deepEqual(W.nextList(T, "bola"), [{ word: "olov", n: 2 }, { word: "suv", n: 1 }]);
  assert.deepEqual(W.nextList(T, "ovchi").map((x) => x.word), ["olov", "suv"]);
  assert.deepEqual(W.nextList(T, "yoqdi"), []);
  assert.equal(W.best(T, "olov"), "yoqdi");
  assert.equal(W.total(T, "olov"), 4);
  assert.deepEqual(W.starters(W.BASE), ["bola", "ovchi", "qabila"]);
});

test("write: eng ko'pini tanlaganda doim bir xil gap", () => {
  assert.deepEqual(W.write(T, "bola"), ["bola", "olov", "yoqdi"]);
  assert.deepEqual(W.write(T, "qabila"), ["qabila", "olov", "yoqdi"]);
  assert.deepEqual(W.write(T, "suv"), ["suv", "ichdi"]);
});

test("sample: ko'p uchragan so'z ko'proq chiqadi, lekin boshqasi ham chiqadi", () => {
  const seen = {};
  for (let i = 0; i < 3000; i++) {
    const w = W.sample(T, "olov", Math.random);
    seen[w] = (seen[w] || 0) + 1;
  }
  assert.ok(seen["yoqdi"] > seen["koʻrdi"], "ko'p uchragani kamroq chiqdi");
  assert.ok(seen["koʻrdi"] > 200, "kam uchragani umuman chiqmadi");
  assert.equal(W.sample(T, "yoqdi", Math.random), null);
});

test("write (tasodifiy): faqat jadvaldagi juftliklardan yasaladi", () => {
  for (let i = 0; i < 300; i++) {
    const start = W.starters(W.ALL)[i % 3];
    const s = W.write(TALL, start, { random: true });
    assert.ok(s.length >= 2, s.join(" "));
    assert.ok(W.canWrite(TALL, s), s.join(" "));
  }
});

test("canWrite: mavjud bo'lmagan juftlik — yo'q", () => {
  assert.equal(W.canWrite(T, ["bola", "olov", "yoqdi"]), true);
  assert.equal(W.canWrite(T, ["bola", "ichdi"]), false);
  assert.equal(W.canWrite(T, ["olov", "suv", "ichdi"]), false);
  assert.equal(W.canWrite(T, ["bola", "suv", "ichdi"], W.starters(W.BASE)), true);
  assert.equal(W.canWrite(T, ["suv", "ichdi"], W.starters(W.BASE)), false, "gap boshi bo'la olmaydi");
});

test("makeBestTask: yagona eng ko'p javob, variantlar takrorlanmaydi", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeBestTask(W.BASE, prev);
    const list = W.nextList(T, task.word);
    assert.ok(list.length >= 2, task.word);
    assert.ok(list[0].n > list[1].n, "javob yagona emas");
    assert.equal(task.options[task.answer], list[0].word);
    assert.equal(new Set(task.options).size, task.options.length);
    assert.ok(task.options.length >= 3);
    if (prev) assert.notEqual(task.word, prev.word);
    prev = task;
  }
});

test("makeSentenceTask: uch gapdan faqat bittasini robot yoza oladi", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeSentenceTask(W.ALL, prev);
    assert.equal(task.options.length, 3);
    const ok = task.options.filter((s) => W.canWrite(TALL, s, W.starters(W.ALL)));
    assert.equal(ok.length, 1, task.options.map((s) => s.join(" ")).join(" | "));
    assert.deepEqual(task.options[task.answer], ok[0]);
    prev = task;
  }
});

test("makeFollowTask: javob — jadvalda bor so'z, qolganlari yo'q", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = W.makeFollowTask(W.ALL, prev);
    const row = TALL[task.word] || {};
    assert.ok(row[task.options[task.answer]], "javob juftlikda yo'q");
    task.options.forEach((w, k) => {
      if (k !== task.answer) assert.ok(!row[w], `${task.word} → ${w} bor ekan`);
    });
    assert.equal(new Set(task.options).size, 3);
    prev = task;
  }
});

test("makeStage3Task: avval gap, keyin keyingi so'z; turlar aralashsa ham ishlaydi", () => {
  assert.equal(W.makeStage3Task(W.ALL, 0, null).type, "sentence");
  assert.equal(W.makeStage3Task(W.ALL, 1, null).type, "follow");
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const task = W.makeStage3Task(W.ALL, i % 3, prev); // oldingi vazifa boshqa turdagi bo'lishi mumkin
    assert.ok(task.type === "sentence" || task.type === "follow");
    assert.equal(task.options.length, 3);
    prev = task;
  }
});
```

- [x] **2-qadam: `js/words.js`**

```js
// Keyingi so'z — sof hisob: qabila gaplari, juftliklar jadvali, gap yasash, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Qabila gaplari (har biri 3 ta so'z)
  const BASE = [
    ["bola", "olov", "yoqdi"],
    ["bola", "suv", "ichdi"],
    ["bola", "olov", "koʻrdi"],
    ["ovchi", "olov", "yoqdi"],
    ["ovchi", "suv", "ichdi"],
    ["qabila", "olov", "yoqdi"],
    ["qabila", "suv", "ichdi"],
  ];
  // 3-bosqichda qo'shiladigan matn
  const EXTRA = [
    ["ovchi", "togʻga", "chiqdi"],
    ["bola", "togʻga", "chiqdi"],
    ["qabila", "ovga", "chiqdi"],
    ["ovchi", "ovga", "chiqdi"],
  ];
  const ALL = BASE.concat(EXTRA);

  // Juftliklar jadvali: { soʻz: { keyingi soʻz: soni } }
  function table(sentences) {
    const out = {};
    for (const sentence of sentences) {
      for (let i = 0; i + 1 < sentence.length; i++) {
        const w = sentence[i];
        out[w] = out[w] || {};
        out[w][sentence[i + 1]] = (out[w][sentence[i + 1]] || 0) + 1;
      }
    }
    return out;
  }

  // Bir so'zdan keyin kelganlar: ko'pdan kamga (teng bo'lsa alifbo tartibida)
  function nextList(t, word) {
    const row = t[word] || {};
    return Object.keys(row)
      .map((w) => ({ word: w, n: row[w] }))
      .sort((a, b) => b.n - a.n || (a.word < b.word ? -1 : 1));
  }

  const best = (t, word) => (nextList(t, word)[0] || {}).word;
  const total = (t, word) => nextList(t, word).reduce((sum, item) => sum + item.n, 0);
  const starters = (sentences) => [...new Set(sentences.map((s) => s[0]))];
  const vocabulary = (sentences) => [...new Set([].concat.apply([], sentences))];

  // Ehtimol bilan keyingi so'z: ko'p uchragani ko'proq chiqadi
  function sample(t, word, rng) {
    const list = nextList(t, word);
    if (!list.length) return null;
    let r = (rng || Math.random)() * total(t, word);
    for (const item of list) {
      r -= item.n;
      if (r < 0) return item.word;
    }
    return list[list.length - 1].word;
  }

  // Gap yasash: random — ehtimol bilan, aks holda doim eng ko'p uchragani
  function write(t, start, opts) {
    const o = opts || {};
    const words = [start];
    for (let k = 0; k < (o.maxLen || 5); k++) {
      const last = words[words.length - 1];
      const next = o.random ? sample(t, last, o.rng) : best(t, last);
      if (!next) break;
      words.push(next);
    }
    return words;
  }

  // Robot shu gapni yoza oladimi: hamma juftlik jadvalda bo'lsin (starts berilsa — gap boshi ham)
  function canWrite(t, words, starts) {
    if (starts && !starts.includes(words[0])) return false;
    for (let i = 1; i < words.length; i++) {
      const row = t[words[i - 1]];
      if (!row || !row[words[i]]) return false;
    }
    return true;
  }

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  function shuffle(arr, rng) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  // "{so'z} dan keyin eng ko'p qaysi so'z kelgan?" — javob yagona bo'lsin
  function makeBestTask(sentences, prev, rng) {
    rng = rng || Math.random;
    const t = table(sentences);
    const words = Object.keys(t).filter((w) => {
      const list = nextList(t, w);
      return list.length >= 2 && list[0].n > list[1].n;
    });
    for (;;) {
      const word = pick(words, rng);
      if (prev && prev.word === word && words.length > 1) continue;
      const list = nextList(t, word);
      const others = vocabulary(sentences).filter((w) => w !== word && !list.some((x) => x.word === w));
      const options = shuffle(list.map((x) => x.word).concat(others.length ? [pick(others, rng)] : []), rng);
      return { type: "best", word, options, answer: options.indexOf(list[0].word), counts: list };
    }
  }

  // "Qaysi gapni robot yoza oladi?" — uch gapdan bittasi jadvaldan yasaladi
  function makeSentenceTask(sentences, prev, rng) {
    rng = rng || Math.random;
    const t = table(sentences);
    const starts = starters(sentences);
    const vocab = vocabulary(sentences);
    for (;;) {
      const good = write(t, pick(starts, rng), { random: true, rng, maxLen: 2 });
      if (good.length !== 3) continue;
      if (prev && prev.type === "sentence" && prev.options[prev.answer].join(" ") === good.join(" ")) continue;
      const bad = [];
      for (let guard = 0; guard < 200 && bad.length < 2; guard++) {
        const candidate = [pick(starts, rng), pick(vocab, rng), pick(vocab, rng)];
        if (canWrite(t, candidate, starts)) continue;
        if (candidate.join(" ") === good.join(" ")) continue;
        if (bad.some((b) => b.join(" ") === candidate.join(" "))) continue;
        bad.push(candidate);
      }
      if (bad.length < 2) continue;
      const options = shuffle([good].concat(bad), rng);
      return { type: "sentence", options, answer: options.findIndex((s) => s.join(" ") === good.join(" ")) };
    }
  }

  // "{so'z} dan keyin nima kelishi mumkin?" — bittasi jadvalda bor
  function makeFollowTask(sentences, prev, rng) {
    rng = rng || Math.random;
    const t = table(sentences);
    const vocab = vocabulary(sentences);
    for (;;) {
      const word = pick(Object.keys(t), rng);
      if (prev && prev.type === "follow" && prev.word === word) continue;
      const list = nextList(t, word);
      const good = pick(list, rng).word;
      const others = vocab.filter((w) => w !== word && w !== good && !list.some((x) => x.word === w));
      if (others.length < 2) continue;
      const wrong = shuffle(others, rng).slice(0, 2);
      const options = shuffle([good].concat(wrong), rng);
      return { type: "follow", word, options, answer: options.indexOf(good) };
    }
  }

  // 3-bosqich mashqi: avval gap, keyin keyingi so'z, keyin tasodifiy
  function makeStage3Task(sentences, k, prev, rng) {
    rng = rng || Math.random;
    const useSentence = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useSentence ? makeSentenceTask(sentences, prev, rng) : makeFollowTask(sentences, prev, rng);
  }

  const api = {
    BASE, EXTRA, ALL,
    table, nextList, best, total, starters, vocabulary, sample, write, canWrite,
    makeBestTask, makeSentenceTask, makeFollowTask, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.words = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

---

### 2-vazifa: Rasmlar va ekran qismlari

- [x] **1-qadam: `js/game-art.js`** (robot `umumiy/js/art.js` ga ko'chirildi)

```js
// 7-o'yinga xos SVG rasmlar: hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Millionlab kitob
  const books = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="24" y="86" width="152" height="12" rx="3" fill="#8A5A2B"/>
  <rect x="30" y="52" width="26" height="34" rx="3" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
  <rect x="58" y="42" width="26" height="44" rx="3" fill="#F08A24" stroke="${INK}" stroke-width="3"/>
  <rect x="86" y="58" width="26" height="28" rx="3" fill="#1A9E77" stroke="${INK}" stroke-width="3"/>
  <rect x="114" y="46" width="26" height="40" rx="3" fill="#8E5BD0" stroke="${INK}" stroke-width="3"/>
  <rect x="142" y="60" width="26" height="26" rx="3" fill="#E0524A" stroke="${INK}" stroke-width="3"/>
  <path d="M60 30 L100 14 L140 30 L100 40 Z" fill="#F4E3C3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

  // Robot javob yozmoqda: pufakda uchta nuqta (matn yo'q)
  const thinking = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="24" y="44" width="56" height="44" rx="12" fill="#B8C0C8" stroke="${INK}" stroke-width="3"/>
  <circle cx="42" cy="62" r="6" fill="#2F6FDE"/>
  <circle cx="62" cy="62" r="6" fill="#2F6FDE"/>
  <rect x="44" y="76" width="16" height="5" rx="2.5" fill="${INK}"/>
  <line x1="52" y1="44" x2="52" y2="34" stroke="${INK}" stroke-width="3"/>
  <circle cx="52" cy="31" r="4" fill="#F08A24" stroke="${INK}" stroke-width="2"/>
  <path d="M100 26 H184 a8 8 0 0 1 8 8 V66 a8 8 0 0 1 -8 8 H116 l-12 12 v-12 h-4 a8 8 0 0 1 -8 -8 V34 a8 8 0 0 1 8 -8 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="126" cy="50" r="5" fill="#8A929A"/>
  <circle cx="146" cy="50" r="5" fill="#8A929A"/>
  <circle cx="166" cy="50" r="5" fill="#8A929A"/>
</svg>`;

  // Odam javobni tekshiradi: lupa ostida yozuv satrlari
  const check = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="26" y="16" width="104" height="88" rx="8" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <rect x="40" y="34" width="70" height="7" rx="3.5" fill="#C9C1AF"/>
  <rect x="40" y="52" width="58" height="7" rx="3.5" fill="#C9C1AF"/>
  <rect x="40" y="70" width="66" height="7" rx="3.5" fill="#C9C1AF"/>
  <circle cx="132" cy="62" r="30" fill="rgba(47,111,222,0.12)" stroke="${INK}" stroke-width="4"/>
  <line x1="153" y1="84" x2="176" y2="106" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <path d="M120 62 L129 72 L146 52" stroke="#1A9E77" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const STORY = { books, thinking, check };

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

test("hikoya rasmlari SVG qaytaradi va matnsiz", () => {
  for (const name of ["books", "thinking", "check"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
});

test("robot rasmi umumiy papkadan keladi", () => {
  assert.match(art.robot(), /^<svg[\s\S]*<\/svg>$/);
});
```

- [x] **3-qadam: `js/words-ui.js`**

```js
// Keyingi so'z: so'z kartochkalari, gaplar, juftliklar jadvali, robot qatori va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, sound } = QK;

  const chip = (word, cls) => ui.h("span", { class: "wchip" + (cls ? " " + cls : ""), text: word });

  // Gaplar ro'yxati. onPick(si, wi, word, node) berilsa — so'zlar bosiladigan bo'ladi.
  function corpus(host, sentences, opts) {
    const o = opts || {};
    const el = ui.h("div", { class: "corpus" });
    const chips = [];
    sentences.forEach((sentence, si) => {
      const row = ui.h("div", { class: "wsent" });
      sentence.forEach((word, wi) => {
        const node = o.onPick
          ? ui.h("button", { class: "wchip", type: "button", text: word, onClick: () => o.onPick(si, wi, word, node) })
          : chip(word);
        chips.push({ si, wi, word, node });
        row.append(node);
      });
      el.append(row);
    });
    host.append(el);
    return {
      el,
      add(sentence) {
        const row = ui.h("div", { class: "wsent fresh" });
        sentence.forEach((word) => row.append(chip(word)));
        el.append(row);
      },
      mark(word) { chips.forEach((c) => c.node.classList.toggle("hl", c.word === word)); },
      markSentence(si) { chips.forEach((c) => c.node.classList.toggle("hl", c.si === si)); },
      done(si, wi) {
        const found = chips.find((c) => c.si === si && c.wi === wi);
        if (found) found.node.classList.add("done");
      },
    };
  }

  // Juftliklar jadvali: so'z → keyingilar (ustuncha va soni)
  function pairTable(host) {
    const el = ui.h("div", { class: "ptable" });
    host.append(el);
    const rows = {};
    return {
      el,
      set(table, list) {
        el.innerHTML = "";
        for (const word of list) {
          const nexts = ui.h("div", { class: "pnexts" });
          for (const item of words.nextList(table, word)) {
            nexts.append(ui.h("div", { class: "pnext" },
              chip(item.word, "sm"),
              ui.h("span", { class: "bar", style: `width:${item.n * 16}px` }),
              ui.h("span", { class: "pn", text: String(item.n) })));
          }
          const row = ui.h("div", { class: "prow" }, chip(word), ui.h("span", { class: "parrow", text: "→" }), nexts);
          rows[word] = row;
          el.append(row);
        }
      },
      highlight(word) {
        Object.keys(rows).forEach((w) => rows[w].classList.toggle("hl", w === word));
      },
    };
  }

  // Robot yozayotgan gap
  function robotLine(host) {
    const el = ui.h("div", { class: "rline" });
    host.append(el);
    return {
      el,
      clear() { el.innerHTML = ""; },
      set(list) {
        el.innerHTML = "";
        (list || []).forEach((word) => el.append(chip(word, "big")));
      },
      add(word) { el.append(chip(word, "big fresh")); },
    };
  }

  // So'z tugmalari (boshqaruv zonasida)
  function wordButtons(options, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((word, i) => row.append(ui.button(word, () => onPick(i))));
    ui.clearControl();
    ui.control().append(row);
  }

  // Gap tugmalari: har tugmada 3 ta so'z kartochkasi
  function sentenceButtons(options, onPick) {
    const col = ui.h("div", { class: "sent-choice" });
    options.forEach((sentence, i) => {
      const button = ui.h("button", {
        class: "btn secondary sent-btn", type: "button",
        "aria-label": sentence.join(" "),
        onClick: () => { sound.play("tap"); onPick(i); },
      });
      sentence.forEach((word) => button.append(chip(word, "sm")));
      col.append(button);
    });
    ui.clearControl();
    ui.control().append(col);
  }

  QK.wordsUi = { chip, corpus, pairTable, robotLine, wordButtons, sentenceButtons };
})(window);
```

- [x] **4-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Keyingi soʻz</title>
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
  <script src="js/words.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="../umumiy/js/practice.js"></script>
  <script src="js/words-ui.js"></script>
  <script src="js/scenes/common.js"></script>
  <script src="js/scenes/stage1.js"></script>
  <script src="js/scenes/stage2.js"></script>
  <script src="js/scenes/stage3.js"></script>
  <script src="js/scenes/final.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [x] **5-qadam: `css/style.css`**

```css
/* Keyingi so'z — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.wbox { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }

/* ---------- So'z kartochkalari va gaplar ---------- */
.wchip {
  display: inline-grid; place-items: center; min-height: 44px; padding: 6px 12px;
  border: none; border-radius: 12px; background: #fff; box-shadow: 0 2px 0 var(--soya);
  color: var(--matn); font-size: 20px; font-weight: 800;
}
button.wchip { min-height: 48px; }
button.wchip:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--soya); }
.wchip.sm { min-height: 34px; padding: 4px 10px; font-size: 18px; border-radius: 9px; }
.wchip.big { min-height: 52px; font-size: 24px; }
.wchip.hl { box-shadow: 0 2px 0 var(--soya), inset 0 0 0 3px var(--yana); }
.wchip.done { background: #E3F3EC; color: var(--togri); }
.wchip.fresh { animation: pop 0.3s; }
.corpus { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 6px 18px; width: 100%; max-width: 560px; }
.wsent { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.wsent.fresh { animation: pop 0.35s; }

/* ---------- Juftliklar jadvali ---------- */
.ptable { display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 460px; }
.prow { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 12px; }
.prow.hl { background: rgba(240, 138, 36, 0.16); }
.parrow { font-size: 22px; font-weight: 900; }
.pnexts { display: flex; flex-direction: column; gap: 4px; }
.pnext { display: flex; align-items: center; gap: 6px; }
.bar { height: 12px; border-radius: 6px; background: var(--asosiy); }
.pn { font-size: 18px; font-weight: 900; }

/* ---------- Robot qatori va javob tugmalari ---------- */
.rline {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px;
  width: 100%; max-width: 420px; min-height: 68px; padding: 8px 12px; border-radius: 14px;
  background: #fff; box-shadow: inset 0 0 0 3px var(--chiziq);
}
.sent-choice { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 420px; }
.sent-btn { display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 56px; padding: 6px 12px; }
.count-line { font-size: 18px; font-weight: 800; text-align: center; }
.answer { font-size: 20px; font-weight: 900; color: var(--togri); text-align: center; }

/* ---------- Hikoya va tabrik ---------- */
.story { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.story-art { width: min(240px, 66vw); }
.story-art.small { width: min(110px, 28vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }

/* Yotiq telefon: sahna ustuni tor, kartochkalar kichikroq */
@media (orientation: landscape) and (max-height: 500px) {
  .play.compact { grid-template-columns: minmax(150px, 24%) minmax(0, 1fr); }
  .wchip { min-height: 40px; padding: 4px 10px; font-size: 18px; }
  button.wchip { min-height: 44px; }
  .wchip.big { min-height: 46px; font-size: 21px; }
  .rline { min-height: 58px; }
  .story-art { width: min(190px, 36vh); }
}
```

---

### 3-vazifa: Sahnalar

- [x] **1-qadam: `js/scenes/common.js`**

```js
// Keyingi so'z: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, sound } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    const el = ui.h("div", { class: "wbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  // Robot gapni so'zma-so'z yozadi; jadvalda tegishli qator yonib turadi
  async function animateWrite(table, start, opts, rline, ptable) {
    const sentence = words.write(table, start, opts);
    rline.set([]);
    for (let i = 0; i < sentence.length; i++) {
      if (ptable) ptable.highlight(i === 0 ? sentence[0] : sentence[i - 1]);
      rline.add(sentence[i]);
      sound.play("tap");
      await ui.sleep(600);
    }
    if (ptable) ptable.highlight(null);
    sound.play("correct");
    return sentence;
  }

  QK.common = { box, answerLine, line, animateWrite };
})(window);
```

- [x] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: juftliklarni sanash (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, sound, art, wordsUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robot gapirishni oʻrganmoqchi!");
    await ui.say("apprentice", "Unga soʻzlarning maʼnosini oʻrgatamizmi?");
    await ui.say("elder", "Yoʻq — u maʼnoni bilmaydi. U faqat sanaydi: qaysi soʻzdan keyin qaysi soʻz kelgan.");
  }

  // 4.1: qabila gaplari
  async function showCorpus(sentences) {
    const el = common.box(true);
    wordsUi.corpus(el, sentences);
    await ui.say("elder", "Bular — qabilaning gaplari. Robot ularni oʻqiydi.");
    await ui.say("elder", "Endi birgalikda sanaymiz.");
  }

  // 4.2: "olov" dan keyingi so'zlarni sanash
  async function countDemo(sentences) {
    const el = common.box(true); // gaplar koʻp — qahramonlar kichrayadi
    const word = "olov";
    let handler = null;
    const view = wordsUi.corpus(el, sentences, { onPick: (si, wi, w, node) => handler(si, wi, w, node) });
    const table = wordsUi.pairTable(el);
    view.mark(word);
    const counts = {};
    const targets = [];
    sentences.forEach((sentence, si) => {
      sentence.forEach((w, wi) => {
        if (w === word && wi + 1 < sentence.length) targets.push({ si, wi: wi + 1, next: sentence[wi + 1] });
      });
    });
    const render = () => table.set({ [word]: counts }, Object.keys(counts).length ? [word] : []);
    render();
    ui.bubble("elder", "«olov» yonib turibdi. Har gapda undan keyingi soʻzni bos!");
    let left = targets.length;
    await ui.settle((done) => {
      handler = (si, wi, w) => {
        const hit = targets.find((x) => x.si === si && x.wi === wi && !x.taken);
        if (!hit) {
          sound.play("retry");
          ui.toast("Bu «olov» dan keyin kelgan soʻz emas.");
          return;
        }
        hit.taken = true;
        sound.play("correct");
        view.done(si, wi);
        counts[w] = (counts[w] || 0) + 1;
        render();
        left--;
        if (left === 0) done();
      };
    });
    await ui.say("elder", "Mana — juftliklar jadvali: «olov» dan keyin «yoqdi» 3 marta, «koʻrdi» 1 marta kelgan.");
    await ui.say("elder", "Robotning bor bilgani — shu jadval.");
  }

  // 4.4 va 5.5: "{so'z} dan keyin eng ko'p qaysi so'z kelgan?"
  function bestTask(task, sentences, mode) {
    const el = common.box(true);
    const table = words.table(sentences);
    let view = null;
    let ptable = null;
    if (mode === "table") {
      ptable = wordsUi.pairTable(el);
      ptable.set(table, [task.word]);
    } else {
      view = wordsUi.corpus(el, sentences);
    }
    ui.bubble("elder", mode === "table"
      ? `Robot «${task.word}» dan keyin qaysi soʻzni yozishi eng ehtimoli katta?`
      : `«${task.word}» dan keyin eng koʻp qaysi soʻz kelgan?`);
    return practice.tries({
      setup: (submit) => wordsUi.wordButtons(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        if (view) view.mark(task.word);
        if (ptable) ptable.highlight(task.word);
        ui.bubble("elder", `↻ «${task.word}» belgilandi. Undan keyingi soʻzlarni sana.`);
      },
      solution: () => {
        if (!ptable) {
          ptable = wordsUi.pairTable(el);
          ptable.set(table, [task.word]);
        }
        ptable.highlight(task.word);
        el.append(common.answerLine(`Eng koʻp: ${task.options[task.answer]}`));
      },
    });
  }

  async function stage1() {
    await showCorpus(words.BASE);
    await countDemo(words.BASE);
    await ui.say("elder", "Endi oʻzing sana! 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev) => words.makeBestTask(words.BASE, prev),
      run: (task) => bestTask(task, words.BASE, "corpus"),
      praise: (task) => `«${task.word}» dan keyin «${task.options[task.answer]}» eng koʻp kelgan.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1, bestTask });
})(window);
```

- [x] **3-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: robot gap yozadi — eng ko'pini tanlash va tasodif (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, wordsUi, practice, common } = QK;

  const ROWS = ["bola", "olov", "suv"];

  // 5.1–5.2: doim eng ko'p uchraganini tanlash — gap har safar bir xil
  async function greedyDemo(table) {
    const el = common.box(false);
    const ptable = wordsUi.pairTable(el);
    ptable.set(table, ROWS);
    const rline = wordsUi.robotLine(el);
    await ui.say("elder", "Robot gap yozadi. U «bola» dan boshlaydi va jadvalga qaraydi.");
    const first = await common.animateWrite(table, "bola", {}, rline, ptable);
    await ui.say("elder", `«${first.join(" ")}». Har safar eng koʻp uchragan soʻzni tanladi.`);
    for (let k = 0; k < 2; k++) {
      ui.bubble("elder", "«Yana yoz»ni bos.");
      await ui.settle((done) => {
        ui.control().append(ui.button("Yana yoz", () => { ui.clearControl(); done(); }, "big"));
      });
      await common.animateWrite(table, "bola", {}, rline, ptable);
    }
    await ui.say("elder", "Robot doim bir xil gap yozdi. Zerikarli!");
  }

  // 5.3: tasodif qo'shamiz
  async function randomDemo(table) {
    const el = common.box(false);
    const ptable = wordsUi.pairTable(el);
    ptable.set(table, ROWS);
    const rline = wordsUi.robotLine(el);
    await ui.say("elder", "Tasodif qoʻshamiz: koʻp uchragan soʻz koʻproq chiqadi, lekin boshqasi ham chiqishi mumkin.");
    const seen = [];
    for (let k = 0; k < 3; k++) {
      ui.bubble("elder", k === 0 ? "«Yoz»ni bos." : "Yana bos — boshqacha chiqishi mumkin.");
      await ui.settle((done) => {
        ui.control().append(ui.button(k === 0 ? "Yoz" : "Yana yoz", () => { ui.clearControl(); done(); }, "big"));
      });
      const start = words.starters(words.BASE)[k % 3];
      const sentence = await common.animateWrite(table, start, { random: true }, rline, ptable);
      seen.push(sentence.join(" "));
    }
    el.append(common.line(seen.join(" · ")));
    await ui.say("elder", "Gaplar har xil chiqdi! Chatbot ham keyingi soʻzni shunday — ehtimol bilan tanlaydi.");
  }

  async function stage2() {
    const table = words.table(words.BASE);
    await greedyDemo(table);
    await randomDemo(table);
    await ui.say("elder", "Endi oʻzing ayt: robot qaysi soʻzni yozishi eng ehtimoli katta? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => words.makeBestTask(words.BASE, prev),
      run: (task) => QK.scenes.bestTask(task, words.BASE, "table"),
      praise: (task) => `«${task.word}» dan keyin koʻpincha «${task.options[task.answer]}» keladi.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [x] **4-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: ko'proq matn, ma'no va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, art, wordsUi, practice, common } = QK;

  const SCENES = [
    { art: "books", lines: ["Chatbotlar millionlab kitob va sahifani oʻqiydi.", "Ular ham soʻz juftliklarini sanaydi — faqat jadvali juda katta."] },
    { art: "thinking", lines: ["Robot maʼnoni bilmaydi.", "Shuning uchun baʼzan ishonch bilan notoʻgʻri javob yozadi."] },
    { art: "check", lines: ["Uning javobini doim tekshirish kerak.", "Kitobdan yoki bilgan odamdan soʻra."] },
  ];

  // 6.1: matn qo'shilsa jadval boyiydi
  async function moreText() {
    const el = common.box(false);
    const view = wordsUi.corpus(el, words.BASE);
    const ptable = wordsUi.pairTable(el);
    ptable.set(words.table(words.BASE), ["ovchi", "bola"]);
    await ui.say("elder", "Robotga koʻproq gap beramiz. Jadval qanday oʻzgaradi?");
    ui.bubble("elder", "«Matn qoʻsh»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Matn qoʻsh", () => { ui.clearControl(); done(); }, "big"));
    });
    for (const sentence of words.EXTRA) {
      view.add(sentence);
      await ui.sleep(420);
    }
    ptable.set(words.table(words.ALL), ["ovchi", "bola"]);
    await ui.say("elder", "Jadval boyidi: yangi soʻzlar va yangi juftliklar paydo boʻldi.");
    const rline = wordsUi.robotLine(el);
    await common.animateWrite(words.table(words.ALL), "bola", { random: true }, rline, ptable);
    await ui.say("elder", "Endi robot yangi gaplar ham yoza oladi. Koʻproq matn — koʻproq gap.");
  }

  // 6.2: robot ma'noni bilmaydi
  async function meaning() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("thinking") }));
    await ui.say("elder", "Robot «olov» nimaligini bilmaydi. U olovni koʻrmagan, issiqligini sezmagan.");
    await ui.say("elder", "U faqat shuni biladi: «olov» dan keyin koʻpincha «yoqdi» kelgan.");
  }

  // 6.3: "Qaysi gapni robot yoza oladi?"
  function sentenceTask(task) {
    const el = common.box(true);
    const table = words.table(words.ALL);
    const need = [];
    task.options.forEach((s) => [s[0], s[1]].forEach((w) => { if (!need.includes(w)) need.push(w); }));
    const ptable = wordsUi.pairTable(el);
    ptable.set(table, need);
    ui.bubble("elder", "Jadvalga qara: robot qaysi gapni yoza oladi?");
    return practice.tries({
      setup: (submit) => wordsUi.sentenceButtons(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        ptable.highlight(task.options[task.answer][0]);
        ui.bubble("elder", "↻ Har juftlikni tekshir: birinchi soʻzdan keyin ikkinchisi kelganmi?");
      },
      solution: () => {
        ptable.highlight(task.options[task.answer][0]);
        el.append(common.answerLine(task.options[task.answer].join(" ")));
      },
    });
  }

  // 6.3: "{so'z} dan keyin nima kelishi mumkin?"
  function followTask(task) {
    const el = common.box(true);
    const view = wordsUi.corpus(el, words.ALL);
    ui.bubble("elder", `Gaplarga qara: «${task.word}» dan keyin qaysi soʻz kelishi mumkin?`);
    return practice.tries({
      setup: (submit) => wordsUi.wordButtons(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        view.mark(task.word);
        ui.bubble("elder", `↻ «${task.word}» belgilandi. Undan keyin turgan soʻzlarni qara.`);
      },
      solution: () => {
        const ptable = wordsUi.pairTable(el);
        ptable.set(words.table(words.ALL), [task.word]);
        el.append(common.answerLine(`${task.word} → ${task.options[task.answer]}`));
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
    await moreText();
    await meaning();
    await ui.say("elder", "Endi oʻzing javob ber. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => words.makeStage3Task(words.ALL, correct, prev),
      run: (task) => (task.type === "sentence" ? sentenceTask(task) : followTask(task)),
      praise: (task) => (task.type === "sentence"
        ? `«${task.options[task.answer].join(" ")}» — juftliklari jadvalda bor.`
        : `«${task.word}» dan keyin «${task.options[task.answer]}» kelgan.`),
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
    ui.bubble("elder", "Tabriklayman! Endi sen chatbot qanday yozishini bilasan!");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Robot soʻz juftliklarini sanaydi" }),
        ui.h("div", { text: "Keyingi soʻz ehtimol bilan tanlanadi" }),
        ui.h("div", { text: "U maʼnoni bilmaydi — javobini tekshir" }))));
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
// 7-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Keyingi soʻz",
  storageKey: "keyingi-soz:v1",
  stageTitles: ["Juftliklarni sanash", "Robot gap yozadi", "Koʻproq matn"],
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
  assert.equal(captured.storageKey, "keyingi-soz:v1");
  assert.equal(captured.title, "Keyingi soʻz");
  assert.deepEqual(captured.stageTitles, ["Juftliklarni sanash", "Robot gap yozadi", "Koʻproq matn"]);
});
```

---

### 4-vazifa: Bosh sahifa va tekshiruv

- [x] **1-qadam: bosh sahifaga 7-o'yin (`gap` ikonkasi bilan) qo'shiladi**

```bash
cd /Users/bicoder/Documents/Information && node --test bosh/tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
```

- [x] **2-qadam: barcha testlar va statik tekshiruv**

```bash
cd /Users/bicoder/Documents/Information/oyinlar && for d in 0*/ umumiy/; do (cd "$d" && printf "%-30s " "$d" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' '; echo); done
```

- [x] **3-qadam: brauzerda to'liq o'ynab chiqish** (`scratchpad/play7.js`: 4 ta ekran + ataylab xato)

```bash
cd /Users/bicoder/Documents/Information && python3 -m http.server 8777 >/dev/null 2>&1 &
sleep 1 && echo "http://localhost:8777/oyinlar/07-keyingi-soz/"
```

- [x] **4-qadam: commit, main'ga birlashtirish va GitHub'ga yuklash**

```bash
cd /Users/bicoder/Documents/Information && git add -A && git commit -m "07-keyingi-soz: til modeli oʻyini" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" && git checkout main && git merge --no-ff oyin/07-keyingi-soz && git branch -d oyin/07-keyingi-soz && git push
```
