// neural.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const N = require("../js/neural.js");

test("neyron: yoniq kirishlar og'irligi bilan qo'shiladi, chegaraga yetsa yonadi", () => {
  assert.equal(N.weightedSum([1, 1, 0], [1, 1, -1]), 2);
  assert.equal(N.weightedSum([1, 1, 1], [1, 1, -1]), 1);
  assert.equal(N.fire([1, 1, 0], [1, 1, -1], 2), true);
  assert.equal(N.fire([1, 0, 1], [1, 1, -1], 2), false);
  assert.deepEqual(N.DEMO, { weights: [1, 1, -1], threshold: 2 });
});

test("3×3 tarmoq: tik va yotiq chiziq topuvchilar", () => {
  const cross = [0, 1, 0, 1, 1, 1, 0, 1, 0];
  const vertical = [0, 1, 0, 0, 1, 0, 0, 1, 0];
  const horizontal = [0, 0, 0, 1, 1, 1, 0, 0, 0];
  const corner = [1, 0, 0, 0, 0, 0, 0, 0, 1];
  assert.deepEqual(N.hidden(cross), { tik: true, yotiq: true });
  assert.deepEqual(N.hidden(vertical), { tik: true, yotiq: false });
  assert.equal(N.output(cross), "krest");
  assert.equal(N.output(vertical), "chiziq");
  assert.equal(N.output(horizontal), "chiziq");
  assert.equal(N.output(corner), "boshqa");
  assert.equal(N.hiddenLabel(cross), "ikkalasi");
  assert.equal(N.hiddenLabel(horizontal), "faqat yotiq");
  assert.equal(N.hiddenLabel(corner), "hech biri");
});

test("bitta neyron: VA va YOKI ni uddalaydi, 'faqat bittasi'ni uddalay olmaydi", () => {
  assert.equal(N.canOneNeuron(N.TABLES.va), true);
  assert.equal(N.canOneNeuron(N.TABLES.yoki), true);
  assert.equal(N.canOneNeuron(N.TABLES.faqatBittasi), false);
  assert.equal(N.bestOneNeuron(N.TABLES.faqatBittasi).errors, 1, "eng yaxshisi ham 1 ta xato qiladi");
});

test("ikki qatlam 'faqat bittasi' ishini to'g'ri bajaradi", () => {
  for (const [a, b, want] of N.TABLES.faqatBittasi) assert.equal(N.twoLayer([a, b]).out, want === 1, `${a},${b}`);
});

test("o'rganish: xato bo'lsa og'irlik o'zgaradi va oxirida xato 0", () => {
  for (const name of ["va", "yoki"]) {
    const steps = N.trainNeuron(N.TABLES[name], [0, 0], N.THRESHOLDS[name]);
    assert.ok(steps.length > 1, name);
    assert.equal(steps[steps.length - 1].errors, 0, name);
    const w = steps[steps.length - 1].weights;
    assert.equal(N.tableErrors(N.TABLES[name], w, N.THRESHOLDS[name]), 0, name);
  }
});

test("updateRule: yonishi kerak edi — oshir, yonmasligi kerak edi — kamaytir", () => {
  assert.equal(N.updateRule(true, false), "oshir");
  assert.equal(N.updateRule(false, true), "kamaytir");
  assert.equal(N.updateRule(true, true), "tegma");
});

test("makeFireTask: javob neyron hisobiga mos, ikkala javob ham chiqadi", () => {
  let prev = null;
  const seen = { true: 0, false: 0 };
  for (let i = 0; i < 300; i++) {
    const task = N.makeFireTask(prev);
    assert.equal(task.answer, N.fire(task.inputs, task.weights, task.threshold));
    assert.ok(task.inputs.some((x) => x === 1), "hamma kirish o'chiq");
    assert.ok(task.weights.every((w) => w === 1 || w === -1));
    seen[task.answer]++;
    if (prev) assert.notDeepEqual([task.inputs, task.weights, task.threshold], [prev.inputs, prev.weights, prev.threshold]);
    prev = task;
  }
  assert.ok(seen.true > 60 && seen.false > 60, JSON.stringify(seen));
});

