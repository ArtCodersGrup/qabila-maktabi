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

const tiers = (fn) => [0, 1, 2].forEach(fn);
const lens = (tier) => (tier === 0 ? [2, 3] : tier === 1 ? [3, 3] : [3, 4]);

test("makeAddTask: tier 0 — 3–9-lik, 2–3 xonali; tier 2 — 12-likkacha, 3–4 xonali; natija ≤ 4 xona", () => {
  tiers((tier) => {
    let carry = 0;
    const bases = new Set();
    loop((p) => P.makeAddTask(p, Math.random, tier), (t) => {
      bases.add(t.base);
      assert.ok(t.base >= P.BASES[tier][0] && t.base <= P.BASES[tier][1]);
      assert.ok(S.valid(t.a, t.base) && S.valid(t.b, t.base));
      const [lo, hi] = lens(tier);
      assert.ok(t.a.length >= lo && t.a.length <= hi && t.b.length >= lo && t.b.length <= hi, `${t.a} + ${t.b}`);
      assert.equal(t.answer, S.toBase(S.fromBase(t.a, t.base) + S.fromBase(t.b, t.base), t.base));
      assert.ok(t.answer.length <= 4, "klaviatura va ustun chegarasi");
      assert.ok(S.fromBase(t.a, t.base) <= (tier === 2 ? 999 : 200));
      const n = S.addColumns(t.a, t.b, t.base).cols.filter((c) => c.carryOut).length;
      if (n) carry++;
      assert.ok(n >= tier, `tier ${tier}: ${n} ta ko'chish`);
    });
    assert.ok(carry > 220);
    if (tier === 2) assert.ok([...bases].some((b) => b > 10), "A, B raqamli tizimlar ham chiqadi");
  });
});

test("makeSubTask: a > b; tier 1 — albatta qarz, tier 2 — kamida ikki qarz", () => {
  tiers((tier) => {
    let borrow = 0;
    loop((p) => P.makeSubTask(p, Math.random, tier), (t) => {
      const x = S.fromBase(t.a, t.base);
      const y = S.fromBase(t.b, t.base);
      assert.ok(x > y && t.b.length >= (tier ? 3 : 2));
      assert.ok(t.base >= P.BASES[tier][0] && t.base <= P.BASES[tier][1]);
      assert.equal(t.answer, S.toBase(x - y, t.base));
      const n = S.subColumns(t.a, t.b, t.base).cols.filter((c) => c.borrowOut).length;
      if (n) borrow++;
      assert.ok(n >= tier, `tier ${tier}: ${n} ta qarz`);
    });
    assert.ok(borrow > 220);
  });
});

test("makeStage3Task: ko'paytirish va jumboq; tier 1+ da jumboq ikki xonali, tier 2 da ko'paytuvchi 3 xonali", () => {
  tiers((tier) => {
    const types = new Set();
    loop((p) => P.makeStage3Task(p, Math.random, tier), (t) => {
      types.add(t.type);
      if (t.type === "mul") {
        assert.equal(t.a.length, tier === 2 ? 3 : 2);
        assert.ok(t.d >= (tier ? 3 : 2) && t.d < t.base);
        assert.equal(t.answer, S.toBase(S.fromBase(t.a, t.base) * t.d, t.base));
        assert.ok(t.answer.length <= 4);
      } else {
        assert.ok(t.x < t.answer && t.y < t.answer, "raqamlar asosdan kichik");
        assert.equal(t.x + t.y, t.answer + t.c);
        assert.ok(t.c < t.answer && t.c >= 0);
        if (t.type === "puzzle2") {
          // Yozuv shu asosda to'g'ri, va faqat shu asosda (boshqa asoslarda tenglik buziladi)
          const n = t.answer;
          assert.ok(S.valid(t.a, n) && S.valid(t.b, n) && S.valid(t.sum, n), `${t.a} + ${t.b} = ${t.sum}`);
          assert.equal(S.fromBase(t.a, n) + S.fromBase(t.b, n), S.fromBase(t.sum, n));
          const fits = [];
          for (let b = 2; b <= 16; b++) {
            if (S.valid(t.a, b) && S.valid(t.b, b) && S.valid(t.sum, b) && S.fromBase(t.a, b) + S.fromBase(t.b, b) === S.fromBase(t.sum, b)) fits.push(b);
          }
          assert.deepEqual(fits, [n], "javob yagona");
          assert.equal(t.sum.length, 2);
        }
      }
    });
    assert.deepEqual([...types].sort(), tier ? ["mul", "puzzle2"] : ["mul", "puzzle"]);
  });
});
