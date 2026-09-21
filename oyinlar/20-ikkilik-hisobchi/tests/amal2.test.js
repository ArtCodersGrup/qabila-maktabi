// amal2.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../../umumiy/js/sanoq.js");
const A = require("../js/amal2.js");

const loop = (make, fn) => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = make(prev);
    fn(t);
    if (prev) assert.notEqual(JSON.stringify(t), JSON.stringify(prev));
    prev = t;
  }
};

test("makeAddTask: 3–5 xonali ikki son, javob ikkilikda", () => {
  loop((p) => A.makeAddTask(p), (t) => {
    assert.ok(t.a.length >= 2 && t.a.length <= 5 && t.b.length >= 2 && t.b.length <= 5);
    assert.equal(t.answer, S.toBase(S.fromBase(t.a, 2) + S.fromBase(t.b, 2), 2));
  });
});

test("makeSubTask: a > b, ko'pincha qarzli", () => {
  let borrow = 0;
  loop((p) => A.makeSubTask(p), (t) => {
    const x = S.fromBase(t.a, 2);
    const y = S.fromBase(t.b, 2);
    assert.ok(x > y && y >= 1);
    assert.equal(t.answer, S.toBase(x - y, 2));
    if (S.subColumns(t.a, t.b, 2).cols.some((c) => c.borrowOut)) borrow++;
  });
  assert.ok(borrow > 200);
});

test("makeMulTask: surish va ko'paytirish, natija ≤ 8 xona", () => {
  const types = new Set();
  loop((p) => A.makeMulTask(p), (t) => {
    types.add(t.type);
    const x = S.fromBase(t.a, 2);
    const y = S.fromBase(t.b, 2);
    assert.equal(t.answer, S.toBase(x * y, 2));
    assert.ok(t.answer.length <= 8);
    if (t.type === "shift") {
      assert.match(t.b, /^10+$/);
      assert.equal(t.answer, t.a + t.b.slice(1));
    } else assert.ok(["11", "101", "110", "111"].includes(t.b));
  });
  assert.deepEqual([...types].sort(), ["mul", "shift"]);
});
