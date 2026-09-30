// 29-o'yin mantiqi: dasturlar, kuzatuv jadvali va kirishli masalalar.
// Ishga tushirish (o'yin papkasida): node --test tests/*.test.js
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
  const r = rngFrom(seed || 11);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("dasturlar xatosiz ishlaydi va qiymatlar chegarada qoladi", () => {
  for (const task of each(L.resultTask, 40)) {
    const r = py.run(task.code);
    assert.equal(r.error, null, task.code);
    for (const value of Object.values(r.vars)) {
      const n = Number(value);
      assert.ok(Number.isInteger(n), task.code + " → " + value);
      assert.ok(n >= L.LOW && n <= L.HIGH, task.code + " → " + value);
    }
  }
});

test("1-bosqich: har dastur print bilan tugaydi va javobi bitta satr", () => {
  for (const task of each(L.resultTask, 30)) {
    assert.match(task.code, /\nprint\(a(, b)?\)$/);
    const out = py.run(task.code).output;
    assert.equal(out.length, 1);
    assert.equal(K.check(task, out[0]).ok, true);
    assert.equal(K.check(task, "0").ok, false);
  }
});

test("kuzatuv jadvali: har bajarilgan satr uchun bitta qator", () => {
  for (const task of each(L.traceTask, 30)) {
    const lines = task.code.split("\n");
    assert.equal(task.rows.length, lines.length, task.code);
    task.rows.forEach((row, k) => {
      assert.equal(row.text, lines[k]);
      assert.equal(row.line, k + 1);
    });
  }
});

test("kuzatuv jadvali: birinchi qatorda b hali yo'q, qiymatlar butun son", () => {
  for (const task of each(L.traceTask, 30)) {
    assert.equal(task.rows[0].values.b, null, "b hali yaratilmagan");
    assert.match(task.rows[0].values.a, /^\d+$/);
    for (const row of task.rows.slice(1)) {
      for (const name of task.vars) {
        if (row.values[name] !== null) assert.match(row.values[name], /^-?\d+$/, task.code);
      }
    }
  }
});

test("kuzatuv jadvali: oxirgi qatorda qiymat haqiqatan o'zgargan", () => {
  for (const task of each(L.traceTask, 30)) {
    const last = task.rows[task.rows.length - 1].values;
    const before = task.rows[task.rows.length - 2].values;
    assert.notDeepEqual(last, before, task.code);
  }
});

test("almashtirish: ikki yo'l ham bir xil natija beradi", () => {
  const long = py.run(L.SWAP_LONG + "\nprint(a, b)").output;
  const short = py.run(L.SWAP_SHORT + "\nprint(a, b)").output;
  assert.deepEqual(long, ["8 3"]);
  assert.deepEqual(short, ["8 3"]);
});

test("3-bosqich: kirishli savollar kirish satrlari bilan ishlaydi", () => {
  for (const task of each(L.inputResultTask, 30)) {
    assert.ok(task.stdin.length >= 1);
    const r = py.run(task.code, { stdin: task.stdin });
    assert.equal(r.error, null, task.code);
    assert.ok(r.output.length >= 1);
    assert.equal(K.check(task, r.output.join("\n")).ok, true);
  }
});

test("3-bosqich: kod yozish masalasi uch test holatida tekshiriladi", () => {
  for (const task of each(L.writeTask, 10)) {
    assert.equal(task.tests.length, 3);
    assert.equal(K.check(task, task.solution).ok, true);
    // faqat bitta holatga moslangan yechim o'tmaydi
    assert.equal(K.check(task, "print(10)").ok, false);
    assert.deepEqual(K.validate(task), []);
  }
});

test("bir xil savol ketma-ket ikki marta chiqmaydi", () => {
  for (const make of [L.resultTask, L.traceTask, L.inputResultTask]) {
    const tasks = each(make, 40, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan keladi", () => {
  const types = each(L.stage3Task, 16).map((t) => t.type);
  assert.ok(types.includes("natija") && types.includes("kod-yoz"));
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});
