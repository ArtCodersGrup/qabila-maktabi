// logic.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

const PAIRS = [[0, 0], [0, 1], [1, 0], [1, 1]];

test("amallar: VA, YOKI, EMAS jadvallari", () => {
  assert.deepEqual(PAIRS.map(([a, b]) => L.apply("and", a, b)), [0, 0, 0, 1]);
  assert.deepEqual(PAIRS.map(([a, b]) => L.apply("or", a, b)), [0, 1, 1, 1]);
  assert.deepEqual([0, 1].map((a) => L.apply("not", a)), [1, 0]);
  assert.deepEqual(L.table("and").map((r) => [r.a, r.b, r.out]), [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]]);
  assert.deepEqual(L.table("not").map((r) => [r.a, r.out]), [[0, 1], [1, 0]]);
  assert.equal(L.OPS.and.name, "VA");
  assert.equal(L.OPS.or.name, "YOKI");
  assert.equal(L.OPS.not.name, "EMAS");
  assert.equal(L.OPS.and.circuit, "series");
  assert.equal(L.OPS.or.circuit, "parallel");
  assert.equal(L.OPS.not.circuit, "inverse");
  assert.equal(L.rowIndex(1, 0), 2);
});

test("needB: chiroq yonishi/o'chishi uchun B qanday bo'lsin", () => {
  assert.equal(L.needB("and", 1, 1), "1");
  assert.equal(L.needB("and", 1, 0), "0");
  assert.equal(L.needB("and", 0, 0), "any");
  assert.equal(L.needB("and", 0, 1), "none");
  assert.equal(L.needB("or", 1, 1), "any");
  assert.equal(L.needB("or", 1, 0), "none");
  assert.equal(L.needB("or", 0, 1), "1");
  assert.equal(L.needB("or", 0, 0), "0");
  assert.deepEqual(L.NEED_ORDER, ["1", "0", "any", "none"]);
  assert.deepEqual(Object.keys(L.NEED_LABELS).sort(), [...L.NEED_ORDER].sort());
});

test("ifodalar: qiymat va qadamlar mustaqil hisobga mos", () => {
  const not = (x) => 1 - x;
  const expected = {
    notA: (a) => not(a),
    aAndNotB: (a, b) => a & not(b),
    notAOrB: (a, b) => not(a) | b,
    notAnd: (a, b) => not(a & b),
    notOr: (a, b) => not(a | b),
    notAAndNotB: (a, b) => not(a) & not(b),
    notAOrNotB: (a, b) => not(a) | not(b),
    notAAndNotB2: (a, b) => not(a & not(b)),
    orAndNotA: (a, b) => (a | b) & not(a),
    andOrNotB: (a, b) => (a & b) | not(b),
    notNotAOrB: (a, b) => not(not(a) | b),
  };
  assert.deepEqual(L.EXPRS.map((e) => e.id).sort(), Object.keys(expected).sort());
  for (const e of L.EXPRS) {
    assert.match(e.text, /^[AB()EMSVYOKI ]+$/, e.text);
    assert.ok([0, 1, 2].includes(e.level), e.id);
    assert.ok(e.hint && e.hint.length > 10, e.id);
    // Qiyinlik: level 2 — uch amal (VA/YOKI/EMAS so'zlari soni)
    const ops = (e.text.match(/VA|YOKI|EMAS/g) || []).length;
    assert.equal(ops >= 3, e.level === 2 || e.id === "notAAndNotB", `${e.id}: ${ops} amal`);
    for (const [a, b] of PAIRS) {
      const v = L.evalExpr(e, a, b);
      assert.equal(v, expected[e.id](a, b), `${e.text} ${a}${b}`);
      const steps = L.exprSteps(e, a, b);
      assert.ok(steps.length >= 1, e.id);
      assert.ok(steps[steps.length - 1].endsWith(`= ${v}`), `${e.id}: ${steps.join(" | ")}`);
    }
    // Jadvali hech bo'lmasa bitta 0 va bitta 1 beradi (hammasi bir xil — chalg'ituvchi)
    const outs = PAIRS.map(([a, b]) => L.evalExpr(e, a, b));
    assert.equal(new Set(outs).size, 2, e.id);
  }
  for (const level of [0, 1, 2]) assert.ok(L.EXPRS.some((e) => e.level === level), `level ${level}`);
});

test("hayotiy qoidalar: ifoda va hisob mos, matnlar to'liq", () => {
  const expected = {
    rain: (a, b) => a & (1 - b), walk: (a, b) => a & (1 - b), gate: (a, b) => a | b,
    robot: (a, b) => a | (1 - b), tea: (a, b) => a & b, bike: (a, b) => a & b,
    film: (a, b) => a & b, lift: (a, b) => (1 - a) | (1 - b), alarm: (a, b) => a & (1 - b),
    garden: (a, b) => a | b, game: (a, b) => a & (1 - b),
  };
  assert.deepEqual(L.LIFE.map((l) => l.id).sort(), Object.keys(expected).sort());
  for (const l of L.LIFE) {
    for (const [a, b] of PAIRS) assert.equal(L.evalLife(l, a, b), expected[l.id](a, b), `${l.id} ${a}${b}`);
    for (const side of [l.a, l.b]) assert.ok(side.icon && side.name && side.on && side.off, l.id);
    assert.ok(l.rule && l.q.endsWith("?") && l.yes && l.no, l.id);
    assert.match(l.expr, /VA|YOKI/, l.id);
    assert.ok(l.expr.includes(l.a.name) && l.expr.includes(l.b.name), l.id);
    assert.equal(L.lifeSteps(l, 1, 0)[0], `${l.expr.replace(l.a.name, "1").replace(l.b.name, "0")} = ${L.evalLife(l, 1, 0)}`);
    assert.match(L.lifeSteps(l, 1, 0)[0], /^[0-9()EMASVYOKI ]+= [01]$/, l.id);
  }
});

