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

test("makeConvTask: 2 → 16, 16 → 2, rang", () => {
  const types = new Set();
  loop((p) => H.makeConvTask(p), (t) => {
    types.add(t.type);
    if (t.type === "bin2hex") {
      assert.equal(t.bits.length, 8);
      assert.equal(t.answer, S.toBase(S.fromBase(t.bits, 2), 16));
    } else if (t.type === "hex2bin") {
      assert.equal(t.hex.length, 2);
      assert.equal(t.answer, S.toBase(S.fromBase(t.hex, 16), 2));
    } else {
      assert.equal(t.type, "color");
      assert.equal(t.options.length, 3);
      assert.equal(new Set(t.options.map((o) => o.code)).size, 3);
      assert.equal(t.options[t.answer].code, t.code);
    }
  });
  assert.deepEqual([...types].sort(), ["bin2hex", "color", "hex2bin"]);
});

test("makeAddSubTask: 2 xonali 16-lik, ko'chish/qarz ko'pincha bor", () => {
  const types = new Set();
  let carry = 0;
  loop((p) => H.makeAddSubTask(p), (t) => {
    types.add(t.op);
    const x = S.fromBase(t.a, 16);
    const y = S.fromBase(t.b, 16);
    assert.equal(t.a.length, 2);
    assert.equal(t.b.length, 2);
    if (t.op === "+") {
      assert.equal(t.answer, S.toBase(x + y, 16));
      if (S.addColumns(t.a, t.b, 16).cols[0].carryOut) carry++;
    } else {
      assert.ok(x > y);
      assert.equal(t.answer, S.toBase(x - y, 16));
      if (S.subColumns(t.a, t.b, 16).cols[0].borrowOut) carry++;
    }
  });
  assert.deepEqual([...types].sort(), ["+", "−"]);
  assert.ok(carry > 180);
});

test("makeMulTask: 2 xonali × 2–9, natija ≤ 3 xona", () => {
  loop((p) => H.makeMulTask(p), (t) => {
    assert.equal(t.a.length, 2);
    assert.ok(t.d >= 2 && t.d <= 9);
    assert.equal(t.answer, S.toBase(S.fromBase(t.a, 16) * t.d, 16));
    assert.ok(t.answer.length <= 3);
  });
});
