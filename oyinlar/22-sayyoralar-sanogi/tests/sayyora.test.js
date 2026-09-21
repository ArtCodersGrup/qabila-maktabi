// sayyora.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../../umumiy/js/sanoq.js");
const P = require("../js/sayyora.js");

const loop = (make, fn) => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = make(prev);
    fn(t);
    if (prev) assert.notEqual(JSON.stringify(t), JSON.stringify(prev));
    prev = t;
  }
};

test("makeAddTask: 3–9-lik, 2–3 xonali, ko'chish ko'pincha bor", () => {
  let carry = 0;
  loop((p) => P.makeAddTask(p), (t) => {
    assert.ok(t.base >= 3 && t.base <= 9);
    assert.ok(S.valid(t.a, t.base) && S.valid(t.b, t.base));
    assert.ok(t.a.length >= 2 && t.a.length <= 3 && t.b.length >= 2 && t.b.length <= 3);
    assert.equal(t.answer, S.toBase(S.fromBase(t.a, t.base) + S.fromBase(t.b, t.base), t.base));
    if (S.addColumns(t.a, t.b, t.base).cols.some((c) => c.carryOut)) carry++;
  });
  assert.ok(carry > 220);
});

test("makeSubTask: a > b, ko'pincha qarzli", () => {
  let borrow = 0;
  loop((p) => P.makeSubTask(p), (t) => {
    const x = S.fromBase(t.a, t.base);
    const y = S.fromBase(t.b, t.base);
    assert.ok(x > y && t.b.length >= 2);
    assert.equal(t.answer, S.toBase(x - y, t.base));
    if (S.subColumns(t.a, t.b, t.base).cols.some((c) => c.borrowOut)) borrow++;
  });
  assert.ok(borrow > 220);
});

test("makeStage3Task: ko'paytirish va jumboq", () => {
  const types = new Set();
  loop((p) => P.makeStage3Task(p), (t) => {
    types.add(t.type);
    if (t.type === "mul") {
      assert.equal(t.a.length, 2);
      assert.ok(t.d >= 2 && t.d < t.base);
      assert.equal(t.answer, S.toBase(S.fromBase(t.a, t.base) * t.d, t.base));
    } else {
      assert.equal(t.type, "puzzle");
      assert.ok(t.x < t.answer && t.y < t.answer, "raqamlar asosdan kichik");
      assert.equal(t.x + t.y, t.answer + t.c);
      assert.ok(t.c < t.answer && t.c >= 0);
    }
  });
  assert.deepEqual([...types].sort(), ["mul", "puzzle"]);
});
