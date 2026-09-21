// learn.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/learn.js");

const P = (x, y, full) => ({ x, y, full });

test("above / predict: chiziqdan yuqoridagi — to'la", () => {
  const line = { angle: 0, y0: 5 };
  assert.equal(L.above(line, P(5, 7)), true);
  assert.equal(L.above(line, P(5, 3)), false);
  assert.equal(L.predict(line, P(1, 9)), true);
  const slanted = { angle: 45, y0: 5 };
  assert.equal(L.above(slanted, P(9, 9)), false); // chiziq x=9 da y=9 — tepasida emas
  assert.equal(L.above(slanted, P(8, 9)), true);  // chiziq x=8 da y=8
  assert.equal(L.above(slanted, P(1, 2)), true);  // chiziq x=1 da y=1
});

test("errorsOf va wrongOnes: model qancha xato qiladi", () => {
  const line = { angle: 0, y0: 5 };
  const points = [P(2, 8, true), P(3, 7, true), P(4, 2, false), P(6, 7, false)];
  assert.equal(L.errorsOf(points, line), 1);
  assert.deepEqual(L.wrongOnes(points, line), [P(6, 7, false)]);
  assert.equal(L.errorsOf(points, { angle: 0, y0: 9 }), 2);
});

test("nearest / nearestList: eng yaqin misol", () => {
  const points = [P(1, 1, true), P(5, 5, false), P(9, 9, true)];
  assert.deepEqual(L.nearest(points, { x: 2, y: 2 }), P(1, 1, true));
  assert.deepEqual(L.nearest(points, { x: 8, y: 8 }), P(9, 9, true));
  assert.deepEqual(L.nearestList(points, { x: 5, y: 6 }, 2), [P(5, 5, false), P(9, 9, true)]);
  assert.equal(L.dist({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});

test("move: chiziqni surish va burish chegaradan chiqmaydi", () => {
  assert.deepEqual(L.move({ angle: 0, y0: 5 }, "up"), { angle: 0, y0: 5.5 });
  assert.deepEqual(L.move({ angle: 0, y0: 5 }, "down"), { angle: 0, y0: 4.5 });
  assert.equal(L.move({ angle: 0, y0: 8.5 }, "up").y0, 8.5);
  assert.equal(L.move({ angle: 0, y0: 1.5 }, "down").y0, 1.5);
  assert.equal(L.move({ angle: 0, y0: 5 }, "left").angle, L.ANGLES[L.ANGLES.indexOf(0) + 1]);
  assert.equal(L.move({ angle: L.ANGLES[0], y0: 5 }, "right").angle, L.ANGLES[0]);
  assert.equal(L.move({ angle: L.ANGLES[L.ANGLES.length - 1], y0: 5 }, "left").angle, L.ANGLES[L.ANGLES.length - 1]);
});

test("train: xato kamayib boradi va oxirida 0 ga yetadi", () => {
  const points = [P(2, 8, true), P(3, 9, true), P(4, 7, true), P(6, 2, false), P(7, 3, false), P(8, 1, false)];
  const steps = L.train(points, { angle: 0, y0: 2 });
  assert.ok(steps.length > 1);
  for (let k = 1; k < steps.length; k++) assert.ok(steps[k].errors <= steps[k - 1].errors, "xato koʻpaydi");
  assert.equal(steps[steps.length - 1].errors, 0);
  assert.deepEqual(L.fit(points, { angle: 0, y0: 2 }), steps[steps.length - 1].line);
});

test("makeExamples: yarmi to'la, hammasi chiziqdan uzoqda, takrorsiz", () => {
  for (let i = 0; i < 100; i++) {
    const set = L.makeExamples(10, Math.random);
    assert.equal(set.points.length, 10);
    assert.equal(set.points.filter((p) => p.full).length, 5);
    assert.equal(L.errorsOf(set.points, set.hidden), 0);
    assert.equal(new Set(set.points.map((p) => `${p.x}:${p.y}`)).size, 10);
    for (const p of set.points) {
      assert.ok(p.x >= 1 && p.x <= 9 && p.y >= 1 && p.y <= 9, `${p.x},${p.y}`);
      assert.ok(L.gap(set.hidden, p) >= 1.2 - 1e-9);
    }
  }
});

test("makeNearestTask: eng yaqin misol javobga mos va ikkilanishsiz", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = L.makeNearestTask(prev);
    assert.equal(task.points.length, 6);
    const near = L.nearest(task.points, task.query);
    assert.equal(near.full, task.answer, "eng yaqin misol javobdan farq qildi");
    const other = L.nearestList(task.points, task.query, 6).find((p) => p.full !== near.full);
    assert.ok(L.dist(other, task.query) - L.dist(near, task.query) >= 1, "javob ikkilanarli");
    if (prev) assert.notDeepEqual(task.query, prev.query);
    prev = task;
  }
});

test("makeLineTask: boshida 3–5 xato, robot 0 ga keltira oladi", () => {
  let prev = null;
  for (let i = 0; i < 100; i++) {
    const task = L.makeLineTask(prev);
    assert.equal(task.points.length, 10);
    const e = L.errorsOf(task.points, task.start);
    assert.ok(e >= 3 && e <= 5, String(e));
    assert.equal(L.errorsOf(task.points, L.fit(task.points, task.start)), 0);
    prev = task;
  }
});

test("makeBiasTask: o'qitish o'ng chekkada, sinovda 2 xato, qo'shimcha misol tuzatadi", () => {
  for (let i = 0; i < 30; i++) {
    const task = L.makeBiasTask();
    assert.equal(task.train.length, 6);
    assert.equal(task.test.length, 6);
    assert.equal(task.extra.length, 2);
    for (const p of task.train) assert.ok(p.x >= 6, `train x=${p.x}`);
    for (const p of task.extra) assert.ok(p.x <= 4, `extra x=${p.x}`);
    assert.equal(L.errorsOf(task.train, task.model), 0);
    const wrong = task.test.filter((p) => L.predict(task.model, p) !== p.full);
    assert.equal(wrong.length, 2);
    assert.equal(L.errorsOf(task.test, task.model2), 0);
  }
});

test("makePredictTask: javob model chizig'iga mos", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = L.makePredictTask(prev);
    assert.equal(task.type, "predict");
    assert.equal(task.answer, L.predict(task.line, task.query));
    assert.ok(L.gap(task.line, task.query) >= 1.2 - 1e-9);
    if (prev) assert.notDeepEqual(task.query, prev.query);
    prev = task;
  }
});

test("makeUsefulTask: to'g'ri javob — misollardan eng uzoqdagi yong'oq", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = L.makeUsefulTask(prev);
    assert.equal(task.type, "useful");
    assert.equal(task.options.length, 3);
    const far = task.options.map((o) => Math.min(...task.points.map((p) => L.dist(p, o))));
    const sorted = [...far].sort((a, b) => b - a);
    assert.equal(far[task.answer], sorted[0]);
    assert.ok(sorted[0] - sorted[1] >= 1.5, "variantlar bir-biriga yaqin");
    prev = task;
  }
});

test("makeStage3Task: avval bashorat, keyin foydali misol", () => {
  assert.equal(L.makeStage3Task(0, null).type, "predict");
  assert.equal(L.makeStage3Task(1, null).type, "useful");
});
