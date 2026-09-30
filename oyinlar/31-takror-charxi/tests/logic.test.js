// 31-o'yin mantiqi: sanoq sikli, yig'indi, raqamlarni ajratish va xato ovi.
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
  const r = rngFrom(seed || 13);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("1-bosqich: sikl tugaydi, chiqish 8 satrdan oshmaydi", () => {
  for (const task of each(L.countTask, 40)) {
    const r = py.run(task.code, { maxSteps: 100000 });
    assert.equal(r.error, null, task.code);
    assert.ok(r.output.length >= 1 && r.output.length <= L.MAX_LINES, task.code + " → " + r.output.length + " satr");
    assert.equal(K.check(task, r.output.join("\n")).ok, true);
  }
});

test("2-bosqich: javob bitta satr va chegarada", () => {
  for (const task of each(L.sumTask, 50)) {
    const r = py.run(task.code, { maxSteps: 100000 });
    assert.equal(r.error, null, task.code);
    assert.equal(r.output.length, 1, task.code);
    assert.ok(Math.abs(Number(r.output[0])) <= L.MAX_VALUE, task.code + " → " + r.output[0]);
  }
});

test("2-bosqich: break ishlatilgan savol ham chiqadi", () => {
  const tasks = each(L.sumTask, 60);
  assert.ok(tasks.some((t) => t.code.includes("break")), "break li savol chiqmadi");
});

test("raqam ajratish qadamlari to'g'ri hisoblanadi", () => {
  assert.deepEqual(L.digitSteps(472), [
    { son: 472, oxirgi: 2, qolgan: 47 },
    { son: 47, oxirgi: 7, qolgan: 4 },
    { son: 4, oxirgi: 4, qolgan: 0 },
  ]);
  assert.equal(L.digitSteps(5).length, 1);
});

test("3-bosqich: cheksiz sikl xatosi qadam chegarasi bilan tutiladi", () => {
  const task = each(L.fixTask, 40).find((t) => t.kind === "cheksiz");
  assert.ok(task, "cheksiz sikl savoli chiqmadi");
  const broken = py.run(task.code, { maxSteps: 5000 });
  assert.equal(broken.error.type, "Limit", task.code);
  assert.equal(py.run(task.solution).error, null);
  assert.equal(K.check(task, task.solution).ok, true);
});

test("3-bosqich: har buzilish turi noto'g'ri natija beradi", () => {
  const kinds = new Set();
  for (const task of each(L.fixTask, 40)) {
    kinds.add(task.kind);
    assert.equal(K.check(task, task.code).ok, false, task.kind + ": buzuq kod o'tib ketdi");
    assert.equal(K.check(task, task.solution).ok, true, task.kind);
    assert.ok(task.why.length > 10);
  }
  assert.equal(kinds.size, L.BROKEN.length);
});

test("3-bosqich: kod yozish masalalari namunali yechim bilan o'tadi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
    assert.ok(kind.tests.length >= 4, kind.id);
  }
});

test("3-bosqich: bir xonali son va nol bilan tugaydigan son ham tekshiriladi", () => {
  for (const kind of L.WRITE_KINDS) {
    const stdins = kind.tests.map((t) => t[0]);
    assert.ok(stdins.some((s) => s.length === 1), kind.id + ": bir xonali son yo'q");
    assert.ok(stdins.some((s) => s.endsWith("0")), kind.id + ": nol bilan tugaydigan son yo'q");
  }
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.countTask, L.sumTask]) {
    const tasks = each(make, 30, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan", () => {
  const types = each(L.stage3Task, 12).map((t) => t.type);
  assert.ok(types.includes("xato-top") && types.includes("kod-yoz"));
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});
