// amal16.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../../umumiy/js/sanoq.js");
const H = require("../js/amal16.js");

const loop = (make, fn) => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = make(prev);
    fn(t);
    if (prev) assert.notEqual(JSON.stringify(t), JSON.stringify(prev));
    prev = t;
  }
};

test("tetradalar: 0 = 0000 … F = 1111", () => {
  assert.equal(H.TETRADS.length, 16);
  assert.deepEqual(H.TETRADS[11], { hex: "B", bits: "1011" });
  assert.deepEqual(H.groups("10110110"), ["1011", "0110"]);
  assert.deepEqual(H.groups("111111"), ["0011", "1111"]);
});

test("ranglar: kod, nom va chiroqlar", () => {
  assert.ok(H.COLORS.length >= 6);
  for (const c of H.COLORS) {
    assert.match(c.code, /^#[0-9A-F]{6}$/);
    assert.equal(c.rgb.length, 3);
    assert.equal(c.rgb[0], S.fromBase(c.code.slice(1, 3), 16));
  }
  assert.ok(H.COLORS.find((c) => c.code === "#FF8800"));
});

const tiers = (fn) => [0, 1, 2].forEach(fn);

test("makeConvTask: 2 → 16, 16 → 2, rang (4 variant); tier 2 da 12 bit", () => {
  tiers((tier) => {
    const types = new Set();
    let top = 0;
    loop((p) => H.makeConvTask(p, Math.random, tier), (t) => {
      types.add(t.type);
      if (t.type === "bin2hex") {
        assert.equal(t.bits.length, tier === 2 ? 12 : 8);
        const v = S.fromBase(t.bits, 2);
        assert.ok(v >= H.CONV[tier][0] && v <= H.CONV[tier][1]);
        assert.equal(t.answer, S.toBase(v, 16));
        top = Math.max(top, v);
      } else if (t.type === "hex2bin") {
        assert.equal(t.hex.length, tier === 2 ? 3 : 2);
        assert.equal(t.answer, S.toBase(S.fromBase(t.hex, 16), 2));
        assert.ok(t.answer.length <= 12);
      } else {
        assert.equal(t.type, "color");
        assert.equal(t.options.length, 4, "4 variant");
        assert.equal(new Set(t.options.map((o) => o.code)).size, 4);
        assert.equal(t.options[t.answer].code, t.code);
        for (const o of t.options) {
          assert.match(o.code, /^#[0-9A-F]{6}$/);
          assert.ok(o.name.length > 1);
          if (tier > 0) {
            // Yaqin ranglar: to'g'ri javobdan aynan bitta kanal bilan farq qiladi
            const diff = [1, 3, 5].filter((k) => o.code.slice(k, k + 2) !== t.code.slice(k, k + 2)).length;
            assert.equal(diff, o.code === t.code ? 0 : 1, `${t.code} / ${o.code}`);
          }
        }
      }
    });
    assert.deepEqual([...types].sort(), ["bin2hex", "color", "hex2bin"]);
    assert.ok(top > H.CONV[tier][1] * 0.7);
  });
  assert.equal(H.channelText("#FF8800"), "qizil FF, yashil 88, koʻk 00");
});

test("makeAddSubTask: tier 0–1 — 2 xonali, tier 2 — 3 xonali; ko'chish/qarz ko'pincha (tier 1+ — doim) bor", () => {
  tiers((tier) => {
    const types = new Set();
    let carry = 0;
    const len = tier === 2 ? 3 : 2;
    loop((p) => H.makeAddSubTask(p, Math.random, tier), (t) => {
      types.add(t.op);
      const x = S.fromBase(t.a, 16);
      const y = S.fromBase(t.b, 16);
      assert.equal(t.a.length, len);
      assert.equal(t.b.length, len);
      assert.ok(t.answer.length <= 3, "natija ≤ FFF");
      let has;
      if (t.op === "+") {
        assert.equal(t.answer, S.toBase(x + y, 16));
        has = S.addColumns(t.a, t.b, 16).cols[0].carryOut;
      } else {
        assert.ok(x > y);
        assert.equal(t.answer, S.toBase(x - y, 16));
        has = S.subColumns(t.a, t.b, 16).cols[0].borrowOut;
      }
      if (has) carry++;
      if (tier > 0) assert.ok(has, `tier ${tier}: ${t.a} ${t.op} ${t.b} — ko'chish/qarz yo'q`);
    });
    assert.deepEqual([...types].sort(), ["+", "−"]);
    assert.ok(carry > 180);
  });
});

test("makeMulTask: 2 xonali × bir xonali, natija ≤ 3 xona; tier 2 da ko'paytuvchi A…F", () => {
  tiers((tier) => {
    const ds = new Set();
    loop((p) => H.makeMulTask(p, Math.random, tier), (t) => {
      assert.equal(t.a.length, 2);
      assert.ok(t.d >= H.MUL_D[tier][0] && t.d <= H.MUL_D[tier][1]);
      assert.equal(t.answer, S.toBase(S.fromBase(t.a, 16) * t.d, 16));
      assert.ok(t.answer.length <= 3);
      ds.add(t.d);
    });
    assert.equal(ds.size, H.MUL_D[tier][1] - H.MUL_D[tier][0] + 1, "hamma ko'paytuvchi uchraydi");
  });
  assert.deepEqual(H.MUL_D[2], [10, 15]);
});
