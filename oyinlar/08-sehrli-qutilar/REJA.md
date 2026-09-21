# 08 — Sehrli qutilar: ish rejasi

**Maqsad:** 8-o'yin: mukofot bilan o'rganish — robot toshlar o'yinini o'ynab, munchoqli qutilar orqali o'rganadi.

**Arxitektura:** oldingi o'yinlardagidek: `window.QK`, oddiy `<script>`, umumiy `oyinlar/umumiy/`. Sof hisob `js/boxes.js` (Node testlari), ekran qismlari `js/boxes-ui.js`, rasmlar `js/game-art.js`, sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi; bloklar tayyor fayllardan olingan (TDD: avval `tests/boxes.test.js`, keyin `js/boxes.js`).

## Nomlar va interfeyslar

- `QK.boxes`: `START` (7), `BEADS` (2), `COLORS`, `legalMoves(n)`, `isWin(n, move)`, `winningMove(n)`, `newBoxes()`, `pickMove(boxes, n, rng)`, `randomOpponent`, `playGame(boxes, rng, opponent)` → `{history, won}`, `reward(boxes, history, won)`, `trainGames(boxes, rounds, rng, opponent)`, `makeBoxTask`, `makeBeadTask`, `makeRewardTask`, `makeUsedTask`, `makeReadTask`, `makeStrategyTask`, `makeStage1Task(k, prev)`, `makeStage2Task`, `makeStage3Task`.
- `QK.boxesUi`: `COLOR_NAME`, `stones(host, n)` → `{set}`, `boxCard(n, box, opts)`, `boxRow(host, opts)` → `{set(state, list), highlight(n), flash(n)}`, `resultLine(host)` → `{add, set, count}`, `moveButtons(n, onPick)`, `optionButtons(options, onPick, labels?)`, `beadChip(move)`.
- `QK.common`: `VISIBLE` ([7…2]), `box(compact)`, `answerLine`, `line`, `playRound(state, stonesView, boxView)` → `{history, won}`, `rewardStep(state, history, won, boxView)`.
- `QK.art.stone()`, `QK.art.box(state)`, `QK.art.story(name)`: `matchboxes | board | walker | star`.

---

### 1-vazifa: Hisob moduli (`js/boxes.js`) — TDD

- [x] **1-qadam: muvaffaqiyatsiz testlar — `tests/boxes.test.js`** (jumladan "robot o'ynab o'rganadi" testi)

```js
// boxes.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/boxes.js");

test("o'yin qoidasi: 7 tosh, 1 yoki 2 ta olinadi, oxirgisini olgan yutadi", () => {
  assert.equal(B.START, 7);
  assert.deepEqual(B.legalMoves(7), [1, 2]);
  assert.deepEqual(B.legalMoves(1), [1]);
  assert.equal(B.isWin(2, 2), true);
  assert.equal(B.isWin(3, 2), false);
});

test("winningMove: 3 ga karrali qoldirish", () => {
  assert.equal(B.winningMove(7), 1);
  assert.equal(B.winningMove(6), null);
  assert.equal(B.winningMove(5), 2);
  assert.equal(B.winningMove(4), 1);
  assert.equal(B.winningMove(3), null);
  assert.equal(B.winningMove(2), 2);
  assert.equal(B.winningMove(1), 1);
});

test("newBoxes: har holat uchun quti, har yurish uchun teng munchoq", () => {
  const boxes = B.newBoxes();
  assert.deepEqual(Object.keys(boxes).map(Number).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(boxes[7], { 1: B.BEADS, 2: B.BEADS });
  assert.deepEqual(boxes[1], { 1: B.BEADS });
});

test("pickMove: munchoqlar soniga mos ehtimol", () => {
  const boxes = B.newBoxes();
  boxes[5] = { 1: 9, 2: 1 };
  const seen = { 1: 0, 2: 0 };
  for (let i = 0; i < 2000; i++) seen[B.pickMove(boxes, 5, Math.random)]++;
  assert.ok(seen[1] > seen[2] * 3, "ko'p munchoqli yurish kam tanlandi");
  assert.ok(seen[2] > 20, "kam munchoqli yurish umuman tanlanmadi");
  assert.equal(B.pickMove(boxes, 1, Math.random), 1);
});

test("playGame: robot birinchi yuradi, tarix faqat robot yurishlari", () => {
  for (let i = 0; i < 200; i++) {
    const boxes = B.newBoxes();
    const game = B.playGame(boxes, Math.random, B.randomOpponent);
    assert.ok(game.history.length >= 1);
    for (const step of game.history) {
      assert.ok(step.n >= 1 && step.n <= 7);
      assert.ok(B.legalMoves(step.n).includes(step.move));
    }
    assert.equal(typeof game.won, "boolean");
    assert.equal(game.history[0].n, 7, "robot 7 toshdan boshlaydi");
  }
});

test("reward: yutsa munchoq qo'shiladi, yutqazsa olinadi (kamida 1 qoladi)", () => {
  const boxes = B.newBoxes();
  B.reward(boxes, [{ n: 7, move: 1 }, { n: 4, move: 1 }], true);
  assert.equal(boxes[7][1], B.BEADS + 1);
  assert.equal(boxes[4][1], B.BEADS + 1);
  assert.equal(boxes[7][2], B.BEADS, "ishlatilmagan munchoq o'zgarmaydi");
  const small = { 3: { 1: 1, 2: 2 } };
  B.reward(small, [{ n: 3, move: 1 }], false);
  assert.equal(small[3][1], 1, "oxirgi munchoq olinmaydi");
  B.reward(small, [{ n: 3, move: 2 }], false);
  assert.equal(small[3][2], 1);
});

test("trainGames: robot o'ynab o'rganadi — yutuqlar ko'payadi", () => {
  let firstSum = 0;
  let lastSum = 0;
  let correct7 = 0;
  const runs = 5;
  for (let run = 0; run < runs; run++) {
    const boxes = B.newBoxes();
    const results = B.trainGames(boxes, 80, Math.random, B.randomOpponent);
    assert.equal(results.length, 80);
    firstSum += results.slice(0, 20).filter(Boolean).length;
    lastSum += results.slice(-20).filter(Boolean).length;
    if (boxes[7][1] > boxes[7][2]) correct7++;
  }
  assert.ok(lastSum > firstSum + runs * 3, `yutuqlar oʻsmadi: ${firstSum} → ${lastSum}`);
  assert.ok(correct7 >= 4, `7 li qutida toʻgʻri yurish ${correct7}/${runs} tasida ustun`);
});

test("makeBoxTask: javob — hozirgi toshlar soni", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = B.makeBoxTask(prev);
    assert.equal(task.type, "box");
    assert.equal(task.options[task.answer], task.n);
    assert.equal(new Set(task.options).size, 3);
    if (prev) assert.notEqual(task.n, prev.n);
    prev = task;
  }
});

test("makeBeadTask: ko'k — 1 ta, sariq — 2 ta", () => {
  let prev = null;
  for (let i = 0; i < 100; i++) {
    const task = B.makeBeadTask(prev);
    assert.equal(task.type, "bead");
    assert.equal(task.answer, task.color === "kok" ? 1 : 2);
    prev = task;
  }
});

test("makeRewardTask: yutsa qo'shiladi, yutqazsa olinadi", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = B.makeRewardTask(prev);
    assert.equal(task.type, "reward");
    assert.equal(task.options[task.answer], task.won ? "qoʻshiladi" : "olinadi");
    assert.equal(task.options.length, 3);
    prev = task;
  }
});

test("makeUsedTask: yutqazganda o'zi tortgan munchoq olinadi", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = B.makeUsedTask(prev);
    assert.equal(task.type, "used");
    assert.equal(task.options[task.answer], task.color);
    assert.equal(task.options.length, 3);
    assert.ok(task.n >= 2 && task.n <= 7);
    prev = task;
  }
});

test("makeReadTask: ko'p munchoqli yurish", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = B.makeReadTask(prev);
    assert.equal(task.type, "read");
    assert.notEqual(task.blue, task.yellow);
    assert.equal(task.answer, task.blue > task.yellow ? 1 : 2);
    prev = task;
  }
});

test("makeStrategyTask: 3 ga karrali qoldiradigan yurish", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = B.makeStrategyTask(prev);
    assert.equal(task.type, "strategy");
    assert.notEqual(task.n % 3, 0, "3 ga karrali holatda yutuqli yurish yo'q");
    assert.equal(task.answer, B.winningMove(task.n));
    assert.equal((task.n - task.answer) % 3, 0);
    prev = task;
  }
});

test("bosqich mashqlari: turlar navbat bilan keladi", () => {
  assert.equal(B.makeStage1Task(0, null).type, "box");
  assert.equal(B.makeStage1Task(1, null).type, "bead");
  assert.equal(B.makeStage2Task(0, null).type, "reward");
  assert.equal(B.makeStage2Task(1, null).type, "used");
  assert.equal(B.makeStage3Task(0, null).type, "read");
  assert.equal(B.makeStage3Task(1, null).type, "strategy");
});
```