test("makeFireTask: yig'indi savoli — 4 variant, bittasi to'g'ri", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let i = 0; i < 300; i++) {
      const task = N.makeFireTask(prev, Math.random, tier);
      assert.equal(task.sum, N.weightedSum(task.inputs, task.weights));
      assert.equal(task.sumOptions.length, 4, "kamida 4 variant");
      assert.equal(new Set(task.sumOptions).size, 4, "variant takrorlandi");
      assert.equal(task.sumOptions[task.sumIndex], task.sum);
      assert.equal(task.answer, task.sum >= task.threshold);
      if (prev) assert.notDeepEqual([task.inputs, task.weights, task.threshold], [prev.inputs, prev.weights, prev.threshold]);
      prev = task;
    }
  }
});

test("makeFireTask: tier bilan qiyinlashadi — og'irlik −2..2, chegara 4 gacha, 4 kirish", () => {
  const stat = (tier) => {
    const out = { inputs: new Set(), weights: new Set(), thresholds: new Set(), answers: { true: 0, false: 0 } };
    let prev = null;
    for (let i = 0; i < 400; i++) {
      prev = N.makeFireTask(prev, Math.random, tier);
      out.inputs.add(prev.inputs.length);
      prev.weights.forEach((w) => out.weights.add(w));
      out.thresholds.add(prev.threshold);
      out.answers[prev.answer]++;
      assert.ok(!prev.weights.includes(0), "og'irlik 0 bo'lmaydi");
      if (tier >= 1) assert.ok(prev.inputs.filter((x) => x).length >= 2, "kamida 2 ta yoniq chiroq");
    }
    return out;
  };
  const t0 = stat(0);
  assert.deepEqual([...t0.inputs], [3]);
  assert.deepEqual([...t0.weights].sort(), [-1, 1]);
  assert.deepEqual([...t0.thresholds].sort(), [1, 2]);
  const t1 = stat(1);
  assert.deepEqual([...t1.inputs], [3]);
  assert.deepEqual([...t1.weights].sort((a, b) => a - b), [-2, -1, 1, 2]);
  assert.deepEqual([...t1.thresholds].sort(), [1, 2, 3]);
  const t2 = stat(2);
  assert.deepEqual([...t2.inputs], [4]);
  assert.deepEqual([...t2.weights].sort((a, b) => a - b), [-2, -1, 1, 2]);
  assert.deepEqual([...t2.thresholds].sort(), [1, 2, 3, 4]);
  for (const t of [t0, t1, t2]) assert.ok(t.answers.true > 60 && t.answers.false > 60, JSON.stringify(t.answers));
});

test("numberOptions: to'g'ri son + takrorsiz chalg'ituvchilar", () => {
  for (let i = 0; i < 100; i++) {
    const opts = N.numberOptions(2, [2, 2, 3], Math.random, 4);
    assert.equal(opts.length, 4);
    assert.equal(new Set(opts).size, 4);
    assert.ok(opts.includes(2) && opts.includes(3));
  }
});

test("makeHiddenTask va makeOutputTask: javob tarmoq hisobiga mos, hamma turdan chiqadi", () => {
  for (const tier of [0, 1, 2]) {
    const labels = new Set();
    const outs = new Set();
    let prev = null;
    for (let i = 0; i < 300; i++) {
      const h = N.makeHiddenTask(prev, Math.random, tier);
      assert.equal(h.answer, N.hiddenLabel(h.image));
      assert.equal(h.options.length, 4);
      if (prev) assert.notDeepEqual(h.image, prev.image);
      labels.add(h.answer);
      const o = N.makeOutputTask(h, Math.random, tier);
      assert.equal(o.answer, N.output(o.image));
      assert.notDeepEqual(o.image, h.image);
      outs.add(o.answer);
      prev = o;
    }
    assert.equal(labels.size, 4);
    assert.equal(outs.size, 3);
  }
});

