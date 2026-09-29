// Xato xabarlari: turi, satri va bolaga beriladigan izohi.
// Xato turlari python3 bilan python-parity.test.js da solishtiriladi; bu yerda izohlar tekshiriladi.
const test = require("node:test");
const assert = require("node:assert/strict");
const py = require("../js/python/python.js");

const boom = (code, opts) => {
  const r = py.run(code, opts);
  assert.ok(r.error, "xato kutilgan edi: " + code);
  return r.error;
};

test("har bir xato satr raqamini ko'rsatadi", () => {
  assert.equal(boom("x = 1\ny = 2\nprint(z)").line, 3);
  assert.equal(boom("a = [1]\nprint(a[7])").line, 2);
});

test("har bir xatoning o'zbekcha izohi bor", () => {
  const codes = ["print(x)", "print(1 / 0)", 'print("5" + 5)', "print(len(5))", 'print(int("a"))', "a = [1]\nprint(a[7])"];
  for (const code of codes) {
    const e = boom(code);
    assert.ok(e.hint && e.hint.length > 10, code + " — izoh yo'q");
  }
});

test("nom topilmasa, qo'shtirnoq unutilgani eslatiladi", () => {
  const e = boom("print(Salom)");
  assert.equal(e.type, "NameError");
  assert.ok(e.hint.includes('"Salom"'));
});

test("matn va sonni qo'shishda yechim aytiladi", () => {
  const e = boom('yosh = 12\nprint("Yoshim: " + yosh)');
  assert.equal(e.type, "TypeError");
  assert.ok(e.hint.includes("str(") && e.hint.includes("print(a, b)"));
});

test("matnni son bilan solishtirganda int(input()) eslatiladi", () => {
  const e = boom('n = input()\nif n > 5:\n    print("katta")', { stdin: ["7"] });
  assert.equal(e.type, "TypeError");
  assert.ok(e.hint.includes("int(input())"));
});

test("chiqish matni satr raqami bilan ko'rinadi", () => {
  assert.equal(boom("x = 1\nprint(y)").text, "NameError: name 'y' is not defined  (2-satr)");
});

test("xato joyini ko'rsatadigan o'q", () => {
  const e = boom("x = 1\nprint(1 / 0)");
  assert.ok(e.col >= 1);
  assert.equal(py.errors.pointer("print(1 / 0)", 9), "        ↑");
});

test("ichki xato bo'lsa ham bolaga tushunarli xabar chiqadi", () => {
  const e = py.errors.describe(py.errors.err("InternalError", "nimadir", { hint: "saytning xatosi" }));
  assert.equal(e.type, "InternalError");
  assert.ok(e.text.includes("nimadir"));
});
