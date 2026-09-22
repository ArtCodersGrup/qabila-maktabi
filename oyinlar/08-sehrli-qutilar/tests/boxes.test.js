// boxes.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/boxes.js");

// Urug'li tasodif (mulberry32) — o'rganish sinovlari har safar bir xil natija beradi
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

test("smartOpponent: yutuqli yurishni biladi", () => {
  assert.equal(B.smartOpponent(7, Math.random), 1);
  assert.equal(B.smartOpponent(5, Math.random), 2);
  assert.equal(B.smartOpponent(4, Math.random), 1);
  assert.ok(B.legalMoves(6).includes(B.smartOpponent(6, Math.random)), "3 ga karrali holatda istalgan yurish");
});

test("tajribali murabbiy bilan mashq — robot kuchliroq bo'ladi", () => {
  const strength = (opponent) => {
    const r = rng(2026);
    let sum = 0;
    for (let run = 0; run < 40; run++) {
      const boxes = B.newBoxes();
      B.trainGames(boxes, 40, r, opponent);
      sum += (100 * boxes[7][1]) / (boxes[7][1] + boxes[7][2]); // 7 da to'g'ri yurish ulushi
    }
    return sum / 40;
  };
  const withSmart = strength(B.smartOpponent);
  const withRandom = strength(B.randomOpponent);
  assert.ok(withSmart > withRandom + 5, `murabbiy foyda bermadi: ${withRandom.toFixed(0)}% → ${withSmart.toFixed(0)}%`);
  assert.ok(withSmart > 80, `40 oʻyindan keyin kuchsiz: ${withSmart.toFixed(0)}%`);
});

test("trainGames: robot o'ynab o'rganadi — yutuqlar ko'payadi", () => {
  let firstSum = 0;
  let lastSum = 0;
  let correct7 = 0;
  const runs = 5;
  const r = rng(7);
  for (let run = 0; run < runs; run++) {
    const boxes = B.newBoxes();
    const results = B.trainGames(boxes, 80, r, B.randomOpponent);
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
