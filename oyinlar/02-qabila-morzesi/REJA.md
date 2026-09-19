# 02 — Qabila Morzesi: ish rejasi

> **Agentlar uchun:** bu rejani bajarishda `superpowers:subagent-driven-development` (tavsiya) yoki `superpowers:executing-plans` skill'idan foydalaning. Qadamlar `- [ ]` belgisi bilan kuzatiladi.

**Maqsad:** (1) 1-o'yindagi umumiy kodni `oyinlar/umumiy/` ga chiqarish — 1-o'yin xuddi avvalgidek ishlashi shart; (2) 2-o'yin "Qabila Morzesi"ni yasash: Morze xabarlarini o'qish, yozish va hikoya.

**Arxitektura:** Oddiy `<script>` fayllar `window.QK` ga yoziladi. `oyinlar/umumiy/` da: `storage.js` (`QK.storage.create`), `sound.js` (`QK.sound` + Morze signallari), `art.js` (qahramonlar, baraban, ikonkalar), `ui.js` (pufak, tugmalar, kutish), `app.js` (bosh ekran va bosqichlar oqimi — `QK.app.start`), `css/asos.css`, `fonts/`. Har bir o'yin o'z `game-art.js`, sahnalari va `main.js` (faqat `QK.app.start({...})`) ga ega. 2-o'yinning sof hisobi `morse.js` da (Node'da test qilinadi), ekran qismlari `morse-ui.js` da.

