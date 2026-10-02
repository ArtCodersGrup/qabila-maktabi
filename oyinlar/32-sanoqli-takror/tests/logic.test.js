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
  // Faqat sodda shakl: "for i in range(a, b): print(i)" (break li va sanovchi sikllar bu yerga kirmaydi)
  const task = each(L.boundTask, 120).find((t) => /^for i in range\((\d+), (\d+)\):\n {4}print\(i\)$/.test(t.code));
  const m = /range\((\d+), (\d+)\)/.exec(task.code);
  const out = py.run(task.code).output;
  assert.equal(out[out.length - 1], String(Number(m[2]) - 1), task.code);
});

test("3-bosqich: ichma-ich sikl va naqsh savollari chiqadi", () => {
  const codes = each(L.nestedTask, 40).map((t) => t.code);
  assert.ok(codes.some((c) => (c.match(/for /g) || []).length === 2), "ikki qavatli sikl");
  assert.ok(codes.some((c) => c.includes('"*" * i')), "naqsh");
});

// 2026-10-02: qiyinlik zinasi va yangi shakllar
test("zina: yangi shakllar faqat yuqori zinalarda, oxirgisida albatta uchraydi", () => {
  const kodlar = (make, tier) => {
    const r = rngFrom(23);
    let prev = null;
    const out = [];
    for (let k = 0; k < 80; k++) { prev = make(r, prev, tier); out.push(prev.code); }
    return out;
  };
  for (const c of kodlar(L.rangeTask, 0)) assert.match(c, /^for i in range\(\d+\):\n {4}print\([^\n]*\)$/, c);
  for (const c of kodlar(L.boundTask, 0)) assert.ok(!c.includes("break") && !c.includes("continue") && !c.includes("% 3"), c);
  for (const c of kodlar(L.nestedTask, 0)) assert.ok(!c.includes("i + 1") && !c.includes("continue") && !c.includes("range(i)"), c);
  const b = kodlar(L.boundTask, 2);
  assert.ok(b.some((c) => c.includes("break")), "break");
  assert.ok(b.some((c) => c.includes("continue")), "continue");
  const n = kodlar(L.nestedTask, 2);
  assert.ok(n.some((c) => c.includes("for j in range(i + 1, ")), "uchburchak juftliklar: range(i + 1, n)");
  assert.ok(n.some((c) => c.includes("if i == j:\n            continue")), "if i == j: continue");
  assert.ok(n.some((c) => c.includes("if i + j ==")), "yig'indisi k bo'lgan juftliklar");
});

test("yangi shakllarning javobi qo'lda tekshirilgan misollarda to'g'ri", () => {
  // Uchburchak juftliklar: n = 4 da C(4, 2) = 6 ta juftlik
  assert.equal(py.run("for i in range(4):\n    for j in range(i + 1, 4):\n        print(i, j)").output.length, 6);
  // i == j ni tashlab ketish: n × n − n
  assert.deepEqual(py.run("soni = 0\nfor i in range(4):\n    for j in range(4):\n        if i == j:\n            continue\n        soni += 1\nprint(soni)").output, ["12"]);
  // Oxiri qadamga to'g'ri kelmaydigan range: range(4, 13, 4) → 4, 8, 12
  assert.deepEqual(py.run("for i in range(4, 13, 4):\n    print(i)").output, ["4", "8", "12"]);
  // Sikldan keyin i oxirgi qiymatida qoladi
  assert.deepEqual(py.run("for i in range(3):\n    print(i * 4 + 1)\nprint(i)").output, ["1", "5", "9", "2"]);
  // break: sikl to'xtagan paytdagi i chiqadi
  assert.deepEqual(py.run("for i in range(1, 20):\n    if i * i > 12:\n        break\n    print(i)\nprint(i)").output, ["1", "2", "3", "4"]);
});

test("yangi kod yozish masalalari: chegara xatolari o'tmaydi", () => {
  assert.ok(L.WRITE_KINDS.length >= 9);
  const vazifa = (id) => {
    const kind = L.WRITE_KINDS.find((k) => k.id === id);
    return { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
  };
  // b kirmay qolgan (range(a, b)) — "3 3" va "0 9" da yiqiladi
  assert.equal(K.check(vazifa("uchga-bolinuvchi"), "a = int(input())\nb = int(input())\nsoni = 0\nfor i in range(a, b):\n    if i % 3 == 0:\n        soni += 1\nprint(soni)").ok, false);
  // Teskari uchburchak: 0 gacha tushib, bo'sh satr chiqargan yechim ham qabul qilinadi (oxirgi bo'sh satr hisobga olinmaydi),
  // lekin 1 dan boshlagan (oddiy uchburchak) — yo'q
  assert.equal(K.check(vazifa("teskari-uchburchak"), 'n = int(input())\nfor i in range(1, n + 1):\n    print("*" * i)').ok, false);
  // Jadval: 3 × 3
  assert.deepEqual(K.expectedFor(vazifa("jadval"), { stdin: ["3"] }), ["1 2 3", "2 4 6", "3 6 9"]);
  // Juftliklar: (i, j) va (j, i) ni ikki marta sanagan yechim yiqiladi; i = j ni qo'shgan yechim "4 8" va "4 4" da yiqiladi
  assert.equal(K.check(vazifa("juftliklar"), "n = int(input())\nk = int(input())\nsoni = 0\nfor i in range(1, n + 1):\n    for j in range(1, n + 1):\n        if i + j == k:\n            soni += 1\nprint(soni)").ok, false);
  assert.equal(K.check(vazifa("juftliklar"), "n = int(input())\nk = int(input())\nsoni = 0\nfor i in range(1, n + 1):\n    for j in range(i, n + 1):\n        if i + j == k:\n            soni += 1\nprint(soni)").ok, false);
  assert.deepEqual(K.expectedFor(vazifa("juftliklar"), { stdin: ["5", "6"] }), ["2"]);
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
