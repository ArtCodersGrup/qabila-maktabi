// 30-o'yin mantiqi: shart, elif zanjiri, mantiqiy ifoda, xato ovi va kod yozish.
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
  const r = rngFrom(seed || 3);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("1-bosqich: har kod xatosiz ishlaydi va javobi to'g'ri tekshiriladi", () => {
  for (const task of each(L.ifTask, 40)) {
    const r = py.run(task.code);
    assert.equal(r.error, null, task.code);
    assert.ok(r.output.length >= 1 && r.output.length <= 2, task.code);
    assert.equal(K.check(task, r.output.join("\n")).ok, true);
  }
});

test("1-bosqich: ikkala yo'l ham chiqadi (hamma savol bir xil javobli emas)", () => {
  const outs = each(L.ifTask, 40).map((t) => py.run(t.code).output[0]);
  assert.ok(new Set(outs).size >= 4, "javoblar xilma-xil: " + [...new Set(outs)].join(", "));
});

test("1-bosqich: blokdan keyingi satr doim bajariladi", () => {
  const withTail = each(L.ifTask, 40).filter((t) => t.code.includes('print("tamom")'));
  assert.ok(withTail.length > 0, "otstup darsi uchun savol chiqmadi");
  for (const task of withTail) {
    const out = py.run(task.code).output;
    assert.equal(out[out.length - 1], "tamom", task.code);
  }
});

test("2-bosqich: elif zanjiri to'rt javobning birini beradi", () => {
  const seen = new Set();
  for (const task of each(L.elifTask, 60)) {
    const out = py.run(task.code).output;
    assert.equal(out.length, 1);
    assert.match(out[0], /^[2345]$/, task.code);
    seen.add(out[0]);
  }
  assert.ok(seen.size >= 3, "bahoning bir nechta xili chiqadi: " + [...seen].join(","));
});

test("2-bosqich: mantiqiy ifoda True yoki False beradi, ikkalasi ham uchraydi", () => {
  const outs = [];
  for (const task of each(L.boolTask, 50)) {
    const out = py.run(task.code).output;
    assert.equal(out.length, 1);
    assert.ok(out[0] === "True" || out[0] === "False", task.code + " → " + out[0]);
    outs.push(out[0]);
  }
  assert.ok(outs.includes("True") && outs.includes("False"));
});

test("3-bosqich: har buzilish xato beradi, sababi yozilgan, yechimi ishlaydi", () => {
  const kinds = new Set();
  for (const task of each(L.fixTask, 50)) {
    kinds.add(task.kind);
    const broken = py.run(task.code);
    assert.ok(broken.error, task.code);
    assert.ok(["SyntaxError", "IndentationError"].includes(broken.error.type), task.kind + " → " + broken.error.type);
    assert.ok(task.why && task.why.length > 10);
    assert.equal(py.run(task.solution).error, null);
    assert.equal(K.check(task, task.solution).ok, true);
  }
  assert.equal(kinds.size, L.BROKEN.length, "hamma buzilish turi uchraydi");
});

test("3-bosqich: kod yozish masalalari namunali yechim bilan o'tadi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
    assert.ok(kind.tests.length >= 4, kind.id + ": kamida 4 ta test holati");
  }
});

test("3-bosqich: chegaradagi holatlar tekshiriladi (10 va 20 kiradi)", () => {
  const oraliq = L.WRITE_KINDS.find((k) => k.id === "oraliq");
  const task = { type: "kod-yoz", solution: oraliq.solution, tests: oraliq.tests.map((stdin) => ({ stdin })) };
  // faqat qat'iy kichik/katta yozilgan yechim o'tmasligi kerak
  const wrong = 'n = int(input())\nif 10 < n < 20:\n    print("ha")\nelse:\n    print("yoʻq")';
  assert.equal(K.check(task, wrong).ok, false);
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.ifTask, L.elifTask, L.boolTask, L.fixTask]) {
    const tasks = each(make, 40, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("2- va 3-bosqichda savol turlari navbat bilan almashadi", () => {
  const kinds = each(L.stage2Task, 12).map((t) => t.kind);
  for (let k = 1; k < kinds.length; k++) assert.notEqual(kinds[k], kinds[k - 1]);
  const types = each(L.stage3Task, 12).map((t) => t.type);
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});
