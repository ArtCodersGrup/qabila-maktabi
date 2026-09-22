// gates.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const G = require("../js/gates.js");

const PAIRS = [[0, 0], [0, 1], [1, 0], [1, 1]];

test("amallar jadvali: XOR — faqat bittasi, YOKI dan farqi 1 1 qatorida", () => {
  assert.deepEqual(G.table("and"), [0, 0, 0, 1]);
  assert.deepEqual(G.table("or"), [0, 1, 1, 1]);
  assert.deepEqual(G.table("xor"), [0, 1, 1, 0]);
  assert.equal(G.apply("not", 1), 0);
  assert.equal(G.OPS.xor.name, "XOR");
  const diff = [0, 1, 2, 3].filter((i) => G.table("or")[i] !== G.table("xor")[i]);
  assert.deepEqual(diff, [G.rowIndex(1, 1)]);
});

test("sxemalar: qiymatlar mustaqil hisobga mos", () => {
  const not = (x) => 1 - x;
  for (const [a, b] of PAIRS) {
    for (const op of G.BINARY) {
      assert.equal(G.output(G.circuit("single", op), a, b), G.apply(op, a, b));
      assert.equal(G.output(G.circuit("thenNot", op), a, b), not(G.apply(op, a, b)));
    }
    for (const op of ["and", "or"]) assert.equal(G.output(G.circuit("notFirst", op), a, b), G.apply(op, not(a), b));
    // XOR ni VA, YOKI, EMAS dan yig'dik
    assert.equal(G.output(G.circuit("xorBuild"), a, b), a ^ b);
    // Yarim qo'shuvchi: [ko'chirish, yig'indi] = a + b ikkilikda
    const [carry, sum] = G.outputs(G.circuit("halfAdder"), a, b);
    assert.equal(carry * 2 + sum, a + b);
    assert.deepEqual(G.halfAdd(a, b), { carry, sum });
  }
});

test("sxema: amallar faqat oldingi simlardan oladi, chiqishlar mavjud", () => {
  for (const tpl of Object.keys(G.TEMPLATES)) {
    for (const op of G.BINARY) {
      const c = G.circuit(tpl, op);
      const known = new Set(["a", "b"]);
      for (const g of c.gates) {
        const n = G.OPS[g.op].unary ? 1 : 2;
        assert.equal(g.in.length, n, `${tpl}/${g.id}`);
        for (const src of g.in) assert.ok(known.has(src), `${tpl}/${g.id}: ${src}`);
        known.add(g.id);
      }
      for (const o of c.outs) assert.ok(known.has(o.id), tpl);
    }
  }
  assert.deepEqual(G.circuit("halfAdder").outs.map((o) => o.name), ["Koʻchirish", "Yigʻindi"]);
});

test("ifoda matni va qadamlar", () => {
  assert.equal(G.exprText(G.circuit("thenNot", "and")), "EMAS (A VA B)");
  assert.equal(G.exprText(G.circuit("notFirst", "or")), "(EMAS A) YOKI B");
  assert.equal(G.exprText(G.circuit("single", "xor")), "A XOR B");
  assert.equal(G.exprText(G.circuit("xorBuild")), "(A YOKI B) VA (EMAS (A VA B))");
  assert.deepEqual(G.steps(G.circuit("thenNot", "and"), 1, 0), ["1 VA 0 = 0", "EMAS 0 = 1"]);
  assert.deepEqual(G.steps(G.circuit("notFirst", "and"), 0, 1), ["EMAS 0 = 1", "1 VA 1 = 1"]);
});

test("ikki xonali qo'shish: natija, qadamlar va variantlar", () => {
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      if (x + y === 0) continue;
      const r = G.add2(x, y);
      assert.equal(parseInt(r.result, 2), x + y);
      assert.equal(r.lines.length, 3);
      assert.ok(r.lines[2].endsWith(`= ${r.result}`));
      const opts = G.add2Options(x, y, Math.random);
      assert.equal(opts.length, 4);
      assert.equal(new Set(opts).size, 4);
      assert.ok(opts.includes(r.result));
      for (const o of opts) assert.match(o, /^1[01]*$/, o);
      if ((x & y) && (x ^ y)) assert.ok(opts.includes(G.bin(x ^ y)), "ko'chirishni unutish xatosi variantda");
    }
  }
  assert.equal(G.bin(1, 2), "01");
  assert.equal(G.add2(1, 3).result, "100");
});

test("topshiriqlar: bosqich bo'yicha turlar, javob to'g'ri, ketma-ket takror yo'q", () => {
  const expected = { 1: ["clicks", "out", "which"], 2: ["eval", "fill"], 3: ["add2", "half", "whichOut"] };
  for (const stage of [1, 2, 3]) {
    let prev = null;
    const types = new Set();
    for (let k = 0; k < 400; k++) {
      const t = G.makeTask(stage, prev);
      assert.notEqual(t.id, prev && prev.id);
      types.add(t.type);
      if (t.type === "out") assert.equal(t.answer, t.a ^ t.b);
      if (t.type === "clicks") {
        assert.ok(t.m + t.n > 0 && t.m <= 4 && t.n <= 4);
        assert.equal(t.answer, (t.m + t.n) % 2);
      }
      if (t.type === "which") assert.equal(t.answer, t.op);
      if (t.type === "eval") assert.equal(t.answer, G.output(t.c, t.a, t.b));
      if (t.type === "fill") {
        assert.deepEqual(t.target, PAIRS.map(([a, b]) => G.output(t.c, a, b)));
        // Maqsad jadvalini faqat bitta amal beradi
        const fits = G.BINARY.filter((op) => {
          const c = G.circuit(t.c.tpl, op);
          return PAIRS.every(([a, b], i) => G.output(c, a, b) === t.target[i]);
        });
        assert.deepEqual(fits, [t.answer]);
      }
      if (t.type === "half") assert.equal(parseInt(t.answer, 2), t.a + t.b);
      if (t.type === "whichOut") assert.equal(t.answer, t.ask === "sum" ? "xor" : "and");
      if (t.type === "add2") assert.equal(parseInt(t.answer, 2), t.x + t.y);
      prev = t;
    }
    assert.deepEqual([...types].sort(), expected[stage]);
  }
});