- [x] **2-qadam: `js/boxes.js`**

```js
// Sehrli qutilar — sof hisob: toshlar o'yini, munchoqli qutilar, mukofot, o'qitish, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const START = 7;   // boshlang'ich toshlar
  const MOVES = [1, 2];
  const BEADS = 2;   // har qutidagi boshlang'ich munchoqlar
  const COLORS = { 1: "kok", 2: "sariq" }; // 1 ta ol — ko'k, 2 ta ol — sariq

  const legalMoves = (n) => MOVES.filter((m) => m <= n);
  const isWin = (n, move) => n - move === 0;

  // Yutuqli yurish: raqibga 3 ga karrali qoldirish (3 ga karrali holatda — yo'q)
  const winningMove = (n) => (n % 3 === 0 ? null : n % 3);

  // Har holat uchun bitta quti, har yurish uchun teng munchoq
  function newBoxes(start) {
    const boxes = {};
    for (let n = 1; n <= (start || START); n++) {
      boxes[n] = {};
      for (const move of legalMoves(n)) boxes[n][move] = BEADS;
    }
    return boxes;
  }

  // Munchoqlar soniga mos tasodifiy tanlov
  function pickMove(boxes, n, rng) {
    const box = boxes[n] || {};
    const moves = Object.keys(box).map(Number).filter((m) => box[m] > 0);
    if (!moves.length) return legalMoves(n)[0];
    const total = moves.reduce((sum, m) => sum + box[m], 0);
    let r = (rng || Math.random)() * total;
    for (const move of moves) {
      r -= box[move];
      if (r < 0) return move;
    }
    return moves[moves.length - 1];
  }

  const randomOpponent = (n, rng) => {
    const moves = legalMoves(n);
    return moves[Math.floor((rng || Math.random)() * moves.length)];
  };

  // Bitta o'yin: robot birinchi yuradi. history — faqat robotning yurishlari.
  function playGame(boxes, rng, opponent) {
    let n = START;
    const history = [];
    let robotTurn = true;
    for (;;) {
      if (robotTurn) {
        const move = pickMove(boxes, n, rng);
        history.push({ n, move });
        n -= move;
        if (n === 0) return { history, won: true };
      } else {
        n -= (opponent || randomOpponent)(n, rng);
        if (n === 0) return { history, won: false };
      }
      robotTurn = !robotTurn;
    }
  }

  // Mukofot: yutsa +1 munchoq, yutqazsa −1 (kamida 1 qoladi)
  function reward(boxes, history, won) {
    for (const step of history) {
      const box = boxes[step.n];
      if (!box) continue;
      if (won) box[step.move] += 1;
      else box[step.move] = Math.max(1, box[step.move] - 1);
    }
    return boxes;
  }

  // N ta o'yin: har birida mukofot beriladi. Natija — yutuqlar ro'yxati.
  function trainGames(boxes, rounds, rng, opponent) {
    const results = [];
    for (let k = 0; k < rounds; k++) {
      const game = playGame(boxes, rng, opponent);
      reward(boxes, game.history, game.won);
      results.push(game.won);
    }
    return results;
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

  // "Hozir {n} tosh qoldi — robot qaysi qutini ochadi?"
  function makeBoxTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const n = randInt(2, 7, rng);
      if (prev && prev.n === n) continue;
      const others = [1, 2, 3, 4, 5, 6, 7].filter((x) => x !== n);
      const options = shuffle([n].concat(shuffle(others, rng).slice(0, 2)), rng);
      return { type: "box", n, options, answer: options.indexOf(n) };
    }
  }

  // "Robot {rang} munchoq tortdi — nechta tosh oladi?"
  function makeBeadTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const move = pick([1, 2], rng);
      if (prev && prev.type === "bead" && prev.answer === move) continue;
      return { type: "bead", color: COLORS[move], answer: move, options: [1, 2] };
    }
  }

  // "Robot yutdi/yutqazdi — munchoqlarga nima bo'ladi?"
  function makeRewardTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const won = rng() < 0.5;
      if (prev && prev.type === "reward" && prev.won === won) continue;
      const options = shuffle(["qoʻshiladi", "olinadi", "oʻzgarmaydi"], rng);
      return { type: "reward", won, options, answer: options.indexOf(won ? "qoʻshiladi" : "olinadi") };
    }
  }

  // "Yutqazdi. {n} li qutida {rang} munchoq tortgan edi — qaysisi olinadi?"
  function makeUsedTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const n = randInt(2, 7, rng);
      const color = pick(["kok", "sariq"], rng);
      if (prev && prev.type === "used" && prev.n === n && prev.color === color) continue;
      const options = shuffle(["kok", "sariq", "ikkalasi"], rng);
      return { type: "used", n, color, options, answer: options.indexOf(color) };
    }
  }

  // "Qutida ko'k {a} ta, sariq {b} ta — robot ko'pincha nima qiladi?"
  function makeReadTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const blue = randInt(1, 8, rng);
      const yellow = randInt(1, 8, rng);
      if (blue === yellow) continue;
      if (prev && prev.type === "read" && prev.blue === blue && prev.yellow === yellow) continue;
      return { type: "read", blue, yellow, answer: blue > yellow ? 1 : 2, options: [1, 2] };
    }
  }

  // "{n} tosh qolganda nechta olsa yutadi?"
  function makeStrategyTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const n = pick([2, 4, 5, 7], rng);
      if (prev && prev.type === "strategy" && prev.n === n) continue;
      return { type: "strategy", n, answer: winningMove(n), options: [1, 2] };
    }
  }

  const makeStage1Task = (k, prev, rng) => {
    rng = rng || Math.random;
    const useBox = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useBox ? makeBoxTask(prev, rng) : makeBeadTask(prev, rng);
  };

  const makeStage2Task = (k, prev, rng) => {
    rng = rng || Math.random;
    const useReward = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useReward ? makeRewardTask(prev, rng) : makeUsedTask(prev, rng);
  };

  const makeStage3Task = (k, prev, rng) => {
    rng = rng || Math.random;
    const useRead = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useRead ? makeReadTask(prev, rng) : makeStrategyTask(prev, rng);
  };

  const api = {
    START, MOVES, BEADS, COLORS,
    legalMoves, isWin, winningMove, newBoxes, pickMove, randomOpponent, playGame, reward, trainGames,
    makeBoxTask, makeBeadTask, makeRewardTask, makeUsedTask, makeReadTask, makeStrategyTask,
    makeStage1Task, makeStage2Task, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.boxes = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

---

### 2-vazifa: Rasmlar va ekran qismlari

- [x] **1-qadam: `js/game-art.js`**

```js
// 8-o'yinga xos SVG rasmlar: tosh, quti va hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const WOOD = "#C9945A";

  // Tosh
  const stone = () => `<svg viewBox="0 0 40 32" aria-hidden="true">
  <path d="M4 22 Q2 10 14 6 Q26 1 34 8 Q40 14 36 22 Q30 30 18 30 Q8 30 4 22 Z" fill="#B5AFA1" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M12 12 Q18 9 24 12" stroke="#D6D0C2" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

  // Quti: "closed" — yopiq, "open" — tortmasi chiqqan
  function box(state) {
    if (state === "open") {
      return `<svg viewBox="0 0 80 56" aria-hidden="true">
  <rect x="4" y="16" width="52" height="34" rx="5" fill="#F4E3C3" stroke="${INK}" stroke-width="3"/>
  <rect x="26" y="6" width="50" height="34" rx="5" fill="${WOOD}" stroke="${INK}" stroke-width="3"/>
  <rect x="34" y="14" width="34" height="18" rx="3" fill="#B07A44"/>
