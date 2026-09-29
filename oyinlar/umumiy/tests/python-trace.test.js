// Qadam-baqadam yurish: qaysi satr bajarildi, o'zgaruvchilar qanday o'zgardi.
// Kuzatuv jadvali (29-o'yin) va qadam paneli shunga tayanadi.
const test = require("node:test");
const assert = require("node:assert/strict");
const py = require("../js/python/python.js");

const lines = (code, opts) => py.trace(code, opts).states.map((s) => s.line);

test("har buyruqdan keyin bitta holat", () => {
  assert.deepEqual(lines("x = 1\nx = x + 1\nprint(x)"), [1, 2, 3]);
});

test("o'zgaruvchilar jadvali qadamma-qadam to'ladi", () => {
  const states = py.trace("a = 2\nb = 3\na = a * b").states;
  assert.deepEqual(states[0].vars, { a: "2" });
  assert.deepEqual(states[1].vars, { a: "2", b: "3" });
  assert.deepEqual(states[2].vars, { a: "6", b: "3" });
});

test("chiqish holat bilan birga o'sadi", () => {
  const states = py.trace('print("bir")\nprint("ikki")').states;
  assert.deepEqual(states[0].output, ["bir"]);
  assert.deepEqual(states[1].output, ["bir", "ikki"]);
});

test("for: har aylanishda sarlavha satri va tana satri", () => {
  const states = py.trace("for i in range(2):\n    print(i)").states;
  assert.deepEqual(states.map((s) => s.line), [1, 2, 1, 2]);
  assert.deepEqual(states.map((s) => s.vars.i), ["0", "0", "1", "1"]);
});

test("while: shart har aylanishda qayta ko'rinadi", () => {
  assert.deepEqual(lines("i = 0\nwhile i < 2:\n    i += 1\nprint(i)"), [1, 2, 3, 2, 3, 2, 4]);
});

test("funksiya ichiga ham kiriladi, lokal o'zgaruvchilar ko'rinadi", () => {
  const states = py.trace("def f(a):\n    b = a * 2\n    return b\nprint(f(3))").states;
  assert.deepEqual(states.map((s) => s.line), [1, 2, 3, 4]);
  assert.deepEqual(states[1].vars, { a: "3", b: "6" });
});

test("juda uzun dasturda holatlar soni cheklanadi", () => {
  const t = py.trace("for i in range(1000):\n    pass", { maxStates: 10 });
  assert.equal(t.states.length, 10);
  assert.equal(t.cut, true);
});

test("xato bo'lsa, unga qadar bo'lgan holatlar qoladi", () => {
  const t = py.trace("x = 1\ny = 0\nprint(x / y)");
  assert.deepEqual(t.states.map((s) => s.line), [1, 2]);
  assert.equal(t.error.type, "ZeroDivisionError");
});