test("hayotiy qoida ifodasi: 4 variant, bittasi to'g'ri, takrorsiz", () => {
  for (const l of L.LIFE) {
    assert.ok(L.lifeExprForms(l).includes(l.expr), `${l.id}: ifoda shakllar ro'yxatida yo'q`);
    assert.equal(new Set(L.lifeExprForms(l)).size, 8, l.id);
    for (let k = 0; k < 20; k++) {
      const opts = L.lifeExprOptions(l);
      assert.equal(opts.length, 4, l.id);
      assert.equal(new Set(opts).size, 4, l.id);
      assert.equal(opts.filter((t) => t === l.expr).length, 1, l.id);
    }
  }
});

test("jadval to'ldirish: xato qatorlar soni", () => {
  assert.equal(L.wrongRows([0, 0, 0, 1], [0, 0, 0, 1]), 0);
  assert.equal(L.wrongRows([0, 0, 0, 1], [0, 1, 1, 1]), 2);
  assert.equal(L.wrongRows([0, 0, 0, 1], [null, 0, 0, 1]), 1);
  assert.equal(L.wrongRows([0, 0, 0, 1], undefined), 4);
  assert.ok(L.fillOk([1, 0], [1, 0]));
  assert.ok(!L.fillOk([1, 0], [0, 0]));
  assert.deepEqual(L.fillRows(true), [[0], [1]]);
  assert.deepEqual(L.fillRows(false), PAIRS);
});

test("topshiriqlar: bosqich va tier bo'yicha turlar, javob to'g'ri, ketma-ket takror yo'q", () => {
  for (const stage of [1, 2, 3]) {
    for (const tier of [0, 1, 2]) {
      let prev = null;
      const ops = new Set();
      const types = new Set();
      const levels = new Set();
      for (let k = 0; k < 400; k++) {
        const t = L.makeTask(stage, prev, Math.random, tier);
        assert.notEqual(t.id, prev && prev.id, `${stage}/${tier}: takror ${t.id}`);
        types.add(t.type);
        if (t.op) ops.add(t.op);
        if (t.type === "need") {
          assert.equal(t.answer, L.needB(t.op, t.a, t.want));
          assert.ok(L.checkTask(t, t.answer));
          // 4 variantdan faqat bittasi to'g'ri
          assert.equal(L.NEED_ORDER.filter((v) => L.checkTask(t, v)).length, 1);
        }
        if (t.type === "fill") {
          assert.deepEqual(t.answer, PAIRS.map(([a, b]) => L.apply(t.op, a, b)));
          assert.equal(t.named, tier < 2, "tier 2 da amal nomi yashirin — faqat sxema");
          assert.equal(t.rows.length, 4);
        }
        if (t.type === "fillExpr") {
          assert.deepEqual(t.answer, t.rows.map(([a, b]) => L.evalExpr(t.expr, a, b)));
          assert.equal(t.rows.length, t.expr.id === "notA" ? 2 : 4);
          levels.add(t.expr.level);
        }
        if (t.type === "fillLife") assert.deepEqual(t.answer, PAIRS.map(([a, b]) => L.evalLife(t.life, a, b)));
        if (t.type === "life") {
          assert.equal(t.answer.out, L.evalLife(t.life, t.a, t.b));
          assert.equal(t.answer.expr, t.life.expr);
          assert.equal(t.options.length, 4);
          assert.equal(new Set(t.options).size, 4);
          assert.ok(t.options.includes(t.life.expr));
          // Ikkala qadam ham to'g'ri bo'lsagina hisoblanadi
          assert.ok(L.checkTask(t, { expr: t.life.expr, out: t.answer.out }));
          assert.ok(!L.checkTask(t, { expr: t.life.expr, out: 1 - t.answer.out }));
          for (const o of t.options) if (o !== t.life.expr) assert.ok(!L.checkTask(t, { expr: o, out: t.answer.out }));
        }
        if (t.type !== "need" && t.type !== "life") {
          assert.ok(L.checkTask(t, t.answer));
          assert.ok(!L.checkTask(t, t.answer.map((v) => 1 - v)));
          assert.ok(!L.checkTask(t, t.answer.map(() => null)));
        }
        prev = t;
      }
      // 0/1 javobli savol yo'q: hamma tur — jadval, 4 variant yoki ikki qadam
      if (stage === 1) assert.deepEqual([...ops], ["and"]);
      if (stage === 2) assert.deepEqual([...ops].sort(), ["and", "or"]);
      if (stage < 3) assert.deepEqual([...types].sort(), ["fill", "need"]);
      if (stage === 3 && tier < 2) assert.deepEqual([...types].sort(), ["fillExpr", "life"]);
      if (stage === 3 && tier === 2) assert.deepEqual([...types].sort(), ["fillExpr", "fillLife", "life"]);
      if (stage === 3) assert.deepEqual([...levels].sort(), tier === 0 ? [0, 1] : [tier]);
    }
  }
  // tier berilmasa — 0
  assert.ok(["need", "fill"].includes(L.makeTask(1, null).type));
});

test("matnlarda oddiy apostrof yo'q (ʻ ishlatiladi)", () => {
  const all = JSON.stringify([L.LIFE, L.EXPRS.map((e) => e.text), L.NEED_LABELS]);
  assert.ok(!/['`’]/.test(all), all.match(/.{20}['`’].{20}/));
});
