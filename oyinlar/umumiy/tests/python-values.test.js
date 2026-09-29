// umumiy/js/python/values.js testlari: turlar, amallar va Python kabi chiqarish.
// Bu yerdagi kutilgan qiymatlar python3 dan olingan (python-parity.test.js ularni yana tekshiradi).
const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../js/python/values.js");

const pos = { line: 1, col: 1 };
const bin = (op, a, b) => V.repr(V.binary(op, a, b, pos));

test("turlar nomi Pythondagidek", () => {
  assert.equal(V.typeName(5n), "int");
  assert.equal(V.typeName(5.5), "float");
  assert.equal(V.typeName("a"), "str");
  assert.equal(V.typeName(true), "bool");
  assert.equal(V.typeName(null), "NoneType");
  assert.equal(V.typeName([1n]), "list");
});

test("bo'lish: / doim kasr, // pastga yumaqlaydi, % musbat qoladi", () => {
  assert.equal(bin("/", 7n, 2n), "3.5");
  assert.equal(bin("/", 4n, 2n), "2.0");
  assert.equal(bin("//", 7n, 2n), "3");
  assert.equal(bin("//", -7n, 2n), "-4");
  assert.equal(bin("%", -7n, 3n), "2");
  assert.equal(bin("%", 7n, -3n), "-2");
});

test("katta sonlar aniq, kasr sonlar IEEE 754", () => {
  assert.equal(bin("**", 2n, 100n), "1267650600228229401496703205376");
  assert.equal(bin("**", 2n, -1n), "0.5");
  assert.equal(bin("+", 0.1, 0.2), "0.30000000000000004");
});

test("bool — sonning bir turi", () => {
  assert.equal(bin("+", true, true), "2");
  assert.equal(bin("*", false, 5n), "0");
});

test("matn va ro'yxat ustidagi amallar", () => {
  assert.equal(bin("*", "ab", 3n), "'ababab'");
  assert.equal(bin("+", "a", "b"), "'ab'");
  assert.equal(bin("+", [1n], [2n]), "[1, 2]");
  assert.equal(bin("*", [1n], 2n), "[1, 1]");
});

test("kasr sonlarni chiqarish python3 dagidek", () => {
  assert.equal(V.formatFloat(2), "2.0");
  assert.equal(V.formatFloat(1e15), "1000000000000000.0");
  assert.equal(V.formatFloat(1e16), "1e+16");
  assert.equal(V.formatFloat(0.0001), "0.0001");
  assert.equal(V.formatFloat(0.00001), "1e-05");
  assert.equal(V.formatFloat(-0), "-0.0");
});

test("repr: ro'yxat ichida qo'shtirnoq, str: matn o'zi", () => {
  assert.equal(V.str([1n, "a", true, null]), "[1, 'a', True, None]");
  assert.equal(V.str("salom"), "salom");
  assert.equal(V.repr("it's"), '"it\'s"');
  assert.equal(V.repr('say "hi"'), "'say \"hi\"'");
});

test("solishtirish va tenglik", () => {
  assert.equal(V.compare("==", 1n, 1), true, "int va float tengligi");
  assert.equal(V.compare("==", true, 1n), true);
  assert.equal(V.compare("<", "a", "b"), true);
  assert.equal(V.eq([1n, 2n], [1n, 2n]), true);
  assert.equal(V.eq("a", "A"), false);
});

test("indeks, kesish va uzunlik", () => {
  assert.equal(V.getIndex("qabila", -1n, pos), "a");
  assert.equal(V.repr(V.getSlice([1n, 2n, 3n, 4n], 1n, 3n, pos)), "[2, 3]");
  assert.equal(V.repr(V.getSlice("qabila", null, 3n, pos)), "'qab'");
  assert.equal(V.len("qabila", pos), 6n);
});

test("xato turlari va xabarlari Pythondagidek", () => {
  const boom = (fn) => { try { fn(); return null; } catch (e) { return e; } };
  assert.equal(boom(() => V.binary("+", "5", 5n, pos)).pyMessage, 'can only concatenate str (not "int") to str');
  assert.equal(boom(() => V.binary("+", 5n, "5", pos)).pyMessage, "unsupported operand type(s) for +: 'int' and 'str'");
  assert.equal(boom(() => V.binary("//", 1n, 0n, pos)).pyType, "ZeroDivisionError");
  assert.equal(boom(() => V.len(5n, pos)).pyMessage, "object of type 'int' has no len()");
  assert.equal(boom(() => V.compare("<", 1n, "a", pos)).pyMessage, "'<' not supported between instances of 'int' and 'str'");
  assert.ok(boom(() => V.binary("+", "5", 5n, pos)).hint.includes("str("), "izoh yechimni aytadi");
});

test("range: uzunlik, yurish va manfiy qadam", () => {
  assert.equal(V.rangeLength(V.range(0n, 5n, 1n)), 5n);
  assert.equal(V.rangeLength(V.range(10n, 0n, -3n)), 4n);
  assert.deepEqual([...V.iterate(V.range(1n, 4n, 1n), pos)], [1n, 2n, 3n]);
  assert.deepEqual([...V.iterate(V.range(0n, 5n, -1n), pos)], []);
});