</svg>`;
    }
    return `<svg viewBox="0 0 80 56" aria-hidden="true">
  <rect x="8" y="8" width="64" height="40" rx="6" fill="${WOOD}" stroke="${INK}" stroke-width="3"/>
  <rect x="18" y="18" width="44" height="20" rx="4" fill="#B07A44"/>
</svg>`;
  }

  // 1961-yildagi mashina: ko'p gugurt qutisi
  function matchboxes() {
    let out = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        out += `<rect x="${16 + c * 34}" y="${16 + r * 30}" width="30" height="24" rx="4" fill="${WOOD}" stroke="${INK}" stroke-width="2.5"/>`;
        out += `<rect x="${22 + c * 34}" y="${22 + r * 30}" width="18" height="12" rx="2" fill="#B07A44"/>`;
      }
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">${out}</svg>`;
  }

  // O'yin taxtasi (shaxmat/Go)
  function board() {
    let cells = "";
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        cells += `<rect x="${28 + c * 24}" y="${10 + r * 16}" width="24" height="16" fill="${(r + c) % 2 ? "#E8DCC0" : "#C9B48E"}"/>`;
      }
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">
  ${cells}
  <rect x="28" y="10" width="144" height="96" fill="none" stroke="${INK}" stroke-width="3"/>
  <circle cx="64" cy="42" r="9" fill="${INK}"/>
  <circle cx="112" cy="74" r="9" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <circle cx="136" cy="42" r="9" fill="${INK}"/>
</svg>`;
  }

  // Yurishni o'rganayotgan robot
  const walker = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="80" y="30" width="44" height="34" rx="10" fill="#B8C0C8" stroke="${INK}" stroke-width="3"/>
  <circle cx="94" cy="46" r="5" fill="#2F6FDE"/>
  <circle cx="110" cy="46" r="5" fill="#2F6FDE"/>
  <rect x="88" y="66" width="28" height="26" rx="6" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>
  <path d="M88 92 L78 110 M116 92 L128 110" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 60 Q46 50 40 36" stroke="#8A929A" stroke-width="4" fill="none" stroke-dasharray="5 5" stroke-linecap="round"/>
  <path d="M144 60 Q158 50 164 36" stroke="#8A929A" stroke-width="4" fill="none" stroke-dasharray="5 5" stroke-linecap="round"/>
  <rect x="20" y="110" width="160" height="6" rx="3" fill="#C9B48E"/>
</svg>`;

  // Mukofot: qo'l yulduz beradi
  const star = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M100 14 L114 52 L154 54 L122 78 L133 116 L100 94 L67 116 L78 78 L46 54 L86 52 Z" fill="#F0C040" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 108 Q44 92 62 96" stroke="#E2A77E" stroke-width="12" stroke-linecap="round" fill="none"/>
  <circle cx="66" cy="98" r="8" fill="#E2A77E" stroke="${INK}" stroke-width="2"/>
</svg>`;

  const STORY = { matchboxes: matchboxes(), board: board(), walker, star };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { stone, box, story });
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

test("tosh va quti rasmlari", () => {
  assert.match(art.stone(), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.box("closed"), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.box("open"), /^<svg[\s\S]*<\/svg>$/);
  assert.notEqual(art.box("open"), art.box("closed"));
});

test("hikoya rasmlari SVG va matnsiz", () => {
  for (const name of ["matchboxes", "board", "walker", "star"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
  assert.match(art.robot(), /^<svg[\s\S]*<\/svg>$/);
});

test("1961-yil mashinasi: 15 ta quti", () => {
  assert.equal((art.story("matchboxes").match(/rx="4"/g) || []).length, 15);
});
```

