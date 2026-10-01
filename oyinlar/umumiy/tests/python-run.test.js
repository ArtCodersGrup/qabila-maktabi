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

// O'yin qo'shadigan funksiyalar (49-o'yin: tank). builtins.js ga tegilmaydi.
test("tashqi funksiyalar: faqat berilgan ishga tushirishda ko'rinadi", () => {
  const yozuv = [];
  const tashqi = {
    move: (args) => { yozuv.push(["move", Number(args[0])]); return null; },
    scan: () => 42n,
  };
  const r = py.run("for i in range(3):\n    move(10)\nprint(scan())", { tashqi });
  assert.equal(r.error, null);
  assert.deepEqual(yozuv, [["move", 10], ["move", 10], ["move", 10]]);
  assert.deepEqual(r.output, ["42"]);

  // tashqi berilmasa — oddiy NameError
  const r2 = py.run("move(5)");
  assert.equal(r2.error.type, "NameError");

  // O'zgaruvchi tashqi funksiyadan ustun turadi (bola o'z nomini yozsa, shu ishlaydi)
  const r3 = py.run("scan = 7\nprint(scan)", { tashqi });
  assert.deepEqual(r3.output, ["7"]);

  // Oddiy builtinlar joyida
  const r4 = py.run("print(len([1, 2]), max(3, 9))", { tashqi });
  assert.deepEqual(r4.output, ["2 9"]);
});

test("tashqi funksiyalar trace() da ham ishlaydi", () => {
  const urilgan = [];
  const r = py.trace("fire()\nfire()", { tashqi: { fire: () => { urilgan.push(1); return null; } } });
  assert.equal(r.error, null);
  assert.equal(urilgan.length, 2);
  assert.ok(r.states.length > 0);
});
