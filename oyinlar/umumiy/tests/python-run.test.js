// umumiy/js/python/python.js testlari: dasturlarni bajarish, chegaralar va kiritish.
const test = require("node:test");
const assert = require("node:assert/strict");
const py = require("../js/python/python.js");
const { PROGRAMS } = require("./python-corpus.js");

const out = (code, opts) => py.run(code, opts).output;

test("korpusdagi barcha dasturlar xatosiz bajariladi", () => {
  for (const p of PROGRAMS) {
    const r = py.run(p.code, { stdin: p.stdin });
    assert.equal(r.error, null, `${p.name}: ${r.error && r.error.text}`);
  }
});

test("print: bir nechta qiymat bo'shliq bilan, har print yangi satr", () => {
  assert.deepEqual(out('print("Salom")\nprint(1, 2)\nprint()'), ["Salom", "1 2", ""]);
});

test("o'zgaruvchi va amallar", () => {
  assert.deepEqual(out("x = 5\nx += 3\ny = x * 2\nprint(x, y)"), ["8 16"]);
});

test("input matn qaytaradi, int() son qiladi", () => {
  assert.deepEqual(out("a = input()\nb = int(input())\nprint(a + a, b + 1)", { stdin: ["ha", "41"] }), ["haha 42"]);
});

test("shart va sikl", () => {
  assert.deepEqual(out("for i in range(1, 6):\n    if i % 2 == 0:\n        print(i)"), ["2", "4"]);
  assert.deepEqual(out("i = 3\nwhile i > 0:\n    print(i)\n    i -= 1"), ["3", "2", "1"]);
});

test("ro'yxat va satr metodlari", () => {
  assert.deepEqual(out("a = [3, 1]\na.append(2)\nprint(sorted(a), a.pop(), len(a))"), ["[1, 2, 3] 2 2"]);
  assert.deepEqual(out("s = 'qabila'\nprint(s.upper(), s.count('a'), s.split('b'))"), ["QABILA 2 ['qa', 'ila']"]);
});

test("funksiya: return qiymat qaytaradi, return'siz None", () => {
  assert.deepEqual(out("def f(a):\n    return a * 2\nprint(f(21))"), ["42"]);
  assert.deepEqual(out("def f():\n    print('ichida')\nprint(f())"), ["ichida", "None"]);
});

test("funksiya ichidagi o'zgaruvchi tashqarida yo'q", () => {
  const r = py.run("def f():\n    ichki = 5\nf()\nprint(ichki)");
  assert.equal(r.error.type, "NameError");
});

test("cheksiz sikl qadam chegarasi bilan to'xtaydi", () => {
  const r = py.run("while True:\n    x = 1", { maxSteps: 1000 });
  assert.equal(r.error.type, "Limit");
  assert.ok(r.error.text.includes("1 000 qadam"));
  assert.ok(r.error.hint.includes("Shart"), "izoh sikl shartini eslatadi");
});

test("juda ko'p chiqarish ham to'xtatiladi", () => {
  const r = py.run("i = 0\nwhile i < 100000:\n    print(i)\n    i += 1", { maxOutput: 50 });
  assert.equal(r.error.type, "Limit");
  assert.equal(r.output.length, 51);
});

test("juda chuqur rekursiya — RecursionError", () => {
  const r = py.run("def f(n):\n    return f(n + 1)\nf(0)");
  assert.equal(r.error.type, "RecursionError");
});

test("kiritish tugasa — EOFError", () => {
  const r = py.run("a = input()\nb = input()", { stdin: ["bitta"] });
  assert.equal(r.error.type, "EOFError");
});

test("xatodan oldin chiqqan matn saqlanadi", () => {
  const r = py.run('print("bir")\nprint(1 / 0)');
  assert.deepEqual(r.output, ["bir"]);
  assert.equal(r.error.line, 2);
});

test("run natijasida o'zgaruvchilar jadvali bo'ladi", () => {
  const r = py.run("x = 5\ns = 'a'\na = [1, 2]");
  assert.deepEqual(r.vars, { x: "5", s: "'a'", a: "[1, 2]" });
});

test("check(): faqat sintaksisni tekshiradi, kodni bajarmaydi", () => {
  assert.equal(py.check("x = 1\nprint(x)"), null);
  assert.equal(py.check('print("ochiq)').type, "SyntaxError");
  assert.equal(py.check("print(nomalum)"), null, "nom xatosi faqat bajarilganda chiqadi");
});
