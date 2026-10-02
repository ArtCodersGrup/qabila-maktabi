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

test("makeAddTask: tier 0 — 3–5 xona, tier 1 — 5–6 xona, tier 2 — 6–7 xona; natija ≤ 8 xona", () => {
  for (const tier of [0, 1, 2]) {
    const lim = A.ADD[tier];
    let top = 0;
    loop((p) => A.makeAddTask(p, Math.random, tier), (t) => {
      const x = S.fromBase(t.a, 2);
      const y = S.fromBase(t.b, 2);
      assert.ok(x >= lim.x[0] && x <= lim.x[1] && y >= lim.y[0] && y <= lim.y[1]);
      assert.equal(t.answer, S.toBase(x + y, 2));
      assert.ok(t.answer.length <= 8, "klaviatura chegarasi");
      top = Math.max(top, x + y);
    });
    assert.ok(top > (lim.x[1] + lim.y[1]) * 0.7);
  }
  // tier berilmasa — 0
  loop((p) => A.makeAddTask(p), (t) => assert.ok(t.a.length <= 5 && t.b.length <= 5));
});

test("makeSubTask: a > b; tier 0 — ko'pincha qarzli, tier 1 — albatta, tier 2 — kamida ikki qarz", () => {
  for (const tier of [0, 1, 2]) {
    let borrow = 0;
    loop((p) => A.makeSubTask(p, Math.random, tier), (t) => {
      const x = S.fromBase(t.a, 2);
      const y = S.fromBase(t.b, 2);
      assert.ok(x > y && y >= 1);
      assert.ok(x >= A.SUB[tier][0] && x <= A.SUB[tier][1]);
      assert.equal(t.answer, S.toBase(x - y, 2));
      const n = S.subColumns(t.a, t.b, 2).cols.filter((c) => c.borrowOut).length;
      if (n) borrow++;
      assert.ok(n >= tier, `tier ${tier}: ${t.a} − ${t.b} — ${n} ta qarz`);
    });
    assert.ok(borrow > 200);
  }
});

test("makeMulTask: surish va ko'paytirish, natija ≤ 8 xona; ko'paytuvchi tier bilan kattalashadi", () => {
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    const mults = new Set();
    loop((p) => A.makeMulTask(p, Math.random, tier), (t) => {
      types.add(t.type);
      const x = S.fromBase(t.a, 2);
      const y = S.fromBase(t.b, 2);
      assert.equal(t.answer, S.toBase(x * y, 2));
      assert.ok(t.answer.length <= 8);
      if (t.type === "shift") {
        assert.match(t.b, /^10+$/);
        assert.ok(t.b.length - 1 <= A.SHIFT[tier]);
        assert.equal(t.answer, t.a + t.b.slice(1));
      } else {
        assert.ok(A.MULT[tier].includes(y), t.b);
        assert.ok(x >= 3);
        mults.add(y);
      }
    });
    assert.deepEqual([...types].sort(), ["mul", "shift"]);
    assert.deepEqual([...mults].sort((p, q) => p - q), A.MULT[tier], "hamma ko'paytuvchi uchraydi");
  }
  assert.deepEqual(A.MULT[0].map((y) => S.toBase(y, 2)), ["11", "101", "110", "111"]);
  assert.ok(A.MULT[2].every((y) => y >= 9), "tier 2: 4 xonali ko'paytuvchi");
});