**Texnologiya:** HTML, CSS, JavaScript (ES2017+), SVG, Web Audio. Testlar: Node `node:test` (Node 26).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md) (13-bo'lim — umumiy kod), 1-o'yin: [`../01-qabila-kodlari/DIZAYN.md`](../01-qabila-kodlari/DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

## Umumiy cheklovlar

- Kutubxona, yig'ish, `npm install` — **yo'q**. Oddiy `<script src>`. `index.html` ni ikki marta bosib ochish ishlaydi (yo'llar nisbiy: `../umumiy/...`).
- Internet kerak emas.
- Ekrandagi matn — o'zbek, lotin; `oʻ`, `gʻ` da **ʻ (U+02BB)**; bolaga "sen". Pufakda ko'pi bilan **2 ta qisqa gap**.
- Kod nomlari inglizcha, izohlar o'zbekcha.
- Bosiladigan element ≥ **48×48 px**, hover'ga bog'liq narsa yo'q, sudrash yo'q. Matn ≥ **18 px**. Eng tor ekran 360 px, gorizontal scroll yo'q.
- Ranglar: `fon #FFF6E5`, `matn #2B2B3A`, `asosiy #2F6FDE`, `togri #1A9E77`, `yana #F08A24`. Xato uchun qizil yo'q; to'g'ri/xato belgi bilan ham (✓, ↻).
- Xato javob: 1-xato — maslahat, 2-xato — yechim + yangi misol (xato qilingan misol hisoblanmaydi). 3 ta to'g'ri javob — bosqich tugaydi.
- `localStorage` faqat `try/catch` ichida.
- **Oraliq brauzer tekshiruvlari yo'q** (muallif talabi): har vazifa `node --check` va `node --test` bilan tekshiriladi; brauzerda ochish, server ishga tushirish, sayt ochish **kerak emas**.
- Commit xabarlari oxirida: `-m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"`.
- Ish **`oyin/02-qabila-morzesi`** branch'ida (1-vazifa 1-qadamda ochiladi).

Testlarni ishga tushirish (repo ildizidan `/Users/bicoder/Documents/Information`):
```bash
(cd oyinlar/umumiy && node --test tests/*.test.js)
(cd oyinlar/01-qabila-kodlari && node --test tests/*.test.js)
(cd oyinlar/02-qabila-morzesi && node --test tests/*.test.js)
```

## Fayllar xaritasi

| Fayl | Vazifasi | Vazifa |
|---|---|---|
| `oyinlar/umumiy/js/storage.js` | `QK.storage.create(key, stageCount)` | 1 |
| `oyinlar/umumiy/js/sound.js` | Tovushlar + `beeps(plan)`, `stopBeeps()` | 1 |
| `oyinlar/umumiy/js/art.js` | Oqsoqol, Shogird, baraban, ikonkalar | 1 |
| `oyinlar/umumiy/js/ui.js` | 1-o'yindan o'zgarishsiz ko'chadi | 1 |
| `oyinlar/umumiy/js/app.js` | Bosh ekran, bosqichlar oqimi, ovoz tugmasi, `?bosqich=N` | 1 |
| `oyinlar/umumiy/css/asos.css`, `oyinlar/umumiy/fonts/` | Umumiy uslublar va shrift | 1 |
| `oyinlar/umumiy/tests/*` | `helpers.js`, `storage.test.js`, `art.test.js` | 1 |
| `oyinlar/01-qabila-kodlari/js/game-art.js` | Daraxt va kichik odam (1-o'yinniki) | 1 |
| `oyinlar/01-qabila-kodlari/js/main.js`, `index.html`, `css/style.css`, `tests/game-art.test.js` | 1-o'yinni umumiy papkaga ulash | 1 |
| `oyinlar/02-qabila-morzesi/js/morse.js`, `tests/morse.test.js` | Morze hisobi | 2 |
| `oyinlar/02-qabila-morzesi/index.html`, `css/style.css`, `js/game-art.js`, `tests/game-art.test.js`, `js/morse-ui.js`, `js/main.js` | 2-o'yin sahifasi va ekran qismlari | 3 |
| `oyinlar/02-qabila-morzesi/js/scenes/common.js`, `stage1.js` | O'qish/yozish sikllari, kirish, 1-bosqich | 4 |
| `oyinlar/02-qabila-morzesi/js/scenes/stage2.js` | 2-bosqich + XAYR | 5 |
| `oyinlar/02-qabila-morzesi/js/scenes/stage3.js`, `final.js` | Hikoya, SOS, bosqich tugashi, tabrik | 6 |

## Nomlar va interfeyslar (barcha vazifalar uchun)

**Umumiy (`oyinlar/umumiy/`):**
- `QK.storage.create(key, stageCount) → { load() → { done: bool[stageCount], muted: bool }, save(state) }`
- `QK.sound.unlock()`, `play(name)` (`tap|correct|retry|win|tak|dum`), `setMuted(bool)`, `isMuted()`, **`beeps(plan)`** (`plan = [{ on, off }]` millisekund; oldingisini to'xtatadi; ovoz o'chiq yoki yo'q bo'lsa hech narsa qilmaydi), **`stopBeeps()`**
- `QK.art.LETTER_COLORS`, `elder()`, `apprentice()`, `drum()`, `icon(name)` — SVG satrlar. O'yinga xos rasmlar o'yinning `game-art.js` fayli orqali `Object.assign(QK.art, {...})` bilan qo'shiladi.
- `QK.ui` — 1-o'yindagidek: `newRun, onCleanup, settle, sleep, h, button, work, control, clearWork, clearControl, setCompact, pose, resetPoses, paper, raisePaper, bubble, say, tile, wordChip, lettersLine, toast, sup, buildWords, askNumber, counter, choice, setProgress, hideProgress`.
- `QK.app.start({ title, storageKey, stageTitles })` — qahramonlarni chizadi, bosh ekranni ko'rsatadi, bosqichlarni o'ynatadi. Sahnalar `QK.scenes` da: `intro()`, `stage1()`…`stageN()`, `stageDone(s, goingOn)`, `finale()` (**ixtiyoriy**), `congrats() → "replay" | "home"`.

**2-o'yin:**
- Morze kodlari ichkarida `"."` (nuqta) va `"-"` (chiziq); ekranda chizilgan shakllar.
- `QK.morse` (Node'da `require`): `CODES`, `SETS`, `FIRST_WORD`, `LAST_WORD`, `WORDS`, `TASKS`, `MAX_SYMBOLS`, `UNIT_MS`, `lettersUpTo(level)`, `encodeWord(word)`, `decodeCode(code)`, `parseTyped(symbols)`, `checkTyped(target, symbols) → { ok, groups, read, wrong }`, `checkRead(word, letters) → number[]`, `addSymbol(symbols, sym)`, `removeSymbol(symbols)`, `beepPlan(codes, unit?) → [{ on, off, group }]`, `pickMessage(correct, prev, rng?)`, `readLevel(correct)`, `pickTask(prev, rng?)`
- `QK.morseUi`: `codeEl(code, big?)`, `wordCodes(text) → { el, groups }`, `guide(letters, { onPick?, fresh? }) → { highlight(set) }`, `clearGuide()`, `messageSlots(host, word)`, `play(codes, groupEls, onLight?)`, `stopPlaying()`, `morseInput(host, onSend) → { mark(wrong, read), symbols() }`
- `QK.common`: `PRAISE`, `readMessage(word, letters, mode, fresh?) → Promise<bool>` (`mode`: `"demo" | "graded" | "free"`), `writeWord(target, letters) → Promise<bool>`, `readExercises()`, `writeExercises()`

---

### 1-vazifa: Umumiy papka va 1-o'yinni unga ulash

**Fayllar:**
- Ko'chirish (`git mv`): `01-qabila-kodlari/js/{ui,storage,sound,art}.js` → `umumiy/js/`; `01-qabila-kodlari/tests/{helpers.js,storage.test.js}` → `umumiy/tests/`; `01-qabila-kodlari/css/style.css` → `umumiy/css/asos.css`; `01-qabila-kodlari/fonts/` → `umumiy/fonts/`
- Yaratish: `umumiy/js/app.js`, `umumiy/tests/art.test.js`, `01-qabila-kodlari/js/game-art.js`, `01-qabila-kodlari/tests/game-art.test.js`, `01-qabila-kodlari/css/style.css` (yangi, faqat 1-o'yinniki)
- O'zgartirish: `umumiy/js/storage.js`, `umumiy/js/sound.js`, `umumiy/js/art.js`, `umumiy/css/asos.css`, `umumiy/tests/helpers.js`, `umumiy/tests/storage.test.js`, `01-qabila-kodlari/js/main.js`, `01-qabila-kodlari/index.html`
- O'chirish: `01-qabila-kodlari/tests/art.test.js`

**Interfeyslar:** "Nomlar va interfeyslar" — Umumiy bo'limi. 1-o'yinning `js/scenes/*` fayllari **o'zgarmaydi** (ular `QK.art.tree`, `QK.art.person` ni ishlatadi — endi `game-art.js` beradi).

- [ ] **1-qadam: branch va boshlang'ich holat**

```bash
cd /Users/bicoder/Documents/Information
git status --short
git checkout -b oyin/02-qabila-morzesi
(cd oyinlar/01-qabila-kodlari && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)")
```
Kutilgan natija: ishchi papka toza; `pass 27`, `fail 0`.

- [ ] **2-qadam: fayllarni ko'chirish**

```bash
cd /Users/bicoder/Documents/Information/oyinlar
mkdir -p umumiy/js umumiy/css umumiy/tests
git mv 01-qabila-kodlari/js/ui.js umumiy/js/ui.js
git mv 01-qabila-kodlari/js/storage.js umumiy/js/storage.js
git mv 01-qabila-kodlari/js/sound.js umumiy/js/sound.js
git mv 01-qabila-kodlari/js/art.js umumiy/js/art.js
git mv 01-qabila-kodlari/css/style.css umumiy/css/asos.css
git mv 01-qabila-kodlari/fonts umumiy/fonts
git mv 01-qabila-kodlari/tests/helpers.js umumiy/tests/helpers.js
git mv 01-qabila-kodlari/tests/storage.test.js umumiy/tests/storage.test.js
git rm -q 01-qabila-kodlari/tests/art.test.js
ls umumiy/js umumiy/css umumiy/fonts umumiy/tests
```
Kutilgan natija: `umumiy/js`: `art.js sound.js storage.js ui.js`; `umumiy/css`: `asos.css`; `umumiy/fonts`: `Nunito.woff2 OFL.txt`; `umumiy/tests`: `helpers.js storage.test.js`.

- [ ] **3-qadam: `umumiy/tests/helpers.js` — to'liq yo'l bilan yuklash**

```js
// Brauzer skriptini (window.QK ga yozadigan) Node'da yuklash uchun yordamchi.
// new Function ishlatiladi — obyektlar shu realm'da yaratiladi, deepEqual to'g'ri ishlaydi.
const fs = require("node:fs");

// filePath — to'liq yo'l: chaqiruvchi uni path.join(__dirname, ...) bilan beradi
function loadScript(filePath, window) {
  new Function("window", fs.readFileSync(filePath, "utf8"))(window);
  return window;
}

module.exports = { loadScript };
```

- [ ] **4-qadam: `umumiy/tests/storage.test.js` — yangi API uchun muvaffaqiyatsiz testlar**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("./helpers.js");

const FILE = path.join(__dirname, "../js/storage.js");
const KEY = "sinov-oyin:v1";
const defaults = (n) => ({ done: Array(n).fill(false), muted: false });

function fakeLocalStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
  };
}

const storageFor = (localStorage) => loadScript(FILE, { localStorage }).QK.storage;

test("bo'sh xotira — standart holat", () => {
  assert.deepEqual(storageFor(fakeLocalStorage()).create(KEY, 3).load(), defaults(3));
});

test("saqlash va qayta o'qish", () => {
  const s = storageFor(fakeLocalStorage()).create(KEY, 3);
  s.save({ done: [true, false, false], muted: true });
  assert.deepEqual(s.load(), { done: [true, false, false], muted: true });
});

test("bosqichlar soni o'yinga qarab", () => {
  const s = storageFor(fakeLocalStorage()).create(KEY, 4);
  assert.deepEqual(s.load(), defaults(4));
  s.save({ done: [true, true, false, false], muted: false });
  assert.deepEqual(s.load(), { done: [true, true, false, false], muted: false });
});

test("har bir o'yin o'z kalitida saqlaydi", () => {
  const st = storageFor(fakeLocalStorage());
  const a = st.create("oyin-a:v1", 3);
  const b = st.create("oyin-b:v1", 3);
  a.save({ done: [true, true, true], muted: true });
  assert.deepEqual(b.load(), defaults(3));
  assert.deepEqual(a.load(), { done: [true, true, true], muted: true });
});

test("localStorage xato tashlasa — standart holat, o'yin to'xtamaydi", () => {
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  const s = storageFor(broken).create(KEY, 3);
  assert.doesNotThrow(() => s.save({ done: [true, true, true], muted: false }));
  assert.deepEqual(s.load(), defaults(3));
});

test("localStorage umuman yo'q — standart holat", () => {
  const s = loadScript(FILE, {}).QK.storage.create(KEY, 3);
  assert.deepEqual(s.load(), defaults(3));
  assert.doesNotThrow(() => s.save(defaults(3)));
});

test("buzilgan yoki eski ma'lumot — standart holat", () => {
  const ls = fakeLocalStorage();
  const s = storageFor(ls).create(KEY, 3);
  ls.setItem(KEY, "{buzuq");
  assert.deepEqual(s.load(), defaults(3));
  ls.setItem(KEY, JSON.stringify({ done: [true], muted: 1 }));
  assert.deepEqual(s.load(), defaults(3));
  ls.setItem(KEY, JSON.stringify({ done: [true, true, true, true], muted: false }));
  assert.deepEqual(s.load(), defaults(3));
});
```

Buyruq: `(cd oyinlar/umumiy && node --test tests/*.test.js)`
Kutilgan natija: FAIL — `create is not a function` (eski `storage.js` da faqat `load`/`save`).

- [ ] **5-qadam: `umumiy/js/storage.js`**

```js
// Tugagan bosqichlar va ovoz tanlovini brauzerda saqlash. Har bir o'yin o'z kaliti bilan:
// const store = QK.storage.create("qabila-kodlari:v1", 3). Xato bo'lsa jim o'tkazib yuboradi.
(function (root) {
  "use strict";

  function create(key, stageCount) {
    const defaults = () => ({ done: Array(stageCount).fill(false), muted: false });

    function load() {
      try {
        const raw = root.localStorage.getItem(key);
        if (!raw) return defaults();
        const data = JSON.parse(raw);
        const ok = Array.isArray(data.done) && data.done.length === stageCount && typeof data.muted === "boolean";
        return ok ? { done: data.done.map(Boolean), muted: data.muted } : defaults();
      } catch (e) {
        return defaults();
      }
    }

    function save(state) {
      try {
        root.localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        // Saqlab bo'lmadi (maxfiy rejim va h.k.) — o'yin baribir ishlaydi
      }
    }

    return { load, save };
  }

  root.QK = root.QK || {};
  root.QK.storage = { create };
})(window);
```

Buyruq: `(cd oyinlar/umumiy && node --test tests/*.test.js)`
Kutilgan natija: 7 ta test PASS.

- [ ] **6-qadam: `umumiy/js/sound.js` — Morze signallari qo'shiladi (fayl to'liq shunday bo'ladi)**

```js
// Tovush effektlari — Web Audio bilan yasaladi, tayyor fayl kerak emas.
// Brauzer talabi: AudioContext bola birinchi marta bosgandan keyin yaratiladi (unlock).
(function (root) {
  "use strict";

  let ctx = null;
  let muted = false;
  let beepNodes = [];

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

  // Morze signallarini to'xtatish (bosh ekranga qaytganda yoki yangi signal boshlanganda)
  function stopBeeps() {
    beepNodes.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // allaqachon to'xtagan
      }
    });
    beepNodes = [];
  }

  // Morze signallari: plan = [{ on, off }] millisekundda. Tekis ovoz, boshi va oxiri silliq.
  function beeps(plan) {
    stopBeeps();
    if (muted || !ctx) return;
    try {
      let t = ctx.currentTime;
      for (const b of plan) {
        const on = b.on / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.005);
        gain.gain.setValueAtTime(0.3, t + on - 0.005);
        gain.gain.linearRampToValueAtTime(0, t + on);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + on + 0.01);
        beepNodes.push(osc);
        t += on + b.off / 1000;
      }
    } catch (e) {
      // Ovoz chiqmasa ham o'yin davom etadi
    }
  }

  root.QK = root.QK || {};
  root.QK.sound = {
    unlock,
    play,
    beeps,
    stopBeeps,
    setMuted: (m) => { muted = !!m; },
    isMuted: () => muted,
  };
})(window);
```

Buyruq: `node --check oyinlar/umumiy/js/sound.js && echo OK` → `OK`.

- [ ] **7-qadam: `umumiy/js/art.js` — 1-o'yinga xos rasmlarni olib tashlash**

Repo ildizidan (skript har bir o'zgarishdan oldin matn borligini tekshiradi):

```bash
cd /Users/bicoder/Documents/Information && python3 - <<'PY'
import pathlib
p = pathlib.Path("oyinlar/umumiy/js/art.js")
s = p.read_text()

def cut(start, end):
    global s
    i = s.index(start)
    j = s.index(end, i)
    s = s[:i] + s[j:]

old_head = "// SVG rasmlar: qahramonlar, odam, baraban, ikonkalar va so'zlar daraxti.\n"
assert s.startswith(old_head)
s = s.replace(old_head, "// Umumiy SVG rasmlar: qahramonlar, baraban, ikonkalar. O'yinga xos rasmlar — o'yinning game-art.js faylida.\n", 1)
assert s.count('  const OFF = "#D9D2C3";\n') == 1
s = s.replace('  const OFF = "#D9D2C3";\n', "")
cut("  const TUNICS = [", "  function drum() {")
cut("  // Barg yozuvi", "  root.QK = root.QK || {};")
old_exp = "root.QK.art = { LETTER_COLORS, elder, apprentice, person, drum, icon, tree };"
assert s.count(old_exp) == 1
s = s.replace(old_exp, "root.QK.art = { LETTER_COLORS, elder, apprentice, drum, icon };")
p.write_text(s)
print("ok")
PY
grep -c "tree\|person\|TUNICS\|OFF" oyinlar/umumiy/js/art.js
```
Kutilgan natija: `ok`, keyin `0`.

- [ ] **8-qadam: `umumiy/tests/art.test.js`**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("./helpers.js");

const art = loadScript(path.join(__dirname, "../js/art.js"), {}).QK.art;

test("qahramonlar, baraban, ikonkalar SVG qaytaradi", () => {
  assert.match(art.elder(), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.elder(), /class="eyes"/);
  assert.match(art.apprentice(), /class="paper-text"/);
  assert.match(art.apprentice(), /class="arms-up"/);
  assert.match(art.drum(), /^<svg/);
  for (const n of ["home", "sound-on", "sound-off"]) assert.match(art.icon(n), /^<svg[\s\S]*<path/);
});

test("harf ranglari — QOIDALAR 6-bo'limidagi 4 ta rang", () => {
  assert.deepEqual(art.LETTER_COLORS, ["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"]);
});

test("umumiy rasmlarda o'yinga xos narsa yo'q", () => {
  assert.equal(art.tree, undefined);
  assert.equal(art.person, undefined);
});
```

Buyruq: `(cd oyinlar/umumiy && node --test tests/*.test.js)` → 10 ta test PASS.

- [ ] **9-qadam: `01-qabila-kodlari/tests/game-art.test.js` — muvaffaqiyatsiz test**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;
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

test("person: xursand va xafa holati farq qiladi", () => {
  assert.match(art.person(true, 0), /^<svg/);
  assert.notEqual(art.person(true, 0), art.person(false, 0));
});

test("umumiy qahramonlar ham joyida", () => {
  assert.match(art.elder(), /^<svg/);
  assert.match(art.apprentice(), /^<svg/);
});
```

Buyruq: `(cd oyinlar/01-qabila-kodlari && node --test tests/*.test.js)`
Kutilgan natija: `game-art.test.js` FAIL — `ENOENT ... js/game-art.js`.

- [ ] **10-qadam: `01-qabila-kodlari/js/game-art.js`**

```js
// 1-o'yinga xos SVG rasmlar: so'zlar daraxti va kichik qabila odami. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const art = root.QK.art;
  const LETTER_COLORS = art.LETTER_COLORS;
  const OFF = "#D9D2C3";
  const INK = "#2B2B3A";

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

  Object.assign(art, { person, tree });
})(window);
```

Buyruq: `(cd oyinlar/01-qabila-kodlari && node --test tests/*.test.js)`
Kutilgan natija: barcha testlar PASS (`logic.test.js` 16 ta + `game-art.test.js` 7 ta).

- [ ] **11-qadam: `umumiy/js/app.js` — umumiy o'yin qobig'i**

1-o'yinning eski `main.js` idagi mantiq, sozlamalar parametr bo'lib:

```js
// O'yin qobig'i: qahramonlar, bosh ekran, bosqichlar oqimi, ovoz tugmasi va ?bosqich=N.
// Har bir o'yinning main.js i faqat QK.app.start({ title, storageKey, stageTitles }) ni chaqiradi.
// Sahnalar QK.scenes da: intro(), stage1()..stageN(), stageDone(s, goingOn), finale() (ixtiyoriy), congrats().
(function (root) {
  "use strict";

  function start({ title, storageKey, stageTitles }) {
    const { storage, sound, art, ui } = root.QK;
    const $ = (id) => document.getElementById(id);
    const count = stageTitles.length;
    const store = storage.create(storageKey, count);
    const state = store.load();
    sound.setMuted(state.muted);
    const saveState = () => store.save(state);

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
      ui.bubble("elder", "Salom! Qaysi bosqichni oʻynaymiz?");

      const heading = ui.h("h1", { class: "game-title", text: title });
      const cards = ui.h("div", { class: "cards" });
      stageTitles.forEach((titleText, k) => {
        const open = k === 0 || state.done[k - 1];
        const clickable = open || state.done[k]; // tugagan bosqich, hattoki qulflangan bo'lsa ham, qayta o'ynaladi
        cards.append(ui.h("button", {
          class: "card" + (state.done[k] ? " done" : ""),
          type: "button",
          disabled: !clickable,
          onClick: () => { sound.play("tap"); play(k + 1, state.done[k]); },
        },
        ui.h("span", { class: "card-num", text: String(k + 1) }),
        ui.h("span", { class: "card-title", text: titleText }),
        ui.h("span", { class: "card-state", text: state.done[k] ? "✓" : open ? "" : "🔒" })));
      });
      ui.work().append(heading, cards);

      const next = state.done.indexOf(false);
      const first = next === -1 ? 1 : next + 1;
      ui.control().append(ui.button(next === -1 ? "Qayta oʻynash" : "Boshlash", () => play(first), "big"));
    }

    // once — tugagan bosqichni faqat o'zini qayta o'ynash: davom etmaydi, bosh ekranga qaytadi
    async function play(stage, once) {
      const scenes = root.QK.scenes;
      ui.newRun();
      ui.resetPoses();
      ui.hideProgress();
      ui.clearControl();
      if (stage === 1 && !state.done[0]) await scenes.intro();
      if (once) {
        await scenes["stage" + stage]();
        await scenes.stageDone(stage, false); // davom etmaymiz — "keyingisiga oʻtamiz" deyilmaydi
        home();
        return;
      }
      for (let s = stage; s <= count; s++) {
        await scenes["stage" + s]();
        state.done[s - 1] = true;
        saveState();
        if (s < count) await scenes.stageDone(s, true); // keyingi bosqichga o'tamiz
      }
      if (scenes.finale) await scenes.finale();
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
    // Brauzer talabi: ovoz faqat birinchi bosishdan keyin. Telefonda pointerdown emas,
    // touchend/click orqali ochiladi — shuning uchun bir nechta hodisa tinglanadi.
    const unlock = () => sound.unlock();
    ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach((t) => document.addEventListener(t, unlock, true));

    // O'qituvchi va sinov uchun: ?bosqich=2 — shu bosqichdan boshlash
    const direct = Number(new URLSearchParams(root.location.search).get("bosqich"));
    if (Number.isInteger(direct) && direct >= 1 && direct <= count) play(direct);
    else home();
  }

  root.QK = root.QK || {};
  root.QK.app = { start };
})(window);
```

- [ ] **12-qadam: `01-qabila-kodlari/js/main.js` (fayl to'liq shunday bo'ladi)**

```js
// 1-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Qabila kodlari",
  storageKey: "qabila-kodlari:v1", // o'zgartirilmaydi — bolalarning saqlangan progressi shu kalitda
  stageTitles: ["Aynan i harfli soʻzlar", "i harfgacha soʻzlar", "Nechta harf kerak?"],
});
```

- [ ] **13-qadam: `01-qabila-kodlari/index.html` (fayl to'liq shunday bo'ladi)**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Qabila kodlari</title>
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
  <script src="js/logic.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="js/scenes/common.js"></script>
  <script src="js/scenes/stage1.js"></script>
  <script src="js/scenes/stage2.js"></script>
  <script src="js/scenes/stage3.js"></script>
  <script src="js/scenes/final.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **14-qadam: CSS ni ajratish — `umumiy/css/asos.css` dan 1-o'yinga xos qoidalarni olib tashlash**

`asos.css` hozir 1-o'yinning eski `style.css` (254 qator) bilan bir xil. Skript har bir qatorni o'chirishdan oldin tekshiradi:

```bash
cd /Users/bicoder/Documents/Information && python3 - <<'PY'
import pathlib
p = pathlib.Path("oyinlar/umumiy/css/asos.css")
lines = p.read_text().split("\n")
L = lambda n: lines[n - 1]  # 1 dan boshlanadigan raqam
expect = {
    1: "/* Qabila kodlari —", 117: "/* ---------- Harflar, kataklar, devor", 138: ".wall {", 139: ".wall-col", 140: ".wall-title",
    171: "/* ---------- Formula", 172: ".formula-box", 178: ".slot-cap", 179: ".hint-title",
    181: "/* ---------- Daraxt", 182: ".level-counts", 185: ".tree .grow", 187: "/* ---------- Odamlar", 195: ".people-info",
    197: "/* ---------- Baraban, pauza, final", 198: ".pause-box", 199: ".drum", 200: ".pause-options", 201: ".pause-opt", 202: ".pause-or", 203: ".beats",
}
for n, start in expect.items():
    assert L(n).startswith(start), (n, L(n))
assert L(186) == "" and L(196) == ""
lines[0] = "/* Barcha o'yinlar uchun umumiy uslublar: ranglar, joylashuv, pufak, tugmalar, qahramonlar. Ranglar: QOIDALAR.md, 6-bo'lim. */"
lines[116] = "/* ---------- Harflar va kataklar ---------- */"
lines[196] = "/* ---------- Baraban ---------- */"
drop = set(range(138, 141)) | set(range(171, 179)) | set(range(181, 197)) | {198, 200, 201, 202}
out = [line for n, line in enumerate(lines, 1) if n not in drop]
p.write_text("\n".join(out))
print("ok", len(out))
PY
```
Kutilgan natija: `ok 224`.

- [ ] **15-qadam: `01-qabila-kodlari/css/style.css` — faqat 1-o'yinga xos uslublar (yangi fayl)**

```css
/* Qabila kodlari — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

/* ---------- Devor ---------- */
.wall { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 520px; }
.wall-col { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 120px; }
.wall-title { font-weight: 800; }

/* ---------- Formula ---------- */
.formula-box { display: flex; flex-direction: column; align-items: center; gap: 10px; max-width: 100%; text-align: center; }
.formula { font-size: clamp(22px, 6vw, 36px); font-weight: 900; overflow-wrap: anywhere; animation: pop 0.3s; }
.formula.big { color: var(--asosiy); font-size: clamp(28px, 8vw, 44px); }
.formula-row { font-size: 22px; font-weight: 800; animation: pop 0.3s; }
.legend { font-size: 18px; }
.slot-f { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.slot-cap { font-size: 18px; font-weight: 700; }

/* ---------- Daraxt ---------- */
.level-counts { font-size: 20px; font-weight: 800; text-align: center; }
.tree-box { width: 100%; flex: 1 0 auto; min-height: 300px; display: flex; justify-content: center; }
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

/* ---------- Pauza sahnasi ---------- */
.pause-box { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.pause-options { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px; }
.pause-opt { display: flex; flex-direction: column; align-items: center; gap: 6px; font-weight: 800; }
.pause-or { font-weight: 800; }
```

- [ ] **16-qadam: hech bir CSS qoidasi yo'qolmaganini tekshirish**

```bash
cd /Users/bicoder/Documents/Information && python3 - <<'PY'
import subprocess, pathlib
old = subprocess.run(["git", "show", "HEAD:oyinlar/01-qabila-kodlari/css/style.css"], capture_output=True, text=True, check=True).stdout
rules = lambda text: {l.strip() for l in text.split("\n") if l.strip() and not l.strip().startswith("/*")}
new = rules(pathlib.Path("oyinlar/umumiy/css/asos.css").read_text()) | rules(pathlib.Path("oyinlar/01-qabila-kodlari/css/style.css").read_text())
missing = rules(old) - new
extra = new - rules(old)
print("missing:", missing)
print("extra:", extra)
assert not missing and not extra
PY
```
Kutilgan natija: `missing: set()`, `extra: set()`.

- [ ] **17-qadam: fayl yo'llari va testlar**

`index.html` dagi har bir `src`/`href` fayli mavjudligini tekshirish (brauzer o'rniga):

```bash
cd /Users/bicoder/Documents/Information/oyinlar/01-qabila-kodlari && python3 - <<'PY'
import re, pathlib
html = pathlib.Path("index.html").read_text()
refs = [r for r in re.findall(r'(?:src|href)="([^"]+)"', html) if not r.startswith("data:")]
missing = [r for r in refs if not pathlib.Path(r).exists()]
print(len(refs), "ta yo'l; yo'q:", missing)
assert not missing
PY
cd /Users/bicoder/Documents/Information/oyinlar
for f in umumiy/js/*.js 01-qabila-kodlari/js/*.js 01-qabila-kodlari/js/scenes/*.js; do node --check "$f" || echo "FAIL $f"; done
(cd umumiy && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)")
(cd 01-qabila-kodlari && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)")
grep -rn "storage\.load\|storage\.save" 01-qabila-kodlari/js || echo "eski storage chaqiruvlari yo'q"
```
Kutilgan natija: `15 ta yo'l; yo'q: []`; `FAIL` yo'q; umumiy `pass 10`, 1-o'yin `pass 23`, `fail 0`; `eski storage chaqiruvlari yo'q`.

- [ ] **18-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information
git add -A oyinlar/umumiy oyinlar/01-qabila-kodlari
git status --short
git commit -m "Umumiy papka: qahramonlar, UI, tovush, saqlash, qobiq va uslublar; 1-o'yin unga ulandi" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 2-vazifa: Morze hisob moduli (`morse.js`)

**Fayllar:**
- Yaratish: `02-qabila-morzesi/js/morse.js`
- Test: `02-qabila-morzesi/tests/morse.test.js`

**Interfeyslar:**
- Oldingi vazifalardan: yo'q (mustaqil modul).
- Keyingilarga beradi: `QK.morse` — "Nomlar va interfeyslar" dagi ro'yxat. Qiymatlar DIZAYN 4, 5.3, 6.2, 9-bo'limlaridan.

- [ ] **1-qadam: muvaffaqiyatsiz testlar — `tests/morse.test.js`**

```js
// morse.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../js/morse.js");

// Xalqaro Morze jadvali — koddagi jadvaldan mustaqil yozilgan
const STANDARD = `A .- B -... C -.-. D -.. E . F ..-. G --. H .... I .. J .--- K -.- L .-.. M --
N -. O --- P .--. Q --.- R .-. S ... T - U ..- V ...- W .-- X -..- Y -.-- Z --..`;

const within = (word, letters) => [...word].every((ch) => letters.includes(ch));

test("kodlar xalqaro standartga mos", () => {
  const parts = STANDARD.split(/\s+/);
  const table = {};
  for (let k = 0; k < parts.length; k += 2) table[parts[k]] = parts[k + 1];
  assert.deepEqual(M.CODES, table);
});

test("to'plamlar: 9, 13, 20 harf, alifbo tartibida", () => {
  assert.equal(M.lettersUpTo(1).join(""), "AEILMNOST");
  assert.equal(M.lettersUpTo(2).join(""), "AEHIKLMNORSTU");
  assert.equal(M.lettersUpTo(3).join(""), "ABDEHIKLMNOQRSTUVXYZ");
});

test("SALOM va 1-to'plam so'zlari faqat 1-to'plam harflaridan", () => {
  const set1 = M.lettersUpTo(1);
  assert.ok(within(M.FIRST_WORD, set1));
  for (const w of M.WORDS[0]) assert.ok(within(w, set1), w);
});

test("2-to'plam so'zlarida kamida bitta yangi harf bor", () => {
  const upTo2 = M.lettersUpTo(2);
  for (const w of M.WORDS[1]) {
    assert.ok(within(w, upTo2), w);
    assert.ok([...w].some((ch) => M.SETS[1].includes(ch)), w);
  }
});

test("topshiriqlar: 12 ta, javob 2–4 harf; 3-to'plamning hamma harfi topshiriqlarda yoki XAYR da bor", () => {
  const all = M.lettersUpTo(3);
  const used = new Set();
  for (const t of M.TASKS) {
    assert.ok(t.a.length >= 2 && t.a.length <= 4, t.a);
    assert.ok(within(t.a, all), t.a);
    assert.ok(t.q.length > 0);
    [...t.a].forEach((ch) => used.add(ch));
  }
  [...M.LAST_WORD].forEach((ch) => used.add(ch)); // X faqat XAYR da uchraydi
  for (const ch of M.SETS[2]) assert.ok(used.has(ch), ch);
  assert.equal(M.TASKS.length, 12);
  assert.ok(within(M.LAST_WORD, all));
});

test("so'zlarda faqat A–Z (oʻ, gʻ, tutuq belgisi yo'q)", () => {
  const words = [M.FIRST_WORD, M.LAST_WORD, ...M.WORDS[0], ...M.WORDS[1], ...M.TASKS.map((t) => t.a), "SOS"];
  for (const w of words) assert.match(w, /^[A-Z]+$/, w);
});

test("kodlash va o'qish bir-birining teskarisi", () => {
  assert.deepEqual(M.encodeWord("SALOM"), ["...", ".-", ".-..", "---", "--"]);
  const words = [M.FIRST_WORD, M.LAST_WORD, ...M.WORDS[0], ...M.WORDS[1], ...M.TASKS.map((t) => t.a)];
  for (const w of words) assert.equal(M.encodeWord(w).map(M.decodeCode).join(""), w);
  assert.equal(M.decodeCode("......"), "?");
});

test("parseTyped: ortiqcha oraliqlar hisobga olinmaydi", () => {
  assert.deepEqual(M.parseTyped(".... .-"), ["....", ".-"]);
  assert.deepEqual(M.parseTyped(".... .- "), ["....", ".-"]);
  assert.deepEqual(M.parseTyped(""), []);
});

test("checkTyped: to'g'ri, noto'g'ri, yetishmayotgan va ortiqcha harf", () => {
  assert.deepEqual(M.checkTyped("HA", ".... .-"), { ok: true, groups: ["....", ".-"], read: "HA", wrong: [] });
  assert.deepEqual(M.checkTyped("HA", ".... -."), { ok: false, groups: ["....", "-."], read: "HN", wrong: [1] });
  assert.deepEqual(M.checkTyped("HA", "...."), { ok: false, groups: ["...."], read: "H", wrong: [1] });
  assert.deepEqual(M.checkTyped("HA", ".... .- ."), { ok: false, groups: ["....", ".-", "."], read: "HAE", wrong: [2] });
  assert.equal(M.checkTyped("HA", "......").read, "?");
  assert.equal(M.checkTyped("HA", "....-").ok, false); // harf oralig'isiz terilgan
});

test("checkRead: noto'g'ri kataklar indekslari", () => {
  assert.deepEqual(M.checkRead("SALOM", ["S", "A", "L", "O", "M"]), []);
  assert.deepEqual(M.checkRead("SALOM", ["S", "A", "I", "O", "N"]), [2, 4]);
});

test("addSymbol / removeSymbol: oraliq boshida va ketma-ket yozilmaydi, 40 belgidan oshmaydi", () => {
  assert.equal(M.addSymbol("", " "), "");
  assert.equal(M.addSymbol("....", " "), ".... ");
  assert.equal(M.addSymbol(".... ", " "), ".... ");
  assert.equal(M.addSymbol(".... ", "."), ".... .");
  assert.equal(M.removeSymbol(".... ."), ".... ");
  assert.equal(M.removeSymbol(""), "");
  let s = "";
  for (let k = 0; k < 60; k++) s = M.addSymbol(s, ".");
  assert.equal(s.length, M.MAX_SYMBOLS);
});

test("beepPlan: nuqta 1, chiziq 3 birlik; belgilar orasida 1, harf oxirida 3 birlik", () => {
  assert.deepEqual(M.beepPlan(M.encodeWord("ET"), 100), [
    { on: 100, off: 300, group: 0 },
    { on: 300, off: 300, group: 1 },
  ]);
  assert.deepEqual(M.beepPlan(["..-"], 100), [
    { on: 100, off: 100, group: 0 },
    { on: 100, off: 100, group: 0 },
    { on: 300, off: 300, group: 0 },
  ]);
  assert.equal(M.beepPlan(["."])[0].on, M.UNIT_MS);
});

test("pickMessage: avval SALOM, keyin 1-, so'ng 2-to'plam; ketma-ket takror yo'q", () => {
  assert.equal(M.pickMessage(0, null), "SALOM");
  assert.equal(M.pickMessage(0, "OTA"), "SALOM");
  for (let k = 0; k < 200; k++) assert.ok(M.WORDS[0].includes(M.pickMessage(0, "SALOM")));
  let prev = "SALOM";
  for (let k = 0; k < 500; k++) {
    const w = M.pickMessage(1, prev);
    assert.ok(M.WORDS[0].includes(w));
    assert.notEqual(w, prev);
    prev = w;
  }
  for (let k = 0; k < 500; k++) {
    const w = M.pickMessage(2, prev);
    assert.ok(M.WORDS[1].includes(w));
    assert.notEqual(w, prev);
    prev = w;
  }
});

test("readLevel: 2-to'g'ri javobdan keyin 2-to'plam", () => {
  assert.deepEqual([0, 1, 2].map((c) => M.readLevel(c)), [1, 1, 2]);
});

test("pickTask: ketma-ket bir xil topshiriq yo'q", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const t = M.pickTask(prev);
    assert.ok(M.TASKS.includes(t));
    if (prev) assert.notEqual(t.a, prev.a);
    prev = t;
  }
});

test("rng berilsa — natija oldindan ma'lum", () => {
  const first = () => 0;
  assert.equal(M.pickMessage(1, null, first), M.WORDS[0][0]);
  assert.equal(M.pickTask(null, first), M.TASKS[0]);
});
```

- [ ] **2-qadam: testlar muvaffaqiyatsiz ekanini ko'rish**

Buyruq: `(cd oyinlar/02-qabila-morzesi && node --test tests/*.test.js)`
Kutilgan natija: FAIL — `Cannot find module '../js/morse.js'`.

- [ ] **3-qadam: `js/morse.js`**

```js
// Qabila Morzesi — sof hisob: Morze kodlari, so'zlar, topshiriqlar va tekshirish.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Xalqaro Morze alifbosi: "." — nuqta, "-" — chiziq
  const CODES = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
    J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  };

  // Harflar to'plamlari — qo'llanmada asta-sekin ochiladi (DIZAYN 4-bo'lim)
  const SETS = [
    ["A", "E", "I", "L", "M", "N", "O", "S", "T"],
    ["H", "K", "R", "U"],
    ["B", "D", "Q", "V", "X", "Y", "Z"],
  ];

  const FIRST_WORD = "SALOM";
  const LAST_WORD = "XAYR";

  // 1-bosqich xabarlari: [0] — 1-to'plamdan, [1] — 2-to'plamdan (kamida bitta yangi harf)
  const WORDS = [
    ["OTA", "ONA", "NON", "MEN", "NIMA", "OLMA", "LOLA", "ASAL", "TAOM", "SOAT", "ILON", "ISM"],
    ["KUN", "TUN", "SUT", "RASM", "KALIT", "KOSA", "TOSH", "SHER", "MUSHUK", "RAHMAT"],
  ];

  // 2-bosqich topshiriqlari: q — qabila savoli, a — bola teradigan javob
  const TASKS = [
    { q: "Kim Morzeni oʻrganyapti?", a: "MEN" },
    { q: "Kechasi osmonda nima chiqadi?", a: "OY" },
    { q: "Morze senga yoqdimi?", a: "HA" },
    { q: "Tushlikka nima yeding?", a: "OSH" },
    { q: "Chanqasang nima ichasan?", a: "SUV" },
    { q: "Mushuk nima ichadi?", a: "SUT" },
    { q: "Nonvoy nima yopadi?", a: "NON" },
    { q: "Quyosh chiqsa kun boʻladimi yoki tun?", a: "KUN" },
    { q: "Sen kimsan?", a: "BOLA" },
    { q: "Osmonda nima uchadi?", a: "QUSH" },
    { q: "Qaysi faslda eng issiq?", a: "YOZ" },
    { q: "Tovuq nima yeydi?", a: "DON" },
  ];

  const MAX_SYMBOLS = 40;
  const UNIT_MS = 120;

  // 1..level to'plamlarining harflari, alifbo tartibida
  function lettersUpTo(level) {
    return SETS.slice(0, level).flat().sort();
  }

  const encodeWord = (word) => [...word].map((ch) => CODES[ch]);

  function decodeCode(code) {
    for (const [letter, c] of Object.entries(CODES)) if (c === code) return letter;
    return "?";
  }

  // Terilgan belgilar ("." "-" " ") → harf kodlari; ortiqcha oraliqlar hisobga olinmaydi
  const parseTyped = (symbols) => symbols.split(" ").filter(Boolean);

  // Bola terganini tekshirish: har bir guruh o'qiladi, noto'g'ri (yoki yetishmayotgan) guruhlar indekslari
  function checkTyped(target, symbols) {
    const want = encodeWord(target);
    const groups = parseTyped(symbols);
    const read = groups.map(decodeCode).join("");
    const wrong = [];
    const n = Math.max(want.length, groups.length);
    for (let k = 0; k < n; k++) if (groups[k] !== want[k]) wrong.push(k);
    return { ok: wrong.length === 0, groups, read, wrong };
  }

  // Bola o'qigan harflarni tekshirish: noto'g'ri kataklar indekslari
  function checkRead(word, letters) {
    const wrong = [];
    [...word].forEach((ch, k) => {
      if (letters[k] !== ch) wrong.push(k);
    });
    return wrong;
  }

  // Terishga belgi qo'shish: oraliq boshida va ketma-ket ikki marta yozilmaydi, 40 belgidan oshmaydi
  function addSymbol(symbols, sym) {
    if (symbols.length >= MAX_SYMBOLS) return symbols;
    if (sym === " " && (symbols === "" || symbols.endsWith(" "))) return symbols;
    return symbols + sym;
  }

  const removeSymbol = (symbols) => symbols.slice(0, -1);

  // "Tinglash" rejasi: har bir belgi uchun { on, off, group } (ms).
  // Nuqta 1, chiziq 3 birlik; belgilar orasida 1, harf oxirida 3 birlik pauza.
  function beepPlan(codes, unit) {
    unit = unit || UNIT_MS;
    const plan = [];
    codes.forEach((code, group) => {
      [...code].forEach((sym, k) => {
        const last = k === code.length - 1;
        plan.push({ on: (sym === "." ? 1 : 3) * unit, off: (last ? 3 : 1) * unit, group });
      });
    });
    return plan;
  }

  // Ro'yxatdan tasodifiy, oldingisidan farqli element
  function pickFrom(list, isSame, rng) {
    const pool = list.filter((x) => !isSame(x));
    return pool[Math.floor((rng || Math.random)() * pool.length)];
  }

  // 1-bosqich xabari: correct — shu paytgacha to'g'ri o'qilganlar soni.
  // 0 → SALOM (u xato bo'lsa — 1-to'plamdan), 1 → 1-to'plam, 2 → 2-to'plam
  function pickMessage(correct, prev, rng) {
    if (correct === 0 && prev !== FIRST_WORD) return FIRST_WORD;
    return pickFrom(WORDS[correct >= 2 ? 1 : 0], (w) => w === prev, rng);
  }

  // Qo'llanmadagi harflar darajasi: 2-to'g'ri javobdan keyin 2-to'plam ochiladi
  const readLevel = (correct) => (correct >= 2 ? 2 : 1);

  function pickTask(prev, rng) {
    return pickFrom(TASKS, (t) => !!prev && t.a === prev.a, rng);
  }

  const api = {
    CODES, SETS, FIRST_WORD, LAST_WORD, WORDS, TASKS, MAX_SYMBOLS, UNIT_MS,
    lettersUpTo, encodeWord, decodeCode, parseTyped, checkTyped, checkRead,
    addSymbol, removeSymbol, beepPlan, pickMessage, readLevel, pickTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.morse = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

- [ ] **4-qadam: testlar o'tishini tekshirish**

Buyruq: `(cd oyinlar/02-qabila-morzesi && node --test tests/*.test.js)`
Kutilgan natija: 16 ta test PASS, `fail 0`.

- [ ] **5-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information
git add oyinlar/02-qabila-morzesi/js/morse.js oyinlar/02-qabila-morzesi/tests/morse.test.js
git commit -m "02-qabila-morzesi: Morze hisob moduli va testlari" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 3-vazifa: 2-o'yin sahifasi, uslublar, hikoya rasmlari va Morze ekran qismlari

**Fayllar:**
- Yaratish: `02-qabila-morzesi/index.html`, `css/style.css`, `js/game-art.js`, `tests/game-art.test.js`, `js/morse-ui.js`, `js/main.js`

**Interfeyslar:**
- Oldingi vazifalardan: `QK.morse` (2-vazifa); `QK.ui`, `QK.sound.beeps/stopBeeps`, `QK.art`, `QK.app.start` (1-vazifa).
- Keyingilarga beradi: `QK.art.story(name)` (`"telegraph" | "ship" | "lighthouse" | "radio" | "eye"`, noma'lum — `""`); `QK.morseUi` — "Nomlar va interfeyslar" dagi ro'yxat.
- `index.html` sahna fayllarini (`js/scenes/*.js`) ham ulaydi — ular 4–6-vazifalarda yoziladi (brauzerda ochilmagani uchun oraliqda muammo yo'q).

- [ ] **1-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Qabila Morzesi</title>
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
      <aside class="zone-guide" id="zone-guide" aria-label="Morze qoʻllanmasi"></aside>
    </main>
  </div>
  <script src="js/morse.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="js/morse-ui.js"></script>
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
/* Qabila Morzesi — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

/* ---------- Qo'llanma zonasi: telefonda pastda, yotiq ekran va kompyuterda o'ng chekkada ---------- */
/* .has-guide sinfini morse-ui.js qo'yadi/oladi; qo'llanma yo'q ekranlar 1-o'yindagidek */
.play.has-guide {
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  grid-template-areas: "stage" "work" "control" "guide";
}
.zone-guide { grid-area: guide; min-height: 0; max-height: 42vh; overflow: auto; padding: 4px; }
.play:not(.has-guide) .zone-guide { display: none; }
@media (orientation: landscape) {
  .play.has-guide {
    grid-template-columns: minmax(180px, 26%) minmax(0, 1fr) minmax(220px, 30%);
    grid-template-rows: minmax(0, 1fr) auto;
    grid-template-areas: "stage work guide" "stage control guide";
  }
  .zone-guide { max-height: none; }
}

/* ---------- Nuqta va chiziq: matn emas, chizilgan shakl ---------- */
.code { display: inline-flex; align-items: center; gap: 4px; min-height: 12px; }
.sym { display: inline-block; background: var(--matn); }
.sym.dot { width: 8px; height: 8px; border-radius: 50%; }
.sym.dash { width: 22px; height: 8px; border-radius: 4px; }
.code.big { gap: 6px; }
.code.big .sym.dot { width: 14px; height: 14px; }
.code.big .sym.dash { width: 38px; height: 14px; border-radius: 7px; }
.code.playing .sym { background: var(--yana); }

/* ---------- Qo'llanma ---------- */
.guide { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 6px; }
.guide-cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  min-width: 48px; min-height: 52px; padding: 4px; border: none; border-radius: 12px;
  background: #fff; box-shadow: 0 3px 0 var(--soya); color: var(--matn); font-size: 20px; font-weight: 900;
}
button.guide-cell:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--soya); }
.guide-cell.hl { outline: 3px solid var(--yana); outline-offset: -3px; }
.guide-cell.new { animation: flash 0.4s 4; }

/* ---------- Xabar va kataklar (o'qish) ---------- */
.read-box, .write-box { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.message { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; }
.group { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.rslot {
  width: 52px; height: 52px; padding: 0; border: 3px dashed var(--chiziq); border-radius: 12px;
  background: #fff; color: var(--matn); font-size: 28px; font-weight: 900;
}
.rslot.current { border-style: solid; border-color: var(--asosiy); }
.rslot.wrong { border-style: solid; border-color: var(--yana); }
.rslot.wrong:empty::after { content: "↻"; color: var(--yana); font-size: 22px; }
.rslot.solution { border-style: solid; border-color: var(--togri); color: var(--togri); }
.msg-tools { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }

/* ---------- Terish (yozish) ---------- */
.typed {
  display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 12px;
  width: 100%; max-width: 520px; min-height: 72px; padding: 10px 12px; border-radius: 14px;
  background: #fff; box-shadow: inset 0 0 0 3px var(--chiziq);
}
.typed-group { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.typed-group.wrong .sym { background: var(--yana); }
.typed-letter { min-height: 26px; font-size: 20px; font-weight: 900; }
.typed-group.wrong .typed-letter::after { content: " ↻"; color: var(--yana); }
.mkeys { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; width: 100%; max-width: 520px; }
.mkeys .key { font-size: 26px; }
.mkeys .key.gap { font-size: 18px; line-height: 1.1; }
.mkeys .key.send { background: var(--togri); color: #fff; font-size: 18px; }

/* ---------- Namuna: harf va uning kodi (ta'rif, hikoya, yechim) ---------- */
.example { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-end; gap: 14px; }
.example-letter { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.example-letter b { font-size: 26px; font-weight: 900; }
.example-slash { padding: 0 4px; color: var(--yana); font-size: 32px; font-weight: 900; }

/* ---------- Baraban va hikoya ---------- */
.drum-box { display: flex; justify-content: center; }
.story { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.story-art { width: min(260px, 70vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.lamp-light { opacity: 0.12; transition: opacity 0.05s; }
.lamp.on .lamp-light { opacity: 1; }

/* ---------- Tabrik ---------- */
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }
.summary-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
```

- [ ] **3-qadam: `tests/game-art.test.js` — muvaffaqiyatsiz test**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("hikoya rasmlari SVG qaytaradi", () => {
  for (const n of ["telegraph", "ship", "lighthouse", "radio", "eye"]) {
    assert.match(art.story(n), /^<svg[\s\S]*<\/svg>$/, n);
  }
});

test("mayoqda yonib-o'chadigan chiroq bor", () => {
  assert.match(art.story("lighthouse"), /class="lamp"/);
  assert.match(art.story("lighthouse"), /class="lamp-light"/);
});

test("noma'lum rasm — bo'sh satr", () => {
  assert.equal(art.story("yoq"), "");
});

test("umumiy qahramonlar joyida", () => {
  assert.match(art.elder(), /^<svg/);
  assert.match(art.drum(), /^<svg/);
});
```

Buyruq: `(cd oyinlar/02-qabila-morzesi && node --test tests/*.test.js)`
Kutilgan natija: `game-art.test.js` FAIL — `ENOENT ... js/game-art.js`.

- [ ] **4-qadam: `js/game-art.js`**

```js
// 2-o'yinga xos SVG rasmlar: hikoya sahnalari. QK.art.story(name) sifatida qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const WOOD = "#8A5A2B";

  const STORY = {
    // Telegraf: taglik, kalit (richag), sim va ustun
    telegraph: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="10" y="84" width="104" height="18" rx="4" fill="${WOOD}"/>
  <rect x="22" y="74" width="16" height="10" fill="#C9C2B4"/>
  <path d="M30 72 L96 62" stroke="#C9C2B4" stroke-width="8" stroke-linecap="round"/>
  <circle cx="98" cy="60" r="9" fill="${INK}"/>
  <path d="M114 92 Q146 70 168 36" stroke="${INK}" stroke-width="3" fill="none"/>
  <rect x="164" y="24" width="8" height="90" fill="${WOOD}"/>
  <rect x="150" y="30" width="36" height="6" rx="2" fill="${WOOD}"/>
  <path d="M168 36 L200 30" stroke="${INK}" stroke-width="3"/>
</svg>`,
    // Kema: ikki yelkan, korpus, to'lqinlar
    ship: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="96" y="14" width="6" height="58" fill="${WOOD}"/>
  <path d="M102 18 L150 64 L102 64 Z" fill="#FFFFFF" stroke="#C9C2B4" stroke-width="2"/>
  <path d="M96 24 L60 64 L96 64 Z" fill="#F4E3C3" stroke="#C9C2B4" stroke-width="2"/>
  <path d="M26 70 L174 70 L154 96 L46 96 Z" fill="#7A4E9A"/>
  <circle cx="70" cy="82" r="4" fill="#F4E3C3"/>
  <circle cx="100" cy="82" r="4" fill="#F4E3C3"/>
  <circle cx="130" cy="82" r="4" fill="#F4E3C3"/>
  <path d="M0 100 Q25 90 50 100 T100 100 T150 100 T200 100 V120 H0 Z" fill="#3E7CB1"/>
</svg>`,
    // Mayoq: .lamp guruhi "on" sinfi bilan yonadi (Morze chirog'i)
    lighthouse: `<svg viewBox="0 0 200 140" aria-hidden="true">
  <g class="lamp">
    <path class="lamp-light" d="M112 44 L200 18 L200 70 Z" fill="#F0C040"/>
    <path class="lamp-light" d="M88 44 L0 18 L0 70 Z" fill="#F0C040"/>
  </g>
  <path d="M78 134 L88 52 L112 52 L122 134 Z" fill="#FFFFFF" stroke="#C8553D" stroke-width="3"/>
  <rect x="84" y="76" width="32" height="10" fill="#C8553D"/>
  <rect x="81" y="104" width="38" height="10" fill="#C8553D"/>
  <rect x="86" y="36" width="28" height="16" rx="2" fill="${INK}"/>
  <circle cx="100" cy="44" r="6" fill="#F0C040"/>
  <path d="M84 36 L100 22 L116 36 Z" fill="#C8553D"/>
</svg>`,
    // Radio va samolyot
    radio: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="16" y="58" width="90" height="50" rx="8" fill="${WOOD}"/>
  <circle cx="44" cy="83" r="14" fill="#F4E3C3"/>
  <rect x="68" y="72" width="28" height="6" rx="3" fill="#F4E3C3"/>
  <rect x="68" y="86" width="28" height="6" rx="3" fill="#F4E3C3"/>
  <path d="M90 58 L108 18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <path d="M114 20 Q122 12 130 20 M110 12 Q122 0 134 12" stroke="#F08A24" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M136 52 L192 44 L188 52 L160 56 L150 74 L142 74 L148 57 L138 58 Z" fill="#3E7CB1"/>
</svg>`,
    // Ko'z
    eye: `<svg viewBox="0 0 200 100" aria-hidden="true">
  <path d="M16 50 Q100 -12 184 50 Q100 112 16 50 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="4"/>
  <circle cx="100" cy="50" r="22" fill="#3E7CB1"/>
  <circle cx="100" cy="50" r="10" fill="${INK}"/>
  <circle cx="107" cy="43" r="4" fill="#FFFFFF"/>
</svg>`,
  };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { story });
})(window);
```

Buyruq: `(cd oyinlar/02-qabila-morzesi && node --test tests/*.test.js)`
Kutilgan natija: 20 ta test PASS (`morse` 16 + `game-art` 4).

- [ ] **5-qadam: `js/morse-ui.js`**

```js
// Morze ekran qismlari: nuqta/chiziq shakllari, qo'llanma, xabar kataklari, Morze klaviaturasi, "Tinglash".
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, sound } = QK;
  const $ = (id) => document.getElementById(id);

  // "." "-" → chizilgan shakllar (nuqta — doira, chiziq — uzun to'rtburchak)
  function codeEl(code, big) {
    const label = [...code].map((s) => (s === "." ? "nuqta" : "chiziq")).join(" ");
    const el = ui.h("span", { class: "code" + (big ? " big" : ""), role: "img", "aria-label": label });
    for (const s of code) el.append(ui.h("span", { class: "sym " + (s === "." ? "dot" : "dash") }));
    return el;
  }

  // Namuna: har bir harf ustida uning kodi. Matndagi bo'sh joy — so'zlar orasidagi "/".
  // groups — harf kodlari elementlari ("Tinglash" ularni yondiradi).
  function wordCodes(text) {
    const el = ui.h("div", { class: "example" });
    const groups = [];
    for (const ch of text) {
      if (ch === " ") {
        el.append(ui.h("span", { class: "example-slash", text: "/" }));
        continue;
      }
      const code = codeEl(morse.CODES[ch], true);
      groups.push(code);
      el.append(ui.h("div", { class: "example-letter" }, code, ui.h("b", { text: ch })));
    }
    return { el, groups };
  }

  // ---------- Qo'llanma ----------
  function clearGuide() {
    $("zone-guide").innerHTML = "";
    $("play").classList.remove("has-guide");
  }

  // letters — ko'rsatiladigan harflar; onPick bo'lsa kataklar tugma (1-bosqich klaviaturasi);
  // fresh — yangi ochilgan harflar (qisqa miltillaydi)
  function guide(letters, opts) {
    opts = opts || {};
    const zone = $("zone-guide");
    zone.innerHTML = "";
    $("play").classList.add("has-guide");
    ui.onCleanup(clearGuide); // bosh ekranga qaytganda qo'llanma yo'qoladi
    const grid = ui.h("div", { class: "guide" });
    const cells = {};
    for (const l of letters) {
      const fresh = !!opts.fresh && opts.fresh.includes(l);
      const cell = ui.h(opts.onPick ? "button" : "div", {
        class: "guide-cell" + (fresh ? " new" : ""),
        type: opts.onPick ? "button" : null,
        "aria-label": opts.onPick ? `${l} harfi` : null,
        onClick: opts.onPick ? () => { sound.play("tap"); opts.onPick(l); } : null,
      }, ui.h("span", { text: l }), codeEl(morse.CODES[l]));
      cells[l] = cell;
      grid.append(cell);
    }
    zone.append(grid);
    return {
      // Maslahat: berilgan harflar kataklari to'q sariq ramka bilan belgilanadi
      highlight(set) {
        for (const [l, c] of Object.entries(cells)) c.classList.toggle("hl", set.has(l));
      },
    };
  }

  // ---------- O'qish: xabar guruhlari va kataklar ----------
  // Harf navbatdagi katakka tushadi; to'lgan katakni bosish — uni navbatdagi qiladi (almashtirish uchun).
  function messageSlots(host, word) {
    const codes = morse.encodeWord(word);
    const letters = codes.map(() => "");
    const groups = [];
    const slots = [];
    let current = 0;
    const wrap = ui.h("div", { class: "message" });
    codes.forEach((code, k) => {
      const codeNode = codeEl(code, true);
      const slot = ui.h("button", {
        class: "rslot",
        type: "button",
        "aria-label": `${k + 1}-harf`,
        onClick: () => { current = k; render(); },
      });
      groups.push(codeNode);
      slots.push(slot);
      wrap.append(ui.h("div", { class: "group" }, codeNode, slot));
    });
    host.append(wrap);

    function render() {
      slots.forEach((s, k) => {
        s.textContent = letters[k];
        s.classList.toggle("current", k === current);
      });
    }
    render();

    return {
      codes,
      groups,
      // Navbatdagi katakka harf qo'yish; navbat keyingi bo'sh katakka o'tadi. Katak tanlanmagan bo'lsa — false
      fill(letter) {
        if (current < 0) return false;
        letters[current] = letter;
        slots[current].classList.remove("wrong");
        const after = letters.findIndex((l, k) => k > current && !l);
        current = after !== -1 ? after : letters.findIndex((l) => !l);
        render();
        return true;
      },
      letters: () => letters.slice(),
      isFull: () => letters.every(Boolean),
      // Xato: noto'g'ri kataklar bo'shatiladi, ↻ bilan belgilanadi va silkinadi
      markWrong(indices) {
        for (const k of indices) {
          letters[k] = "";
          slots[k].classList.add("wrong");
          slots[k].classList.remove("shake");
          void slots[k].offsetWidth; // animatsiyani qaytadan boshlash
          slots[k].classList.add("shake");
        }
        current = indices.length ? indices[0] : -1;
        render();
      },
      // To'g'ri so'zni kataklarda ko'rsatish (2-xato yoki baholanmaydigan xabar)
      showSolution() {
        [...word].forEach((ch, k) => {
          letters[k] = ch;
          slots[k].classList.remove("wrong");
          slots[k].classList.add("solution");
        });
        current = -1;
        render();
      },
      lock() {
        slots.forEach((s) => { s.disabled = true; });
      },
    };
  }

  // ---------- "Tinglash" ----------
  let timers = [];

  function stopPlaying() {
    timers.forEach(clearTimeout);
    timers = [];
    sound.stopBeeps();
    document.querySelectorAll(".code.playing").forEach((el) => el.classList.remove("playing"));
  }

  // Xabarni signal bilan chalish; chalinayotgan harf kodi yonadi.
  // onLight(on) — har bir signal boshida (true) va oxirida (false): mayoq chirog'i uchun.
  // Ovoz o'chiq bo'lsa ham kodlar yonadi.
  function play(codes, groupEls, onLight) {
    stopPlaying();
    const plan = morse.beepPlan(codes);
    sound.beeps(plan);
    let t = 0;
    plan.forEach((b) => {
      const el = groupEls[b.group];
      timers.push(setTimeout(() => {
        el.classList.add("playing");
        if (onLight) onLight(true);
      }, t));
      timers.push(setTimeout(() => { if (onLight) onLight(false); }, t + b.on));
      t += b.on + b.off;
      timers.push(setTimeout(() => el.classList.remove("playing"), t));
    });
    ui.onCleanup(stopPlaying); // bosh ekranga qaytganda to'xtaydi
  }

  // ---------- Yozish: terilganini ko'rsatish + Morze klaviaturasi ----------
  // host — terilgan guruhlar ko'rinadigan joy; klaviatura boshqaruv zonasiga qo'yiladi.
  // onSend(symbols) — "Yuborish" bosilganda (hech narsa terilmagan bo'lsa chaqirilmaydi).
  function morseInput(host, onSend) {
    let symbols = "";
    let marks = { wrong: [], read: "" };
    const view = ui.h("div", { class: "typed", "aria-live": "polite" });
    host.append(view);

    function render() {
      view.innerHTML = "";
      morse.parseTyped(symbols).forEach((g, k) => {
        view.append(ui.h("div", { class: "typed-group" + (marks.wrong.includes(k) ? " wrong" : "") },
          codeEl(g, true),
          ui.h("div", { class: "typed-letter", text: marks.read[k] || "" })));
      });
    }

    function change(next) {
      symbols = next;
      marks = { wrong: [], read: "" }; // tahrir qilinsa belgilar olib tashlanadi
      render();
    }

    const keys = ui.h("div", { class: "mkeys" });
    const key = (label, aria, cls, fn) => keys.append(ui.h("button", {
      class: "key " + cls,
      type: "button",
      text: label,
      "aria-label": aria,
      onClick: () => { sound.play("tap"); fn(); },
    }));
    key("·", "Nuqta", "dot-key", () => change(morse.addSymbol(symbols, ".")));
    key("—", "Chiziq", "dash-key", () => change(morse.addSymbol(symbols, "-")));
    key("harf oraligʻi", "Harf oraligʻi", "gap", () => change(morse.addSymbol(symbols, " ")));
    key("⌫", "Oʻchirish", "del", () => change(morse.removeSymbol(symbols)));
    key("Yuborish", "Yuborish", "send", () => {
      if (morse.parseTyped(symbols).length) onSend(symbols);
    });
    ui.clearControl();
    ui.control().append(keys);
    render();

    return {
      // Yuborilgandan keyin: noto'g'ri guruhlar va Shogird o'qigan harflar
      mark(wrong, read) {
        marks = { wrong, read };
        render();
      },
      symbols: () => symbols,
    };
  }

  QK.morseUi = { codeEl, wordCodes, guide, clearGuide, messageSlots, play, stopPlaying, morseInput };
})(window);
```

- [ ] **6-qadam: `js/main.js`**

```js
// 2-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Qabila Morzesi",
  storageKey: "qabila-morzesi:v1",
  stageTitles: ["Oʻqish", "Yozish", "Hikoya"],
});
```

- [ ] **7-qadam: tekshirish va commit**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/02-qabila-morzesi
for f in js/*.js; do node --check "$f" || echo "FAIL $f"; done
node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
cd /Users/bicoder/Documents/Information
git add oyinlar/02-qabila-morzesi/index.html oyinlar/02-qabila-morzesi/css oyinlar/02-qabila-morzesi/js oyinlar/02-qabila-morzesi/tests
git commit -m "02-qabila-morzesi: sahifa, uslublar, hikoya rasmlari va Morze ekran qismlari" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
Kutilgan natija: `FAIL` yo'q; `pass 20`, `fail 0`.

---

### 4-vazifa: O'qish/yozish sikllari, kirish va 1-bosqich

**Fayllar:**
- Yaratish: `02-qabila-morzesi/js/scenes/common.js`, `js/scenes/stage1.js`

**Interfeyslar:**
- Oldingi vazifalardan: `QK.morse` (2), `QK.morseUi`, `QK.art.drum` (3), `QK.ui`, `QK.sound` (1).
- Keyingilarga beradi: `QK.common` — "Nomlar va interfeyslar" dagi ro'yxat; `QK.scenes.intro()`, `QK.scenes.stage1()`.

- [ ] **1-qadam: `js/scenes/common.js`**

```js
// O'qish va yozish: bitta xabar/topshiriq va 3 ta to'g'ri javob sikllari (QOIDALAR 4.4, 4.5).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, sound, morseUi } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  // Bitta xabarni o'qish. Natija: true — bola o'zi to'g'ri o'qidi.
  // mode: "demo"   — xato bo'lsa qayta urinadi (ko'rsatish qismi, DIZAYN 5.1);
  //       "graded" — 1-xato: noto'g'ri kataklar belgilanadi, 2-xato: yechim ko'rsatiladi (5.3);
  //       "free"   — baholanmaydi, 1-xatodayoq yechim ko'rsatiladi (XAYR, 6.2).
  // fresh — qo'llanmada miltillaydigan yangi harflar.
  function readMessage(word, letters, mode, fresh) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    QK.current = { answer: word }; // tekshirish uchun
    const box = ui.h("div", { class: "read-box" });
    ui.work().append(box);
    const slots = morseUi.messageSlots(box, word);
    const check = ui.button("Tekshir", () => submit());
    const listen = ui.button("Tinglash", () => morseUi.play(slots.codes, slots.groups), "secondary");
    ui.control().append(ui.h("div", { class: "msg-tools" }, listen, check));
    const update = () => { check.disabled = !slots.isFull(); };
    morseUi.guide(letters, { fresh, onPick: (l) => { if (slots.fill(l)) update(); } });
    update();

    let wrongCount = 0;
    let finish = null;
    const done = ui.settle((resolve) => { finish = resolve; });

    function end(ok) {
      slots.lock();
      ui.clearControl();
      morseUi.stopPlaying();
      finish(ok);
    }

    function submit() {
      if (!slots.isFull()) return;
      const wrong = morse.checkRead(word, slots.letters());
      if (!wrong.length) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        end(true);
        return;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      wrongCount++;
      if (mode === "demo" || (mode === "graded" && wrongCount === 1)) {
        slots.markWrong(wrong);
        update();
        ui.bubble("elder", mode === "demo" ? "Kodni diqqat bilan solishtir." : "↻ Belgilangan harflarni qaytadan top.");
        return;
      }
      slots.showSolution();
      end(false);
    }

    return done;
  }

  // Bitta so'zni Morze bilan yozish. Natija: true — bola o'zi to'g'ri yozdi.
  // 1-xato: noto'g'ri guruhlar ↻, qo'llanmada kerakli harflar yonadi, terilgani o'chmaydi;
  // 2-xato: to'g'ri kod ko'rsatiladi (DIZAYN 6.2).
  function writeWord(target, letters) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    QK.current = { answer: target, code: morse.encodeWord(target).join(" ") }; // tekshirish uchun
    const box = ui.h("div", { class: "write-box" });
    ui.work().append(box);
    const g = morseUi.guide(letters);
    let wrongCount = 0;
    return ui.settle((finish) => {
      const input = morseUi.morseInput(box, (symbols) => {
        const res = morse.checkTyped(target, symbols);
        input.mark(res.wrong, res.read);
        if (res.ok) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          ui.clearControl();
          finish(true);
          return;
        }
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        wrongCount++;
        if (wrongCount === 1) {
          g.highlight(new Set(target));
          const fix = res.groups.length < target.length ? "Harf yetmayapti — qoʻsh." : "↻ Belgilanganlarini tuzat.";
          ui.bubble("apprentice", `Men oʻqidim: ${res.read}, kerak edi: ${target}. ${fix}`);
          return;
        }
        ui.clearControl();
        box.append(morseUi.wordCodes(target).el);
        finish(false);
      });
    });
  }

  // 1-bosqich mashqi: 3 ta to'g'ri o'qilgan xabar (DIZAYN 5.3). 2-to'g'ri javobdan keyin 2-to'plam ochiladi.
  async function readExercises() {
    let correct = 0;
    let prev = null;
    let shownLevel = 1;
    ui.setProgress(3, 0);
    while (correct < 3) {
      const level = morse.readLevel(correct);
      let fresh = null;
      if (level > shownLevel) {
        shownLevel = level;
        fresh = morse.SETS[level - 1];
        await ui.say("elder", `Qabila yangi harflarni oʻrgandi: ${fresh.join(", ")}!`);
      }
      const word = morse.pickMessage(correct, prev);
      prev = word;
      ui.bubble("apprentice", "Qabila xabar yubordi. Oʻqib ber!");
      const ok = await readMessage(word, morse.lettersUpTo(level), "graded", fresh);
      if (ok) {
        correct++;
        ui.setProgress(3, correct);
        await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} Bu — ${word}.`);
      } else {
        await ui.say("elder", `Toʻgʻri javob: ${word}. Endi yangi xabar.`);
      }
    }
    ui.hideProgress();
  }

  // 2-bosqich mashqi: 3 ta to'g'ri yozilgan javob (DIZAYN 6.2)
  async function writeExercises() {
    let correct = 0;
    let prev = null;
    const letters = morse.lettersUpTo(3);
    ui.setProgress(3, 0);
    while (correct < 3) {
      const task = morse.pickTask(prev);
      prev = task;
      ui.bubble("elder", `Qabila soʻraydi: «${task.q}» Javob ber: ${task.a}.`);
      const ok = await writeWord(task.a, letters);
      if (ok) {
        correct++;
        ui.setProgress(3, correct);
        await ui.say("apprentice", `Men oʻqidim: ${task.a}! ${PRAISE[(correct - 1) % PRAISE.length]}`);
      } else {
        await ui.say("elder", "Toʻgʻri kod ekranda. Endi yangi topshiriq.");
      }
    }
    ui.hideProgress();
  }

  QK.common = { PRAISE, readMessage, writeWord, readExercises, writeExercises };
})(window);
```

- [ ] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: Morze xabarini o'qish (DIZAYN 3, 5-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, sound, art, morseUi, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "drum-box", html: art.drum() }));
    await ui.say("elder", "Esingdami, Shogird barabanda tak-dum chalgan edi?");
    await ui.say("elder", "Endi biz qisqa va uzun zarblar bilan gaplashamiz. Bu — Morze alifbosi.");
    await ui.say("apprentice", "Men xabar chalaman, sen oʻqiysan!");
  }

  // 5.1: bitta harf — Shogird barabanda chaladi, bola qo'llanmadan topadi
  async function demoLetter(letter, drumSound, text) {
    ui.pose("apprentice", "drum", 300);
    sound.play(drumSound);
    ui.bubble("elder", text);
    await common.readMessage(letter, morse.lettersUpTo(1), "demo");
  }

  // 5.2: ta'rif — namunalar ish maydonida, Oqsoqol tushuntiradi
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    morseUi.clearGuide();
    await ui.say("elder", "Har bir harfning oʻz kodi bor. Kod nuqta va chiziqlardan tuzilgan.");
    ui.work().append(morseUi.wordCodes("SALOM").el);
    await ui.say("elder", "Kodlar har xil uzunlikda. Shuning uchun harflar orasida pauza qoʻyamiz — 1-oʻyinda buni koʻrgan edik!");
    ui.clearWork();
    ui.work().append(morseUi.wordCodes("ET").el);
    await ui.say("elder", "E va T ning kodi eng qisqa. Nega? Buni hikoyada bilib olasan.");
    ui.clearWork();
    ui.work().append(morseUi.wordCodes("SALOM OTA").el);
    await ui.say("elder", "Soʻzlar orasida esa uzunroq pauza boʻladi. Biz uni / bilan belgilaymiz.");
  }

  async function stage1() {
    ui.paper("");
    await demoLetter("E", "tak", "Tingla: qisqa zarb! Qoʻllanmadan shu kodni top va harfini bos.");
    await ui.say("elder", "Toʻgʻri! Qisqa zarb — E harfi.");
    await demoLetter("T", "dum", "Endi uzun zarb! Qoʻllanmadan shu kodni top.");
    await ui.say("elder", "Barakalla! Uzun zarb — T harfi.");
    await explain();
    await ui.say("elder", "Endi qabila senga xabar yuboradi. 3 ta xabarni oʻqi!");
    await common.readExercises();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [ ] **3-qadam: tekshirish va commit**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/02-qabila-morzesi
node --check js/scenes/common.js && node --check js/scenes/stage1.js && echo OK
node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
cd /Users/bicoder/Documents/Information
git add oyinlar/02-qabila-morzesi/js/scenes/common.js oyinlar/02-qabila-morzesi/js/scenes/stage1.js
git commit -m "02-qabila-morzesi: o'qish/yozish sikllari, kirish va 1-bosqich" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
Kutilgan natija: `OK`; `pass 20`, `fail 0`.

---

### 5-vazifa: 2-bosqich — yozish va XAYR

**Fayllar:**
- Yaratish: `02-qabila-morzesi/js/scenes/stage2.js`

**Interfeyslar:**
- Oldingi vazifalardan: `QK.common.writeWord`, `writeExercises`, `readMessage` (4); `QK.morseUi.guide` (3); `QK.morse.lettersUpTo`, `SETS`, `LAST_WORD` (2).
- Keyingilarga beradi: `QK.scenes.stage2()`.

- [ ] **1-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: Morze bilan javob yozish va XAYR (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, morseUi, common } = QK;

  async function stage2() {
    const letters = morse.lettersUpTo(3);
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    await ui.say("elder", "Endi sen javob yozasan. Qabila yana yangi harflarni oʻrgandi!");
    morseUi.guide(letters, { fresh: morse.SETS[2] });
    await ui.say("elder", "Yozish uchun tugmalar: nuqta, chiziq, harf oraligʻi, oʻchirish va yuborish.");

    // 6.1: birgalikda misol — E
    ui.bubble("elder", "Sinab koʻr: E ni yoz va yubor.");
    const ok = await common.writeWord("E", letters);
    await ui.say("apprentice", ok ? "Men oʻqidim: E!" : "E — bitta nuqta. Endi bilasan!");

    await ui.say("elder", "Endi qabila savol beradi. 3 ta toʻgʻri javob yoz!");
    await common.writeExercises();

    // Yakun: qabila xayrlashadi (baholanmaydi)
    ui.bubble("apprentice", "Qabila xayrlashyapti. Oʻqib ber!");
    const read = await common.readMessage(morse.LAST_WORD, letters, "free");
    await ui.say("elder", read ? "Toʻgʻri: XAYR! Qabila senga rahmat aytadi." : "Bu — XAYR. Qabila senga rahmat aytadi.");
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [ ] **2-qadam: tekshirish va commit**

```bash
cd /Users/bicoder/Documents/Information
node --check oyinlar/02-qabila-morzesi/js/scenes/stage2.js && echo OK
git add oyinlar/02-qabila-morzesi/js/scenes/stage2.js
git commit -m "02-qabila-morzesi: 2-bosqich — yozish va XAYR" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 6-vazifa: 3-bosqich (hikoya va SOS), tabrik va yakuniy tekshiruv

**Fayllar:**
- Yaratish: `02-qabila-morzesi/js/scenes/stage3.js`, `js/scenes/final.js`
- O'zgartirish: `02-qabila-morzesi/DIZAYN.md` (holati)

**Interfeyslar:**
- Oldingi vazifalardan: `QK.art.story` (3), `QK.morseUi.wordCodes`, `play`, `stopPlaying`, `clearGuide`, `codeEl` (3), `QK.common.writeWord` (4), `QK.ui.choice` (1).
- Keyingilarga beradi: `QK.scenes.stage3()`, `QK.scenes.stageDone(s, goingOn)`, `QK.scenes.congrats() → "replay" | "home"` (`QK.app` shularni chaqiradi; `finale` yo'q — qobiq uni o'tkazib yuboradi).

- [ ] **1-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: Morze qayerlarda ishlatiladi — hikoya va SOS (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, art, morseUi, common } = QK;

  // art — rasm nomi (QK.art.story) yoki null; lines — Oqsoqol gaplari (har biri alohida pufak);
  // extra — rasm ostida: "codes" (E, T, Q kodlari), "sos" (SOS + Tinglash), "lamp" (SOS mayoq chirog'i bilan)
  const SCENES = [
    { art: "telegraph", lines: ["Taxminan 180 yil oldin Samuel Morze telegraf uchun shu alifboni oʻylab topdi.", "Xabar sim orqali boshqa shaharga bir zumda yetib borardi."] },
    { art: null, extra: "codes", lines: ["Eng koʻp ishlatiladigan harfga eng qisqa kod berildi. Ingliz tilida bu — E.", "Shunda xabar tezroq yuboriladi. Buni siqish deyishadi."] },
    { art: "ship", extra: "sos", lines: ["Kema xavfda qolsa, SOS signalini yuboradi.", "SOS — uch nuqta, uch chiziq, uch nuqta. Uni hamma taniydi."] },
    { art: "lighthouse", extra: "lamp", lines: ["Kemalar Morzeni chiroq bilan ham yuboradi: qisqa va uzun yorugʻlik."] },
    { art: "radio", lines: ["Bugun ham radio havaskorlari Morzeda gaplashadi.", "Samolyotlarga yoʻl koʻrsatadigan radiomayoqlar oʻz nomini Morze bilan aytadi."] },
    { art: "eye", lines: ["Gapira olmaydigan odamlar koʻz qisib yoki barmoq bilan urib Morzeda gaplasha oladi."] },
  ];

  // Rasm ostidagi qo'shimcha element
  function extraEl(kind, box) {
    if (kind === "codes") return morseUi.wordCodes("ETQ").el;
    const sos = morseUi.wordCodes("SOS");
    const codes = morse.encodeWord("SOS");
    const onLight = kind === "lamp"
      ? (on) => {
        const lamp = box.querySelector(".lamp");
        if (lamp) lamp.classList.toggle("on", on);
      }
      : null;
    const listen = ui.button("Tinglash", () => morseUi.play(codes, sos.groups, onLight), "secondary");
    return ui.h("div", { class: "story" }, sos.el, listen);
  }

  async function showScene(sc) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    morseUi.clearGuide();
    morseUi.stopPlaying();
    const box = ui.h("div", { class: "story" });
    if (sc.art) box.append(ui.h("div", { class: "story-art", html: art.story(sc.art) }));
    ui.work().append(box);
    if (sc.extra) box.append(extraEl(sc.extra, box));
    for (const line of sc.lines) await ui.say("elder", line);
  }

  async function stage3() {
    ui.paper("");
    await ui.say("elder", "Endi senga Morze haqida hikoya aytib beraman.");
    for (const sc of SCENES) await showScene(sc);
    morseUi.stopPlaying();
    ui.bubble("elder", "Endi sen ham SOS ni yoza olasan. Ter!");
    const ok = await common.writeWord("SOS", morse.lettersUpTo(3));
    await ui.say("apprentice", ok ? "Men oʻqidim: SOS! Yordamga shoshilamiz!" : "Mana SOS kodi. Uni eslab qol!");
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
```

- [ ] **2-qadam: `js/scenes/final.js`**

```js
// Bosqich tugashi va tabrik ekrani (DIZAYN 7-bo'lim, yakun). 2-o'yinda finale yo'q.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, morseUi } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    morseUi.clearGuide();
    morseUi.stopPlaying();
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
    morseUi.clearGuide();
    morseUi.stopPlaying();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi sen Morzeda gaplasha olasan!");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { class: "summary-row" },
        morseUi.codeEl(".", true), ui.h("span", { text: "va" }), morseUi.codeEl("-", true),
        ui.h("span", { text: "— Morze alifbosi" })),
      ui.h("div", { class: "summary-row", text: "Eng koʻp ishlatiladigan harf — eng qisqa kod" }),
      ui.h("div", { class: "summary-row", text: "SOS — yordam signali" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
```

- [ ] **3-qadam: yakuniy tekshiruv (brauzersiz)**

1) Fayl yo'llari, sintaksis, uchala testlar to'plami:

```bash
cd /Users/bicoder/Documents/Information/oyinlar
for g in 01-qabila-kodlari 02-qabila-morzesi; do (cd $g && python3 - <<'PY'
import re, pathlib
html = pathlib.Path("index.html").read_text()
refs = [r for r in re.findall(r'(?:src|href)="([^"]+)"', html) if not r.startswith("data:")]
missing = [r for r in refs if not pathlib.Path(r).exists()]
print(pathlib.Path.cwd().name, len(refs), "ta yo'l; yo'q:", missing)
assert not missing
PY
); done
for f in umumiy/js/*.js 01-qabila-kodlari/js/*.js 01-qabila-kodlari/js/scenes/*.js 02-qabila-morzesi/js/*.js 02-qabila-morzesi/js/scenes/*.js; do node --check "$f" || echo "FAIL $f"; done
for g in umumiy 01-qabila-kodlari 02-qabila-morzesi; do (cd $g && echo "$g:" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"); done
```
Kutilgan natija: `01-qabila-kodlari 15 ta yo'l; yo'q: []`, `02-qabila-morzesi 16 ta yo'l; yo'q: []`; `FAIL` yo'q; umumiy `pass 10`, 1-o'yin `pass 23`, 2-o'yin `pass 20`, hammasida `fail 0`.

2) 2-o'yin fayllari bir-birining faqat mavjud funksiyalarini chaqirishini tekshirish:

```bash
cd /Users/bicoder/Documents/Information/oyinlar && python3 - <<'PY'
import re, pathlib
read = lambda p: pathlib.Path(p).read_text()
def block(text, pattern):
    return set(re.findall(r"\w+", re.search(pattern, text, re.S).group(1)))
ex = {
    "ui": block(read("umumiy/js/ui.js"), r"QK\.ui = \{(.*?)\};"),
    "sound": block(read("umumiy/js/sound.js"), r"root\.QK\.sound = \{(.*?)\};"),
    "morse": block(read("02-qabila-morzesi/js/morse.js"), r"const api = \{(.*?)\};"),
    "morseUi": block(read("02-qabila-morzesi/js/morse-ui.js"), r"QK\.morseUi = \{(.*?)\};"),
    "common": block(read("02-qabila-morzesi/js/scenes/common.js"), r"QK\.common = \{(.*?)\};"),
    "art": block(read("umumiy/js/art.js"), r"root\.QK\.art = \{(.*?)\};") | block(read("02-qabila-morzesi/js/game-art.js"), r"Object\.assign\(root\.QK\.art, \{(.*?)\}\)"),
}
scenes = set()
files = list(pathlib.Path("02-qabila-morzesi/js").rglob("*.js"))
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
Kutilgan natija: `yetishmaydi: set()` va `Barcha chaqiruvlar eksportlarga mos`.

- [ ] **4-qadam: dizayn holati va commit**

`02-qabila-morzesi/DIZAYN.md` 6-qatorida `**Holati:** tasdiqlangan (2026-09-19)` → `**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda`.

```bash
cd /Users/bicoder/Documents/Information
git add oyinlar/02-qabila-morzesi/js/scenes/stage3.js oyinlar/02-qabila-morzesi/js/scenes/final.js oyinlar/02-qabila-morzesi/DIZAYN.md
git commit -m "02-qabila-morzesi: hikoya, SOS va tabrik" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git status --short
```
Kutilgan natija: ishchi papka toza.

---

## Tugagandan keyin

- 2-o'yinni ochish: `oyinlar/02-qabila-morzesi/index.html` ni ikki marta bosish. 1-o'yin ham avvalgidek ochiladi.
- Muallif ikkala o'yinni telefon va kompyuterda ko'rib chiqadi (QOIDALAR 10-bo'lim).