- [x] **3-qadam: `js/boxes-ui.js`**

```js
// Sehrli qutilar: toshlar qatori, munchoqli qutilar, natija chizig'i va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, sound, art } = QK;

  const COLOR_NAME = { kok: "koʻk", sariq: "sariq" };

  // Toshlar qatori
  function stones(host, start) {
    const el = ui.h("div", { class: "stones" });
    host.append(el);
    function set(n) {
      el.innerHTML = "";
      for (let k = 0; k < n; k++) el.append(ui.h("span", { class: "stone", html: art.stone() }));
      el.setAttribute("aria-label", `${n} ta tosh`);
    }
    set(start);
    return { el, set };
  }

  // Bitta quti: sarlavha (nechta tosh) va har yurish uchun munchoqlar
  function boxCard(n, box, opts) {
    const o = opts || {};
    const card = ui.h("div", { class: "mbox" + (o.compact ? " sm" : "") });
    card.append(ui.h("div", { class: "mbox-art", html: art.box(o.open ? "open" : "closed") }));
    card.append(ui.h("div", { class: "mbox-title", text: `${n} tosh` }));
    for (const move of Object.keys(box).map(Number)) {
      const row = ui.h("div", { class: "brow" });
      const dots = ui.h("span", { class: "beads" });
      const shown = Math.min(box[move], 8);
      for (let k = 0; k < shown; k++) dots.append(ui.h("span", { class: `bead ${boxes.COLORS[move]}` }));
      row.append(dots, ui.h("span", { class: "bn", text: String(box[move]) }));
      row.setAttribute("aria-label", `${COLOR_NAME[boxes.COLORS[move]]}: ${box[move]}`);
      card.append(row);
    }
    return card;
  }

  // Toshlarni stoldan tarafga "uchirish" (nusxa yasab, joyidan joyiga suradi)
  async function flyTo(nodes, target) {
    if (!nodes.length) return;
    const quick = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quick) {
      await ui.sleep(120);
      return;
    }
    const to = target.getBoundingClientRect();
    const clones = nodes.map((node) => {
      const box = node.getBoundingClientRect();
      const clone = node.cloneNode(true);
      clone.className = "stone flying";
      clone.style.left = `${box.left}px`;
      clone.style.top = `${box.top}px`;
      clone.style.width = `${box.width}px`;
      clone.style.height = `${box.height}px`;
      document.body.append(clone);
      node.style.visibility = "hidden";
      return { clone, box };
    });
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    clones.forEach(({ clone, box }, i) => {
      const dx = to.left + to.width / 2 - (box.left + box.width / 2);
      const dy = to.top + Math.min(to.height, 24) / 2 - (box.top + box.height / 2);
      clone.style.transitionDelay = `${i * 130}ms`;
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.62)`;
    });
    await ui.sleep(560 + nodes.length * 130);
    clones.forEach(({ clone }) => clone.remove());
  }

  // O'yin stoli: tepada navbat, o'rtada stoldagi toshlar, pastda ikki taraf (robot va bola) olgan toshlari
  function gameTable(host) {
    const turn = ui.h("div", { class: "turn", "aria-live": "polite" });
    const stonesRow = ui.h("div", { class: "stones" });
    const left = ui.h("div", { class: "left-n" });
    const sides = {};
    const makeSide = (who, label, svg) => {
      const mini = ui.h("div", { class: "mini" });
      const count = ui.h("span", { class: "tray-n", text: "0" });
      const win = ui.h("span", { class: "tray-win" });
      const side = ui.h("div", { class: "tray " + who },
        ui.h("div", { class: "tray-head" }, ui.h("span", { class: "tray-art", html: svg }), ui.h("span", { text: label })),
        mini,
        ui.h("div", { class: "tray-foot" }, count, ui.h("span", { class: "tray-lbl", text: "ta tosh" })),
        win);
      sides[who] = { side, mini, count, win, taken: 0, last: null };
      return side;
    };
    const el = ui.h("div", { class: "gtable" },
      turn,
      ui.h("div", { class: "stones-box" }, stonesRow, left),
      ui.h("div", { class: "trays" },
        makeSide("robot", "Robot", art.robot()),
        makeSide("me", "Sen", art.apprentice())));
    host.append(el);

    let onTable = 0;
    const drawStones = () => {
      stonesRow.innerHTML = "";
      for (let k = 0; k < onTable; k++) stonesRow.append(ui.h("span", { class: "stone", html: art.stone() }));
      left.textContent = `Stolda: ${onTable} ta tosh`;
      stonesRow.setAttribute("aria-label", `Stolda ${onTable} ta tosh`);
    };

    return {
      el,
      reset(n) {
        onTable = n;
        drawStones();
        for (const who of Object.keys(sides)) {
          sides[who].taken = 0;
          sides[who].last = null;
          sides[who].mini.innerHTML = "";
          sides[who].count.textContent = "0";
          sides[who].win.textContent = "";
          sides[who].side.classList.remove("winner");
        }
      },
      turn(who) {
        turn.textContent = who === "robot" ? "Navbat: Robot" : who === "me" ? "Navbat: SEN" : "";
        turn.className = "turn" + (who ? " " + who : "");
        sides.robot.side.classList.toggle("active", who === "robot");
        sides.me.side.classList.toggle("active", who === "me");
      },
      // Toshlarni olish: tosh stoldan o'sha tarafga uchib o'tadi
      async take(who, count) {
        const side = sides[who];
        const taken = [...stonesRow.children].slice(-count);
        await flyTo(taken, side.mini);
        onTable -= count;
        drawStones();
        side.taken += count;
        for (let k = 0; k < count; k++) {
          const stone = ui.h("span", { class: "stone mini-stone fresh", html: art.stone() });
          side.mini.append(stone);
          side.last = stone;
        }
        side.count.textContent = String(side.taken);
        sound.play("tap");
        await ui.sleep(260);
      },

      // O'yin tugadi: yutgan taraf va oxirgi tosh belgilanadi
      finish(who) {
        turn.textContent = who === "robot" ? "Robot yutdi!" : "Sen yutding!";
        turn.className = "turn done " + who;
        for (const key of Object.keys(sides)) {
          sides[key].side.classList.remove("active");
          sides[key].side.classList.toggle("winner", key === who);
          sides[key].win.textContent = key === who ? "Yutdi! ✓" : "";
        }
        if (sides[who].last) sides[who].last.classList.add("last");
      },
      left: () => onTable,
    };
  }

  // Qutilar qatori: faqat kerakli holatlar ko'rsatiladi
  function boxRow(host, opts) {
    const o = opts || {};
    const el = ui.h("div", { class: "mboxes" });
    host.append(el);
    const cards = {};
    return {
      el,
      set(state, list) {
        el.innerHTML = "";
        for (const n of list) {
          if (!state[n]) continue;
          const card = boxCard(n, state[n], o);
          cards[n] = card;
          el.append(card);
        }
      },
      highlight(n) {
        Object.keys(cards).forEach((k) => cards[k].classList.toggle("hl", Number(k) === n));
      },
      flash(n) {
        const card = cards[n];
        if (!card) return;
        card.classList.remove("flash");
        void card.offsetWidth;
        card.classList.add("flash");
      },
    };
  }

  // Natija chizig'i: ✓ / ✗
  function resultLine(host) {
    const el = ui.h("div", { class: "results", "aria-live": "polite" });
    host.append(el);
    let list = [];
    const render = () => {
      el.innerHTML = "";
      list.slice(-20).forEach((won) => el.append(ui.h("span", { class: "res " + (won ? "win" : "lose"), text: won ? "✓" : "✗" })));
    };
    return {
      el,
      add(won) { list.push(won); render(); },
      set(next) { list = next.slice(); render(); },
      count: () => list.filter(Boolean).length,
    };
  }

  // "1 ta ol" / "2 ta ol" tugmalari (n ga qarab)
  function moveButtons(n, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    for (const move of boxes.legalMoves(n)) {
      row.append(ui.button(`${move} ta ol`, () => onPick(move), move === 2 ? "secondary" : ""));
    }
    ui.clearControl();
    ui.control().append(row);
  }

  // Javob tugmalari (matnli variantlar)
  function optionButtons(options, onPick, labels) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((value, i) => {
      row.append(ui.button(labels ? labels(value) : String(value), () => onPick(i), i % 2 ? "secondary" : ""));
    });
    ui.clearControl();
    ui.control().append(row);
  }

  // Munchoq belgisi (savollarda)
  const beadChip = (move) => ui.h("span", { class: `bead ${boxes.COLORS[move]} big` });

  QK.boxesUi = { COLOR_NAME, stones, gameTable, boxCard, boxRow, resultLine, moveButtons, optionButtons, beadChip };
})(window);
```

- [x] **4-qadam: `index.html`**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Sehrli qutilar</title>
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
  <script src="js/boxes.js"></script>
  <script src="../umumiy/js/storage.js"></script>
  <script src="../umumiy/js/sound.js"></script>
  <script src="../umumiy/js/art.js"></script>
  <script src="js/game-art.js"></script>
  <script src="../umumiy/js/ui.js"></script>
  <script src="../umumiy/js/app.js"></script>
  <script src="../umumiy/js/practice.js"></script>
  <script src="js/boxes-ui.js"></script>
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
/* Sehrli qutilar — faqat shu o'yinga xos uslublar. Umumiylari: ../../umumiy/css/asos.css */

.qbox { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }

/* ---------- Toshlar ---------- */
.stones { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; min-height: 40px; }
.stone { display: block; width: 40px; height: 32px; animation: pop 0.25s; }
.stone svg { display: block; width: 100%; height: 100%; }

/* ---------- O'yin stoli: navbat, toshlar, ikki taraf ---------- */
.gtable { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; max-width: 460px; }
.turn {
  min-height: 34px; padding: 4px 16px; border-radius: 999px; font-size: 20px; font-weight: 900;
  background: #fff; box-shadow: 0 2px 0 var(--soya);
}
.turn:empty { visibility: hidden; }
.turn.robot { color: #4A5560; box-shadow: 0 2px 0 var(--soya), inset 0 0 0 3px #B8C0C8; }
.turn.me { color: var(--togri); box-shadow: 0 2px 0 var(--soya), inset 0 0 0 3px var(--togri); }
.stones-box {
  display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%;
  padding: 10px; border-radius: 16px; background: #FDEFD4; box-shadow: inset 0 0 0 3px #E4D5B4;
}
.left-n { font-size: 18px; font-weight: 800; }
.stone.flying {
  position: fixed; z-index: 60; pointer-events: none; margin: 0;
  transition: transform 0.55s cubic-bezier(0.4, 0.1, 0.2, 1);
}
.trays { display: flex; justify-content: center; gap: 10px; width: 100%; }
.tray {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-height: 84px;
  padding: 6px; border-radius: 14px; background: #fff; box-shadow: 0 2px 0 var(--soya);
}
.tray.active { box-shadow: 0 2px 0 var(--soya), inset 0 0 0 3px var(--yana); }
.tray-head { display: flex; align-items: center; gap: 6px; font-size: 17px; font-weight: 800; }
.tray-art { width: 22px; height: 28px; }
.tray-art svg { display: block; width: 100%; height: 100%; }
.tray-art .paper { display: none; }
.mini { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px; min-height: 22px; }
.mini-stone { width: 24px; height: 19px; }
.tray-foot { display: flex; align-items: baseline; gap: 4px; }
.tray-n { font-size: 22px; font-weight: 900; }
.tray-lbl { font-size: 15px; font-weight: 700; opacity: 0.7; }
.tray.winner { box-shadow: 0 2px 0 var(--soya), inset 0 0 0 4px var(--togri); animation: pop 0.4s; }
.tray-win { min-height: 20px; font-size: 17px; font-weight: 900; color: var(--togri); }
.mini-stone.last { box-shadow: 0 0 0 3px var(--yana); border-radius: 50%; animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.45; } }
.turn.done { font-size: 22px; }
.turn.done.robot { color: #4A5560; }
.turn.done.me { color: var(--togri); }
.current-box { display: flex; flex-direction: column; align-items: center; gap: 6px; min-height: 126px; }
.pulled { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 14px; background: #fff; box-shadow: 0 2px 0 var(--soya); animation: pop 0.3s; }
.pulled-text { font-size: 22px; font-weight: 900; }

/* ---------- Qutilar va munchoqlar ---------- */
.mboxes { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; width: 100%; }
.mbox {
  display: flex; flex-direction: column; align-items: center; gap: 2px; width: 132px; padding: 6px;
  border-radius: 12px; background: #fff; box-shadow: 0 2px 0 var(--soya);
}
.mbox.sm { width: 84px; padding: 4px; }
.mbox.hl { box-shadow: 0 2px 0 var(--soya), inset 0 0 0 3px var(--yana); }
.mbox.flash { animation: pop 0.35s; }
.mbox-art { width: 64px; height: 45px; }
.mbox.sm .mbox-art { width: 44px; height: 31px; }
.mbox-art svg { display: block; width: 100%; height: 100%; }
.mbox-title { font-size: 18px; font-weight: 800; }
.mbox.sm .mbox-title { font-size: 16px; }
.brow { display: flex; align-items: center; gap: 4px; min-height: 22px; }
.beads { display: flex; flex-wrap: wrap; gap: 2px; max-width: 74px; }
.mbox.sm .beads { max-width: 44px; }
.bead { display: inline-block; width: 12px; height: 12px; border-radius: 50%; box-shadow: inset 0 0 0 1.5px rgba(43, 43, 58, 0.5); }
.bead.kok { background: #2F6FDE; }
.bead.sariq { background: #F0C040; }
.bead.big { width: 46px; height: 46px; box-shadow: inset 0 0 0 4px rgba(43, 43, 58, 0.5); }
.bn { font-size: 17px; font-weight: 900; min-width: 16px; }
.bead-show { display: flex; justify-content: center; padding: 8px; }

/* ---------- Natijalar ---------- */
.results { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; min-height: 26px; }
.res { font-size: 20px; font-weight: 900; }
.res.win { color: var(--togri); }
.res.lose { color: var(--yana); }
.count-line { font-size: 18px; font-weight: 800; text-align: center; }
.answer { font-size: 20px; font-weight: 900; color: var(--togri); text-align: center; }

/* ---------- Hikoya va tabrik ---------- */
.story { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.story-art { width: min(240px, 66vw); }
.story-art.small { width: min(110px, 28vw); }
.story-art svg { display: block; width: 100%; height: auto; }
.summary { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; text-align: center; }

/* Yotiq telefon: sahna ustuni tor, qutilar kichikroq */
@media (orientation: landscape) and (max-height: 500px) {
  .play.compact { grid-template-columns: minmax(150px, 24%) minmax(0, 1fr); }
  .mbox.sm { width: 74px; }
  .stone { width: 32px; height: 26px; }
  .story-art { width: min(190px, 36vh); }
  .gtable { max-width: none; flex-direction: row; align-items: flex-start; gap: 10px; }
  .turn { order: -1; align-self: center; }
  .stones-box { flex: 1; }
  .trays { flex: 1; }
  .current-box { min-height: 0; }
}
```

