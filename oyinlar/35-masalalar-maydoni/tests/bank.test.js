// 35-o'yin: masalalar banki. Har masalaning namunali yechimi barcha testlardan o'tishi shart
// (QOIDALAR §4.3 dagi masala banki istisnosi shuni talab qiladi).
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/bank.js");
const L = require("../js/logic.js");
const K = require("../../umumiy/js/kod.js");
const py = require("../../umumiy/js/python/python.js");

const allProblems = B.LEVELS.flatMap((level) => level.problems.map((p) => [level, p]));

test("uchta daraja bor va har birida kamida 6 ta masala", () => {
  assert.equal(B.LEVELS.length, 3);
  assert.deepEqual(B.LEVELS.map((l) => l.id), ["oson", "orta", "qiyin"]);
  for (const level of B.LEVELS) {
    assert.ok(level.problems.length >= 6, level.id + ": " + level.problems.length + " ta masala");
  }
});

test("har masalada shart, format, namuna, testlar, yechim va maslahat bor", () => {
  for (const [level, p] of allProblems) {
    const where = level.id + "/" + p.id;
    for (const field of ["title", "what", "kirish", "chiqish", "solution", "hint"]) {
      assert.ok(p[field] && String(p[field]).length > 5, where + ": " + field);
    }
    assert.ok(p.namuna && p.namuna.stdin && p.namuna.out, where + ": namuna");
    assert.ok(p.tests.length >= 4, where + ": kamida 4 ta yashirin test");
  }
});

test("masala nomlari takrorlanmaydi", () => {
  const ids = allProblems.map(([, p]) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("namunali yechim namunadagi javobni aynan beradi", () => {
  for (const [level, p] of allProblems) {
    const r = py.run(p.solution, { stdin: p.namuna.stdin, maxSteps: 200000 });
    assert.equal(r.error, null, level.id + "/" + p.id + ": " + (r.error && r.error.text));
    assert.deepEqual(r.output, p.namuna.out, level.id + "/" + p.id);
  }
});

test("namunali yechim barcha yashirin testlarda ham xatosiz ishlaydi", () => {
  for (const [level, p] of allProblems) {
    const task = L.toTask(p);
    assert.deepEqual(K.validate(task), [], level.id + "/" + p.id);
    assert.equal(K.check(task, p.solution).ok, true, level.id + "/" + p.id);
  }
});

test("bo'sh yoki soxta yechim o'tmaydi", () => {
  for (const [level, p] of allProblems) {
    const task = L.toTask(p);
    assert.equal(K.check(task, "   ").ok, false, level.id + "/" + p.id);
    // Faqat namunadagi javobni yozib qo'ygan yechim yashirin testda yiqiladi
    const cheat = p.namuna.out.map((line) => "print(" + JSON.stringify(line) + ")").join("\n");
    assert.equal(K.check(task, cheat).ok, false, level.id + "/" + p.id + ": namunani ko'chirgan yechim o'tdi");
  }
});

test("yechimlar faqat o'rgatilgan qismdan foydalanadi", () => {
  const taqiq = [/\bimport\b/, /\bclass\b/, /\blambda\b/, /f"/, /\.format\(/, /\bdict\b/, /\bset\(/, /\bmap\(/, /\bzip\(/, /\benumerate\(/];
  for (const [level, p] of allProblems) {
    for (const re of taqiq) {
      assert.ok(!re.test(p.solution), level.id + "/" + p.id + ": " + re);
    }
  }
});

test("masala tanlash: yechilgani qayta chiqmaydi", () => {
  let s = 7;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const used = [];
  const level = B.LEVELS[0];
  for (let k = 0; k < level.problems.length; k++) {
    const task = L.pickProblem(1, used, rnd);
    assert.ok(!used.includes(task.id), "takrorlandi: " + task.id);
    used.push(task.id);
  }
  // Bank tugagach, boshidan beriladi
  const again = L.pickProblem(1, used, rnd);
  assert.ok(level.problems.some((p) => p.id === again.id));
});

test("daraja bosqich raqamiga mos keladi", () => {
  assert.equal(L.levelByIndex(1).id, "oson");
  assert.equal(L.levelByIndex(2).id, "orta");
  assert.equal(L.levelByIndex(3).id, "qiyin");
});
