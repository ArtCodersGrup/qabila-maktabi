// 33-o'yin mantiqi: ro'yxat amallari, bo'ylab yurish, satr va kod yozish.
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
  const r = rngFrom(seed || 19);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("hamma savol xatosiz ishlaydi va javobi tekshiriladi", () => {
  for (const make of [L.listTask, L.walkTask, L.stringTask]) {
    for (const task of each(make, 30)) {
      const r = py.run(task.code, { maxSteps: 100000 });
      assert.equal(r.error, null, task.code);
      assert.ok(r.output.length >= 1 && r.output.length <= L.MAX_LINES, task.code);
      assert.equal(K.check(task, r.output.join("\n")).ok, true);
    }
  }
});

test("ro'yxatdagi sonlar takrorlanmaydi va 1–20 oralig'ida", () => {
  const r = rngFrom(4);
  for (let k = 0; k < 30; k++) {
    const nums = L.numbers(r);
    assert.equal(new Set(nums).size, nums.length);
    assert.ok(nums.every((n) => n >= 1 && n <= 20));
    assert.ok(nums.length >= 3 && nums.length <= 5);
  }
});

test("1-bosqichda manfiy indeks, o'zgartirish va append savollari chiqadi", () => {
  const codes = each(L.listTask, 50).map((t) => t.code);
  assert.ok(codes.some((c) => c.includes("a[-1]")), "manfiy indeks");
  assert.ok(codes.some((c) => c.includes("append")), "append");
  assert.ok(codes.some((c) => /a\[\d\] = /.test(c)), "o'zgartirish");
  assert.ok(codes.some((c) => c.includes("sum(a)")), "sum/max/min");
});

test("2-bosqichda ikkala yurish usuli va kesish chiqadi", () => {
  const codes = each(L.walkTask, 50).map((t) => t.code);
  assert.ok(codes.some((c) => c.includes("for x in a")), "for x in a");
  assert.ok(codes.some((c) => c.includes("range(len(a))")), "range(len(a))");
  assert.ok(codes.some((c) => /a\[\d:\d\]/.test(c) || c.includes("a[:2]")), "kesish");
});

test("3-bosqichda satr kesish va harflar bo'ylab yurish chiqadi", () => {
  const codes = each(L.stringTask, 50).map((t) => t.code);
  assert.ok(codes.some((c) => c.includes("s[1:4]")), "kesish");
  assert.ok(codes.some((c) => c.includes("for harf in s")), "harflar bo'ylab");
  assert.ok(codes.some((c) => c.includes("s[-1]")), "oxirgi harf");
});

test("kod yozish masalalari namunali yechim bilan o'tadi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
    assert.ok(kind.tests.length >= 4, kind.id);
  }
});

test("bitta qiymatli holat ham tekshiriladi (sikl umuman aylanmasligi mumkin)", () => {
  for (const kind of L.WRITE_KINDS) {
    if (kind.id === "ikkinchi-katta") continue; // kamida ikkita son kerak
    assert.ok(kind.tests.some((t) => t[0].split(" ").length === 1), kind.id + ": bitta qiymatli holat yo'q");
  }
});

test("bir xil sonlar bo'lgan holat eng katta masalasida tekshiriladi", () => {
  const eng = L.WRITE_KINDS.find((k) => k.id === "eng-katta");
  assert.ok(eng.tests.some((t) => new Set(t[0].split(" ")).size === 1), "bir xil sonlar holati yo'q");
});

test("input().split() ishlatadigan yechim haqiqatan ishlaydi", () => {
  const out = py.run("a = input().split()\nprint(len(a), a[0], a[-1])", { stdin: ["3 5 7"] });
  assert.equal(out.error, null);
  assert.deepEqual(out.output, ["3 3 7"]);
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.listTask, L.walkTask, L.stringTask]) {
    const tasks = each(make, 30, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});