---

### 3-vazifa: Sahnalar

- [x] **1-qadam: `js/scenes/common.js`**

```js
// Sehrli qutilar: umumiy sahna qismlari — o'yin aylanishi va mukofot.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, sound, boxesUi } = QK;

  const VISIBLE = [7, 6, 5, 4, 3, 2]; // ko'rsatiladigan qutilar (1 li quti — bittagina yurish)

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper(""); // shogirdning qogʻozi bu oʻyinda kerak emas
    const el = ui.h("div", { class: "qbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  // O'yin ekrani: stol (navbat, toshlar, taraflar) va hozirgi quti
  function playScreen() {
    const el = box(true);
    const table = boxesUi.gameTable(el);
    const boxHost = ui.h("div", { class: "current-box" });
    el.append(boxHost);
    return { el, table, boxHost };
  }

  // Bitta o'yin: robot birinchi yuradi, keyin bola tanlaydi
  async function playRound(state) {
    const { table, boxHost } = playScreen();
    let n = boxes.START;
    const history = [];
    table.reset(n);
    for (;;) {
      table.turn("robot");
      boxHost.innerHTML = "";
      boxHost.append(boxesUi.boxCard(n, state[n], { open: true }));
      ui.bubble("elder", `Robot ${n} li qutidan munchoq tortmoqda…`);
      await ui.sleep(950);
      const move = boxes.pickMove(state, n, Math.random);
      history.push({ n, move });
      boxHost.innerHTML = "";
      boxHost.append(ui.h("div", { class: "pulled" },
        boxesUi.beadChip(move),
        ui.h("span", { class: "pulled-text", text: `${move} ta ol` })));
      sound.play("correct");
      ui.bubble("elder", `Robot ${boxesUi.COLOR_NAME[boxes.COLORS[move]]} munchoq tortdi — ${move} ta oladi.`);
      await ui.sleep(850);
      await table.take("robot", move);
      n -= move;
      if (n === 0) {
        boxHost.innerHTML = ""; // tortilgan munchoq oʻyin tugagach kerak emas
        table.finish("robot");
        sound.play("retry");
        ui.bubble("elder", "Oxirgi toshni robot oldi — robot yutdi!");
        await ui.sleep(1200);
        return { history, won: true };
      }
      table.turn("me");
      boxHost.innerHTML = "";
      ui.bubble("elder", `Stolda ${n} ta tosh qoldi. Sen nechta olasan?`);
      const mine = await ui.settle((done) => boxesUi.moveButtons(n, (m) => { ui.clearControl(); done(m); }));
      await table.take("me", mine);
      n -= mine;
      if (n === 0) {
        boxHost.innerHTML = ""; // tortilgan munchoq oʻyin tugagach kerak emas
        table.finish("me");
        sound.play("win");
        ui.pose("apprentice", "happy", 900);
        ui.bubble("elder", "Oxirgi toshni sen olding — sen yutding!");
        await ui.sleep(1200);
        return { history, won: false };
      }
    }
  }

  // Mukofot ekrani: qutilar to'plami va ishlatilgan munchoqlarning o'zgarishi
  async function rewardStep(state, history, won) {
    const el = box(true);
    el.append(line(won ? "Robot yutdi ✓" : "Robot yutqazdi ✗"));
    const view = boxesUi.boxRow(el, { compact: true });
    view.set(state, VISIBLE);
    for (const step of history) view.highlight(step.n);
    ui.bubble("elder", won
      ? "Robot yutdi! Ishlatgan munchoqlaridan bittadan qoʻshamiz."
      : "Robot yutqazdi. Ishlatgan munchoqlaridan bittadan olamiz.");
    await ui.settle((done) => {
      ui.control().append(ui.button(won ? "Mukofot ber" : "Munchoq ol", () => { ui.clearControl(); done(); }, "big"));
    });
    for (const step of history) {
      boxes.reward(state, [step], won);
      view.set(state, VISIBLE);
      view.highlight(step.n);
      view.flash(step.n);
      sound.play(won ? "correct" : "retry");
      await ui.sleep(620);
    }
    view.highlight(null);
    await ui.sleep(300);
  }

  QK.common = { VISIBLE, box, answerLine, line, playScreen, playRound, rewardStep };
})(window);
```