test("makeHiddenTask: tier bilan rasm \"shovqini\" ortadi", () => {
  const avg = (tier) => {
    let sum = 0;
    for (let i = 0; i < 400; i++) sum += N.makeHiddenTask(null, Math.random, tier).image.reduce((a, b) => a + b, 0);
    return sum / 400;
  };
  const a0 = avg(0);
  const a2 = avg(2);
  assert.ok(a2 > a0 + 0.5, `tier 2 da bo'yalgan kataklar ko'proq bo'lishi kerak: ${a0} → ${a2}`);
  for (let i = 0; i < 200; i++) {
    assert.ok(N.makeHiddenTask(null, Math.random, 2).image.reduce((a, b) => a + b, 0) >= 4);
  }
});

test("makeBothTask: 1-qatlam (4 variant) va chiqish (3 variant) bir rasmga mos", () => {
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const task = N.makeBothTask(prev, Math.random, i % 3);
    assert.equal(task.type, "both");
    assert.equal(task.hidden, N.hiddenLabel(task.image));
    assert.equal(task.answer, N.output(task.image));
    assert.equal(task.hiddenOptions.length, 4);
    assert.deepEqual(task.options, ["krest", "chiziq", "boshqa"]);
    assert.ok(task.hiddenOptions.includes(task.hidden) && task.options.includes(task.answer));
    if (prev) assert.notDeepEqual(task.image, prev.image);
    prev = task;
  }
});

test("makeUpdateTask: neyron xato qilgan, javob qoidaga mos", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const seen = new Set();
    for (let i = 0; i < 200; i++) {
      const task = N.makeUpdateTask(prev, Math.random, tier);
      const out = N.fire(task.inputs, task.weights, task.threshold);
      assert.notEqual(out, task.target, "neyron xato qilmagan");
      assert.equal(task.answer, N.updateRule(task.target, out));
      seen.add(task.answer);
      if (prev) assert.notDeepEqual([task.inputs, task.weights], [prev.inputs, prev.weights]);
      prev = task;
    }
    assert.deepEqual([...seen].sort(), ["kamaytir", "oshir"]);
  }
});

test("makeUpdateTask: «yangi yig'indi» — yoniq kirishlar 1 ga o'zgaradi, 4 variant", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let i = 0; i < 300; i++) {
      const task = N.makeUpdateTask(prev, Math.random, tier);
      // Qoidani haqiqatan qo'llaymiz: yoniq kirishlarning og'irligi 1 ga oshadi yoki kamayadi
      const d = task.answer === "oshir" ? 1 : -1;
      const updated = task.weights.map((w, k) => w + d * task.inputs[k]);
      assert.equal(task.newSum, N.weightedSum(task.inputs, updated));
      assert.equal(task.sum, N.weightedSum(task.inputs, task.weights));
      assert.equal(task.lit, task.inputs.filter((x) => x).length);
      assert.equal(task.newSumOptions.length, 4, "kamida 4 variant");
      assert.equal(new Set(task.newSumOptions).size, 4, "variant takrorlandi");
      assert.equal(task.newSumOptions[task.newSumIndex], task.newSum);
      assert.equal(task.inputs.length, tier === 2 ? 4 : 3);
      assert.ok(task.threshold >= 1 && task.threshold <= (tier === 2 ? 4 : 3));
      const lo = tier === 0 ? -1 : -2;
      const hi = tier === 0 ? 2 : 3;
      assert.ok(task.weights.every((w) => w >= lo && w <= hi), `tier ${tier}: og'irliklar ${task.weights}`);
      prev = task;
    }
  }
});

test("makeStage2Task: avval 1-qatlam, keyin ikki qadamli (1-qatlam → chiqish)", () => {
  assert.equal(N.makeStage2Task(0, null).type, "hidden");
  assert.equal(N.makeStage2Task(1, null).type, "both");
  assert.equal(N.makeStage2Task(4, null, Math.random, 2).tier, 2);
});
