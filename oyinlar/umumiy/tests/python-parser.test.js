// umumiy/js/python/parser.js testlari: amallar ustuvorligi va bloklar.
const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../js/python/tokenizer.js");
const P = require("../js/python/parser.js");

const ast = (src) => P.parse(T.tokenize(src));
const first = (src) => ast(src).body[0];
const boom = (src) => { try { ast(src); return null; } catch (e) { return e; } };

// Ifodani o'qilishi oson qilib yozish: (2 + (3 * 4))
function show(n) {
  if (n.t === "BinOp") return "(" + show(n.left) + " " + n.op + " " + show(n.right) + ")";
  if (n.t === "UnaryOp") return "(" + n.op + " " + show(n.operand) + ")";
  if (n.t === "BoolOp") return "(" + n.values.map(show).join(" " + n.op + " ") + ")";
  if (n.t === "Compare") return "(" + show(n.left) + n.ops.map((o, k) => " " + o + " " + show(n.comparators[k])).join("") + ")";
  if (n.t === "Num" || n.t === "Const") return String(n.value);
  if (n.t === "Str") return JSON.stringify(n.value);
  if (n.t === "Name") return n.id;
  if (n.t === "Call") return show(n.func) + "(" + n.args.map(show).join(", ") + ")";
  if (n.t === "List") return "[" + n.items.map(show).join(", ") + "]";
  return n.t;
}
const expr = (src) => show(first(src).value);

test("ko'paytirish qo'shishdan oldin bajariladi", () => {
  assert.equal(expr("2 + 3 * 4"), "(2 + (3 * 4))");
  assert.equal(expr("(2 + 3) * 4"), "((2 + 3) * 4)");
  assert.equal(expr("10 - 2 - 3"), "((10 - 2) - 3)");
});

test("daraja o'ngga bog'lanadi va unar minusdan kuchli", () => {
  assert.equal(expr("2 ** 3 ** 2"), "(2 ** (3 ** 2))");
  assert.equal(expr("-2 ** 2"), "(- (2 ** 2))");
  assert.equal(expr("2 ** -1"), "(2 ** (- 1))");
});

test("mantiq: not > and > or", () => {
  assert.equal(expr("not a and b or c"), "(((not a) and b) or c)");
});

test("zanjirli solishtirish bitta tugunga yig'iladi", () => {
  assert.equal(expr("0 < x < 10"), "(0 < x < 10)");
  assert.equal(expr("x in a"), "(x in a)");
  assert.equal(expr("x not in a"), "(x not in a)");
});

test("o'zlashtirish, ko'p o'zlashtirish va almashtirish", () => {
  assert.equal(first("x = 5").t, "Assign");
  assert.equal(first("x += 5").t, "AugAssign");
  assert.equal(first("a, b = b, a").targets[0].t, "Tuple");
  assert.equal(first("a = b = 5").targets.length, 2);
});

test("if / elif / else bloklarga yig'iladi", () => {
  const node = first("if x > 1:\n    print(1)\nelif x > 0:\n    print(2)\nelse:\n    print(3)");
  assert.equal(node.t, "If");
  assert.equal(node.body.length, 1);
  assert.equal(node.orelse[0].t, "If");
  assert.equal(node.orelse[0].orelse[0].t, "Expr");
});

test("for, while, def va return", () => {
  assert.equal(first("for i in range(3):\n    print(i)").target.id, "i");
  assert.equal(first("while x:\n    x -= 1").t, "While");
  const fn = first("def f(a, b):\n    return a + b");
  assert.deepEqual(fn.params, ["a", "b"]);
  assert.equal(fn.body[0].t, "Return");
});

test("bir qatorli blok ham ishlaydi (Pythonda ham mumkin)", () => {
  assert.equal(first("if x: print(1)").body[0].t, "Expr");
});

test("indeks, kesish va metod", () => {
  assert.equal(first("a[0] = 5").targets[0].t, "Index");
  assert.equal(first("print(a[1:3])").value.args[0].t, "Slice");
  assert.equal(first("a.append(5)").value.func.t, "Attribute");
});

test("if ichida = yozilsa, == kerakligi aytiladi", () => {
  const e = boom("if x = 5:\n    print(1)");
  assert.equal(e.pyType, "SyntaxError");
  assert.ok(e.pyMessage.includes("'=='"));
  assert.ok(e.hint.includes("=="));
});

test("otstup yo'q bo'lsa, qaysi satrdan keyin kerakligi aytiladi", () => {
  const e = boom("if x:\nprint(1)");
  assert.equal(e.pyType, "IndentationError");
  assert.ok(e.pyMessage.includes("on line 1"));
});

test("ikki nuqta unutilsa", () => {
  assert.equal(boom("if x > 1\n    print(1)").pyType, "SyntaxError");
});
