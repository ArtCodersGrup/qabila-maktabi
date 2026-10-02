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

const fourOptions = (task) => {
  assert.equal(task.options.length, 4, "kamida 4 variant");
  assert.equal(new Set(task.options.map((o) => JSON.stringify(o))).size, 4, "variant takrorlandi");
};

test("makeBoxTask: javob — stoldagi toshlar soni, 4 variant; zina bilan toshlar ko'payadi", () => {
  assert.deepEqual(B.STONES, [[2, 7], [3, 9], [5, 12]]);
  for (const tier of [0, 1, 2]) {
    let prev = null;
    let max = 0;
    for (let i = 0; i < 300; i++) {
      const task = B.makeBoxTask(prev, Math.random, tier);
      assert.equal(task.type, "box");
      fourOptions(task);
      assert.equal(task.options[task.answer], task.n);
      assert.ok(task.n >= Math.max(2, B.STONES[tier][0]) && task.n <= B.STONES[tier][1], `tier ${tier}: ${task.n}`);
      assert.ok(task.options.every((o) => o >= 1));
      // Yuqori zinada chalg'ituvchilar — qo'shni sonlar (aniq sanash kerak)
      if (tier >= 1) assert.ok(task.options.every((o) => Math.abs(o - task.n) <= 4), task.options.join());
      if (prev) assert.notEqual(task.n, prev.n);
      max = Math.max(max, task.n);
      prev = task;
    }
    assert.equal(max, B.STONES[tier][1], `tier ${tier}: eng katta son chiqmadi`);
  }
});

test("makeLeftTask: rang → yurish → stolda qolgan toshlar; 4 variant", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const moves = new Set();
    for (let i = 0; i < 300; i++) {
      const task = B.makeLeftTask(prev, Math.random, tier);
      assert.equal(task.type, "left");
      fourOptions(task);
      assert.equal(task.color, B.COLORS[task.move]);
      assert.equal(task.left, task.n - task.move);
      assert.equal(task.options[task.answer], task.left);
      assert.ok(task.n >= 3 && task.n <= B.STONES[tier][1]);
      assert.ok(task.options.includes(task.n - (3 - task.move)), "boshqa rangning natijasi ham variantlarda");
      assert.ok(task.options.every((o) => o >= 0));
      if (prev) assert.ok(task.n !== prev.n || task.move !== prev.move);
      moves.add(task.move);
      prev = task;
    }
    assert.equal(moves.size, 2);
  }
});

test("makeCountTask: yutsa +1, yutqazsa −1 (kamida 1), boshqa rang o'zgarmaydi; 4 variant", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const asks = new Set();
    let floor = 0;
    for (let i = 0; i < 600; i++) {
      const task = B.makeCountTask(prev, Math.random, tier);
      assert.equal(task.type, "count");
      fourOptions(task);
      const before = { 1: task.blue, 2: task.yellow };
      // Haqiqiy mukofot qoidasi bilan solishtiramiz
      const boxes = { [task.n]: { 1: task.blue, 2: task.yellow } };
      B.reward(boxes, [{ n: task.n, move: task.move }], task.won);
      assert.deepEqual(task.after, boxes[task.n]);
      assert.equal(task.value, boxes[task.n][task.askMove]);
      assert.equal(task.options[task.answer], task.value);
      assert.equal(task.askMove, task.ask === "pulled" ? task.move : 3 - task.move);
      if (task.ask === "other") assert.equal(task.value, before[task.askMove], "tortilmagan rang o'zgarmaydi");
      const [lo, hi] = B.BEAD_RANGE[tier];
      assert.ok([task.blue, task.yellow].every((c) => c >= lo && c <= hi));
      assert.notEqual(task.blue, task.yellow);
      assert.ok(task.options.every((o) => o >= 0));
      assert.equal(task.kept, !task.won && before[task.move] === 1);
      if (task.kept && task.ask === "pulled") floor++;
      asks.add(task.ask);
      prev = task;
    }
    assert.deepEqual([...asks].sort(), tier === 0 ? ["pulled"] : ["other", "pulled"], `tier ${tier}`);
    if (tier >= 1) assert.ok(floor > 0, `tier ${tier}: «kamida 1 ta qoladi» holati chiqishi kerak`);
  }
  assert.equal(B.makeCountTask(null, Math.random, 2, "pulled").ask, "pulled");
});

test("makeUsedTask: yutqazganda o'zi tortgan munchoq olinadi; 4 variant", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = B.makeUsedTask(prev);
    assert.equal(task.type, "used");
    fourOptions(task);
    assert.equal(task.options[task.answer], task.color);
    assert.deepEqual([...task.options].sort(), ["hech", "ikkalasi", "kok", "sariq"]);
    assert.ok(task.n >= 2 && task.n <= 7);
    if (prev) assert.ok(task.n !== prev.n || task.color !== prev.color);
    prev = task;
  }
});

