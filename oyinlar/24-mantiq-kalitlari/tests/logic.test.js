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
  };
  assert.deepEqual(L.EXPRS.map((e) => e.id).sort(), Object.keys(expected).sort());
  for (const e of L.EXPRS) {
    assert.match(e.text, /^[AB()EMSVYOKI ]+$/, e.text);
    for (const [a, b] of PAIRS) {
      const v = L.evalExpr(e, a, b);
      assert.equal(v, expected[e.id](a, b), `${e.text} ${a}${b}`);
      const steps = L.exprSteps(e, a, b);
      assert.ok(steps.length >= 1, e.id);
      assert.ok(steps[steps.length - 1].endsWith(`= ${v}`), `${e.id}: ${steps.join(" | ")}`);
    }
  }
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

test("topshiriqlar: bosqich bo'yicha turlar, javob to'g'ri, ketma-ket takror yo'q", () => {
  for (const stage of [1, 2, 3]) {
    let prev = null;
    const ops = new Set();
    const types = new Set();
    for (let k = 0; k < 300; k++) {
      const t = L.makeTask(stage, prev);
      assert.notEqual(t.id, prev && prev.id, `${stage}: takror ${t.id}`);
      types.add(t.type);
      if (t.op) ops.add(t.op);
      if (t.type === "out") assert.equal(t.answer, L.apply(t.op, t.a, t.b));
      if (t.type === "need") assert.equal(t.answer, L.needB(t.op, t.a, t.want));
      if (t.type === "expr") assert.equal(t.answer, L.evalExpr(t.expr, t.a, t.b));
      if (t.type === "life") assert.equal(t.answer, L.evalLife(t.life, t.a, t.b));
      prev = t;
    }
    if (stage === 1) assert.deepEqual([...ops], ["and"]);
    if (stage === 2) assert.deepEqual([...ops].sort(), ["and", "or"]);
    if (stage < 3) assert.deepEqual([...types].sort(), ["need", "out"]);
    if (stage === 3) assert.deepEqual([...types].sort(), ["expr", "life"]);
  }
});

test("matnlarda oddiy apostrof yo'q (ʻ ishlatiladi)", () => {
  const all = JSON.stringify([L.LIFE, L.EXPRS.map((e) => e.text), L.NEED_LABELS]);
  assert.ok(!/['`’]/.test(all), all.match(/.{20}['`’].{20}/));
});
