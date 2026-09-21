# 05 — Rim toshi: ish rejasi

> **Agentlar uchun:** `superpowers:executing-plans`. Qadamlar `- [ ]` bilan.

**Maqsad:** 5-o'yin "Rim toshi": Rim raqamlarini o'qish va yozish, Rimliklar usulida qo'shish va aylantirib hisoblash, pozitsion va nopozitsion tizim, al-Xorazmiy hikoyasi.

**Arxitektura:** 1–4-o'yindagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/`. Sof hisob `js/roman.js` (Node testlari), ekran qismlari `js/roman-ui.js`, rasmlar `js/game-art.js`, sahnalar `js/scenes/`. Mashq sikli va "ikki urinish" 4-o'yindan `umumiy/js/practice.js` ga chiqariladi (QOIDALAR 9: kamida 2 ta o'yin ishlatadi).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

## Umumiy cheklovlar

- Kutubxona/yig'ish yo'q; `index.html` ikki marta bosib ochiladi; internet kerak emas.
- Ekrandagi matn o'zbek lotin (`ʻ` U+02BB, `ʼ` U+02BC), bolaga "sen", pufakda ≤ 2 qisqa gap.
- Bosiladigan element ≥ 48×48 px; matn ≥ 18 px; 360 px; gorizontal scroll yo'q; xato uchun qizil yo'q, ✓/↻.
- Xato: 1-xato maslahat, 2-xato yechim + yangi misol (xato qilingani hisoblanmaydi). 3 ta to'g'ri javob — bosqich tugaydi.
- Rasm ichiga matn/son yozilmaydi (yozuvlar HTML'da).
- `umumiy/` o'zgargani uchun barcha o'yinlar testlari ishga tushiriladi (QOIDALAR 9).
- Commit: `-m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"`. Branch: `oyin/05-rim-toshi`.

## Nomlar va interfeyslar

- `QK.practice` (`umumiy/js/practice.js`): `PRAISE`, `tries({ setup, check, hint, solution })` — `hint(qiymat)`/`solution(qiymat)` oxirgi javobni oladi; `numberTries({ answer, hint, solution, maxLen })`; `exercises({ next, run, praise })`.
- `QK.roman` (Node'da `require`): `VALUES`, `KEYS` (`I V X L C`), `RULES`, `ruleLabel(r)`, `toRoman(n)`, `fromRoman(s)`, `isStandard(s)`, `mistake(s)` → `repeat|twice|subtract`, `tokens(s)` → `[{text, value}]`, `symbolValues(s)`, `sortSymbols(s)`, `merge(a, b)`, `applyRule(s, r)` → yangi yozuv yoki `null`, `canTidy(s)`, `tidy(s)`, `partsOf(n)`, `places(n)` → `[{digit, place, value}]`, `hasNo49(n)`, `makeReadWriteTask(k, prev, rng?)`, `makeTidyTask(prev, rng?)`, `makeArithTask(prev, rng?)`, `makeCalcTask(k, prev, rng?)`, `makePlaceTask(prev, rng?)`.
- `QK.art.stone()`, `QK.art.story(name)` (`abacus | scroll | scholar | computer`).
- `QK.romanUi`: `PLACE_NAMES`, `symbol(ch, size?)`, `word(str, size?)`, `breakdown(str, { grouped?, mark? })`, `keyboard({ live, onSubmit, maxLen? })` → `{ get, setLive, shake }`, `tray(host)` → `{ get, set, shake }`, `ruleButtons(onRule, extra?)` → `{ highlight(str) }`, `placeView(host, n, { labels?, values? })` → `{ set, showLabels, showValues, highlight }`.
- `QK.common` (shu o'yin): `MISTAKE`, `stone(text)`, `expr(a, op, b, result?)`, `answerLine(text)`, `buildUntil(target, lead)`, `romanAnswer({ target, hint, solution })`, `askUntil(answer, hintText)`.
- Sahnalar `QK.scenes`: `intro`, `stage1`, `stage2`, `stage3`, `stageDone`, `congrats`.

---

### 1-vazifa: Umumiy mashq moduli (`umumiy/js/practice.js`)

4-o'yindagi `tries`, `numberTries`, `exercises` umumiy papkaga ko'chiriladi; 4-o'yin unga ulanadi. `hint`/`solution` endi oxirgi javobni oladi (5-o'yinda "qiymati to'g'ri, yozuvi nostandart" holati uchun), `numberTries` da `maxLen` sozlanadi.

- [ ] **1-qadam: branch**

```bash
cd /Users/bicoder/Documents/Information && git status --short && git checkout -b oyin/05-rim-toshi
```

- [ ] **2-qadam: `oyinlar/umumiy/js/practice.js`**

```js
// Mashq sikli va bitta vazifaga ikki urinish (QOIDALAR 4.4, 4.5). 4- va 5-o'yin ishlatadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  // Bitta vazifaga ikki urinish. setup(submit) — ekranni chizadi; check(qiymat) → bool.
  // 1-xato — hint(qiymat), 2-xato — solution(qiymat). Natija: true — bola o'zi topdi.
  function tries({ setup, check, hint, solution }) {
    let wrong = 0;
    let busy = false; // ikki marta tez bosish ikkita xato bo'lib hisoblanmasin
    return ui.settle((finish) => {
      setup((value) => {
        if (busy) return;
        busy = true;
        setTimeout(() => { busy = false; }, 400);
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
          hint(value);
        } else {
          ui.clearControl();
          solution(value);
          finish(false);
        }
      });
    });
  }

  // Raqam klaviaturasi bilan javob: 1-xato — hint(), 2-xato — solution()
  async function numberTries({ answer, hint, solution, maxLen }) {
    for (let wrong = 0; ; ) {
      const value = await ui.askNumber(maxLen || 3);
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

  QK.practice = { PRAISE, tries, numberTries, exercises };
})(window);
```

- [ ] **3-qadam: 4-o'yin `js/scenes/common.js` — faqat `findAll` qoladi**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/04-qabila-chiroqlari && python3 - <<'PY'
import pathlib, re
p = pathlib.Path("js/scenes/common.js"); s = p.read_text()
s = s.replace("// Naqshlarni topish, urinishlar va mashq sikli (QOIDALAR 4.4, 4.5).",
              "// Naqshlarni topish. Mashq sikli va urinishlar: ../../umumiy/js/practice.js")
s = s.replace('const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];\n\n', "")
start = s.index("  // Bitta vazifaga ikki urinish.")
end = s.index("  QK.common = ")
s = s[:start] + s[end:]
s = s.replace("QK.common = { PRAISE, findAll, tries, numberTries, exercises };", "QK.common = { findAll };")
p.write_text(s)
PY
grep -n "QK.common\|PRAISE\|function " js/scenes/common.js
```

- [ ] **4-qadam: 4-o'yin sahnalari `QK.practice` ga o'tadi**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/04-qabila-chiroqlari && python3 - <<'PY'
import pathlib
for name in ["stage1.js", "stage2.js", "stage3.js"]:
    p = pathlib.Path("js/scenes") / name
    s = p.read_text()
    for fn in ["tries", "numberTries", "exercises"]:
        s = s.replace("common." + fn, "practice." + fn)
    s = s.replace("practice.numberTries({\n      answer:", "practice.numberTries({\n      maxLen: 2,\n      answer:")
    s = s.replace("common.practice", "practice")  # ehtiyot chorasi
    # destrukturizatsiya: practice qo'shiladi, common faqat findAll bo'lgan fayllarda qoladi
    line = [l for l in s.split("\n") if l.startswith("  const { lamps")][0]
    names = line[line.index("{") + 1:line.index("}")].split(", ")
    names = [n.strip() for n in names if n.strip() != "common"]
    if "common." in s: names.append("common")
    names.append("practice")
    p.write_text(s.replace(line, "  const { " + ", ".join(names) + " } = QK;"))
PY
grep -rn "const { lamps\|practice\.\|common\." js/scenes/stage*.js | head -20
```

- [ ] **5-qadam: 4-o'yin `index.html` — `practice.js` ulanadi**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/04-qabila-chiroqlari && python3 - <<'PY'
import pathlib
p = pathlib.Path("index.html"); s = p.read_text()
old = '  <script src="../umumiy/js/app.js"></script>\n'
assert s.count(old) == 1
p.write_text(s.replace(old, old + '  <script src="../umumiy/js/practice.js"></script>\n'))
PY
grep -n "script src" index.html
```

- [ ] **6-qadam: 4-o'yin `DIZAYN.md` dagi kod jadvali yangilanadi**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/04-qabila-chiroqlari && python3 - <<'PY'
import pathlib
p = pathlib.Path("DIZAYN.md"); s = p.read_text()
old = "| `js/scenes/common.js` | Naqshlarni topish, mashq sikli, urinishlar |"
assert s.count(old) == 1
p.write_text(s.replace(old, "| `js/scenes/common.js` | Naqshlarni topish |\n| `../umumiy/js/practice.js` | Mashq sikli va urinishlar (4- va 5-o'yin uchun umumiy) |"))
PY
grep -n "practice.js" DIZAYN.md
```

- [ ] **7-qadam: barcha testlar va statik tekshiruv**

```bash
cd /Users/bicoder/Documents/Information/oyinlar && node --check umumiy/js/practice.js && for d in 0*/; do (cd "$d" && echo "== $d" && node --test tests/*.test.js 2>&1 | tail -3); done
```

- [ ] **8-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information && git add -A && git commit -m "umumiy: mashq sikli va urinishlar practice.js ga chiqarildi (4- va 5-o'yin)" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 2-vazifa: Rim hisobi (`js/roman.js`)

- [ ] **1-qadam: muvaffaqiyatsiz testlar — `tests/roman.test.js`**

```js
// roman.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../js/roman.js");

test("toRoman: standart yozuv", () => {
  const pairs = [[1, "I"], [3, "III"], [4, "IV"], [7, "VII"], [9, "IX"], [12, "XII"], [14, "XIV"],
    [26, "XXVI"], [40, "XL"], [42, "XLII"], [49, "XLIX"], [88, "LXXXVIII"], [90, "XC"], [99, "XCIX"],
    [100, "C"], [1999, "MCMXCIX"], [2026, "MMXXVI"]];
  for (const [n, s] of pairs) assert.equal(R.toRoman(n), s, String(n));
});

test("fromRoman: har qanday yozuvning qiymati", () => {
  assert.equal(R.fromRoman("XLII"), 42);
  assert.equal(R.fromRoman("IIII"), 4);
  assert.equal(R.fromRoman("VV"), 10);
  assert.equal(R.fromRoman("IL"), 49);
  for (let n = 1; n <= 3999; n++) assert.equal(R.fromRoman(R.toRoman(n)), n);
});

test("isStandard: Rimliklar shunday yozganmi", () => {
  for (const s of ["I", "IV", "XLII", "XC", "MMXXVI"]) assert.equal(R.isStandard(s), true, s);
  for (const s of ["IIII", "VV", "IL", "XXXX", "VIV", ""]) assert.equal(R.isStandard(s), false, s);
});

test("mistake: nostandart yozuvdagi xato turi", () => {
  assert.equal(R.mistake("IIII"), "repeat");
  assert.equal(R.mistake("XXXXII"), "repeat");
  assert.equal(R.mistake("VV"), "twice");
  assert.equal(R.mistake("VIV"), "twice");
  assert.equal(R.mistake("IL"), "subtract");
  assert.equal(R.mistake("IIX"), "subtract");
});

test("tokens va symbolValues: yoyilma uchun", () => {
  assert.deepEqual(R.tokens("XLII"), [{ text: "XL", value: 40 }, { text: "I", value: 1 }, { text: "I", value: 1 }]);
  assert.deepEqual(R.tokens("XCIX"), [{ text: "XC", value: 90 }, { text: "IX", value: 9 }]);
  assert.deepEqual(R.symbolValues("XXVII"), [10, 10, 5, 1, 1]);
  for (let n = 1; n <= 100; n++) {
    const s = R.toRoman(n);
    assert.equal(R.tokens(s).reduce((sum, t) => sum + t.value, 0), n, s);
  }
});

test("sortSymbols va merge: belgilar kattadan kichikka", () => {
  assert.equal(R.sortSymbols("IXV"), "XVI");
  assert.equal(R.merge("XII", "VIII"), "XVIIIII");
  assert.equal(R.merge("XXXV", "XXV"), "XXXXXVV");
});

test("applyRule: belgilar yetsa — yangi yozuv, yetmasa — null", () => {
  const [rI, rV, rX, rL] = R.RULES;
  assert.equal(R.ruleLabel(rI), "IIIII → V");
  assert.equal(R.applyRule("XVIIIII", rI), "XVV");
  assert.equal(R.applyRule("XVV", rV), "XX");
  assert.equal(R.applyRule("XX", rV), null);
  assert.equal(R.applyRule("IIII", rI), null);
  assert.equal(R.applyRule("XXXXXVV", rX), "LVV");
  assert.equal(R.applyRule("LL", rL), "C");
});

test("canTidy va tidy: qoidalar tugaguncha", () => {
  assert.equal(R.canTidy("XVIIIII"), true);
  assert.equal(R.canTidy("XXVI"), false);
  assert.equal(R.tidy("XVIIIII"), "XX");
  assert.equal(R.tidy("XXXXXVV"), "LX");
  for (let a = 2; a <= 60; a++) {
    for (let b = 2; b <= 20; b++) {
      if (!R.hasNo49(a) || !R.hasNo49(b) || !R.hasNo49(a + b)) continue;
      assert.equal(R.tidy(R.merge(R.toRoman(a), R.toRoman(b))), R.toRoman(a + b), a + "+" + b);
    }
  }
});

test("places va partsOf: xonalar", () => {
  assert.deepEqual(R.places(352), [
    { digit: 3, place: 2, value: 300 },
    { digit: 5, place: 1, value: 50 },
    { digit: 2, place: 0, value: 2 },
  ]);
  assert.deepEqual(R.places(105).map((p) => p.value), [100, 0, 5]);
  assert.deepEqual(R.partsOf(42), [40, 2]);
  assert.deepEqual(R.partsOf(100), [100]);
  assert.deepEqual(R.partsOf(7), [7]);
  assert.deepEqual(R.partsOf(90), [90]);
});

test("makeReadWriteTask: oʻqish/yozish, 3–100, ketma-ket takrorlanmaydi", () => {
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const t = R.makeReadWriteTask(i % 3, prev);
    assert.ok(t.n >= 3 && t.n <= 100, String(t.n));
    if (i % 3 === 0) {
      assert.equal(t.type, "read");
      assert.ok(t.n <= 39, String(t.n));
    }
    if (i % 3 === 1) assert.equal(t.type, "write");
    assert.equal(t.roman, R.toRoman(t.n));
    if (prev) assert.notEqual(t.n, prev.n);
    prev = t;
  }
});

test("makeTidyTask: 4 va 9 raqamisiz, yigʻindi ≤ 80, qoida kerak", () => {
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const t = R.makeTidyTask(prev);
    assert.equal(t.type, "tidy");
    assert.equal(t.op, "+");
    assert.equal(t.answer, t.a + t.b);
    assert.ok(t.answer <= 80, String(t.answer));
    for (const n of [t.a, t.b, t.answer]) assert.ok(R.hasNo49(n), String(n));
    assert.ok(R.canTidy(R.merge(R.toRoman(t.a), R.toRoman(t.b))));
    prev = t;
  }
});

test("makeArithTask: qoʻshishda ≤ 100, ayirishda natija ≥ 1", () => {
  let prev = null;
  let plus = 0;
  for (let i = 0; i < 300; i++) {
    const t = R.makeArithTask(prev);
    assert.equal(t.type, "arith");
    assert.ok(t.a >= 2 && t.b >= 2);
    if (t.op === "+") {
      plus++;
      assert.equal(t.answer, t.a + t.b);
      assert.ok(t.answer <= 100, String(t.answer));
    } else {
      assert.equal(t.op, "−");
      assert.equal(t.answer, t.a - t.b);
      assert.ok(t.answer >= 1, String(t.answer));
    }
    prev = t;
  }
  assert.ok(plus > 0 && plus < 300);
});

test("makeCalcTask: avval lagan, keyin aylantirish", () => {
  assert.equal(R.makeCalcTask(0, null).type, "tidy");
  assert.equal(R.makeCalcTask(1, null).type, "arith");
});

test("makePlaceTask: raqamlar har xil va nolsiz; javob — xonadagi qiymat", () => {
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const t = R.makePlaceTask(prev);
    const s = String(t.number);
    assert.ok(s.length === 2 || s.length === 3, s);
    assert.ok(!s.includes("0"), s);
    assert.equal(new Set(s).size, s.length, s);
    assert.equal(s[t.index], String(t.digit));
    assert.equal(t.answer, t.digit * Math.pow(10, t.place));
    if (prev) assert.notEqual(t.number, prev.number);
    prev = t;
  }
});
```

- [ ] **2-qadam: testni ishga tushirish — yiqilishi kerak**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && node --test tests/roman.test.js 2>&1 | tail -5
```

- [ ] **3-qadam: `js/roman.js`**

```js
// Rim toshi — sof hisob: Rim yozuvi ↔ son, lagan qoidalari, xonalar, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const KEYS = ["I", "V", "X", "L", "C"]; // Rim klaviaturasi (1–100 uchun yetarli)
  const PAIRS = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  // Lagan qoidalari: `count` ta `from` belgisi o'rniga bitta `to`
  const RULES = [
    { from: "I", count: 5, to: "V" },
    { from: "V", count: 2, to: "X" },
    { from: "X", count: 5, to: "L" },
    { from: "L", count: 2, to: "C" },
  ];
  const ruleLabel = (r) => `${r.from.repeat(r.count)} → ${r.to}`;

  // Son → standart Rim yozuvi. toRoman(42) → "XLII"
  function toRoman(n) {
    let out = "";
    for (const [value, sym] of PAIRS) {
      while (n >= value) {
        out += sym;
        n -= value;
      }
    }
    return out;
  }

  // Rim yozuvi → son: belgi keyingisidan kichik bo'lsa — ayiriladi. fromRoman("XLII") → 42
  function fromRoman(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      const v = VALUES[str[i]];
      sum += VALUES[str[i + 1]] > v ? -v : v;
    }
    return sum;
  }

  // Rimliklar shunday yozganmi (IIII, VV, IL — yo'q)
  const isStandard = (str) => str.length > 0 && toRoman(fromRoman(str)) === str;

  // Nostandart yozuvdagi xato turi: "repeat" — IIII, "twice" — VV, "subtract" — IL kabi
  function mistake(str) {
    if (/IIII|XXXX|CCCC|MMMM/.test(str)) return "repeat";
    if (/V.*V|L.*L|D.*D/.test(str)) return "twice";
    return "subtract";
  }

  // Belgilar guruhlari: ayiriladigan juftlik — bitta guruh. tokens("XLII") → XL 40, I 1, I 1
  function tokens(str) {
    const out = [];
    for (let i = 0; i < str.length; i++) {
      const v = VALUES[str[i]];
      const next = VALUES[str[i + 1]];
      if (next > v) {
        out.push({ text: str[i] + str[i + 1], value: next - v });
        i++;
      } else {
        out.push({ text: str[i], value: v });
      }
    }
    return out;
  }

  // Har belgining qiymati. symbolValues("XXVII") → [10, 10, 5, 1, 1]
  const symbolValues = (str) => [...str].map((ch) => VALUES[ch]);

  // Laganda belgilar kattadan kichikka turadi
  const sortSymbols = (str) => [...str].sort((a, b) => VALUES[b] - VALUES[a]).join("");

  // Ikki yozuvni bitta laganga to'plash (faqat qo'shish qoidasidagi yozuvlar uchun)
  const merge = (a, b) => sortSymbols(a + b);

  // Qoidani qo'llash: yangi yozuv yoki null (belgilar yetarli emas)
  function applyRule(str, rule) {
    const have = [...str].filter((ch) => ch === rule.from).length;
    if (have < rule.count) return null;
    let removed = 0;
    const rest = [...str].filter((ch) => {
      if (ch === rule.from && removed < rule.count) {
        removed++;
        return false;
      }
      return true;
    });
    return sortSymbols(rest.join("") + rule.to);
  }

  const canTidy = (str) => RULES.some((r) => applyRule(str, r) !== null);

  // Qoidalar tugaguncha tartibga solish (yechimni ko'rsatish uchun)
  function tidy(str) {
    for (let changed = true; changed; ) {
      changed = false;
      for (const rule of RULES) {
        const next = applyRule(str, rule);
        if (next) {
          str = next;
          changed = true;
        }
      }
    }
    return str;
  }

  // Xonalarga ajratish (yozish maslahati uchun): 42 → [40, 2]; 100 → [100]
  function partsOf(n) {
    const out = [];
    for (let unit = 100; unit >= 1; unit /= 10) {
      const part = (Math.floor(n / unit) % 10) * unit;
      if (part) out.push(part);
    }
    return out;
  }

  // Raqamlar va ularning xonadagi qiymati. places(352) → 3/300, 5/50, 2/2
  function places(n) {
    const digits = String(n).split("").map(Number);
    return digits.map((digit, i) => {
      const place = digits.length - 1 - i;
      return { digit, place, value: digit * Math.pow(10, place) };
    });
  }

  // Sonda 4 yoki 9 raqami yo'qmi (faqat qo'shish qoidasidagi yozuv chiqadi)
  const hasNo49 = (n) => !/[49]/.test(String(n));

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));

  // 1-bosqich mashqi: k — nechanchi to'g'ri javob (0 — o'qish, 1 — yozish, keyin tasodifiy)
  function makeReadWriteTask(k, prev, rng) {
    rng = rng || Math.random;
    const type = k === 0 ? "read" : k === 1 ? "write" : rng() < 0.5 ? "read" : "write";
    const max = k === 0 ? 39 : 100; // birinchi misol yengilroq
    let n;
    do {
      n = randInt(3, max, rng);
    } while (prev && n === prev.n);
    return { type, n, roman: toRoman(n) };
  }

  // 2-bosqich: Rimliklar usulida qo'shish — 4/9 raqamisiz, yig'indi ≤ 80, kamida bitta qoida kerak
  function makeTidyTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const a = randInt(2, 60, rng);
      const b = randInt(2, 60, rng);
      const answer = a + b;
      if (answer > 80 || !hasNo49(a) || !hasNo49(b) || !hasNo49(answer)) continue;
      if (!canTidy(merge(toRoman(a), toRoman(b)))) continue;
      if (prev && prev.type === "tidy" && prev.a === a && prev.b === b) continue;
      return { type: "tidy", op: "+", a, b, answer };
    }
  }

  // 2-bosqich: aylantirib hisoblash. "+": yig'indi ≤ 100; "−": natija ≥ 1
  function makeArithTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const op = rng() < 0.5 ? "+" : "−";
      let a;
      let b;
      if (op === "+") {
        a = randInt(5, 70, rng);
        b = randInt(2, 40, rng);
        if (a + b > 100) continue;
      } else {
        a = randInt(12, 100, rng);
        b = randInt(2, a - 1, rng);
      }
      if (prev && prev.type === "arith" && prev.op === op && prev.a === a && prev.b === b) continue;
      return { type: "arith", op, a, b, answer: op === "+" ? a + b : a - b };
    }
  }

  // 2-bosqich mashqi: avval lagan, keyin aylantirish, keyin tasodifiy
  function makeCalcTask(k, prev, rng) {
    rng = rng || Math.random;
    const useTidy = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useTidy ? makeTidyTask(prev, rng) : makeArithTask(prev, rng);
  }

  // 3-bosqich: "352 sonidagi 5 raqami nechaga teng?" — raqamlar har xil va noldan farqli
  function makePlaceTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const len = rng() < 0.7 ? 3 : 2;
      const digits = [];
      while (digits.length < len) {
        const d = randInt(1, 9, rng);
        if (!digits.includes(d)) digits.push(d);
      }
      const number = Number(digits.join(""));
      if (prev && prev.number === number) continue;
      const index = randInt(0, len - 1, rng);
      const part = places(number)[index];
      return { number, index, digit: part.digit, place: part.place, answer: part.value };
    }
  }

  const api = {
    VALUES, KEYS, RULES, ruleLabel,
    toRoman, fromRoman, isStandard, mistake, tokens, symbolValues,
    sortSymbols, merge, applyRule, canTidy, tidy,
    partsOf, places, hasNo49,
    makeReadWriteTask, makeTidyTask, makeArithTask, makeCalcTask, makePlaceTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.roman = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

- [ ] **4-qadam: testlar o'tishi kerak**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && node --test tests/roman.test.js 2>&1 | tail -5
```

- [ ] **5-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information && git add -A && git commit -m "05-rim-toshi: Rim raqamlari hisobi va testlari" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 3-vazifa: Sahifa, uslublar va rasmlar

- [ ] **1-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Rim toshi</title>
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
  <script src="js/roman.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="../umumiy/js/practice.js"></script>
  <script src="js/roman-ui.js"></script>
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
/* Rim toshi — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.rbox { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }

/* ---------- Rim belgilari ---------- */
.rword { display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 4px; }
.rtile {
  display: inline-grid; place-items: center; width: 40px; height: 48px; border-radius: 8px;
  color: #fff; font-family: Georgia, "Times New Roman", serif; font-size: 28px; font-weight: 700;
}
.rtile.sm { width: 28px; height: 34px; border-radius: 6px; font-size: 22px; }
.rtile.lg { width: 52px; height: 62px; font-size: 38px; }
.rtile.fresh { animation: pop 0.3s; }
.r-I { background: var(--c0); }
.r-V { background: var(--c1); }
.r-X { background: var(--c2); }
.r-L { background: var(--c3); }
.r-C { background: #6B4E3D; }
.r-D { background: #B0831E; }
.r-M { background: var(--matn); }

/* ---------- Belgi kartochkalari (1-bosqich) ---------- */
.cards5 { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.sym-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 68px;
  padding: 8px; border: none; border-radius: 14px; background: #fff; box-shadow: 0 3px 0 var(--soya);
}
.sym-card:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--soya); }
.sym-val { min-height: 32px; font-size: 24px; font-weight: 900; color: var(--asosiy); }
.sym-card.open .sym-val { animation: pop 0.3s; }

/* ---------- Yoyilma va xonalar ---------- */
.bk { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.bk-col { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 4px; border-radius: 10px; }
.bk-col.hl { outline: 3px solid var(--yana); outline-offset: -1px; }
.bk-val { font-size: 22px; font-weight: 900; }
.pairs { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }
.pv { display: flex; justify-content: center; gap: 10px; }
.pv-col { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 4px; border-radius: 12px; }
.pv-col.hl { outline: 3px solid var(--yana); outline-offset: -1px; }
.pv-label { min-height: 24px; font-size: 18px; font-weight: 800; color: var(--asosiy); }
.pv-digit {
  display: grid; place-items: center; width: 60px; height: 68px; border-radius: 12px;
  background: #fff; box-shadow: 0 3px 0 var(--soya); font-size: 42px; font-weight: 900;
}
.pv-val { min-height: 30px; font-size: 22px; font-weight: 900; }

/* ---------- Lagan va qoidalar ---------- */
.tray {
  display: flex; flex-wrap: wrap; align-content: center; justify-content: center; gap: 6px;
  width: 100%; max-width: 440px; min-height: 76px; padding: 12px 16px; border-radius: 38px;
  background: #E9DCC3; box-shadow: inset 0 0 0 4px #C9B48E;
}
.rules { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; width: 100%; max-width: 420px; }
.rules .key { font-family: Georgia, "Times New Roman", serif; font-size: 20px; font-weight: 700; }
.rules .key.hl { outline: 3px solid var(--yana); outline-offset: -3px; }
.left-line { font-size: 20px; font-weight: 800; }

/* ---------- Rim klaviaturasi ---------- */
.rkb-wrap { display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 420px; }
.rkb-display {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px;
  min-height: 52px; padding: 4px 10px; border-radius: 12px; background: #fff;
  box-shadow: inset 0 0 0 3px var(--chiziq);
}
.rkb-val { font-size: 24px; font-weight: 900; color: var(--asosiy); }
.rkb { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.rkb .sym { font-family: Georgia, "Times New Roman", serif; font-size: 28px; font-weight: 700; }
.rkb .del { grid-column: span 2; }
.rkb .ok { grid-column: span 3; font-size: 22px; }

/* ---------- Tosh, misol, javob ---------- */
.stone { position: relative; width: min(280px, 72vw); }
.stone-art svg { display: block; width: 100%; height: auto; }
.stone-text {
  position: absolute; inset: 0; display: grid; place-items: center; padding: 0 12%;
  font-family: Georgia, "Times New Roman", serif; font-size: 34px; font-weight: 700; letter-spacing: 4px;
  color: #4A4336; text-align: center; white-space: pre-wrap;
}
.expr { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; font-size: 28px; font-weight: 900; }
.target { font-size: 44px; font-weight: 900; line-height: 1; }
.formula-row { font-size: 22px; font-weight: 800; text-align: center; animation: pop 0.3s; }
.formula-row.big { font-size: 32px; font-weight: 900; }
.answer { font-size: 22px; font-weight: 900; color: var(--togri); text-align: center; }

/* ---------- Hikoya va tabrik ---------- */
.story { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.story-art { width: min(260px, 70vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.story-caption { font-size: 24px; font-weight: 900; text-align: center; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }

/* Klaviatura paytida (ixcham rejim) tosh va raqamlar kichrayadi */
.compact .stone { width: min(200px, 56vw); }
.compact .stone-text { font-size: 26px; letter-spacing: 2px; }

/* Yotiq telefon: sahna ustuni tor, qoidalar bitta qator, klaviatura bitta qator */
@media (orientation: landscape) and (max-height: 500px) {
  .play.compact { grid-template-columns: minmax(150px, 24%) minmax(0, 1fr); }
  .rules { grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: none; }
  .rules .key { font-size: 18px; }
  .rkb { grid-template-columns: repeat(6, minmax(0, 1fr)) minmax(0, 1.8fr); }
  .rkb .del, .rkb .ok { grid-column: auto; }
  .rkb-wrap { max-width: none; }
  .tray { min-height: 60px; padding: 8px 12px; }
  .compact .stone { width: 150px; }
  .compact .stone-text { font-size: 22px; letter-spacing: 1px; }
  .compact .pv-digit { width: 48px; height: 54px; font-size: 34px; }
  .compact .target { font-size: 36px; }
}
```

- [ ] **3-qadam: `js/game-art.js`**

```js
// 5-o'yinga xos SVG rasmlar: tosh lavha va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q (yozuvlar HTML'da).
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Tosh lavha: o'rtasi silliq — ustiga HTML yozuv qo'yiladi
  const stone = () => `<svg class="stone-svg" viewBox="0 0 240 150" aria-hidden="true">
  <path d="M20 28 Q16 8 40 8 L198 4 Q228 4 230 30 L236 120 Q238 144 210 144 L34 146 Q6 146 8 118 Z" fill="#A9A08E" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M34 26 L204 22 Q216 22 217 34 L220 112 Q220 126 206 126 L42 128 Q28 128 28 114 Z" fill="#C9C1AF"/>
  <path d="M206 36 L196 50 L204 58" stroke="#857C6B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 116 L54 106 L60 110" stroke="#857C6B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 134 Q30 142 46 138" stroke="#6E9E4B" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`;

  // Hisob taxtasi (abak): ramka, 4 ta tayoqcha va toshchalar
  function abacus() {
    const colors = ["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"];
    const left = [3, 1, 4, 2];
    let rods = "";
    [34, 56, 78, 100].forEach((y, i) => {
      rods += `<line x1="20" y1="${y}" x2="180" y2="${y}" stroke="#6A4A2B" stroke-width="3"/>`;
      for (let k = 0; k < left[i]; k++) {
        rods += `<circle cx="${36 + k * 18}" cy="${y}" r="8" fill="${colors[i]}" stroke="${INK}" stroke-width="2"/>`;
      }
      for (let k = 0; k < 4 - left[i]; k++) {
        rods += `<circle cx="${164 - k * 18}" cy="${y}" r="8" fill="${colors[i]}" stroke="${INK}" stroke-width="2"/>`;
      }
    });
    return `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="8" y="8" width="184" height="114" rx="10" fill="#8A5A2B"/>
  <rect x="20" y="20" width="160" height="90" rx="4" fill="#F4E3C3"/>
  ${rods}
</svg>`;
  }

  // Hindistondan kelgan qo'lyozma: palma bargi, ipi va yozuv chiziqlari
  const scroll = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="10" y="26" width="180" height="60" rx="16" fill="#E8C98A" stroke="${INK}" stroke-width="3"/>
  <path d="M26 44 q7 -8 14 0 t14 0 t14 0 t14 0" stroke="#8A5A2B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M26 58 q7 -8 14 0 t14 0 t14 0 t14 0 t14 0 t14 0" stroke="#8A5A2B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M26 72 q7 -8 14 0 t14 0 t14 0" stroke="#8A5A2B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="150" cy="56" r="5" fill="${INK}"/>
  <path d="M150 61 Q150 96 132 108" stroke="#B0412E" stroke-width="3" fill="none"/>
</svg>`;

  // Olim: salla, soqol, kitob; orqada deraza va yulduz
  const scholar = `<svg viewBox="0 0 200 150" aria-hidden="true">
  <path d="M18 146 L18 62 Q18 26 48 26 Q78 26 78 62 L78 146 Z" fill="#2B4C7E"/>
  <circle cx="48" cy="58" r="9" fill="#F0C040"/>
  <path d="M80 148 Q84 96 120 90 Q156 96 160 148 Z" fill="#1A9E77" stroke="${INK}" stroke-width="3"/>
  <circle cx="120" cy="64" r="20" fill="#E8B98A" stroke="${INK}" stroke-width="3"/>
  <path d="M102 68 Q120 102 138 68 Q130 80 120 80 Q110 80 102 68 Z" fill="#6B4E3D"/>
  <path d="M98 58 Q98 34 120 34 Q142 34 142 58 Q120 48 98 58 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <circle cx="113" cy="62" r="2.5" fill="${INK}"/>
  <circle cx="127" cy="62" r="2.5" fill="${INK}"/>
  <path d="M92 116 L120 122 L148 116 L148 136 L120 142 L92 136 Z" fill="#F4E3C3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M120 122 L120 142" stroke="${INK}" stroke-width="3"/>
</svg>`;

  // Kompyuter: ekranda qadamlar (rangli chiziqlar)
  const computer = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="30" y="8" width="140" height="88" rx="8" fill="${INK}"/>
  <rect x="40" y="18" width="120" height="68" rx="4" fill="#1E3A5F"/>
  <rect x="50" y="28" width="42" height="8" rx="4" fill="#F0C040"/>
  <rect x="60" y="44" width="62" height="8" rx="4" fill="#1A9E77"/>
  <rect x="60" y="58" width="46" height="8" rx="4" fill="#8FB8F0"/>
  <rect x="50" y="72" width="32" height="8" rx="4" fill="#F08A24"/>
  <rect x="90" y="96" width="20" height="12" fill="#6A6A6A"/>
  <rect x="40" y="108" width="120" height="16" rx="4" fill="#8A8A8A"/>
</svg>`;

  const STORY = { abacus: abacus(), scroll, scholar, computer };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { stone, story });
})(window);
```

- [ ] **4-qadam: `tests/game-art.test.js`**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("tosh va hikoya rasmlari SVG qaytaradi", () => {
  assert.match(art.stone(), /^<svg[\s\S]*<\/svg>$/);
  for (const n of ["abacus", "scroll", "scholar", "computer"]) {
    assert.match(art.story(n), /^<svg[\s\S]*<\/svg>$/, n);
  }
  assert.equal(art.story("yoq"), "");
});

test("rasm ichida matn yoʻq (QOIDALAR 6)", () => {
  for (const svg of [art.stone(), art.story("abacus"), art.story("scroll"), art.story("scholar"), art.story("computer")]) {
    assert.ok(!svg.includes("<text"), svg.slice(0, 40));
  }
});

test("abak: 4 ta tayoqcha va 16 ta toshcha", () => {
  const svg = art.story("abacus");
  assert.equal((svg.match(/<line /g) || []).length, 4);
  assert.equal((svg.match(/<circle /g) || []).length, 16);
});
```

- [ ] **5-qadam: `js/main.js` va `tests/main.test.js`**

```js
// 5-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Rim toshi",
  storageKey: "rim-toshi:v1",
  stageTitles: ["Oʻqish va yozish", "Qoʻshish va ayirish", "Pozitsion tizim"],
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
  assert.equal(captured.storageKey, "rim-toshi:v1");
  assert.equal(captured.title, "Rim toshi");
  assert.deepEqual(captured.stageTitles, ["Oʻqish va yozish", "Qoʻshish va ayirish", "Pozitsion tizim"]);
});
```

- [ ] **6-qadam: testlar**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && node --check js/game-art.js && node --check js/main.js && node --test tests/*.test.js 2>&1 | tail -5
```

