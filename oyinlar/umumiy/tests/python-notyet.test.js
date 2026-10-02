// Qo'llanmagan sintaksis "xato" emas: bola "bu saytda hali yo'q" degan xabarni ko'radi.
// Bu qoida muhim — bola o'zini xato qilgandek his qilmasligi kerak (PYTHON-DVIGATEL.md §1).
const test = require("node:test");
const assert = require("node:assert/strict");
const py = require("../js/python/python.js");

const NOT_YET = [
  ['print(f"salom {x}")', "f-satr"],
  ["import math", "import"],
  ["class It:\n    pass", "class"],
  ["try:\n    x = 1\nexcept:\n    pass", "try"],
  ["x = {1: 2}", "lugʻat"],
  ["x = (1, 2)", "tuple"],
  ["print(1, flush=True)", "nomli argument"],
  ["def f(a):\n    return a\nf(a=1)", "nomli argument"],
  ["for i, x in enumerate([1]):\n    pass", "ikki oʻzgaruvchi"],
  ["print(enumerate([1]))", "enumerate"],
  ["x = dict()", "dict"],
  ["def f(a=1):\n    return a", "standart qiymat"],
  ["for i, x in a:\n    pass", "ikki oʻzgaruvchi"],
  ["x = 5\nif x is None:\n    pass", "is"],
  ["x = 0b1010", "sanoq tizimi"],
  ["s = '''uzun'''", "uch qoʻshtirnoq"],
];

test("qo'llanmagan sintaksis NotYet turini beradi, xato emas", () => {
  for (const [code] of NOT_YET) {
    const r = py.run(code);
    assert.ok(r.error, code + " — javob kutilgan edi");
    assert.equal(r.error.type, "NotYet", code + " → " + r.error.text);
  }
});

test("xabar nima yo'qligini aytadi", () => {
  for (const [code, what] of NOT_YET) {
    const r = py.run(code);
    assert.ok(r.error.message.toLowerCase().includes(what.toLowerCase()),
      code + " → «" + r.error.message + "» ichida «" + what + "» yo'q");
  }
});

test("xabar ohangi: ayblamaydi, haqiqiy Pythonda borligini aytadi", () => {
  const r = py.run('print(f"salom")');
  assert.ok(r.error.text.startsWith("Bu saytda hali yoʻq:"));
  assert.ok(r.error.hint.includes("Haqiqiy Pythonda"));
  assert.ok(r.error.title === "Bu saytda hali yoʻq");
});

test("o'rniga nima yozishni ko'rsatadi", () => {
  assert.ok(py.run('print(f"x = {x}")').error.hint.includes("print("));
  assert.ok(py.run("x = (1, 2)").error.hint.includes("[1, 2]"));
  assert.ok(py.run("x = 5\nif x is None:\n    pass").error.hint.includes("=="));
});

test("satr raqami ko'rsatiladi", () => {
  assert.equal(py.run('x = 1\nprint(f"{x}")').error.line, 2);
});
