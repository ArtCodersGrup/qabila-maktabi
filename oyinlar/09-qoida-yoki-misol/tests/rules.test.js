// rules.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../js/rules.js");

const item = (size, dots, yes) => ({ size, dots, yes });

test("qoida: belgi, amal va son bo'yicha tekshiriladi", () => {
  assert.equal(R.test({ feature: "size", op: ">", value: 5 }, item(7, 2)), true);
  assert.equal(R.test({ feature: "size", op: ">", value: 5 }, item(5, 2)), false);
  assert.equal(R.test({ feature: "dots", op: "<", value: 4 }, item(9, 2)), true);
  assert.equal(R.test({ feature: "dots", op: "<", value: 4 }, item(1, 4)), false);
});

test("errorsOf: qoida nechta narsada xato qiladi", () => {
  const items = [item(7, 2, true), item(8, 1, true), item(2, 5, false), item(6, 9, true)];
  assert.equal(R.errorsOf(items, { feature: "size", op: ">", value: 5 }), 0);
  assert.equal(R.errorsOf(items, { feature: "size", op: ">", value: 7 }), 2);
  assert.deepEqual(R.wrongOnes(items, { feature: "size", op: ">", value: 7 }).map((x) => x.size).sort(), [6, 7]);
});

test("allRules va bestRule: hamma qoida sinaladi", () => {
  assert.equal(R.allRules().length, R.FEATURES.length * R.OPS.length * 9);
  const clean = [item(7, 2, true), item(8, 1, true), item(9, 4, true), item(2, 5, false), item(3, 9, false), item(1, 6, false)];
  const best = R.bestRule(clean);
  assert.equal(best.errors, 0);
  assert.equal(R.errorsOf(clean, best.rule), 0);
});

test("nearest: eng yaqin misol bo'yicha bashorat", () => {
  const train = [item(2, 2, false), item(8, 8, true)];
  assert.equal(R.nearest(train, { size: 3, dots: 2 }).yes, false);
  assert.equal(R.nearest(train, { size: 7, dots: 9 }).yes, true);
  assert.equal(R.nnErrors(train, [item(3, 3, false), item(9, 9, true)]), 0);
  assert.equal(R.nnErrors(train, [item(3, 3, true)]), 1);
});

test("makeRuleTask: qoida bilan 0 xato bo'ladi, ikki xil javob bor", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = R.makeRuleTask(prev);
    assert.equal(task.items.length, 8);
    assert.ok(task.items.some((x) => x.yes) && task.items.some((x) => !x.yes));
    assert.equal(R.errorsOf(task.items, task.answer), 0);
    assert.equal(R.bestRule(task.items).errors, 0);
    if (prev) assert.notDeepEqual(task.answer, prev.answer);
    prev = task;
  }
});

test("makeFuzzyTask: hech bir qoida to'g'ri ishlamaydi, misollar esa yetarli", () => {
  for (let i = 0; i < 60; i++) {
    const task = R.makeFuzzyTask();
    assert.equal(task.items.length, 8);
    assert.equal(task.examples.length, 6);
    assert.ok(R.bestRule(task.items).errors >= 2, "qoida bilan yechib bo'ldi");
    assert.equal(R.nnErrors(task.examples, task.items), 0, "misollar bilan yechilmadi");
  }
});

test("makeSetKindTask: qoidali to'plam — «qoida», chalkash — «misol»", () => {
  let prev = null;
  let qoida = 0;
  for (let i = 0; i < 100; i++) {
    const task = R.makeSetKindTask(i % 2, prev);
    const solvable = R.bestRule(task.items).errors === 0;
    assert.equal(task.answer, solvable ? "qoida" : "misol");
    if (task.answer === "qoida") qoida++;
    prev = task;
  }
  assert.ok(qoida > 20 && qoida < 80, `muvozanat buzilgan: ${qoida}`);
});

test("makeKindTask: hayotdan misollar, javobi ro'yxatdagidek", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = R.makeKindTask(prev);
    const found = R.CASES.find((c) => c.text === task.text);
    assert.ok(found, task.text);
    assert.equal(task.answer, found.kind);
    assert.ok(task.why.length > 5);
    seen.add(task.text);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.ok(seen.size >= 6, "misollar takrorlanib qolyapti");
});

test("hayotdan misollar ro'yxati: ikki turi ham yetarli", () => {
  const qoida = R.CASES.filter((c) => c.kind === "qoida").length;
  const misol = R.CASES.filter((c) => c.kind === "misol").length;
  assert.ok(qoida >= 5 && misol >= 5, `${qoida} / ${misol}`);
  for (const c of R.CASES) assert.ok(c.text && c.why && ["qoida", "misol"].includes(c.kind));
});
