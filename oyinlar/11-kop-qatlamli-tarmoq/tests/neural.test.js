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

test("makeHiddenTask va makeOutputTask: javob tarmoq hisobiga mos, hamma turdan chiqadi", () => {
  const labels = new Set();
  const outs = new Set();
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const h = N.makeHiddenTask(prev);
    assert.equal(h.answer, N.hiddenLabel(h.image));
    labels.add(h.answer);
    const o = N.makeOutputTask(h);
    assert.equal(o.answer, N.output(o.image));
    outs.add(o.answer);
    prev = o;
  }
  assert.equal(labels.size, 4);
  assert.equal(outs.size, 3);
});

test("makeUpdateTask: neyron xato qilgan, javob qoidaga mos", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = N.makeUpdateTask(prev);
    const out = N.fire(task.inputs, task.weights, task.threshold);
    assert.notEqual(out, task.target, "neyron xato qilmagan");
    assert.equal(task.answer, N.updateRule(task.target, out));
    seen.add(task.answer);
    prev = task;
  }
  assert.deepEqual([...seen].sort(), ["kamaytir", "oshir"]);
});

test("makeStage2Task: avval yashirin, keyin chiqish", () => {
  assert.equal(N.makeStage2Task(0, null).type, "hidden");
  assert.equal(N.makeStage2Task(1, null).type, "output");
});