- [ ] **7-qadam: commit**

```bash
cd /Users/bicoder/Documents/Information && git add -A && git commit -m "05-rim-toshi: sahifa, uslublar va rasmlar" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### 4-vazifa: Ekran qismlari (`js/roman-ui.js`)

- [ ] **1-qadam: `js/roman-ui.js`**

```js
// Rim toshi ekran qismlari: belgi kartochkalari, yoyilma, Rim klaviaturasi, lagan va qoidalar, xonalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound } = QK;

  const PLACE_NAMES = ["birlar", "oʻnlar", "yuzlar"];

  // Bitta Rim belgisi (rangli kartochka); size: "sm" | "lg" | yo'q
  const symbol = (ch, size) => ui.h("span", { class: `rtile r-${ch}${size ? " " + size : ""}`, text: ch });

  // Rim yozuvi kartochkalarda
  function word(str, size) {
    const el = ui.h("span", { class: "rword", role: "img", "aria-label": [...str].join(" ") });
    for (const ch of str) el.append(symbol(ch, size));
    return el;
  }

  // Yoyilma: har guruh ostida qiymati. grouped — ayiriladigan juftlik bitta guruh (XL → 40),
  // aks holda har belgi alohida (X X V I I → 10 10 5 1 1). mark — ajratib ko'rsatiladigan belgi.
  function breakdown(str, opts) {
    const { grouped, mark } = opts || {};
    const parts = grouped ? roman.tokens(str) : [...str].map((ch) => ({ text: ch, value: roman.VALUES[ch] }));
    const el = ui.h("div", { class: "bk" });
    for (const part of parts) {
      el.append(ui.h("div", { class: "bk-col" + (mark && part.text === mark ? " hl" : "") },
        word(part.text),
        ui.h("div", { class: "bk-val", text: String(part.value) })));
    }
    return el;
  }

  // Rim klaviaturasi (boshqaruv zonasida): I V X L C, ⌫, Tayyor.
  // live — yozuv yonida jonli qiymat (= 12). Kompyuterda I V X L C, Backspace, Enter ham ishlaydi.
  function keyboard({ live, onSubmit, maxLen }) {
    const limit = maxLen || 8;
    let value = "";
    let showValue = !!live;
    let busy = false; // ikki marta tez bosish bitta javob bo'lsin
    const text = ui.h("span", { class: "rkb-text" });
    const val = ui.h("span", { class: "rkb-val" });
    const display = ui.h("div", { class: "rkb-display", "aria-live": "polite" }, text, val);

    function render() {
      text.innerHTML = "";
      if (value) text.append(word(value, "sm"));
      val.textContent = showValue && value ? `= ${roman.fromRoman(value)}` : "";
    }

    function press(key) {
      if (key === "ok") {
        if (!value || busy) return;
        busy = true;
        setTimeout(() => { busy = false; }, 400);
        onSubmit(value);
        return;
      }
      if (key === "del") value = value.slice(0, -1);
      else if (value.length < limit) value += key;
      else return;
      sound.play("tap");
      render();
    }

    function onKey(e) {
      if (!wrap.isConnected) { // klaviatura ekrandan olingan — endi tinglamaymiz
        cleanup();
        return;
      }
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (roman.KEYS.includes(key)) press(key);
      else if (key === "Backspace") press("del");
      else if (key === "Enter") {
        e.preventDefault();
        press("ok");
      }
    }
    const cleanup = () => document.removeEventListener("keydown", onKey);
    document.addEventListener("keydown", onKey);
    ui.onCleanup(cleanup);

    const keys = ui.h("div", { class: "rkb" });
    roman.KEYS.forEach((k) => keys.append(ui.h("button", { class: "key sym", type: "button", text: k, "aria-label": k, onClick: () => press(k) })));
    keys.append(ui.h("button", { class: "key del", type: "button", text: "⌫", "aria-label": "Oʻchirish", onClick: () => press("del") }));
    keys.append(ui.h("button", { class: "key ok", type: "button", text: "Tayyor", onClick: () => press("ok") }));
    const wrap = ui.h("div", { class: "rkb-wrap" }, display, keys);
    ui.clearControl();
    ui.control().append(wrap);
    render();

    return {
      get: () => value,
      setLive(on) {
        showValue = !!on;
        render();
      },
      shake() {
        display.classList.remove("shake");
        void display.offsetWidth; // animatsiyani qaytadan boshlash
        display.classList.add("shake");
      },
    };
  }

  // Rimliklar lagani: belgilar kattadan kichikka. set(yozuv, yangi) — yangi belgi "sakrab" chiqadi
  // ("*" — hamma belgi yangi).
  function tray(host) {
    let cur = "";
    const el = ui.h("div", { class: "tray", role: "img" });
    host.append(el);
    function set(str, fresh) {
      cur = str;
      el.innerHTML = "";
      let marked = false;
      for (const ch of str) {
        const tile = symbol(ch);
        if (fresh === "*" || (fresh === ch && !marked)) {
          tile.classList.add("fresh");
          marked = true;
        }
        el.append(tile);
      }
      el.setAttribute("aria-label", `Laganda: ${[...str].join(" ")}`);
    }
    set("");
    return {
      get: () => cur,
      set,
      shake() {
        el.classList.remove("shake");
        void el.offsetWidth;
        el.classList.add("shake");
      },
    };
  }

  // Lagan qoidalari tugmalari (boshqaruv zonasida). extra — pastdagi qo'shimcha tugma ("Tayyor").
  // highlight(yozuv) — shu yozuvga qo'llanadigan qoidalar yonadi.
  function ruleButtons(onRule, extra) {
    const grid = ui.h("div", { class: "rules" });
    const buttons = roman.RULES.map((rule) => {
      const b = ui.h("button", {
        class: "key rule",
        type: "button",
        text: roman.ruleLabel(rule),
        onClick: () => onRule(rule),
      });
      grid.append(b);
      return b;
    });
    ui.clearControl();
    ui.control().append(grid);
    if (extra) ui.control().append(extra);
    return {
      highlight(str) {
        buttons.forEach((b, i) => b.classList.toggle("hl", roman.applyRule(str, roman.RULES[i]) !== null));
      },
    };
  }

  // Oddiy son xonalarda: tepada xona nomi, pastda qiymati
  function placeView(host, number, opts) {
    const state = { number, labels: !!(opts && opts.labels), values: !!(opts && opts.values), hl: -1 };
    const el = ui.h("div", { class: "pv" });
    host.append(el);
    function render() {
      el.innerHTML = "";
      roman.places(state.number).forEach((part, i) => {
        el.append(ui.h("div", { class: "pv-col" + (state.hl === i ? " hl" : "") },
          ui.h("div", { class: "pv-label", text: state.labels ? PLACE_NAMES[part.place] : "" }),
          ui.h("div", { class: "pv-digit", text: String(part.digit) }),
          ui.h("div", { class: "pv-val", text: state.values ? String(part.value) : "" })));
      });
    }
    render();
    return {
      set(n) {
        state.number = n;
        render();
      },
      showLabels() {
        state.labels = true;
        render();
      },
      showValues() {
        state.values = true;
        render();
      },
      highlight(i) {
        state.hl = i;
        render();
      },
    };
  }

  QK.romanUi = { PLACE_NAMES, symbol, word, breakdown, keyboard, tray, ruleButtons, placeView };
})(window);
```

- [ ] **2-qadam: sintaksis tekshiruvi**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && node --check js/roman-ui.js
```

