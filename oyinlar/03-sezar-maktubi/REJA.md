# 03 — Sezar maktubi: ish rejasi

> **Agentlar uchun:** `superpowers:executing-plans` yoki `superpowers:subagent-driven-development`. Qadamlar `- [ ]` bilan.

**Maqsad:** 3-o'yin "Sezar maktubi": Sezar xatini ochish, javobni shifrlash, kalitsiz ochish va hikoya. Qo'llanma zonasi (4-zona) umumiy papkaga chiqariladi.

**Arxitektura:** 1–2-o'yindagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/` (`ui`, `sound`, `art`, `storage`, `app`). O'yinning sof hisobi `js/caesar.js` da (Node testlari), ekran qismlari `js/caesar-ui.js` da, rasmlar `js/game-art.js` da, sahnalar `js/scenes/`.

**Texnologiya:** HTML, CSS, JavaScript, SVG. Testlar: Node `node:test`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

## Umumiy cheklovlar

- Kutubxona, yig'ish yo'q; oddiy `<script src>`; `index.html` ikki marta bosib ochiladi; internet kerak emas.
- Ekrandagi matn o'zbek lotin; `oʻ`, `gʻ` da **ʻ (U+02BB)**, tutuq belgisi **ʼ (U+02BC)**; bolaga "sen"; pufakda ≤ 2 qisqa gap.
- Kod nomlari inglizcha, izohlar o'zbekcha. Bosiladigan element ≥ 48×48 px; matn ≥ 18 px; 360 px; gorizontal scroll yo'q; xato uchun qizil yo'q, ✓/↻ belgilari.
- Xato: 1-xato maslahat, 2-xato yechim (+ mashqda yangi so'z, xato qilingani hisoblanmaydi).
- Brauzer tekshiruvlari oraliqda yo'q: `node --check` + `node --test`.
- Commit: `-m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"`. Branch: `oyin/03-sezar-maktubi`.

Testlar (repo ildizidan):
```bash
for g in umumiy 01-qabila-kodlari 02-qabila-morzesi 03-sezar-maktubi; do (cd oyinlar/$g && echo "$g:" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"); done
```

## Nomlar va interfeyslar

- `QK.ui.openGuide() → HTMLElement | null` — `#zone-guide` ni tozalaydi, `#play` ga `has-guide` qo'yadi, `onCleanup(closeGuide)`; `QK.ui.closeGuide()`.
- `QK.caesar` (Node'da `require`): `ALPHABET` (29), `FIRST_KEY` (3), `LETTERS`, `PRACTICE`, `FIRST_REPLY`, `REPLIES`, `CRACK`, `tokenize(word) → string[]`, `wrapKey(k)`, `shift(letter, k)`, `encrypt(tokens, key)`, `decrypt(tokens, key)`, `checkLetters(expected, given) → number[]`, `pickLetter(rng?)`, `makeExercise(list, prev, rng?) → { word, key }` (kalit 1–6, 3 emas), `makeCrack(prev, rng?) → { word, key }` (kalit 4–9).
- `QK.art.wheel(alphabet, key, highlight?)`, `QK.art.story(name)` (`caesar | scroll | key | keys | book | phone`).
- `QK.caesarUi`: `tile(letter, cls?)`, `tilesRow(tokens, cls?)`, `wordSlots(host, shown)`, `table(key, onPick?) → { getKey, setKey, setPick }`, `keyState(key) → { getKey, setKey }`, `keyControl(host, holder, onChange?)`.
- `QK.common`: `PRAISE`, `solveWord({ plain, key, mode, tbl, opened? }) → Promise<bool>` (`mode`: `"decode" | "encode"`), `exercises({ count, total, doneBefore, mode, tbl, next, question, praise })`.
- `QK.scenes`: `intro`, `stage1`, `stage2`, `stage3`, `stageDone(s, goingOn)`, `congrats`.

---

### 1-vazifa: Qo'llanma zonasi umumiy papkaga

**Fayllar:** o'zgartirish — `umumiy/js/ui.js`, `umumiy/css/asos.css`, `02-qabila-morzesi/js/morse-ui.js`, `02-qabila-morzesi/css/style.css`.

- [ ] **1-qadam: branch**

```bash
cd /Users/bicoder/Documents/Information && git status --short && git checkout -b oyin/03-sezar-maktubi
```

- [ ] **2-qadam: `ui.openGuide` / `ui.closeGuide` va 2-o'yin ularga ulanadi; qo'llanma zonasi uslublari `asos.css` ga**

```bash
cd /Users/bicoder/Documents/Information/oyinlar && python3 - <<'PY'
import pathlib
def edit(path, pairs):
    p = pathlib.Path(path); s = p.read_text()
    for a, b in pairs:
        assert s.count(a) == 1, (path, a[:60])
        s = s.replace(a, b)
    p.write_text(s)

guide_fns = '''  // ---------- Qo'llanma zonasi (4-zona: 2- va 3-o'yin) ----------
  // Zonani tozalab ochadi; bosh ekranga qaytganda (newRun) o'zi yopiladi. Zona yo'q sahifada — null.
  function openGuide() {
    const zone = $("zone-guide");
    if (!zone) return null;
    zone.innerHTML = "";
    $("play").classList.add("has-guide");
    onCleanup(closeGuide);
    return zone;
  }

  function closeGuide() {
    const zone = $("zone-guide");
    if (zone) zone.innerHTML = "";
    $("play").classList.remove("has-guide");
  }

  QK.ui = {'''
edit("umumiy/js/ui.js", [
    ("  QK.ui = {", guide_fns),
    ("    buildWords, askNumber, counter, choice, setProgress, hideProgress,\n",
     "    buildWords, askNumber, counter, choice, setProgress, hideProgress,\n    openGuide, closeGuide,\n"),
])
edit("02-qabila-morzesi/js/morse-ui.js", [
    ('  function clearGuide() {\n    $("zone-guide").innerHTML = "";\n    $("play").classList.remove("has-guide");\n  }',
     "  const clearGuide = () => ui.closeGuide();"),
    ('    const zone = $("zone-guide");\n    zone.innerHTML = "";\n    $("play").classList.add("has-guide");\n    ui.onCleanup(clearGuide); // bosh ekranga qaytganda qo\'llanma yo\'qoladi\n',
     "    const zone = ui.openGuide(); // bosh ekranga qaytganda o'zi yopiladi\n"),
])

css02 = pathlib.Path("02-qabila-morzesi/css/style.css"); s = css02.read_text()
i = s.index("/* ---------- Qo'llanma zonasi")
j = s.index("/* ---------- Nuqta va chiziq")
block = s[i:j]
assert block.count("morse-ui.js qo'yadi/oladi") == 1
block = block.replace("morse-ui.js qo'yadi/oladi", "ui.openGuide()/closeGuide() qo'yadi/oladi")
css02.write_text(s[:i] + s[j:])
asos = pathlib.Path("umumiy/css/asos.css"); t = asos.read_text()
k = t.index("@media (prefers-reduced-motion")
asos.write_text(t[:k] + block + t[k:])
print("ok")
PY
```
Kutilgan natija: `ok`.

- [ ] **3-qadam: CSS qoidalari yo'qolmaganini tekshirish, sintaksis va testlar**

```bash
cd /Users/bicoder/Documents/Information && python3 - <<'PY'
import subprocess, pathlib
rules = lambda t: {l.strip() for l in t.split("\n") if l.strip() and not l.strip().startswith("/*")}
old = lambda p: subprocess.run(["git", "show", "HEAD:" + p], capture_output=True, text=True, check=True).stdout
before = rules(old("oyinlar/umumiy/css/asos.css")) | rules(old("oyinlar/02-qabila-morzesi/css/style.css"))
after = rules(pathlib.Path("oyinlar/umumiy/css/asos.css").read_text()) | rules(pathlib.Path("oyinlar/02-qabila-morzesi/css/style.css").read_text())
print("missing:", before - after, "extra:", after - before)
assert before == after
PY
node --check oyinlar/umumiy/js/ui.js && node --check oyinlar/02-qabila-morzesi/js/morse-ui.js && echo OK
grep -c "zone-guide" oyinlar/02-qabila-morzesi/js/morse-ui.js
for g in umumiy 01-qabila-kodlari 02-qabila-morzesi; do (cd oyinlar/$g && echo "$g:" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"); done
```
Kutilgan natija: `missing: set() extra: set()`, `OK`, `0`, hamma testlar `fail 0`.

- [ ] **4-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information && git add -A oyinlar/umumiy oyinlar/02-qabila-morzesi
git commit -m "Umumiy: qo'llanma zonasi (openGuide/closeGuide va uslublar), 2-o'yin unga ulandi" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 2-vazifa: Shifr hisobi (`caesar.js`)

**Fayllar:** yaratish — `03-sezar-maktubi/js/caesar.js`, `03-sezar-maktubi/tests/caesar.test.js`.

- [ ] **1-qadam: muvaffaqiyatsiz testlar — `tests/caesar.test.js`**

```js
// caesar.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/caesar.js");

const allWords = () => [...C.LETTERS.flatMap((s) => s.split(" ")), ...C.PRACTICE, C.FIRST_REPLY, ...C.REPLIES, ...C.CRACK];

test("alifbo: 29 ta harf, rasmiy tartibda, takrorsiz", () => {
  assert.equal(C.ALPHABET.join(" "), "A B D E F G H I J K L M N O P Q R S T U V X Y Z Oʻ Gʻ Sh Ch Ng");
  assert.equal(new Set(C.ALPHABET).size, 29);
});

test("tokenize: Oʻ, Gʻ, Sh, Ch, Ng — bitta harf", () => {
  assert.deepEqual(C.tokenize("SHAMOL"), ["Sh", "A", "M", "O", "L"]);
  assert.deepEqual(C.tokenize("OʻQ"), ["Oʻ", "Q"]);
  assert.deepEqual(C.tokenize("TONGDA"), ["T", "O", "Ng", "D", "A"]);
  assert.deepEqual(C.tokenize("CHOY"), ["Ch", "O", "Y"]);
  assert.deepEqual(C.tokenize("GʻOZ"), ["Gʻ", "O", "Z"]);
});

test("ro'yxatlardagi har bir so'z faqat alifbo harflaridan va qayta yig'ilganda o'zi", () => {
  for (const w of allWords()) {
    const t = C.tokenize(w);
    for (const ch of t) assert.ok(C.ALPHABET.includes(ch), `${w}: ${ch}`);
    assert.equal(t.join("").toUpperCase(), w);
  }
});

test("shift: aylana — Ng dan keyin A, A dan orqaga Ng", () => {
  assert.equal(C.shift("A", 3), "E");
  assert.equal(C.shift("Z", 1), "Oʻ");
  assert.equal(C.shift("Ng", 1), "A");
  assert.equal(C.shift("Ng", 3), "D");
  assert.equal(C.shift("A", -1), "Ng");
  assert.equal(C.shift("E", -3), "A");
  assert.equal(C.wrapKey(29), 0);
  assert.equal(C.wrapKey(-1), 28);
});

test("encrypt: XOʻP kalit 3 bilan", () => {
  assert.deepEqual(C.encrypt(C.tokenize("XOʻP"), 3), ["Oʻ", "Ch", "S"]);
});

test("encrypt va decrypt bir-birining teskarisi (hamma so'z, hamma kalit)", () => {
  for (const w of allWords()) {
    const t = C.tokenize(w);
    for (let k = 0; k < 29; k++) assert.deepEqual(C.decrypt(C.encrypt(t, k), k), t, `${w} ${k}`);
  }
});

test("checkLetters: noto'g'ri kataklar", () => {
  assert.deepEqual(C.checkLetters(["A", "Sh"], ["A", "Sh"]), []);
  assert.deepEqual(C.checkLetters(["A", "Sh", "O"], ["A", "S", "Ng"]), [1, 2]);
});

test("ro'yxatlar chegaralari", () => {
  for (const s of C.LETTERS) {
    const words = s.split(" ");
    assert.ok(words.length >= 3 && words.length <= 4, s);
    for (const w of words) assert.ok(C.tokenize(w).length <= 9, w);
  }
  for (const w of C.PRACTICE) assert.ok(C.tokenize(w).length >= 3 && C.tokenize(w).length <= 5, w);
  assert.equal(C.FIRST_REPLY, "XOʻP");
  for (const w of C.REPLIES) assert.ok(C.tokenize(w).length >= 3 && C.tokenize(w).length <= 6, w);
  for (const w of C.CRACK) assert.ok(C.tokenize(w).length >= 4 && C.tokenize(w).length <= 6, w);
  assert.equal(C.FIRST_KEY, 3);
});

test("makeExercise: kalit 1–6 (3 emas), so'z ketma-ket takrorlanmaydi", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const ex = C.makeExercise(C.PRACTICE, prev);
    assert.ok(C.PRACTICE.includes(ex.word));
    assert.ok(ex.key >= 1 && ex.key <= 6 && ex.key !== 3, String(ex.key));
    if (prev) assert.notEqual(ex.word, prev.word);
    prev = ex;
  }
});

test("makeCrack: kalit 4–9, so'z ketma-ket takrorlanmaydi", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const ex = C.makeCrack(prev);
    assert.ok(C.CRACK.includes(ex.word));
    assert.ok(ex.key >= 4 && ex.key <= 9);
    if (prev) assert.notEqual(ex.word, prev.word);
    prev = ex;
  }
});

test("pickLetter va rng", () => {
  const first = () => 0;
  assert.equal(C.pickLetter(first), C.LETTERS[0]);
  for (let k = 0; k < 100; k++) assert.ok(C.LETTERS.includes(C.pickLetter()));
  assert.deepEqual(C.makeExercise(C.PRACTICE, null, first), { word: C.PRACTICE[0], key: 1 });
});
```

Buyruq: `(cd oyinlar/03-sezar-maktubi && node --test tests/*.test.js)` → FAIL: `Cannot find module '../js/caesar.js'`.

- [ ] **2-qadam: `js/caesar.js`**

```js
// Sezar maktubi — sof hisob: o'zbek lotin alifbosi, surish, so'zlar va tekshirish. Node'da test qilinadi.
(function (root) {
  "use strict";

  // O'zbek lotin alifbosi tartibida 29 ta harf. Oʻ, Gʻ, Sh, Ch, Ng — bitta harf (ekranda bitta katak).
  const ALPHABET = [
    "A", "B", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "X", "Y", "Z", "Oʻ", "Gʻ", "Sh", "Ch", "Ng",
  ];
  const N = ALPHABET.length;

  const FIRST_KEY = 3; // Sezar harflarni 3 ga surgan (Svetoniy)

  // Sezar xatlari (1-bosqich), kalit 3
  const LETTERS = [
    "XATNI HECH KIM OʻQIMASIN",
    "ERTAGA TONGDA YOʻLGA CHIQAMIZ",
    "DOʻSTLARIM SIZGA ISHONAMAN",
    "QOʻSHIN DARYO BOʻYIDA KUTSIN",
  ];
  // 1-bosqich mashqi (ochish)
  const PRACTICE = ["KITOB", "QUSH", "CHOY", "TONG", "GʻOZ", "SHAMOL", "BULUT", "OLMA"];
  // 2-bosqich (shifrlash): birinchisi har doim XOʻP, keyin tasodifiy
  const FIRST_REPLY = "XOʻP";
  const REPLIES = ["TAYYOR", "RAHMAT", "SALOM", "KELING"];
  // 3-bosqich (kalitsiz ochish)
  const CRACK = ["SALOM", "DOʻST", "QUYOSH", "YULDUZ"];

  // Katta harflar bilan yozilgan so'zni harflarga ajratish: "SH" → "Sh", "Oʻ" → "Oʻ"
  const DIGRAPHS = { "Oʻ": "Oʻ", "Gʻ": "Gʻ", SH: "Sh", CH: "Ch", NG: "Ng" };

  function tokenize(word) {
    const out = [];
    for (let k = 0; k < word.length; ) {
      const two = word.slice(k, k + 2);
      if (DIGRAPHS[two]) {
        out.push(DIGRAPHS[two]);
        k += 2;
      } else {
        out.push(word[k]);
        k += 1;
      }
    }
    return out;
  }

  const wrapKey = (k) => ((k % N) + N) % N;

  // Harfni k ta oldinga surish (k manfiy — orqaga). Alifbo aylana: Ng dan keyin A.
  const shift = (letter, k) => ALPHABET[wrapKey(ALPHABET.indexOf(letter) + k)];
  const encrypt = (tokens, key) => tokens.map((t) => shift(t, key));
  const decrypt = (tokens, key) => tokens.map((t) => shift(t, -key));

  // Noto'g'ri kataklar indekslari
  function checkLetters(expected, given) {
    const wrong = [];
    expected.forEach((t, k) => {
      if (given[k] !== t) wrong.push(k);
    });
    return wrong;
  }

  const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pickOther = (list, prev, rng) => {
    const pool = list.filter((x) => x !== prev);
    return pool[Math.floor(rng() * pool.length)];
  };

  const pickLetter = (rng) => LETTERS[Math.floor((rng || Math.random)() * LETTERS.length)];

  // Mashq misoli: ro'yxatdan so'z (oldingisidan boshqa), kalit 1–6 (xatdagi 3 dan boshqa)
  function makeExercise(list, prev, rng) {
    rng = rng || Math.random;
    const word = pickOther(list, prev && prev.word, rng);
    let key = randInt(rng, 1, 5);
    if (key >= FIRST_KEY) key += 1; // 1, 2, 4, 5, 6
    return { word, key };
  }

  // Kalitsiz ochish: so'z (oldingisidan boshqa), kalit 4–9
  function makeCrack(prev, rng) {
    rng = rng || Math.random;
    return { word: pickOther(CRACK, prev && prev.word, rng), key: randInt(rng, 4, 9) };
  }

  const api = {
    ALPHABET, FIRST_KEY, LETTERS, PRACTICE, FIRST_REPLY, REPLIES, CRACK,
    tokenize, wrapKey, shift, encrypt, decrypt, checkLetters, pickLetter, makeExercise, makeCrack,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.caesar = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

Buyruq: `(cd oyinlar/03-sezar-maktubi && node --test tests/*.test.js)` → 11 ta test PASS.

- [ ] **3-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information && git add oyinlar/03-sezar-maktubi/js/caesar.js oyinlar/03-sezar-maktubi/tests/caesar.test.js
git commit -m "03-sezar-maktubi: shifr hisobi va testlari" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 3-vazifa: Sahifa, uslublar, rasmlar va ekran qismlari

**Fayllar:** yaratish — `03-sezar-maktubi/index.html`, `css/style.css`, `js/game-art.js`, `js/caesar-ui.js`, `js/main.js`, `tests/game-art.test.js`, `tests/main.test.js`.

- [ ] **1-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Sezar maktubi</title>
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
      <aside class="zone-guide" id="zone-guide" aria-label="Surish jadvali"></aside>
    </main>
  </div>
  <script src="js/caesar.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="js/caesar-ui.js"></script>
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
/* Sezar maktubi — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

/* Surish jadvali 5 qator — tik ekranda qo'llanma zonasiga ko'proq joy */
.zone-guide { max-height: 50vh; max-height: 48dvh; }
@media (orientation: landscape) {
  .zone-guide { max-height: none; }
}

/* ---------- Harf kataklari (Sh, Oʻ ham bitta katak) ---------- */
.ctiles { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.ctile {
  display: inline-grid; place-items: center; min-width: 44px; height: 44px; padding: 0 4px;
  border-radius: 10px; background: #fff; box-shadow: 0 2px 0 var(--soya); font-size: 22px; font-weight: 900;
}
.ctile.shown { background: var(--matn); color: #fff; }
.ctile.guess-tile { color: var(--asosiy); }

/* ---------- So'z: ko'rsatilgan harflar va bola to'ldiradigan kataklar ---------- */
.cbox { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.opened { font-size: 20px; font-weight: 800; text-align: center; color: var(--togri); overflow-wrap: anywhere; }
.opened.big { font-size: 26px; }
.cword { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.ccol { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.cslot {
  min-width: 48px; height: 48px; padding: 0 4px; border: 3px dashed var(--chiziq); border-radius: 10px;
  background: #fff; color: var(--matn); font-size: 22px; font-weight: 900;
}
.cslot.current { border-style: solid; border-color: var(--asosiy); }
.cslot.wrong { border-style: solid; border-color: var(--yana); }
.cslot.wrong.current { border-color: var(--asosiy); }
.cslot.wrong:empty::after { content: "↻"; color: var(--yana); font-size: 20px; }
.cslot.solution { border-style: solid; border-color: var(--togri); color: var(--togri); }

/* ---------- Surish jadvali: tepada oddiy harf, pastda shifri ---------- */
.ctable { display: grid; grid-template-columns: repeat(6, minmax(48px, 1fr)); gap: 4px; }
.ct-cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 48px; padding: 2px; border: none; border-radius: 10px; line-height: 1.1;
  background: #fff; box-shadow: 0 2px 0 var(--soya);
}
.ct-cell:active { transform: translateY(2px); box-shadow: none; }
.ct-top { font-size: 20px; font-weight: 900; color: var(--matn); }
.ct-bottom { font-size: 18px; font-weight: 800; color: var(--asosiy); }
@media (orientation: landscape) {
  .ctable { grid-template-columns: repeat(auto-fill, minmax(52px, 1fr)); }
}

/* ---------- Kalit boshqaruvi ---------- */
.key-ctrl { display: flex; align-items: center; justify-content: center; gap: 10px; }
.key-ctrl .key { width: 52px; }
.key-val { min-width: 150px; text-align: center; font-size: 20px; font-weight: 900; }
.guess { min-height: 44px; }

/* ---------- G'ildirak, hikoya, tabrik ---------- */
.wheel-box { width: min(300px, 80vw); }
.wheel { display: block; width: 100%; height: auto; }
.story { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.story-art { width: min(260px, 70vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }
```

- [ ] **3-qadam: `tests/game-art.test.js` va `tests/main.test.js` — muvaffaqiyatsiz testlar**

`tests/game-art.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const C = require("../js/caesar.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;
const count = (s, re) => (s.match(re) || []).length;

test("g'ildirak: 29 ta tashqi va 29 ta ichki harf, markazda kalit", () => {
  const svg = art.wheel(C.ALPHABET, 3);
  assert.equal(count(svg, /class="w-outer"/g), 29);
  assert.equal(count(svg, /class="w-inner"/g), 29);
  assert.match(svg, />3<\/text>/);
  assert.match(svg, /class="w-inner"[^>]*>E<\/text>/); // A ostida — E
});

test("g'ildirak: kalit 0 da ichki halqa tashqisi bilan bir xil, belgilangan harf yonadi", () => {
  const plain = art.wheel(C.ALPHABET, 0);
  assert.match(plain, /class="w-inner"[^>]*>A<\/text>/);
  assert.ok(!plain.includes("#F08A24"));
  assert.ok(art.wheel(C.ALPHABET, 3, new Set([0])).includes("#F08A24"));
});

test("hikoya rasmlari SVG qaytaradi", () => {
  for (const n of ["caesar", "scroll", "key", "keys", "book", "phone"]) {
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
  assert.equal(captured.storageKey, "sezar-maktubi:v1");
  assert.equal(captured.title, "Sezar maktubi");
  assert.deepEqual(captured.stageTitles, ["Xatni ochish", "Javobni shifrlash", "Kalitsiz ochish va hikoya"]);
});
```

Buyruq: `(cd oyinlar/03-sezar-maktubi && node --test tests/*.test.js)` → FAIL (`game-art.js`, `main.js` yo'q).

- [ ] **4-qadam: `js/game-art.js`**

```js
// 3-o'yinga xos SVG rasmlar: Sezar g'ildiragi va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const BLUE = "#2F6FDE";
  const ORANGE = "#F08A24";
  const GOLD = "#E0B04A";

  // Sezar g'ildiragi: tashqi halqada alifbo, ichkisida kalitga surilgan harflar, markazda kalit.
  // highlight — yonadigan harflar indekslari (Set)
  function wheel(alphabet, key, highlight) {
    const n = alphabet.length;
    const hl = highlight || new Set();
    const c = 150;
    let s = `<svg class="wheel" viewBox="0 0 300 300" role="img" aria-label="Sezar gʻildiragi, kalit ${key}">`;
    s += `<circle cx="${c}" cy="${c}" r="146" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`;
    s += `<circle cx="${c}" cy="${c}" r="110" fill="#F4E3C3" stroke="${INK}" stroke-width="2"/>`;
    s += `<circle cx="${c}" cy="${c}" r="72" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`;
    for (let i = 0; i < n; i++) {
      const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
      const on = hl.has(i);
      const inner = alphabet[(((i + key) % n) + n) % n];
      const ox = (c + 128 * Math.cos(a)).toFixed(1);
      const oy = (c + 128 * Math.sin(a)).toFixed(1);
      const ix = (c + 91 * Math.cos(a)).toFixed(1);
      const iy = (c + 91 * Math.sin(a)).toFixed(1);
      s += `<text class="w-outer" x="${ox}" y="${oy}" text-anchor="middle" dominant-baseline="central" font-size="${on ? 18 : 15}" font-weight="900" fill="${on ? ORANGE : INK}">${alphabet[i]}</text>`;
      s += `<text class="w-inner" x="${ix}" y="${iy}" text-anchor="middle" dominant-baseline="central" font-size="${on ? 17 : 14}" font-weight="800" fill="${on ? ORANGE : BLUE}">${inner}</text>`;
    }
    s += `<text x="${c}" y="${c - 10}" text-anchor="middle" dominant-baseline="central" font-size="40" font-weight="900" fill="${INK}">${key}</text>`;
    s += `<text x="${c}" y="${c + 26}" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="700" fill="${INK}">kalit</text>`;
    return s + "</svg>";
  }

  const STORY = {
    // Yuliy Sezar: dafna gulchambarli bosh
    caesar: `<svg viewBox="0 0 200 140" aria-hidden="true">
  <path d="M60 140 Q60 96 100 92 Q140 96 140 140 Z" fill="#7A4E9A"/>
  <circle cx="100" cy="62" r="30" fill="#E2A77E"/>
  <path d="M70 58 Q72 30 100 30 Q128 30 130 58 Q122 44 100 44 Q78 44 70 58 Z" fill="#6B4A2E"/>
  <g fill="#1A9E77">
    <ellipse cx="72" cy="50" rx="7" ry="4" transform="rotate(-50 72 50)"/>
    <ellipse cx="80" cy="38" rx="7" ry="4" transform="rotate(-30 80 38)"/>
    <ellipse cx="92" cy="31" rx="7" ry="4" transform="rotate(-10 92 31)"/>
    <ellipse cx="108" cy="31" rx="7" ry="4" transform="rotate(10 108 31)"/>
    <ellipse cx="120" cy="38" rx="7" ry="4" transform="rotate(30 120 38)"/>
    <ellipse cx="128" cy="50" rx="7" ry="4" transform="rotate(50 128 50)"/>
  </g>
  <circle cx="90" cy="62" r="3" fill="${INK}"/>
  <circle cx="110" cy="62" r="3" fill="${INK}"/>
  <path d="M92 76 Q100 80 108 76" stroke="#7A3B2E" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`,
    // Muhrli xat (o'rama)
    scroll: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="40" y="24" width="120" height="76" rx="6" fill="#F4E3C3" stroke="#8A5A2B" stroke-width="3"/>
  <rect x="32" y="18" width="12" height="88" rx="6" fill="#C9A26B"/>
  <rect x="156" y="18" width="12" height="88" rx="6" fill="#C9A26B"/>
  <path d="M56 44 H144 M56 58 H144 M56 72 H120" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/>
  <circle cx="132" cy="84" r="12" fill="#C8553D"/>
</svg>`,
    // Kalit
    key: `<svg viewBox="0 0 200 100" aria-hidden="true">
  <circle cx="54" cy="50" r="26" fill="none" stroke="${GOLD}" stroke-width="12"/>
  <rect x="78" y="44" width="92" height="12" rx="4" fill="${GOLD}"/>
  <rect x="140" y="56" width="10" height="18" fill="${GOLD}"/>
  <rect x="158" y="56" width="10" height="24" fill="${GOLD}"/>
</svg>`,
    // Ko'p kalitlar: 1 dan 28 gacha
    keys: `<svg viewBox="0 0 200 110" aria-hidden="true">
  <g fill="none" stroke="${GOLD}" stroke-width="5">
    <circle cx="30" cy="30" r="10"/><circle cx="80" cy="30" r="10"/><circle cx="130" cy="30" r="10"/><circle cx="180" cy="30" r="10"/>
  </g>
  <g fill="${GOLD}">
    <rect x="38" y="27" width="22" height="6"/><rect x="88" y="27" width="22" height="6"/>
    <rect x="138" y="27" width="22" height="6"/><rect x="188" y="27" width="10" height="6"/>
  </g>
  <text x="100" y="88" text-anchor="middle" font-size="30" font-weight="900" fill="${INK}">1 … 28</text>
</svg>`,
    // Al-Kindiy: ochiq kitob va harflar chastotasi ustunchalari
    book: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M20 30 Q60 18 100 30 V104 Q60 92 20 104 Z" fill="#FFFFFF" stroke="#8A5A2B" stroke-width="3"/>
  <path d="M180 30 Q140 18 100 30 V104 Q140 92 180 104 Z" fill="#FFFFFF" stroke="#8A5A2B" stroke-width="3"/>
  <path d="M34 48 H86 M34 62 H86 M34 76 H74" stroke="#C9C2B4" stroke-width="4" stroke-linecap="round"/>
  <rect x="116" y="70" width="10" height="24" fill="${BLUE}"/>
  <rect x="132" y="50" width="10" height="44" fill="${ORANGE}"/>
  <rect x="148" y="80" width="10" height="14" fill="#1A9E77"/>
  <rect x="164" y="62" width="10" height="32" fill="#8E5BD0"/>
</svg>`,
    // Qulfli telefon
    phone: `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="66" y="10" width="68" height="120" rx="12" fill="${INK}"/>
  <rect x="72" y="22" width="56" height="92" rx="4" fill="#DDE7F7"/>
  <path d="M92 64 V54 Q100 42 108 54 V64" stroke="${GOLD}" stroke-width="5" fill="none"/>
  <rect x="86" y="62" width="28" height="24" rx="4" fill="${GOLD}"/>
</svg>`,
  };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { wheel, story });
})(window);
```

- [ ] **5-qadam: `js/caesar-ui.js`**

```js
// Sezar ekran qismlari: harf kataklari, so'z kataklari, surish jadvali, kalit boshqaruvi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, sound } = QK;

  // Bitta harf katagi (Sh, Oʻ ham bitta katak)
  const tile = (letter, cls) => ui.h("span", { class: "ctile" + (cls ? " " + cls : ""), text: letter });

  function tilesRow(tokens, cls) {
    const row = ui.h("div", { class: "ctiles" });
    tokens.forEach((t) => row.append(tile(t, cls)));
    return row;
  }

  // ---------- So'z: tepada ko'rsatilgan harflar, ostida bola to'ldiradigan kataklar ----------
  // Harf navbatdagi katakka tushadi; to'lgan katakni bosish — uni navbatdagi qiladi.
  function wordSlots(host, shown) {
    const letters = shown.map(() => "");
    const slots = [];
    let current = 0;
    let locked = false;
    const wrap = ui.h("div", { class: "cword" });
    shown.forEach((t, k) => {
      const slot = ui.h("button", {
        class: "cslot",
        type: "button",
        "aria-label": `${k + 1}-harf`,
        onClick: () => {
          if (locked) return;
          current = k;
          render();
        },
      });
      slots.push(slot);
      wrap.append(ui.h("div", { class: "ccol" }, tile(t, "shown"), slot));
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
      // Navbatdagi katakka harf; qulflangan yoki katak tanlanmagan bo'lsa — false
      fill(letter) {
        if (locked || current < 0) return false;
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
      // Jadval kaliti noto'g'ri bo'lganda: hamma katak bo'shatiladi
      clearAll() {
        letters.fill("");
        slots.forEach((s) => s.classList.remove("wrong"));
        current = 0;
        render();
      },
      // To'g'ri javobni ko'rsatish va qulflash
      showSolution(tokens) {
        tokens.forEach((t, k) => {
          letters[k] = t;
          slots[k].classList.remove("wrong");
          slots[k].classList.add("solution");
        });
        locked = true;
        current = -1;
        render();
      },
      lock() {
        locked = true;
        current = -1;
        render();
      },
    };
  }

  // ---------- Kalit saqlovchi (jadvalsiz — kalitsiz ochish uchun) ----------
  function keyState(key) {
    let k = caesar.wrapKey(key);
    return {
      getKey: () => k,
      setKey(next) { k = caesar.wrapKey(next); },
    };
  }

  // ---------- Surish jadvali (qo'llanma zonasida): tepada oddiy harf, pastda uning shifri ----------
  // Katak bosilganda pick(oddiy, shifr) chaqiriladi. Kalit o'zgarsa pastki qator yangilanadi.
  function table(key, onPick) {
    const zone = ui.openGuide();
    const state = keyState(key);
    let pick = onPick || null;
    const bottoms = [];
    const grid = ui.h("div", { class: "ctable" });
    caesar.ALPHABET.forEach((letter) => {
      const bottom = ui.h("span", { class: "ct-bottom" });
      bottoms.push(bottom);
      grid.append(ui.h("button", {
        class: "ct-cell",
        type: "button",
        "aria-label": `${letter} harfi`,
        onClick: () => {
          if (!pick) return;
          sound.play("tap");
          pick(letter, caesar.shift(letter, state.getKey()));
        },
      }, ui.h("span", { class: "ct-top", text: letter }), bottom));
    });
    zone.append(grid);
    const render = () => caesar.ALPHABET.forEach((l, i) => { bottoms[i].textContent = caesar.shift(l, state.getKey()); });
    render();
    return {
      getKey: state.getKey,
      setKey(next) {
        state.setKey(next);
        render();
      },
      setPick(fn) { pick = fn; },
    };
  }

  // ---------- Kalit boshqaruvi: [−] Jadval kaliti: k [+] (0–28, aylana) ----------
  // holder — table() yoki keyState(); onChange(k) — har o'zgarishda
  function keyControl(host, holder, onChange) {
    const val = ui.h("span", { class: "key-val", "aria-live": "polite" });
    const render = () => { val.textContent = `Jadval kaliti: ${holder.getKey()}`; };
    const step = (d) => {
      holder.setKey(holder.getKey() + d);
      sound.play("tap");
      render();
      if (onChange) onChange(holder.getKey());
    };
    host.append(ui.h("div", { class: "key-ctrl" },
      ui.h("button", { class: "key", type: "button", text: "−", "aria-label": "Kalitni kamaytirish", onClick: () => step(-1) }),
      val,
      ui.h("button", { class: "key", type: "button", text: "+", "aria-label": "Kalitni oshirish", onClick: () => step(1) })));
    render();
  }

  QK.caesarUi = { tile, tilesRow, wordSlots, keyState, table, keyControl };
})(window);
```

- [ ] **6-qadam: `js/main.js`**

```js
// 3-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Sezar maktubi",
  storageKey: "sezar-maktubi:v1",
  stageTitles: ["Xatni ochish", "Javobni shifrlash", "Kalitsiz ochish va hikoya"],
});
```

- [ ] **7-qadam: tekshirish va commit**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/03-sezar-maktubi
for f in js/*.js; do node --check "$f" || echo "FAIL $f"; done
node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
cd /Users/bicoder/Documents/Information && git add oyinlar/03-sezar-maktubi/index.html oyinlar/03-sezar-maktubi/css oyinlar/03-sezar-maktubi/js oyinlar/03-sezar-maktubi/tests
git commit -m "03-sezar-maktubi: sahifa, uslublar, g'ildirak, jadval va kataklar" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
Kutilgan natija: `FAIL` yo'q; `pass 15`, `fail 0`.

---

### 4-vazifa: So'z sikllari, kirish va 1-bosqich

**Fayllar:** yaratish — `03-sezar-maktubi/js/scenes/common.js`, `js/scenes/stage1.js`.

- [ ] **1-qadam: `js/scenes/common.js`**

```js
// So'zni ochish/shifrlash va mashq sikllari (QOIDALAR 4.4, 4.5).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, sound, caesarUi } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  // Bitta so'z. mode "decode": kataklar ustida shifr, bola jadvaldan oddiy harfni tanlaydi;
  // "encode": ustida oddiy harflar, bola shifrni tanlaydi. Hamma katak to'lganda avtomatik tekshiriladi.
  // 1-xato: jadval kaliti noto'g'ri bo'lsa — kalit haqida maslahat, aks holda noto'g'ri kataklar ↻;
  // 2-xato: to'g'ri javob ko'rsatiladi. Natija: true — bola o'zi to'g'ri bajardi.
  function solveWord({ plain, key, mode, tbl, opened }) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const cipher = caesar.encrypt(plain, key);
    const shown = mode === "decode" ? cipher : plain;
    const answer = mode === "decode" ? plain : cipher;
    QK.current = { answer: answer.join(" "), key }; // tekshirish uchun
    const box = ui.h("div", { class: "cbox" });
    if (opened && opened.length) box.append(ui.h("div", { class: "opened", text: opened.join(" ") }));
    ui.work().append(box);
    caesarUi.keyControl(box, tbl);
    const slots = caesarUi.wordSlots(box, shown);
    let wrongCount = 0;

    return ui.settle((finish) => {
      function done(ok) {
        slots.lock();
        tbl.setPick(null);
        finish(ok);
      }
      function check() {
        const wrong = caesar.checkLetters(answer, slots.letters());
        if (!wrong.length) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          done(true);
          return;
        }
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        wrongCount++;
        if (wrongCount === 1) {
          if (tbl.getKey() !== key) {
            slots.clearAll();
            ui.bubble("elder", `Jadval kaliti ${tbl.getKey()} emas, ${key} boʻlishi kerak.`);
          } else {
            slots.markWrong(wrong);
            ui.bubble("elder", "↻ Belgilangan harflarni qaytadan top.");
          }
          return;
        }
        slots.showSolution(answer);
        done(false);
      }
      tbl.setPick((p, c) => {
        if (slots.fill(mode === "decode" ? p : c) && slots.isFull()) check();
      });
    });
  }

  // Mashq: count ta to'g'ri javob; next(prev, correct) → { word, key }.
  // Doiralar: total ta, doneBefore tasi oldindan to'la (1-bosqichda xat birinchisini to'ldiradi).
  // 2-xatodan keyin yangi so'z beriladi, xato qilingani hisoblanmaydi.
  async function exercises({ count, total, doneBefore, mode, tbl, next, question, praise }) {
    let correct = 0;
    let prev = null;
    ui.setProgress(total, doneBefore);
    while (correct < count) {
      const ex = next(prev, correct);
      prev = ex;
      ui.paper(String(ex.key));
      ui.raisePaper(true);
      ui.bubble("elder", question(ex));
      const ok = await solveWord({ plain: caesar.tokenize(ex.word), key: ex.key, mode, tbl });
      if (ok) {
        correct++;
        ui.setProgress(total, doneBefore + correct);
        await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} ${praise(ex)}`);
      } else {
        await ui.say("elder", "Toʻgʻri javob ekranda. Endi yangi soʻz.");
      }
    }
  }

  QK.common = { PRAISE, solveWord, exercises };
})(window);
```

- [ ] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: Sezar xatini ochish (DIZAYN 4, 5-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, sound, art, caesarUi, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("scroll") }));
    await ui.say("elder", "Qabilaga uzoq Rimdan xat keldi!");
    await ui.say("apprentice", "Xat Yuliy Sezardan. Lekin uni oʻqib boʻlmaydi!");
    await ui.say("elder", "Harflari surilgan. Kel, birga ochamiz!");
  }

  // 5.1: g'ildirak — ichki halqa 0 dan 3 gacha birma-bir buriladi
  async function showWheel() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.paper("");
    const box = ui.h("div", { class: "wheel-box", html: art.wheel(caesar.ALPHABET, 0) });
    ui.work().append(box);
    await ui.say("elder", "Bu — Sezar gʻildiragi. Ichki halqani 3 ga buramiz.");
    for (let k = 1; k <= caesar.FIRST_KEY; k++) {
      await ui.sleep(500);
      sound.play("tap");
      box.innerHTML = art.wheel(caesar.ALPHABET, k, new Set([0]));
    }
    await ui.say("elder", "Endi har harf ostida 3 ta keyingi harf turibdi: A ostida — E.");
  }

  // 5.1 (davomi): jadval ochiladi, bola kalitni 3 ga qo'yadi
  async function setupTable() {
    ui.clearWork();
    const tbl = caesarUi.table(0, null);
    await ui.say("elder", "Gʻildirakni yoyib chiqsak — jadval boʻladi.");
    ui.setCompact(true);
    ui.paper(String(caesar.FIRST_KEY));
    ui.raisePaper(true);
    ui.bubble("elder", "Jadval kalitini 3 ga qoʻy.");
    const box = ui.h("div", { class: "cbox" });
    ui.work().append(box);
    await ui.settle((done) => {
      caesarUi.keyControl(box, tbl, (k) => { if (k === caesar.FIRST_KEY) done(); });
    });
    sound.play("correct");
    return tbl;
  }

  // 5.2: xat — so'zlar birma-bir ochiladi, oxirida butun gap o'qiladi
  async function readLetter(tbl) {
    const sentence = caesar.pickLetter();
    const words = sentence.split(" ");
    const opened = [];
    ui.setProgress(3, 0);
    for (let w = 0; w < words.length; w++) {
      ui.bubble("elder", w === 0 ? "Pastki qatordan shifrlangan harfni top va katakni bos." : `${w + 1}-soʻzni och.`);
      await common.solveWord({ plain: caesar.tokenize(words[w]), key: caesar.FIRST_KEY, mode: "decode", tbl, opened });
      opened.push(words[w]);
      await ui.sleep(700);
    }
    ui.setProgress(3, 1);
    ui.clearWork();
    ui.work().append(ui.h("div", { class: "opened big", text: sentence }));
    await ui.say("elder", `Sezar yozibdi: «${sentence}»`);
  }

  // 5.3: ta'rif
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.raisePaper(false);
    const box = ui.h("div", { class: "wheel-box", html: art.wheel(caesar.ALPHABET, caesar.FIRST_KEY) });
    ui.work().append(box);
    await ui.say("elder", "Kalit — har bir harf nechta surilgani. Sezarning kaliti — 3.");
    await ui.say("elder", "Shifrlashda harf oldinga suriladi, ochishda — orqaga.");
    box.innerHTML = art.wheel(caesar.ALPHABET, caesar.FIRST_KEY, new Set([0, caesar.ALPHABET.length - 1]));
    await ui.say("elder", "Alifbo aylana: Ng dan keyin yana A keladi.");
  }

  async function stage1() {
    await showWheel();
    const tbl = await setupTable();
    await readLetter(tbl);
    await explain();
    // 5.4: mashq — jadval 3 da ochiladi, bola kalitni o'zi o'zgartiradi
    const practice = caesarUi.table(caesar.FIRST_KEY, null);
    await ui.say("elder", "Endi boshqa kalitli soʻzlar. Jadvalni oʻzing sozla!");
    await common.exercises({
      count: 2,
      total: 3,
      doneBefore: 1,
      mode: "decode",
      tbl: practice,
      next: (prev) => caesar.makeExercise(caesar.PRACTICE, prev),
      question: (ex) => `Kalit — ${ex.key}. Jadvalni sozla va soʻzni och.`,
      praise: (ex) => `Bu — ${ex.word}.`,
    });
    ui.hideProgress();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [ ] **3-qadam: tekshirish va commit**

```bash
cd /Users/bicoder/Documents/Information
node --check oyinlar/03-sezar-maktubi/js/scenes/common.js && node --check oyinlar/03-sezar-maktubi/js/scenes/stage1.js && echo OK
git add oyinlar/03-sezar-maktubi/js/scenes/common.js oyinlar/03-sezar-maktubi/js/scenes/stage1.js
git commit -m "03-sezar-maktubi: so'z sikllari, kirish va 1-bosqich" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 5-vazifa: 2-bosqich, 3-bosqich, tabrik va yakuniy tekshiruv

**Fayllar:** yaratish — `03-sezar-maktubi/js/scenes/stage2.js`, `stage3.js`, `final.js`; o'zgartirish — `DIZAYN.md` (holati).

- [ ] **1-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: Sezarga javobni shifrlash (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, caesarUi, common } = QK;

  async function stage2() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.paper("");
    await ui.say("elder", "Endi Sezarga javob yozamiz. Javob ham shifrlanadi!");
    const tbl = caesarUi.table(0, null);
    await ui.say("elder", "Oddiy harfni tepa qatordan top — pastdagisi shifr.");
    await common.exercises({
      count: 3,
      total: 3,
      doneBefore: 0,
      mode: "encode",
      tbl,
      // Birinchi javob har doim XOʻP (kalit 3), keyin tasodifiy
      next: (prev) => (prev ? caesar.makeExercise(caesar.REPLIES, prev) : { word: caesar.FIRST_REPLY, key: caesar.FIRST_KEY }),
      question: (ex) => `Kalit — ${ex.key}. «${ex.word}» soʻzini shifrla.`,
      praise: () => "Shifr tayyor!",
    });
    ui.hideProgress();
    await ui.say("apprentice", "Javob Sezarga joʻnatildi!");
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [ ] **2-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: kalitsiz ochish va hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, sound, art, caesarUi } = QK;

  // Hikoya: art — rasm (QK.art.story), lines — Oqsoqol gaplari (har biri alohida pufak)
  const SCENES = [
    { art: "caesar", lines: ["Yuliy Sezar Qadimgi Rimning sarkardasi va hukmdori edi.", "U taxminan 2000 yil oldin yashagan."] },
    { art: "scroll", lines: ["U sarkardalariga maxfiy xatlar yuborgan.", "Xat dushman qoʻliga tushsa ham oʻqib boʻlmasin deb, harflarni 3 ga surgan."] },
    { art: "key", lines: ["Buni Rim tarixchisi Svetoniy yozib qoldirgan.", "Kalit — sir. Kalitni bilgan odam xatni bir zumda ochadi."] },
    { art: "keys", lines: ["Lekin kalit atigi 28 xil. Sen hozir oʻzing sinab koʻrding!"] },
    { art: "book", lines: ["IX asrda olim Al-Kindiy harflar qanchalik koʻp uchrashiga qarab shifrni ochishni oʻylab topdi.", "Esingdami, Morzeda eng koʻp ishlatiladigan harf eng qisqa edi?"] },
    { art: "phone", lines: ["Bugun telefondagi xabarlar ham shifrlanadi.", "Faqat kalitlar juda uzun — hammasini sinash uchun millionlab yil kerak."] },
  ];

  // 7.1: kalitsiz ochish — bola kalitni o'zgartiradi, so'z shu kalit bilan ochilib ko'rinadi
  function crackWord(ex) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    QK.current = { answer: ex.word, key: ex.key }; // tekshirish uchun
    const cipher = caesar.encrypt(caesar.tokenize(ex.word), ex.key);
    const state = caesarUi.keyState(0);
    const box = ui.h("div", { class: "cbox" });
    ui.work().append(box);
    box.append(caesarUi.tilesRow(cipher, "shown"));
    const guess = ui.h("div", { class: "guess" });
    const draw = () => {
      guess.innerHTML = "";
      guess.append(caesarUi.tilesRow(caesar.decrypt(cipher, state.getKey()), "guess-tile"));
    };
    caesarUi.keyControl(box, state, draw);
    box.append(guess);
    draw();
    return ui.settle((done) => {
      ui.control().append(ui.button("Topdim!", () => {
        if (state.getKey() === ex.key) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          ui.clearControl();
          done();
        } else {
          sound.play("retry");
          ui.bubble("elder", "Bu soʻz maʼnoli emas. Yana sinab koʻr.");
        }
      }));
    });
  }

  async function showScene(sc) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(sc.art) })));
    for (const line of sc.lines) await ui.say("elder", line);
  }

  async function stage3() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.paper("");
    ui.raisePaper(false);
    await ui.say("elder", "Dushman xatni tutib oldi. Lekin u kalitni bilmaydi!");
    await ui.say("elder", "Sen ham kalitni bilmaysan. Kalitni oʻzgartirib, maʼnoli soʻz chiqquncha sinab koʻr.");
    let prev = null;
    for (let n = 0; n < 2; n++) {
      const ex = caesar.makeCrack(prev);
      prev = ex;
      ui.bubble("elder", "Kalitni oʻzgartir. Maʼnoli soʻz chiqsa — «Topdim!»");
      await crackWord(ex);
      await ui.say("elder", `✓ Toʻgʻri! Kalit ${ex.key} ekan: ${ex.word}.`);
    }
    await ui.say("elder", "Hammasini sinab chiqish oson — shuning uchun Sezar shifri kuchsiz.");
    for (const sc of SCENES) await showScene(sc);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
```

- [ ] **3-qadam: `js/scenes/final.js`**

```js
// Bosqich tugashi va tabrik ekrani. 3-o'yinda finale yo'q.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.raisePaper(false);
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
    ui.closeGuide();
    ui.raisePaper(false);
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi sen Sezar shifrini bilasan!");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { text: "Kalit — sir" }),
      ui.h("div", { text: "Shifrlash — oldinga, ochish — orqaga" }),
      ui.h("div", { text: "Kalit kam boʻlsa — shifrni sinab ochish mumkin" })));
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
for g in 01-qabila-kodlari 02-qabila-morzesi 03-sezar-maktubi; do (cd $g && python3 - <<'PY'
import re, pathlib
html = pathlib.Path("index.html").read_text()
refs = [r for r in re.findall(r'(?:src|href)="([^"]+)"', html) if not r.startswith("data:")]
missing = [r for r in refs if not pathlib.Path(r).exists()]
print(pathlib.Path.cwd().name, len(refs), "ta yo'l; yo'q:", missing)
assert not missing
PY
); done
for f in umumiy/js/*.js */js/*.js */js/scenes/*.js; do node --check "$f" || echo "FAIL $f"; done
for g in umumiy 01-qabila-kodlari 02-qabila-morzesi 03-sezar-maktubi; do (cd $g && echo "$g:" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"); done
python3 - <<'PY'
import re, pathlib
read = lambda p: pathlib.Path(p).read_text()
def block(text, pattern):
    return set(re.findall(r"\w+", re.search(pattern, text, re.S).group(1)))
ex = {
    "ui": block(read("umumiy/js/ui.js"), r"QK\.ui = \{(.*?)\};"),
    "sound": block(read("umumiy/js/sound.js"), r"root\.QK\.sound = \{(.*?)\};"),
    "caesar": block(read("03-sezar-maktubi/js/caesar.js"), r"const api = \{(.*?)\};"),
    "caesarUi": block(read("03-sezar-maktubi/js/caesar-ui.js"), r"QK\.caesarUi = \{(.*?)\};"),
    "common": block(read("03-sezar-maktubi/js/scenes/common.js"), r"QK\.common = \{(.*?)\};"),
    "art": block(read("umumiy/js/art.js"), r"root\.QK\.art = \{(.*?)\};") | block(read("03-sezar-maktubi/js/game-art.js"), r"Object\.assign\(root\.QK\.art, \{(.*?)\}\)"),
}
scenes = set()
files = list(pathlib.Path("03-sezar-maktubi/js").rglob("*.js"))
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
Kutilgan natija: uchala o'yinda `yo'q: []`; `FAIL` yo'q; testlar: umumiy 10, 01 24, 02 22, 03 15 — hammasi `fail 0`; `Barcha chaqiruvlar eksportlarga mos`.

- [ ] **5-qadam: holat va commit**

`03-sezar-maktubi/DIZAYN.md`: `**Holati:** tasdiqlangan (2026-09-19)` → `**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda`.

```bash
cd /Users/bicoder/Documents/Information
git add oyinlar/03-sezar-maktubi/js/scenes oyinlar/03-sezar-maktubi/DIZAYN.md
git commit -m "03-sezar-maktubi: shifrlash, kalitsiz ochish, hikoya va tabrik" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git status --short
```
