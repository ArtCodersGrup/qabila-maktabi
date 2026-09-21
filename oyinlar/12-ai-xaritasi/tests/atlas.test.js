// atlas.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const A = require("../js/atlas.js");

test("xarita zonalari: oddiy dastur, AI ⊃ ML ⊃ DL", () => {
  assert.deepEqual(A.ZONES.map((z) => z.id), ["plain", "ai", "ml", "dl"]);
  for (const z of A.ZONES) assert.ok(z.name && z.short && z.def, z.id);
  assert.equal(A.inside("dl", "ml"), true);
  assert.equal(A.inside("dl", "ai"), true);
  assert.equal(A.inside("ml", "dl"), false);
  assert.equal(A.inside("ai", "plain"), true, "hamma narsa dastur");
});

test("ta'riflar: har doira uchun kamida 2 ta, kalit so'z matnda bor", () => {
  for (const id of ["ai", "ml", "dl"]) assert.ok(A.DEFS.filter((d) => d.circle === id).length >= 2, id);
  for (const d of A.DEFS) assert.ok(d.text.includes(d.key), `${d.text} — ${d.key}`);
});

test("vazifalar: har biriga kamida 2 ta ish", () => {
  assert.deepEqual(A.TASKS.map((t) => t.id), ["korish", "til", "harakat", "hisob"]);
  for (const t of A.TASKS) assert.ok(A.JOBS.filter((j) => j.task === t.id).length >= 2, t.id);
});

test("real misollar: har zonada kamida 3 ta, vazifasi va sababi bor", () => {
  for (const z of A.ZONES) assert.ok(A.EXAMPLES.filter((e) => e.zone === z.id).length >= 3, z.id);
  for (const e of A.EXAMPLES) {
    assert.ok(A.TASKS.some((t) => t.id === e.task), e.text);
    assert.ok(e.why.length > 10, e.text);
  }
  assert.equal(A.EXAMPLES.find((e) => e.text.startsWith("Kalkulyator")).zone, "plain", "kalkulyator AI emas");
});

test("6–11-o'yinlar xaritada", () => {
  assert.deepEqual(A.GAMES.map((g) => g.n), [6, 7, 8, 9, 10, 11]);
  assert.equal(A.GAMES.find((g) => g.n === 11).zone, "dl");
  for (const g of A.GAMES) assert.ok(A.ZONES.some((z) => z.id === g.zone), g.n);
});

test("makeDefTask: javob ta'rifning doirasi, ketma-ket takrorlanmaydi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = A.makeDefTask(prev);
    const def = A.DEFS.find((d) => d.text === task.text);
    assert.equal(task.answer, def.circle);
    assert.deepEqual(task.options, ["ai", "ml", "dl"]);
    seen.add(task.answer);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.equal(seen.size, 3);
});

test("makeJobTask: javob ishning vazifasi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const task = A.makeJobTask(prev);
    assert.equal(task.answer, A.JOBS.find((j) => j.text === task.text).task);
    seen.add(task.answer);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.equal(seen.size, 4);
});

test("makeExampleTask: javob misolning zonasi, to'rtala zona chiqadi", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 300; i++) {
    const task = A.makeExampleTask(prev);
    const ex = A.EXAMPLES.find((e) => e.text === task.text);
    assert.equal(task.answer, ex.zone);
    assert.equal(task.why, ex.why);
    assert.deepEqual(task.options, ["plain", "ai", "ml", "dl"]);
    seen.add(task.answer);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.equal(seen.size, 4);
});
