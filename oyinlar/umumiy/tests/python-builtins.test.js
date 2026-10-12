// Kichik Python: keyin qoʻshilgan ichki funksiyalar (type, round).
const test = require("node:test");
const assert = require("node:assert/strict");

// 2026-10-12: IX sinf darslari uchun type() va round()
test("type() va round()", () => {
  const P = require("../js/python/python.js");
  const chiq = (kod) => { const r = P.run(kod); assert.equal(r.error, null, kod); return r.output; };
  assert.deepEqual(chiq('print(type(5))\nprint(type(0.5), type("a"), type(True), type([1]), type(None))'),
    ["<class 'int'>", "<class 'float'> <class 'str'> <class 'bool'> <class 'list'> <class 'NoneType'>"]);
  assert.deepEqual(chiq("print(type(1) == type(2), type(1) == type(1.0))"), ["True False"]);
  assert.deepEqual(chiq("print(round(2.567, 2), round(2.5), round(3.5), round(7), round(10 / 3, 1))"), ["2.57 2 4 7 3.3"]);
  assert.deepEqual(chiq("print(type(round(2.7)), type(round(2.71, 1)))"), ["<class 'int'> <class 'float'>"]);
  assert.deepEqual(chiq('print(type(5) == int, type(5) == float, type("a") == str, type([1]) == list, int == type(7))'), ["True False True True True"]);
  assert.equal(P.run('round("a")').error.type, "TypeError");
});