- [x] **2-qadam: `js/scenes/stage1.js`**

```js
// Kirish va 1-bosqich: o'yin qoidasi va qutilar (DIZAYN 4, 5-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, art, boxesUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robot oʻyin oʻynamoqchi!");
    await ui.say("apprentice", "Unga qoidani oʻrgatamizmi?");
    await ui.say("elder", "Yoʻq. U oʻynab, xato qilib oʻrganadi — mukofot yordamida.");
  }

  // 5.1: o'yin qoidasi — stol ko'rsatiladi
  async function rules() {
    const { table } = common.playScreen();
    table.reset(boxes.START);
    table.turn(null);
    await ui.say("elder", "Stolda 7 ta tosh. Navbat bilan 1 yoki 2 ta tosh olinadi.");
    await ui.say("elder", "Olingan toshlar oʻz tarafingga toʻplanadi. Oxirgi toshni olgan yutadi!");
    await ui.say("elder", "Robot birinchi yuradi.");
  }

  // 5.2: robotning "miyasi" — qutilar
  async function showBoxes(state) {
    const el = common.box(true);
    const view = boxesUi.boxRow(el, { compact: true });
    view.set(state, common.VISIBLE);
    await ui.say("elder", "Robotning miyasi — mana shu qutilar. Har holat uchun bittadan.");
    await ui.say("elder", "Koʻk munchoq — «1 ta ol», sariq munchoq — «2 ta ol».");
    await ui.say("elder", "Hozir munchoqlar teng, shuning uchun robot tasodifiy tanlaydi. Oʻynab koʻramiz!");
  }

  // 5.3: bitta o'yin
  async function firstGame(state) {
    const game = await common.playRound(state);
    await ui.say("elder", game.won ? "Robot yutdi — lekin u hali hech narsa oʻrganmadi." : "Sen yutding! Robot hali oʻrganmagan.");
    return game;
  }

  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const el = ui.h("div", { class: "qbox" });
    ui.work().append(el);
    const row = boxesUi.boxRow(el, {});
    row.set(boxes.newBoxes(), [5]);
    await ui.say("elder", "Qaysi munchoq koʻp boʻlsa, robot oʻshani koʻproq tortadi.");
    await ui.say("elder", "Demak munchoqlarni oʻzgartirsak — robotning xulqi ham oʻzgaradi.");
  }

  // 5.4: mashq
  function stageTask(task) {
    const el = common.box(true);
    if (task.type === "box") {
      boxesUi.stones(el, task.n);
      ui.bubble("elder", `Hozir ${task.n} ta tosh qoldi. Robot qaysi qutini ochadi?`);
      return practice.tries({
        setup: (submit) => boxesUi.optionButtons(task.options, submit, (n) => `${n} tosh`),
        check: (index) => index === task.answer,
        hint: () => ui.bubble("elder", "↻ Toshlarni sana: quti nomi — qolgan toshlar soni."),
        solution: () => el.append(common.answerLine(`${task.n} li quti`)),
      });
    }
    const chip = boxesUi.beadChip(task.answer);
    el.append(ui.h("div", { class: "bead-show" }, chip));
    ui.bubble("elder", `Robot ${boxesUi.COLOR_NAME[task.color]} munchoq tortdi. Nechta tosh oladi?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta`),
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", "↻ Koʻk — 1 ta ol, sariq — 2 ta ol."),
      solution: () => el.append(common.answerLine(`${boxesUi.COLOR_NAME[task.color]} — ${task.answer} ta`)),
    });
  }

  async function stage1() {
    const state = boxes.newBoxes();
    QK.state = state;
    await rules();
    await showBoxes(state);
    await firstGame(state);
    await explain();
    await ui.say("elder", "Endi savollar. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => boxes.makeStage1Task(correct, prev),
      run: stageTask,
      praise: (task) => (task.type === "box" ? `${task.n} li quti.` : `${boxesUi.COLOR_NAME[task.color]} — ${task.answer} ta.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
