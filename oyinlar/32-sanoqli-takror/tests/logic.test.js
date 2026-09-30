// 32-o'yin mantiqi: range, chegaralar, ichma-ich sikl va kod yozish.
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
  const r = rngFrom(seed || 17);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("hamma savol xatosiz ishlaydi va chiqishi 8 satrdan oshmaydi", () => {
  for (const make of [L.rangeTask, L.boundTask, L.nestedTask]) {
    for (const task of each(make, 30)) {
      const r = py.run(task.code, { maxSteps: 100000 });
      assert.equal(r.error, null, task.code);
      assert.ok(r.output.length >= 1 && r.output.length <= L.MAX_LINES, task.code + " → " + r.output.length);
      assert.equal(K.check(task, r.output.join("\n")).ok, true);
    }
  }
});

test("2-bosqichda uchala range shakli ham uchraydi", () => {
  const codes = each(L.boundTask, 60).map((t) => t.code);
  assert.ok(codes.some((c) => /range\(\d+, \d+\)/.test(c)), "range(a, b)");
  assert.ok(codes.some((c) => /range\(\d+, \d+, \d+\)/.test(c)), "qadam bilan");
  assert.ok(codes.some((c) => /range\(\d+, 0, -\d+\)/.test(c)), "manfiy qadam");
  assert.ok(codes.some((c) => c.includes("for harf in")), "satr bo'ylab");
});

test("range(a, b) da oxiri kirmasligi savollarda ko'rinadi", () => {
  const task = each(L.boundTask, 60).find((t) => /range\((\d+), (\d+)\):/.test(t.code));
  const m = /range\((\d+), (\d+)\)/.exec(task.code);
  const out = py.run(task.code).output;
  assert.equal(out[out.length - 1], String(Number(m[2]) - 1), task.code);
});

test("3-bosqich: ichma-ich sikl va naqsh savollari chiqadi", () => {
  const codes = each(L.nestedTask, 40).map((t) => t.code);
  assert.ok(codes.some((c) => (c.match(/for /g) || []).length === 2), "ikki qavatli sikl");
  assert.ok(codes.some((c) => c.includes('"*" * i')), "naqsh");
});

test("kod yozish masalalari namunali yechim bilan o'tadi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
    assert.ok(kind.tests.length >= 4, kind.id);
  }
});

test("chegara xatosi bilan yozilgan yechim o'tmaydi (range(1, n) va range(1, n + 1))", () => {
  const uch = L.WRITE_KINDS.find((k) => k.id === "uchburchak");
  const task = { type: "kod-yoz", solution: uch.solution, tests: uch.tests.map((stdin) => ({ stdin })) };
  const wrong = 'n = int(input())\nfor i in range(1, n):\n    print("*" * i)';
  assert.equal(K.check(task, wrong).ok, false);
  const yigindi = L.WRITE_KINDS.find((k) => k.id === "oraliq-yigindi");
  const task2 = { type: "kod-yoz", solution: yigindi.solution, tests: yigindi.tests.map((stdin) => ({ stdin })) };
  const wrong2 = "a = int(input())\nb = int(input())\ns = 0\nfor i in range(a, b):\n    s += i\nprint(s)";
  assert.equal(K.check(task2, wrong2).ok, false);
});

test("bir xil chegaradagi holat ham tekshiriladi (a = b)", () => {
  const yigindi = L.WRITE_KINDS.find((k) => k.id === "oraliq-yigindi");
  assert.ok(yigindi.tests.some((t) => t[0] === t[1]), "a = b holati yo'q");
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.rangeTask, L.boundTask, L.nestedTask]) {
    const tasks = each(make, 30, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan", () => {
  const types = each(L.stage3Task, 12).map((t) => t.type);
  assert.ok(types.includes("natija") && types.includes("kod-yoz"));
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});
