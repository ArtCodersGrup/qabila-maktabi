// vision.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../js/vision.js");

test("to'r va shablonlar: 6×6, uch xil shakl", () => {
  assert.equal(V.SIZE, 6);
  assert.deepEqual(V.NAMES, ["kvadrat", "uchburchak", "krest"]);
  for (const name of V.NAMES) {
    const grid = V.TEMPLATES[name];
    assert.equal(grid.length, 36, name);
    assert.ok(grid.every((c) => c === 0 || c === 1), name);
  }
  assert.equal(V.filled(V.TEMPLATES.kvadrat), 32);
  assert.equal(V.filled(V.TEMPLATES.uchburchak), 24);
  assert.equal(V.filled(V.TEMPLATES.krest), 20);
});

test("matchScore: bir xil rasmda 36, farq qilganda kamayadi", () => {
  assert.equal(V.matchScore(V.TEMPLATES.krest, V.TEMPLATES.krest), 36);
  assert.ok(V.matchScore(V.TEMPLATES.krest, V.TEMPLATES.kvadrat) < 36);
  const one = V.TEMPLATES.krest.slice();
  one[0] = one[0] ? 0 : 1;
  assert.equal(V.matchScore(V.TEMPLATES.krest, one), 35);
});

test("shift: rasm suriladi, chetdagi kataklar yo'qoladi", () => {
  const grid = new Array(36).fill(0);
  grid[0] = 1;   // chap-yuqori
  grid[35] = 1;  // o'ng-past
  const right = V.shift(grid, 1, 0);
  assert.equal(right[1], 1, "o'ngga surilmadi");
  assert.equal(right[0], 0);
  assert.equal(V.filled(right), 1, "o'ng chekkadagi katak yo'qolishi kerak");
  const down = V.shift(grid, 0, 1);
  assert.equal(down[6], 1);
});

test("bestMatch: eng ko'p mos kelgan shablon", () => {
  const best = V.bestMatch(V.TEMPLATES.uchburchak);
  assert.equal(best.name, "uchburchak");
  assert.equal(best.score, 36);
  assert.equal(best.list.length, 3);
  assert.ok(best.list[0].score >= best.list[1].score);
});

test("byFeature: bo'yalgan kataklar soniga eng yaqin shablon", () => {
  assert.equal(V.byFeature(V.TEMPLATES.krest), "krest");
  assert.equal(V.byFeature(V.shift(V.TEMPLATES.krest, 1, 0)), "krest", "surilganda ham belgi ishlaydi");
  assert.equal(V.byFeature(V.TEMPLATES.kvadrat), "kvadrat");
});

test("addNoise: aytilgancha katak o'zgaradi", () => {
  const noisy = V.addNoise(V.TEMPLATES.krest, 4, Math.random);
  assert.equal(V.matchScore(V.TEMPLATES.krest, noisy), 32);
});

test("makeReadTask: uch variantdan bittasi to'g'ri", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = V.makeReadTask(prev);
    assert.equal(task.options.length, 3);
    assert.deepEqual(task.options[task.answer], task.image);
    const keys = task.options.map((g) => g.join(""));
    assert.equal(new Set(keys).size, 3, "variantlar takrorlandi");
    if (prev) assert.notEqual(task.image.join(""), prev.image.join(""));
    prev = task;
  }
});

test("makeMatchTask: robot shablon bilan to'g'ri javob topadi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = V.makeMatchTask(prev);
    const best = V.bestMatch(task.image);
    assert.equal(best.name, task.answer);
    assert.ok(best.list[0].score - best.list[1].score >= 3, "javob ikkilanarli");
    seen.add(task.answer);
    prev = task;
  }
  assert.equal(seen.size, 3, "uchala shakl ham chiqishi kerak");
});

test("makeMethodTask: faqat bitta usul to'g'ri javob beradi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 300; i++) {
    const task = V.makeMethodTask(prev);
    const byPixels = V.bestMatch(task.image).name === task.truth;
    const byFeature = V.byFeature(task.image) === task.truth;
    assert.notEqual(byPixels, byFeature, "ikkala usul ham bir xil natija berdi");
    assert.equal(task.answer, byPixels ? "shablon" : "belgi");
    assert.ok(V.NAMES.includes(task.truth));
    seen.add(task.answer);
    prev = task;
  }
  assert.equal(seen.size, 2, "ikkala javob turi ham chiqishi kerak");
});