---

### 5-vazifa: Sahnalar — umumiy qismlar va 1-bosqich

- [ ] **1-qadam: `js/scenes/common.js`**

```js
// Rim toshi: umumiy sahna qismlari — xato izohlari, tosh, misol satri, Rim yozuvida javob.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound, art, romanUi, practice } = QK;

  // Qiymati to'g'ri, lekin yozuvi nostandart bo'lganda (roman.mistake)
  const MISTAKE = {
    repeat: "Qiymati toʻgʻri! Lekin bir belgi 3 martadan koʻp yozilmaydi: IIII emas — IV.",
    twice: "Qiymati toʻgʻri! Lekin V va L ikki marta yozilmaydi: VV emas — X.",
    subtract: "Qiymati toʻgʻri! Lekin ayirishda faqat IV, IX, XL, XC ishlatiladi.",
  };

  // Tosh lavha va ustidagi yozuv (rasm ichida matn yo'q — yozuv HTML'da)
  const stone = (text) => ui.h("div", { class: "stone" },
    ui.h("div", { class: "stone-art", html: art.stone() }),
    ui.h("div", { class: "stone-text", text }));

  // Misol satri: XII + VIII = ? (natija berilsa — javob bilan)
  const expr = (a, op, b, result) => ui.h("div", { class: "expr" },
    romanUi.word(a),
    ui.h("span", { text: op }),
    romanUi.word(b),
    ui.h("span", { text: "=" }),
    result ? romanUi.word(result) : ui.h("span", { text: "?" }));

  const answerLine = (text) => ui.h("div", { class: "answer", text });

  // Yozish maslahati: 42 = 40 + 2 (bir xonali sonlarda — jonli qiymatga ishora)
  function partsHint(n) {
    const parts = roman.partsOf(n);
    if (parts.length > 1) return `↻ ${n} = ${parts.join(" + ")}. Avval ${parts[0]} ni, keyin ${parts[1]} ni yoz.`;
    return `↻ Yozuving yonida qiymati koʻrinadi. ${n} boʻlguncha tuzat.`;
  }

  // O'rgatish qismi: to'g'ri yozilguncha davom etadi, jonli qiymat yoniq (xato hisoblanmaydi)
  async function buildUntil(target, lead) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const answer = roman.toRoman(target);
    const box = ui.h("div", { class: "rbox" }, ui.h("div", { class: "target", text: String(target) }));
    ui.work().append(box);
    ui.bubble("elder", lead);
    let wrong = 0;
    await ui.settle((done) => {
      romanUi.keyboard({
        live: true,
        onSubmit: (value) => {
          if (value === answer) {
            done();
            return;
          }
          sound.play("retry");
          ui.pose("apprentice", "think", 1000);
          wrong++;
          if (roman.fromRoman(value) === target) ui.bubble("elder", "↻ " + MISTAKE[roman.mistake(value)]);
          else if (wrong === 1) ui.bubble("elder", `↻ Hozir ${roman.fromRoman(value)}. ${target} kerak — kattasidan boshla.`);
          else ui.bubble("elder", `↻ ${target} = ${answer}. Shuni yoz.`);
        },
      });
    });
    sound.play("correct");
    ui.pose("apprentice", "happy", 900);
    ui.clearControl();
    box.append(romanUi.word(answer, "lg"));
  }

  // Mashqda javob Rim yozuvida: 1-xato — jonli qiymat yoqiladi va maslahat beriladi
  // (qiymati to'g'ri, yozuvi nostandart bo'lsa — maxsus izoh), 2-xato — solution(javob).
  function romanAnswer({ target, hint, solution }) {
    const answer = roman.toRoman(target);
    let kb = null;
    return practice.tries({
      setup: (submit) => { kb = romanUi.keyboard({ live: false, onSubmit: submit }); },
      check: (value) => value === answer,
      hint: (value) => {
        kb.setLive(true);
        kb.shake();
        if (roman.fromRoman(value) === target) ui.bubble("elder", "↻ " + MISTAKE[roman.mistake(value)]);
        else hint(value);
      },
      solution: () => solution(answer),
    });
  }

  // O'rgatish qismidagi hisob: to'g'ri javobgacha raqam klaviaturasi
  async function askUntil(answer, hintText) {
    for (;;) {
      const value = await ui.askNumber(3);
      if (value === answer) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        return;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      ui.bubble("elder", "↻ " + hintText);
    }
  }

  QK.common = { MISTAKE, stone, expr, answerLine, partsHint, buildUntil, romanAnswer, askUntil };
})(window);
```