test("makeRatioTask: 4 ta quti, javob — kerakli rang ulushi eng katta quti (yagona)", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    let traps = 0;
    for (let i = 0; i < 300; i++) {
      const task = B.makeRatioTask(prev, Math.random, tier);
      assert.equal(task.type, "ratio");
      fourOptions(task);
      assert.equal(new Set(task.options.map((o) => o.n)).size, 4, "quti raqamlari har xil");
      const count = (o) => (task.move === 1 ? o.blue : o.yellow);
      const share = (o) => count(o) / (o.blue + o.yellow);
      const sorted = task.options.map(share).sort((a, b) => b - a);
      assert.equal(share(task.options[task.answer]), sorted[0]);
      assert.ok(sorted[0] - sorted[1] >= 0.15 - 1e-9, "javob ikkilanarli");
      assert.ok(task.options.every((o) => o.blue >= 1 && o.yellow >= 1 && o.n >= 2 && o.n <= 7));
      const best = task.options[task.answer];
      const trap = task.options.some((o, k) => k !== task.answer && count(o) >= count(best));
      if (trap) traps++;
      if (tier === 0) assert.ok(!trap, "tier 0 da to'g'ri qutida kerakli rang soni ham eng ko'p");
      else assert.ok(trap, `tier ${tier}: tuzoq quti bo'lishi kerak (soni ko'p, ulushi kam)`);
      prev = task;
    }
  }
});

test("makeStrategyTask: 3 ga karrali qoldiradigan yurish + «nega?» (4 ta sabab, bittasi to'g'ri)", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const seen = new Set();
    for (let i = 0; i < 300; i++) {
      const task = B.makeStrategyTask(prev, Math.random, tier);
      assert.equal(task.type, "strategy");
      assert.ok(B.STRATEGY_N[tier].includes(task.n));
      assert.notEqual(task.n % 3, 0, "3 ga karrali holatda yutuqli yurish yo'q");
      assert.equal(task.answer, B.winningMove(task.n));
      assert.equal(task.left, task.n - task.answer);
      assert.equal(task.left % 3, 0);
      assert.notEqual(task.wrongLeft % 3, 0, "noto'g'ri yurish 3 ga karrali qoldirmaydi");
      assert.deepEqual([...task.whys].sort(), ["bad", "fast", "good", "more"]);
      assert.equal(task.whys[task.whyIndex], "good");
      if (prev) assert.notEqual(task.n, prev.n);
      seen.add(task.n);
      prev = task;
    }
    assert.equal(seen.size, B.STRATEGY_N[tier].length);
  }
  assert.ok(Math.max(...B.STRATEGY_N[2]) <= B.START_RANGE[1]);
});

test("makeBeatTask va perfectGame: to'g'ri o'ynagan bola xatosiz robotni yutadi, bir marta adashsa — yutqazadi", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let i = 0; i < 200; i++) {
      const task = B.makeBeatTask(prev, Math.random, tier);
      assert.equal(task.type, "beat");
      assert.ok(B.BEAT_N[tier].includes(task.n));
      assert.notEqual(task.n % 3, 0, "birinchi yurgan yuta olishi kerak");
      assert.equal(task.first, B.winningMove(task.n));
      assert.ok(task.n <= B.START_RANGE[1]);
      // Sirni bilgan bola doim yutadi
      assert.equal(B.perfectGame(task.n, (n) => B.winningMove(n), Math.random), true);
      // Birinchi yurishda adashgan bola yuta olmaydi (robot xatosiz o'ynaydi)
      let first = true;
      const wrongFirst = (n) => {
        if (first) { first = false; return 3 - B.winningMove(n) <= n ? 3 - B.winningMove(n) : B.winningMove(n); }
        return B.winningMove(n) || 1;
      };
      if (task.n >= 2 && 3 - task.first <= task.n && task.n - (3 - task.first) > 0) {
        assert.equal(B.perfectGame(task.n, wrongFirst, Math.random), false, `n=${task.n}`);
      }
      if (prev) assert.notEqual(task.n, prev.n);
      prev = task;
    }
  }
  assert.ok(Math.max(...B.BEAT_N[2]) > Math.max(...B.BEAT_N[0]), "zina bilan toshlar ko'payadi");
});

test("numberOptions: to'g'ri son + takrorsiz chalg'ituvchilar, min dan kichik emas", () => {
  for (let i = 0; i < 100; i++) {
    const opts = B.numberOptions(1, [0, 1, 1, -3], Math.random, 0);
    assert.equal(opts.length, 4);
    assert.equal(new Set(opts).size, 4);
    assert.ok(opts.includes(1) && opts.every((o) => o >= 0));
  }
});

test("bosqich mashqlari: turlar navbat bilan keladi; 3-bosqichning yarmi — haqiqiy o'yin", () => {
  assert.equal(B.makeStage1Task(0, null).type, "box");
  assert.equal(B.makeStage1Task(1, null).type, "left");
  assert.equal(B.makeStage2Task(0, null).type, "count");
  assert.equal(B.makeStage2Task(0, null).ask, "pulled");
  assert.equal(B.makeStage2Task(1, null).type, "used");
  assert.equal(B.makeStage2Task(3, null).type, "count");
  const order = [0, 1, 2, 3, 4, 5].map((k) => B.makeStage3Task(k, null).type);
  assert.deepEqual(order, ["ratio", "strategy", "beat", "strategy", "beat", "beat"]);
  assert.equal(order.filter((t) => t === "beat").length, 3);
  assert.equal(B.makeStage3Task(6, null, Math.random, 2).type, "ratio");
  // Zina uzatiladi; turlar aralashganda ham (prev boshqa turdan) ishlaydi
  let prev = null;
  for (let k = 0; k < 120; k++) {
    prev = B.makeStage3Task(k, prev, Math.random, k % 3);
    assert.equal(prev.tier, k % 3);
  }
  for (let k = 0; k < 120; k++) prev = B.makeStage1Task(k, prev, Math.random, k % 3);
  for (let k = 0; k < 120; k++) prev = B.makeStage2Task(k, prev, Math.random, k % 3);
});
