// 28-o'yin mantiqi: bo'lish, amallar tartibi va kod yozish masalalari.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const K = require("../../umumiy/js/kod.js");
const py = require("../../umumiy/js/python/python.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 5);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("1-bosqich: uchala amal ham uchraydi, javob bitta satr", () => {
  const ops = new Set();
  for (const task of each(L.divisionTask, 60)) {
    ops.add(task.op);
    const r = py.run(task.code);
    assert.equal(r.error, null, task.code);
    assert.equal(r.output.length, 1);
    assert.equal(K.check(task, r.output[0]).ok, true);
  }
  assert.deepEqual([...ops].sort(), ["%", "/", "//"]);
});

test("1-bosqich: / javobi uzun kasr bo'lmaydi", () => {
  for (const task of each(L.divisionTask, 60)) {
    if (task.op !== "/") continue;
    const out = py.run(task.code).output[0];
    assert.match(out, /^\d+\.\d$/, task.code + " → " + out);
  }
});

test("1-bosqich: bo'luvchi 2–9, bo'linuvchi undan katta", () => {
  for (const task of each(L.divisionTask, 40)) {
    assert.ok(task.b >= 2 && task.b <= 9, task.code);
    assert.ok(task.a > task.b && task.a <= 99, task.code);
  }
});

test("2-bosqich: javob butun son va 0–200 oralig'ida", () => {
  for (const task of each(L.orderTask, 60)) {
    const out = py.run(task.code).output;
    assert.equal(out.length, 1);
    const value = Number(out[0]);
    assert.ok(Number.isInteger(value), task.code + " → " + out[0]);
    assert.ok(value >= 0 && value <= L.MAX, task.code + " → " + out[0]);
    assert.equal(K.check(task, out[0]).ok, true);
  }
});

test("2-bosqich: tartib muhim bo'lgan ifodalar chiqadi", () => {
  const tasks = each(L.orderTask, 80);
  assert.ok(tasks.some((t) => t.code.includes("(")), "qavsli ifoda");
  assert.ok(tasks.some((t) => t.code.includes("**")), "darajali ifoda");
  assert.ok(tasks.some((t) => t.code.includes("//") || t.code.includes("%")), "butun bo'linma yoki qoldiq");
});

test("3-bosqich: buzuq kod TypeError beradi, yechimi ishlaydi", () => {
  for (const task of each(L.fixTask, 30)) {
    const broken = py.run(task.code);
    assert.equal(broken.error.type, "TypeError", task.code);
    assert.equal(py.run(task.solution).error, null, task.solution);
    assert.equal(K.check(task, task.solution).ok, true);
    // Ikkala to'g'ri yo'l ham qabul qilinadi: vergul bilan ham, str() bilan ham
    const other = task.solution.replace(/print\("([^"]*):", x\)/, 'print("$1: " + str(x))');
    assert.notEqual(other, task.solution);
    assert.equal(K.check(task, other).ok, true, "str() bilan yozilgani ham to'g'ri");
  }
});

test("3-bosqich: kod yozish masalalari uch test holatidan o'tadi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
  }
});

test("3-bosqich: bitta holatga moslangan yechim o'tmaydi", () => {
  const task = each(L.writeTask, 1)[0];
  const firstOut = py.run(task.solution, { stdin: task.tests[0].stdin }).output;
  const cheat = firstOut.map((line) => "print(" + line + ")").join("\n");
  assert.equal(K.check(task, cheat).ok, false);
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.divisionTask, L.orderTask, L.fixTask]) {
    const tasks = each(make, 40, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan", () => {
  const types = each(L.stage3Task, 12).map((t) => t.type);
  assert.ok(types.includes("xato-top") && types.includes("kod-yoz"));
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});
