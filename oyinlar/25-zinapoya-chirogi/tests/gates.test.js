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
    // tier 2 shablonlari: ikkala kirish teskari; boshida va oxirida EMAS
    for (const op of G.BINARY) assert.equal(G.output(G.circuit("bothNot", op), a, b), G.apply(op, not(a), not(b)));
    for (const op of ["and", "or"]) assert.equal(G.output(G.circuit("notBothEnds", op), a, b), not(G.apply(op, not(a), b)));
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

test("uch xonali qo'shish (tier 2): natija, qadamlar, 4 variant", () => {
  for (let x = 1; x < 8; x++) {
    for (let y = 1; y < 8; y++) {
      const r = G.addCols(x, y, 3);
      assert.equal(parseInt(r.result, 2), x + y);
      assert.equal(r.lines.length, 4);
      assert.ok(r.lines[3].endsWith(`= ${r.result}`));
      const opts = G.add2Options(x, y, Math.random, 3);
      assert.equal(opts.length, 4);
      assert.equal(new Set(opts).size, 4);
      assert.ok(opts.includes(r.result));
    }
  }
  assert.deepEqual(G.addCols(5, 7, 3).lines[0], "1-xona (oʻngdan): 1 + 1 = 10 — 0 yoz, 1 ni koʻchir");
  assert.deepEqual(G.add2(1, 3), G.addCols(1, 3, 2));
});

test("zinapoya: necha marta yondi, javob sabab bilan", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(G.litCount), [1, 1, 2, 2, 3, 3, 4]);
  // Mustaqil hisob: har bosishda almashadi, o'chiqdan yoniqqa o'tishlar soni
  for (let k = 1; k <= 14; k++) {
    let on = 0;
    let lit = 0;
    for (let i = 0; i < k; i++) { on = 1 - on; if (on) lit++; }
    assert.equal(G.litCount(k), lit, `k = ${k}`);
  }
  assert.equal(G.outAnswer(0, 0), "same:0");
  assert.equal(G.outAnswer(1, 1), "same:0");
  assert.equal(G.outAnswer(0, 1), "diff:1");
  assert.equal(G.outAnswer(1, 0), "diff:1");
  assert.equal(new Set(G.OUT_OPTIONS).size, 4);
});

test("«Hech biri» jadvallari: VA, YOKI, XOR — hech biriniki emas", () => {
  for (const t of G.ODD_TABLES) {
    for (const op of G.BINARY) assert.notDeepEqual(t, G.table(op));
  }
  for (const tpl of ["single", "thenNot", "notFirst"]) {
    for (let k = 0; k < 50; k++) {
      const target = G.oddTarget(tpl, Math.random);
      for (const op of G.BINARY) {
        assert.notDeepEqual(target, PAIRS.map(([a, b]) => G.output(G.circuit(tpl, op), a, b)), `${tpl}/${op}`);
      }
    }
  }
});

test("topshiriqlar: bosqich va tier bo'yicha turlar, javob to'g'ri, ketma-ket takror yo'q", () => {
  const expected = { 1: ["clicks", "out", "table", "which"], 2: ["evalTable", "fill"], 3: ["add2", "half", "whichOut"] };
  for (const stage of [1, 2, 3]) {
    for (const tier of [0, 1, 2]) {
      let prev = null;
      const types = new Set();
      const answers = new Set();
      let maxClicks = 0;
      const widths = new Set();
      for (let k = 0; k < 500; k++) {
        const t = G.makeTask(stage, prev, Math.random, tier);
        assert.notEqual(t.id, prev && prev.id);
        types.add(t.type);
        assert.ok(G.checkTask(t, t.answer), t.id);
        // 0/1 javobli (2 variantli) savol yo'q
        assert.ok(t.answer !== 0 && t.answer !== 1 || t.type === "clicks", `${t.id}: 0/1 javob`);
        if (t.type === "out") {
          assert.equal(t.answer, G.outAnswer(t.a, t.b));
          assert.equal(G.OUT_OPTIONS.filter((v) => G.checkTask(t, v)).length, 1);
        }
        if (t.type === "clicks") {
          const total = t.m + t.n;
          assert.ok(t.m <= G.CLICK_MAX[tier] && t.n <= G.CLICK_MAX[tier], t.id);
          assert.ok(total >= (tier === 2 ? 7 : 3), t.id);
          assert.equal(t.answer, Math.ceil(total / 2));
          assert.equal(t.lit, total % 2);
          maxClicks = Math.max(maxClicks, total);
        }
        if (t.type === "table") {
          assert.deepEqual(t.answer, G.table(t.op));
          if (tier < 2) assert.equal(t.op, "xor");
          assert.ok(!G.checkTask(t, t.answer.map((v) => 1 - v)));
        }
        if (t.type === "which") {
          answers.add(t.answer);
          if (t.answer === G.NONE) for (const op of G.BINARY) assert.notDeepEqual(t.table, G.table(op));
          else assert.deepEqual(t.table, G.table(t.answer));
        }
        if (t.type === "evalTable") {
          assert.deepEqual(t.answer, PAIRS.map(([a, b]) => G.output(t.c, a, b)));
          assert.equal(new Set(t.answer).size, 2, "jadvalda 0 ham, 1 ham bor");
          assert.equal(t.c.gates.length >= 3, tier === 2, `${t.id}: tier 2 da kamida 3 amal`);
        }
        if (t.type === "fill") {
          answers.add(t.answer);
          // Maqsad jadvalini faqat bitta amal beradi (yoki hech biri — "none")
          const fits = G.BINARY.filter((op) => {
            const c = G.circuit(t.c.tpl, op);
            return PAIRS.every(([a, b], i) => G.output(c, a, b) === t.target[i]);
          });
          assert.deepEqual(fits, t.answer === G.NONE ? [] : [t.answer]);
          assert.ok(t.c.gates.some((g) => g.id === t.unknown && !G.OPS[g.op].unary), "noma'lum quti — ikki kirishli amal");
        }
        if (t.type === "half") assert.equal(parseInt(t.answer, 2), t.a + t.b);
        if (t.type === "whichOut") assert.equal(t.answer, t.ask === "sum" ? "xor" : "and");
        if (t.type === "add2") {
          widths.add(t.width);
          assert.equal(parseInt(t.answer, 2), t.x + t.y);
          assert.equal(t.options.length, 4);
          assert.equal(new Set(t.options).size, 4);
          assert.ok(t.options.includes(t.answer));
          assert.ok(t.x < 2 ** t.width && t.y < 2 ** t.width);
          if (tier > 0) assert.ok(t.x & t.y, "tier 1+ da ko'chirish bor");
        }
        prev = t;
      }
      assert.deepEqual([...types].sort(), expected[stage]);
      if (stage === 1) assert.ok(maxClicks > [5, 8, 11][tier] - 1 && maxClicks <= 2 * G.CLICK_MAX[tier], `tier ${tier}: ${maxClicks}`);
      if (stage < 3) assert.equal(answers.has(G.NONE), tier > 0, "«Hech biri» tier 1 dan boshlab to'g'ri javob bo'ladi");
      if (stage === 3) assert.deepEqual([...widths], [tier === 2 ? 3 : 2]);
    }
  }
  assert.ok(G.makeTask(1, null).type); // tier berilmasa — 0
});