- [ ] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: Rim raqamlarini o'qish va yozish (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound, romanUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(common.stone("XII  XXVI"));
    await ui.say("elder", "Qabila qadimgi tosh topdi!");
    await ui.say("apprentice", "Unda gʻalati belgilar bor: XII, XXVI…");
    await ui.say("elder", "Bular — Rim raqamlari. Sezar askarlari shunday yozgan.");
  }

  // 4.1: belgilar — bola har birini bosib qiymatini ochadi
  async function symbols() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const grid = ui.h("div", { class: "cards5" });
    ui.work().append(grid);
    ui.bubble("elder", "Rimliklarda 5 ta asosiy belgi bor. Har birini bos — qanday son ekan?");
    await ui.settle((done) => {
      let opened = 0;
      roman.KEYS.forEach((ch) => {
        const val = ui.h("span", { class: "sym-val", text: "?" });
        const card = ui.h("button", { class: "sym-card", type: "button", "aria-label": ch }, romanUi.symbol(ch, "lg"), val);
        card.addEventListener("click", () => {
          if (card.classList.contains("open")) return;
          card.classList.add("open");
          sound.play("tap");
          val.textContent = String(roman.VALUES[ch]);
          opened++;
          if (opened === roman.KEYS.length) setTimeout(done, 500);
        });
        grid.append(card);
      });
    });
    await ui.say("elder", "I — 1, V — 5, X — 10, L — 50, C — 100.");
    await ui.say("elder", "I — bitta barmoq, V — ochiq qoʻl, X — ikki qoʻl.");
  }

  // 4.2: qo'shish qoidasi, keyin 7, 12, 26 ni yasash
  async function additionRule() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "rbox" },
      romanUi.breakdown("VII"),
      ui.h("div", { class: "formula-row", text: "VII = 5 + 1 + 1 = 7" })));
    await ui.say("elder", "Belgilar kattadan kichikka yozilsa — qoʻshiladi: VII = 5 + 1 + 1.");
    for (const n of [7, 12, 26]) {
      await common.buildUntil(n, `${n} ni yasa. Kattasidan boshla — yozuving yonida qiymati koʻrinadi.`);
      const r = roman.toRoman(n);
      await ui.say("elder", `✓ ${r} = ${roman.symbolValues(r).join(" + ")} = ${n}.`);
    }
  }

  // 4.3: ayirish qoidasi, keyin 4 va 40 ni yasash
  async function subtractionRule() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" },
      romanUi.word("IV", "lg"),
      ui.h("div", { class: "formula-row", text: "IV = 5 − 1 = 4" }));
    ui.work().append(box);
    await ui.say("elder", "Kichik belgi kattasidan oldin tursa — ayiriladi: IV = 5 − 1 = 4.");
    box.innerHTML = "";
    const pairs = ui.h("div", { class: "pairs" });
    for (const p of ["IV", "IX", "XL", "XC"]) pairs.append(romanUi.breakdown(p, { grouped: true }));
    box.append(pairs);
    await ui.say("elder", "Bunday juftlik faqat 4 ta: IV, IX, XL, XC.");
    await ui.say("elder", "Bir belgi 3 martadan koʻp takrorlanmaydi: IIII emas — IV.");
    await common.buildUntil(4, "4 ni yasa.");
    await ui.say("elder", "✓ IV = 5 − 1 = 4.");
    await common.buildUntil(40, "Endi 40 ni yasa. Oʻnliklarda ham xuddi shunday!");
    await ui.say("elder", "✓ XL = 50 − 10 = 40.");
  }

  // 4.4: o'qish — toshdagi son raqam klaviaturasida
  function readTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" }, common.stone(task.roman));
    ui.work().append(box);
    ui.bubble("elder", `Toshda ${task.roman} yozilgan. Bu qaysi son?`);
    return practice.numberTries({
      answer: task.n,
      hint: () => {
        box.append(romanUi.breakdown(task.roman, { grouped: true }));
        ui.bubble("elder", "↻ Har guruh ostidagi qiymatlarni qoʻshib chiq.");
      },
      solution: () => {
        const parts = roman.tokens(task.roman);
        const line = common.answerLine(`${parts.map((p) => p.value).join(" + ")} = ${task.n}`);
        box.append(line);
        line.scrollIntoView({ block: "nearest" });
      },
    });
  }

  // 4.4: yozish — son Rim klaviaturasida
  function writeTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" }, ui.h("div", { class: "target", text: String(task.n) }));
    ui.work().append(box);
    ui.bubble("elder", `${task.n} ni Rim raqamida yoz.`);
    return common.romanAnswer({
      target: task.n,
      hint: () => ui.bubble("elder", common.partsHint(task.n)),
      solution: (answer) => {
        const line = common.answerLine(`${task.n} = ${answer}`);
        box.append(romanUi.word(answer, "lg"), line);
        line.scrollIntoView({ block: "nearest" });
      },
    });
  }

  async function stage1() {
    await symbols();
    await additionRule();
    await subtractionRule();
    await ui.say("elder", "Endi toshdagi sonlarni oʻqiymiz va yozamiz. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => roman.makeReadWriteTask(correct, prev),
      run: (task) => (task.type === "read" ? readTask(task) : writeTask(task)),
      praise: (task) => `${task.roman} = ${task.n}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [ ] **3-qadam: sintaksis tekshiruvi**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && node --check js/scenes/common.js && node --check js/scenes/stage1.js
```

---

### 6-vazifa: 2-bosqich — qo'shish va ayirish

- [ ] **1-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: Rimliklar usulida qo'shish, ayirish namoyishi, aylantirib hisoblash (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound, romanUi, practice, common } = QK;

  // Ayirish namoyishi: har qadamda lagan holati va nima olish kerakligi
  const MINUS_STEPS = [
    { tray: "XV", left: "VII", line: "Endi ayirish: XV − VII. Lagandan V, I, I ni olish kerak." },
    { tray: "X", left: "II", line: "V ni olib tashladik. Endi I, I kerak — lekin laganda I yoʻq!" },
    { tray: "VV", left: "II", line: "Rimliklar X ni ikkita V ga «sindirgan»." },
    { tray: "VIIIII", left: "II", line: "Bitta V ni esa beshta I ga sindirgan." },
    { tray: "VIII", left: "", line: "Mana, ikkita I ni ham olib tashladik. Laganda VIII qoldi." },
  ];

  // Qoida tugmasi: qo'llansa — lagan yangilanadi; qo'llanmasa — "yetarli emas"
  function applyOn(tray, rule) {
    const next = roman.applyRule(tray.get(), rule);
    if (!next) {
      sound.play("retry");
      ui.toast("Bunday belgilar yetarli emas.");
      return false;
    }
    sound.play("tap");
    tray.set(next, rule.to);
    return true;
  }

  // 5.1: XII + VIII — bola laganni o'zi tartibga soladi
  async function tidyDemo() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" }, common.expr("XII", "+", "VIII"));
    ui.work().append(box);
    const tray = romanUi.tray(box);
    await ui.say("elder", "Rimliklar qanday qoʻshgan? Ikki sonning belgilarini bitta laganga toʻplagan.");
    tray.set(roman.merge("XII", "VIII"), "*");
    await ui.say("elder", "Mana: X V I I I I I. Belgilar koʻp — ularni tartibga solish kerak.");
    ui.bubble("elder", "Beshta I — bitta V ga teng. Yonib turgan qoidani bos!");
    await ui.settle((done) => {
      const rules = romanUi.ruleButtons((rule) => {
        if (!applyOn(tray, rule)) return;
        if (roman.canTidy(tray.get())) {
          rules.highlight(tray.get());
          ui.bubble("elder", "Zoʻr! Yana tartibga solsa boʻladi.");
          return;
        }
        ui.clearControl();
        done();
      });
      rules.highlight(tray.get());
    });
    sound.play("correct");
    box.replaceChild(common.expr("XII", "+", "VIII", "XX"), box.firstChild);
    await ui.say("elder", "Tayyor: XII + VIII = XX. Rimliklar shunday qoʻshgan.");
  }

  // 5.2: xuddi shu misol oddiy sonlarda
  async function ordinary() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const line = ui.h("div", { class: "formula-row big", text: "12 + 8 = ?" });
    ui.work().append(ui.h("div", { class: "rbox" }, line));
    ui.bubble("elder", "Endi oʻzimizning sonlarda: 12 + 8 = ?");
    await common.askUntil(20, "12 ga 8 ni qoʻsh.");
    line.textContent = "12 + 8 = 20";
    await ui.say("elder", "Bir zumda! XII = 12, VIII = 8, XX = 20.");
  }

  // 5.3: XV − VII — bola kuzatadi, keyin oddiy sonlarda hisoblaydi
  async function minusDemo() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" }, common.expr("XV", "−", "VII"));
    ui.work().append(box);
    const tray = romanUi.tray(box);
    const left = ui.h("div", { class: "left-line" });
    box.append(left);
    for (const step of MINUS_STEPS) {
      tray.set(step.tray, "*");
      left.textContent = step.left ? `Olish kerak: ${[...step.left].join(" ")}` : "Hammasi olindi ✓";
      await ui.say("elder", step.line);
    }
    box.replaceChild(common.expr("XV", "−", "VII", "VIII"), box.firstChild);
    await ui.say("elder", "XV − VII = VIII, yaʼni 8. Rimliklar buni hisob taxtasida qilgan.");
    ui.clearWork();
    const line = ui.h("div", { class: "formula-row big", text: "15 − 7 = ?" });
    ui.work().append(ui.h("div", { class: "rbox" }, line));
    ui.bubble("elder", "Endi oʻzimizning sonlarda: 15 − 7 = ?");
    await common.askUntil(8, "15 dan 7 ni ayir.");
    line.textContent = "15 − 7 = 8";
    await ui.say("elder", "Oʻzimizning sonlarda hisoblash ancha oson!");
  }

  // 5.4: Rimliklar usulida qo'shish (lagan va qoidalar)
  function tidyTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const a = roman.toRoman(task.a);
    const b = roman.toRoman(task.b);
    const answer = roman.toRoman(task.answer);
    const box = ui.h("div", { class: "rbox" }, common.expr(a, "+", b));
    ui.work().append(box);
    const tray = romanUi.tray(box);
    tray.set(roman.merge(a, b), "*");
    ui.bubble("elder", "Rimliklar usulida qoʻsh: laganni tartibga sol, keyin «Tayyor»ni bos.");
    let rules = null;
    return practice.tries({
      setup: (submit) => {
        rules = romanUi.ruleButtons((rule) => applyOn(tray, rule), ui.button("Tayyor", () => submit(tray.get())));
      },
      check: (value) => !roman.canTidy(value),
      hint: () => {
        tray.shake();
        rules.highlight(tray.get());
        ui.bubble("elder", "↻ Hali tartibga solsa boʻladi. Yonib turgan qoidani bos.");
      },
      solution: () => {
        tray.set(roman.tidy(tray.get()), "*");
        box.append(common.answerLine(`${a} + ${b} = ${answer}`));
      },
    });
  }

  // 5.4: aylantirib hisoblash — javob Rim klaviaturasida
  function arithTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const a = roman.toRoman(task.a);
    const b = roman.toRoman(task.b);
    const plain = `${task.a} ${task.op} ${task.b} = ${task.answer}`;
    const box = ui.h("div", { class: "rbox" }, common.expr(a, task.op, b));
    ui.work().append(box);
    const note = ui.h("div", { class: "formula-row" });
    box.append(note);
    ui.bubble("elder", "Oddiy songa aylantirib hisobla, javobni Rim raqamida yoz.");
    return common.romanAnswer({
      target: task.answer,
      hint: () => {
        note.textContent = plain;
        ui.bubble("elder", `↻ ${a} = ${task.a}, ${b} = ${task.b}. ${plain}`);
      },
      solution: (answer) => {
        note.textContent = plain;
        const line = common.answerLine(`${task.answer} = ${answer}`);
        box.append(line);
        line.scrollIntoView({ block: "nearest" });
      },
    });
  }

  async function stage2() {
    await tidyDemo();
    await ordinary();
    await minusDemo();
    await ui.say("elder", "Endi oʻzing hisobla: goh lagan bilan, goh oddiy sonlarda. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev, correct) => roman.makeCalcTask(correct, prev),
      run: (task) => (task.type === "tidy" ? tidyTask(task) : arithTask(task)),
      praise: (task) => `${roman.toRoman(task.a)} ${task.op} ${roman.toRoman(task.b)} = ${roman.toRoman(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [ ] **2-qadam: sintaksis tekshiruvi**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && node --check js/scenes/stage2.js
```

---

### 7-vazifa: 3-bosqich, tabrik va yakuniy tekshiruv

- [ ] **1-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: pozitsion va nopozitsion tizim, xonalar mashqi, al-Xorazmiy hikoyasi (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, art, romanUi, practice, common } = QK;

  // Hikoya: art — rasm (QK.art.story), caption — rasm ostidagi yozuv, lines — Oqsoqol gaplari
  const SCENES = [
    { art: "abacus", lines: ["Rimliklar hisobni hisob taxtasida qilgan.", "Rim raqamlari esa asosan yozib qoʻyish uchun edi."] },
    { art: "scroll", caption: "0 1 2 3 4 5 6 7 8 9", lines: ["Hindistonda 0 va oʻnlik pozitsion sonlar paydo boʻldi."] },
    { art: "scholar", caption: "Muhammad al-Xorazmiy", lines: ["Xorazmlik buyuk olim Muhammad al-Xorazmiy bu sonlar haqida kitob yozdi.", "Kitob Yevropaga yetib bordi va dunyo shu sonlarni ishlata boshladi."] },
    { art: "computer", caption: "algoritm", lines: ["«Algoritm» soʻzi al-Xorazmiy nomidan kelib chiqqan.", "Algoritm — ishni qadamma-qadam bajarish tartibi. Kompyuterlar ham shu bilan ishlaydi!"] },
  ];

  // 6.1: yoyilma — 352 va XXVII
  async function expand() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, 352, { labels: true });
    await ui.say("elder", "352 da 3 ta yuz, 5 ta oʻn va 2 ta bir bor.");
    view.showValues();
    box.append(ui.h("div", { class: "formula-row", text: "352 = 300 + 50 + 2" }));
    await ui.say("elder", "Har bir raqam turgan xonasiga qarab qiymat oladi.");
    box.innerHTML = "";
    box.append(romanUi.breakdown("XXVII"), ui.h("div", { class: "formula-row", text: "XXVII = 10 + 10 + 5 + 1 + 1 = 27" }));
    await ui.say("elder", "Rimda esa har bir belgining oʻz qiymati bor.");
  }

  // 6.2: tajriba — 5 va 2 joy almashadi
  async function swap() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, 352, { labels: true, values: true });
    view.highlight(1);
    ui.bubble("elder", "«Almashtir»ni bos: 5 va 2 joy almashadi. 5 ga nima boʻladi?");
    await ui.settle((done) => {
      ui.control().append(ui.button("Almashtir", () => {
        ui.clearControl();
        done();
      }));
    });
    view.set(325);
    view.highlight(2);
    await ui.say("elder", "5 raqami oʻnlar xonasida 50 edi, birlar xonasida esa 5!");
    await ui.say("elder", "Raqam qiymati turgan xonasiga bogʻliq — bu pozitsion tizim.");
    box.innerHTML = "";
    const row = ui.h("div", { class: "pairs" });
    for (const w of ["XV", "LX", "XXX"]) row.append(romanUi.breakdown(w, { mark: "X" }));
    box.append(row);
    await ui.say("elder", "Rimda X qayerda tursa ham 10 — bu nopozitsion tizim.");
  }

  // 6.3: nol nega kerak
  async function zero() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, 105, { labels: true, values: true });
    view.highlight(1);
    await ui.say("elder", "105 da 0 oʻnlar xonasini band qilib turadi.");
    romanUi.placeView(box, 15, { labels: true, values: true });
    await ui.say("elder", "0 boʻlmasa, 1 va 5 yonma-yon turib, 15 boʻlib qolardi!");
    box.innerHTML = "";
    box.append(romanUi.breakdown("CV"), ui.h("div", { class: "formula-row", text: "CV = 100 + 5 = 105" }));
    await ui.say("elder", "Rimda nol yoʻq: 105 — CV.");
  }

  // 6.4: "{352} sonidagi {5} raqami nechaga teng?"
  function placeTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, task.number);
    ui.bubble("elder", `${task.number} sonidagi ${task.digit} raqami nechaga teng?`);
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        view.showLabels();
        view.highlight(task.index);
        ui.bubble("elder", `↻ ${task.digit} qaysi xonada turibdi: yuzlarmi, oʻnlarmi, birlarmi?`);
      },
      solution: () => {
        view.showValues();
        view.highlight(task.index);
        box.append(common.answerLine(`${task.digit} — ${romanUi.PLACE_NAMES[task.place]} xonasida: ${task.answer}`));
      },
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: art.story(scene.art) }),
      scene.caption ? ui.h("div", { class: "story-caption", text: scene.caption }) : null));
    for (const line of scene.lines) await ui.say("elder", line);
  }

  // Joriy yil Rim raqamida (M — 1000)
  async function yearScene() {
    const year = new Date().getFullYear();
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      common.stone(roman.toRoman(year)),
      ui.h("div", { class: "story-caption", text: String(year) })));
    await ui.say("elder", "M — 1000. Bu yil Rim raqamida shunday yoziladi!");
  }

  async function stage3() {
    await expand();
    await swap();
    await zero();
    await ui.say("elder", "Endi oʻzing: raqam qaysi xonada turibdi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => roman.makePlaceTask(prev),
      run: placeTask,
      praise: (task) => `${task.digit} — ${romanUi.PLACE_NAMES[task.place]} xonasida: ${task.answer}.`,
    });
    for (const scene of SCENES) await showScene(scene);
    await yearScene();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