```

- [x] **3-qadam: `js/scenes/stage2.js`**

```js
// 2-bosqich: mukofot — munchoqlar o'zgaradi (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, boxesUi, practice, common } = QK;

  // 6.1–6.2: ikkita o'yin, har biridan keyin mukofot
  async function gamesWithReward(state) {
    await ui.say("elder", "Endi har oʻyindan keyin robotga mukofot beramiz.");
    for (let k = 0; k < 2; k++) {
      const game = await common.playRound(state);
      await common.rewardStep(state, game.history, game.won);
      await ui.say("elder", game.won
        ? "Yutgan yurishlarining munchogʻi koʻpaydi — endi ularni koʻproq tanlaydi."
        : "Yutqazgan yurishlarining munchogʻi kamaydi — endi ularni kamroq tanlaydi.");
    }
    await ui.say("elder", "Mana shu — mukofot bilan oʻrganish. Robotga qoida aytmadik!");
  }

  // 6.4: mashq
  function stageTask(task) {
    const el = common.box(true);
    if (task.type === "reward") {
      ui.bubble("elder", `Robot ${task.won ? "yutdi" : "yutqazdi"}. Ishlatgan munchoqlariga nima boʻladi?`);
      return practice.tries({
        setup: (submit) => boxesUi.optionButtons(task.options, submit),
        check: (index) => index === task.answer,
        hint: () => ui.bubble("elder", "↻ Yutsa — koʻpayadi, yutqazsa — kamayadi."),
        solution: () => el.append(common.answerLine(task.options[task.answer])),
      });
    }
    const state = boxes.newBoxes();
    const move = task.color === "kok" ? 1 : 2;
    state[task.n][move] += 2;
    const row = boxesUi.boxRow(el, {});
    row.set(state, [task.n]);
    ui.bubble("elder", `Robot yutqazdi. ${task.n} li qutida ${boxesUi.COLOR_NAME[task.color]} munchoq tortgan edi — qaysi munchoq olinadi?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options, submit, (c) => boxesUi.COLOR_NAME[c] || c),
      check: (index) => index === task.answer,
      hint: () => ui.bubble("elder", "↻ Faqat robot tortgan munchoq olinadi, boshqasi tegilmaydi."),
      solution: () => el.append(common.answerLine(boxesUi.COLOR_NAME[task.color])),
    });
  }

  async function stage2() {
    const state = (QK.state && QK.state[7]) ? QK.state : boxes.newBoxes();
    QK.state = state;
    await gamesWithReward(state);
    await ui.say("elder", "Endi savollar. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => boxes.makeStage2Task(correct, prev),
      run: stageTask,
      praise: (task) => (task.type === "reward"
        ? `Yutsa qoʻshiladi, yutqazsa olinadi.`
        : `Faqat ${boxesUi.COLOR_NAME[task.color]} munchoq olinadi.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
```

- [x] **4-qadam: `js/scenes/stage3.js`**

```js
// 3-bosqich: robot kuchayadi, strategiya va hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, sound, art, boxesUi, practice, common } = QK;

  const SCENES = [
    { art: "matchboxes", lines: ["1961-yilda bir olim 304 ta gugurt qutisi va munchoqlar bilan shunday mashina yasagan.", "U odam bilan oʻynab, yutishni oʻrgangan."] },
    { art: "board", lines: ["Kompyuterlar shaxmat va Go oʻyinini ham shunday oʻrgangan: oʻynab, mukofot olib."] },
    { art: "walker", lines: ["Robotlar yurishni ham shunday oʻrganadi.", "Har urinishdan keyin mukofot: yaqinroq yurdimi — plyus, yiqildimi — minus."] },
    { art: "star", lines: ["Mukofot notoʻgʻri qoʻyilsa, robot notoʻgʻri narsani oʻrganadi.", "Shuning uchun mukofotni odam ehtiyotkorlik bilan tanlaydi."] },
  ];

  // 7.1–7.2: 20 marta o'ynab o'rganish
  async function trainFast(state) {
    const el = common.box(true);
    const boxView = boxesUi.boxRow(el, { compact: true });
    boxView.set(state, common.VISIBLE);
    const results = boxesUi.resultLine(el);
    const note = common.line("Oʻyinlar: 0 / 20");
    el.append(note);
    await ui.say("elder", "Robot oʻzi bilan mashq qilsin — 20 marta oʻynaydi.");
    ui.bubble("elder", "«20 marta oʻyna»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("20 marta oʻyna", () => { ui.clearControl(); done(); }, "big"));
    });
    let first = 0;
    let last = 0;
    for (let k = 0; k < 20; k++) {
      const game = boxes.playGame(state, Math.random, boxes.randomOpponent);
      boxes.reward(state, game.history, game.won);
      results.add(game.won);
      boxView.set(state, common.VISIBLE);
      note.textContent = `Oʻyinlar: ${k + 1} / 20`;
      if (k < 10 && game.won) first++;
      if (k >= 10 && game.won) last++;
      sound.play(game.won ? "correct" : "tap");
      await ui.sleep(230);
    }
    el.append(common.line(`Birinchi 10 ta oʻyin: ${first} ta yutuq · Oxirgi 10 ta: ${last} ta yutuq`));
    await ui.say("elder", `Boshida ${first} ta yutdi, oxirida ${last} ta. Munchoqlar oʻzgardi!`);
    await ui.say("elder", "Robot sirni topdi: raqibga 3 ga karrali tosh qoldiradi.");
  }

  // 7.3: bola o'rgangan robot bilan o'ynaydi
  async function playTrained(state) {
    await ui.say("elder", "Endi oʻrgangan robot bilan oʻynab koʻr!");
    const game = await common.playRound(state);
    await ui.say("elder", game.won
      ? "Robot yutdi. Endi uni yutish qiyin!"
      : "Sen yutding! Demak robot hali toʻliq oʻrganmagan.");
  }

  // 7.4: mashq
  function stageTask(task) {
    const el = common.box(true);
    if (task.type === "read") {
      const state = { 5: { 1: task.blue, 2: task.yellow } };
      const row = boxesUi.boxRow(el, {});
      row.set(state, [5]);
      ui.bubble("elder", "Qutiga qara: robot koʻpincha nima qiladi?");
      return practice.tries({
        setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta ol`),
        check: (index) => task.options[index] === task.answer,
        hint: () => ui.bubble("elder", "↻ Qaysi rang koʻp boʻlsa, oʻsha koʻproq tortiladi."),
        solution: () => el.append(common.answerLine(`${task.answer} ta ol`)),
      });
    }
    boxesUi.stones(el, task.n);
    ui.bubble("elder", `${task.n} ta tosh qoldi va navbat robotniki. Nechta olsa yutadi?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta`),
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", "↻ Raqibga 3 ga karrali tosh qoldir: 6, 3 yoki 0."),
      solution: () => el.append(common.answerLine(`${task.answer} ta — raqibga ${task.n - task.answer} ta qoladi`)),
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
    const state = (QK.state && QK.state[7]) ? QK.state : boxes.newBoxes();
    QK.state = state;
    await trainFast(state);
    await playTrained(state);
    await ui.say("elder", "Endi savollar. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => boxes.makeStage3Task(correct, prev),
      run: stageTask,
      praise: (task) => (task.type === "read"
        ? `Koʻp munchoq — koʻp tanlov.`
        : `${task.answer} ta olsa, raqibga ${task.n - task.answer} ta qoladi.`),
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
    ui.bubble("elder", "Tabriklayman! Endi sen robotni mukofot bilan oʻrgata olasan!");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Har holat uchun quti, har yurish uchun munchoq" }),
        ui.h("div", { text: "Yutsa — munchoq qoʻshiladi, yutqazsa — olinadi" }),
        ui.h("div", { text: "Mukofot qanday boʻlsa — xulq shunday" }))));
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
// 8-o'yin: umumiy qobiqni (umumiy/js/app.js) shu o'yin sozlamalari bilan ishga tushirish.
window.QK.app.start({
  title: "Sehrli qutilar",
  storageKey: "sehrli-qutilar:v1",
  stageTitles: ["Oʻyin va qutilar", "Mukofot", "Robot kuchayadi"],
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
  assert.equal(captured.storageKey, "sehrli-qutilar:v1");
  assert.equal(captured.title, "Sehrli qutilar");
  assert.deepEqual(captured.stageTitles, ["Oʻyin va qutilar", "Mukofot", "Robot kuchayadi"]);
});
```

---

### 4-vazifa: Bosh sahifa va tekshiruv

- [x] **1-qadam: bosh sahifaga 8-o'yin (`qutilar` ikonkasi) qo'shiladi**

```bash
cd /Users/bicoder/Documents/Information && node --test bosh/tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)"
```

- [x] **2-qadam: barcha testlar**

```bash
cd /Users/bicoder/Documents/Information/oyinlar && for d in 0*/ umumiy/; do (cd "$d" && printf "%-30s " "$d" && node --test tests/*.test.js 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' '; echo); done
```

- [x] **3-qadam: brauzerda to'liq o'ynab chiqish** (`scratchpad/play8.js`: 4 ta ekran + ataylab xato)

```bash
cd /Users/bicoder/Documents/Information && python3 -m http.server 8777 >/dev/null 2>&1 &
sleep 1 && echo "http://localhost:8777/oyinlar/08-sehrli-qutilar/"
```

- [x] **4-qadam: commit, main'ga birlashtirish va GitHub'ga yuklash**

```bash
cd /Users/bicoder/Documents/Information && git add -A && git commit -m "08-sehrli-qutilar: mukofot bilan oʻrganish oʻyini" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" && git checkout main && git merge --no-ff oyin/08-sehrli-qutilar && git branch -d oyin/08-sehrli-qutilar && git push
```
