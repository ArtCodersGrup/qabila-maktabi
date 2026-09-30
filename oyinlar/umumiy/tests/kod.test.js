// umumiy/js/kod.js testlari: beshta masala turining tekshirilishi.
const test = require("node:test");
const assert = require("node:assert/strict");
const K = require("../js/kod.js");

test("ter: aynan terilsa o'tadi, farq bo'lsa joyini ko'rsatadi", () => {
  const task = { type: "ter", code: 'print("Salom")' };
  assert.equal(K.check(task, 'print("Salom")').ok, true);
  assert.equal(K.check(task, 'print("Salom")  ').ok, true, "satr oxiridagi bo'shliq kechiriladi");
  const bad = K.check(task, 'print("salom")');
  assert.equal(bad.ok, false);
  assert.equal(bad.diff.line, 1);
  assert.equal(bad.diff.col, 8);
});

test("natija: kod chiqishini to'g'ri aytgan bola o'tadi", () => {
  const task = { type: "natija", solution: "for i in range(3):\n    print(i * i)" };
  assert.equal(K.check(task, "0\n1\n4").ok, true);
  assert.equal(K.check(task, "0\n1\n4\n").ok, true, "oxirgi bo'sh satr hisobga olinmaydi");
  const bad = K.check(task, "0\n1");
  assert.equal(bad.ok, false);
  assert.ok(bad.hint.includes("3 ta"));
});

test("natija: input() ishlatadigan kod kirish satrlari bilan hisoblanadi", () => {
  const task = { type: "natija", solution: "a = int(input())\nb = int(input())\nprint(a + b)", stdin: ["12", "30"] };
  assert.equal(K.check(task, "42").ok, true);
  assert.equal(K.check(task, "1230").ok, false);
});

test("natija: kutilgan chiqishni to'g'ridan-to'g'ri yozish ham mumkin", () => {
  assert.equal(K.check({ type: "natija", code: "…", expected: ["5"] }, "5").ok, true);
});

test("bosh-joy: bir nechta to'g'ri javob qabul qilinadi", () => {
  const task = { type: "bosh-joy", template: "x = ___\nprint(x * 2)", solution: "x = 5\nprint(x * 2)" };
  assert.equal(K.check(task, ["5"]).ok, true);
  assert.equal(K.check(task, ["2 + 3"]).ok, true, "boshqacha yozilgan, lekin natija bir xil");
  assert.equal(K.check(task, ["4"]).ok, false);
  assert.equal(K.check(task, [""]).kind, "bosh");
});

test("bosh-joy: bir nechta bo'sh joy tartib bilan to'ldiriladi", () => {
  const task = { type: "bosh-joy", template: "for i in range(___):\n    print(___)", solution: "for i in range(3):\n    print(i)" };
  assert.equal(K.fill(task.template, ["3", "i"]), "for i in range(3):\n    print(i)");
  assert.equal(K.blanksIn(task.template), 2);
  assert.equal(K.check(task, ["3", "i"]).ok, true);
});

test("xato-top: tuzatilgan kod xatosiz ishlashi va to'g'ri chiqish berishi kerak", () => {
  const task = { type: "xato-top", code: 'print("Salom"', solution: 'print("Salom")' };
  assert.equal(K.check(task, 'print("Salom")').ok, true);
  const bad = K.check(task, 'print("Salom"');
  assert.equal(bad.ok, false);
  assert.equal(bad.kind, "xato");
  assert.equal(bad.error.type, "SyntaxError");
});

test("kod-yoz: barcha test holatlaridan o'tishi kerak", () => {
  const task = {
    type: "kod-yoz",
    solution: "n = int(input())\nprint(n * n)",
    tests: [{ stdin: ["3"] }, { stdin: ["12"] }, { stdin: ["0"] }],
  };
  assert.equal(K.check(task, "n = int(input())\nprint(n * n)").ok, true);
  assert.equal(K.check(task, "n = int(input())\nprint(n + n)").ok, false, "3 uchun to'g'ri, 12 uchun xato");
});

test("kod-yoz: yiqilgan birinchi test ko'rsatiladi", () => {
  const task = { type: "kod-yoz", solution: "n = int(input())\nprint(n * 2)", tests: [{ stdin: ["5"] }, { stdin: ["7"] }] };
  const bad = K.check(task, "n = int(input())\nif n == 5:\n    print(10)\nelse:\n    print(0)");
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.testCase.stdin, ["7"]);
  assert.ok(bad.hint.includes("kutilgan: 14"));
});

test("kod-yoz: cheksiz sikl yozilsa ham sahifa qotmaydi", () => {
  const task = { type: "kod-yoz", solution: "print(1)", tests: [{ stdin: [] }] };
  const bad = K.check(task, "while True:\n    x = 1");
  assert.equal(bad.ok, false);
  assert.equal(bad.error.type, "Limit");
});

test("kod-yoz: bo'sh javob", () => {
  assert.equal(K.check({ type: "kod-yoz", solution: "print(1)" }, "   ").kind, "bosh");
});

test("kod-yoz: funksiya yozish masalasi sinov satri bilan tekshiriladi", () => {
  const task = {
    type: "kod-yoz",
    solution: "def juftmi(n):\n    return n % 2 == 0",
    tail: "print(juftmi(int(input())))",
    tests: [{ stdin: ["4"] }, { stdin: ["7"] }, { stdin: ["0"] }],
  };
  assert.deepEqual(K.validate(task), []);
  assert.equal(K.check(task, task.solution).ok, true);
  assert.equal(K.check(task, "def juftmi(n):\n    return n % 2 == 1").ok, false, "teskari yozilgani o'tmaydi");
  assert.equal(K.check(task, "def boshqa(n):\n    return True").kind, "xato", "nomi boshqa bo'lsa NameError");
  // Funksiya ichida print yozib, return qilmagan yechim o'tmaydi
  assert.equal(K.check(task, "def juftmi(n):\n    print(n % 2 == 0)").ok, false);
});

test("validate: masala banki xatolarini topadi", () => {
  assert.deepEqual(K.validate({ type: "kod-yoz", solution: "print(1)", tests: [{ stdin: [], out: ["1"] }] }), []);
  assert.ok(K.validate({ type: "kod-yoz", solution: "print(2)", tests: [{ stdin: [], out: ["1"] }] })[0].includes("testdan o'tmadi"));
  assert.ok(K.validate({ type: "kod-yoz", solution: "print(" })[0].includes("xato berdi"));
  assert.ok(K.validate({ type: "bosh-joy", template: "x = 5", solution: "x = 5" })[0].includes("___"));
});