```

- [ ] **2-qadam: `js/scenes/final.js`**

```js
// Bosqich tugashi va tabrik ekrani. 5-o'yinda finale yo'q — hikoya 3-bosqich ichida.
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
    ui.bubble("elder", "Tabriklayman! Endi sen Rim raqamlarini bilasan!");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { text: "I V X L C — 1 5 10 50 100" }),
      ui.h("div", { text: "Kichik belgi oldinda — ayiriladi: IV = 4" }),
      ui.h("div", { text: "Oddiy sonda raqam qiymati xonasiga bogʻliq" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
```

- [ ] **3-qadam: statik tekshiruv — sintaksis, `index.html` dagi fayllar, eksportlar**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && for f in $(grep -o 'src="[^"]*"' index.html | cut -d'"' -f2); do node --check "$f" || echo "XATO: $f"; test -f "$f" || echo "YOʻQ: $f"; done && grep -o 'href="[^"]*"' index.html | cut -d'"' -f2 | grep css | while read f; do test -f "$f" || echo "YOʻQ: $f"; done && echo "statik tekshiruv tugadi"
```

- [ ] **4-qadam: fayllar orasidagi chaqiruvlar mos kelishini tekshirish**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && python3 - <<'PY'
import re, pathlib
src = {p: p.read_text() for p in pathlib.Path("js").rglob("*.js")}
api = {}
for p, s in src.items():
    for m in re.finditer(r"QK\.(roman|romanUi|common|practice|art)\s*=\s*\{([^}]*)\}", s):
        api.setdefault(m.group(1), set()).update(n.strip().split(":")[0] for n in m.group(2).split(",") if n.strip())
api.setdefault("practice", set()).update({"PRAISE", "tries", "numberTries", "exercises"})
api.setdefault("art", set()).update({"elder", "apprentice", "drum", "icon", "stone", "story"})
api.setdefault("roman", set()).update(re.findall(r"^\s{4}([a-zA-Z0-9_]+)[,:]", src[pathlib.Path("js/roman.js")], re.M))
bad = []
for p, s in src.items():
    for obj, name in re.findall(r"\b(roman|romanUi|common|practice|art)\.([a-zA-Z0-9_]+)", s):
        if obj in api and name not in api[obj] and name not in {"length"}:
            bad.append(f"{p}: {obj}.{name}")
print("\n".join(sorted(set(bad))) or "eksportlar mos")
PY
```

- [ ] **5-qadam: barcha o'yinlar testlari (umumiy kod o'zgargan — QOIDALAR 9)**

```bash
cd /Users/bicoder/Documents/Information/oyinlar && for d in 0*/; do (cd "$d" && echo "== $d" && node --test tests/*.test.js 2>&1 | grep -E "^# (pass|fail)"); done
```

- [ ] **6-qadam: brauzerda to'liq o'ynab chiqish**

Mahalliy server (Playwright `file://` ni ochmaydi), keyin 375×667 (tik), 360×640 (tor), 667×375 (yotiq), 1280×800 (kompyuter) da:
kirish → 1-bosqich (belgilar, 7/12/26, 4/40, 3 ta mashq) → 2-bosqich (lagan, 12+8, ayirish namoyishi, 3 ta mashq) → 3-bosqich (352/325, nol, 3 ta mashq, hikoya, yil) → tabrik.
Har ekranda: gorizontal scroll yo'q, tugmalar ko'rinadi, konsolda xato yo'q. Javoblarni `QK.current` dan olish mumkin.

```bash
cd /Users/bicoder/Documents/Information/oyinlar && python3 -m http.server 8777 >/dev/null 2>&1 &
sleep 1 && echo "http://localhost:8777/05-rim-toshi/"
```

- [ ] **7-qadam: yakuniy kod ko'rigi (opus) va tuzatishlar**

Ko'rik: QOIDALAR (matn belgilar, 48×48, 18 px, 360 px, qizil yo'q, 2 gap), sahna oqimi (newRun, settle), xotira (listener'lar), tasodifiy misollar chegaralari, telefon/yotiq joylashuv.

- [ ] **8-qadam: `DIZAYN.md` holatini yangilash va commit**

```bash
cd /Users/bicoder/Documents/Information/oyinlar/05-rim-toshi && python3 - <<'PY'
import pathlib
p = pathlib.Path("DIZAYN.md"); s = p.read_text()
p.write_text(s.replace("**Holati:** tasdiqlangan (2026-09-19)", "**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda"))
PY
cd /Users/bicoder/Documents/Information && git add -A && git commit -m "05-rim-toshi: 3-bosqich, tabrik va yakuniy tuzatishlar" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **9-qadam: main'ga birlashtirish**

```bash
cd /Users/bicoder/Documents/Information && git checkout main && git merge --no-ff oyin/05-rim-toshi -m "05-rim-toshi: Rim raqamlari oʻyini" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" && git branch -d oyin/05-rim-toshi && git log --oneline | head -3
```
