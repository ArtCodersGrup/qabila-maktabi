// rules.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../js/rules.js");

const item = (size, dots, yes) => ({ size, dots, yes });

test("qoida: belgi, amal va son bo'yicha tekshiriladi", () => {
  assert.equal(R.test({ feature: "size", op: ">", value: 5 }, item(7, 2)), true);
  assert.equal(R.test({ feature: "size", op: ">", value: 5 }, item(5, 2)), false);
  assert.equal(R.test({ feature: "dots", op: "<", value: 4 }, item(9, 2)), true);
  assert.equal(R.test({ feature: "dots", op: "<", value: 4 }, item(1, 4)), false);
});

test("errorsOf: qoida nechta narsada xato qiladi", () => {
  const items = [item(7, 2, true), item(8, 1, true), item(2, 5, false), item(6, 9, true)];
  assert.equal(R.errorsOf(items, { feature: "size", op: ">", value: 5 }), 0);
  assert.equal(R.errorsOf(items, { feature: "size", op: ">", value: 7 }), 2);
  assert.deepEqual(R.wrongOnes(items, { feature: "size", op: ">", value: 7 }).map((x) => x.size).sort(), [6, 7]);
});

test("allRules va bestRule: hamma qoida sinaladi", () => {
  assert.equal(R.allRules().length, R.FEATURES.length * R.OPS.length * 9);
  const clean = [item(7, 2, true), item(8, 1, true), item(9, 4, true), item(2, 5, false), item(3, 9, false), item(1, 6, false)];
  const best = R.bestRule(clean);
  assert.equal(best.errors, 0);
  assert.equal(R.errorsOf(clean, best.rule), 0);
});

test("nearest: eng yaqin misol bo'yicha bashorat", () => {
  const train = [item(2, 2, false), item(8, 8, true)];
  assert.equal(R.nearest(train, { size: 3, dots: 2 }).yes, false);
  assert.equal(R.nearest(train, { size: 7, dots: 9 }).yes, true);
  assert.equal(R.nnErrors(train, [item(3, 3, false), item(9, 9, true)]), 0);
  assert.equal(R.nnErrors(train, [item(3, 3, true)]), 1);
});

test("makeRuleTask: qoida bilan 0 xato bo'ladi, ikki xil javob bor", () => {
  let prev = null;
  for (let i = 0; i < 200; i++) {
    const task = R.makeRuleTask(prev);
    assert.equal(task.items.length, 8);
    assert.ok(task.items.some((x) => x.yes) && task.items.some((x) => !x.yes));
    assert.equal(R.errorsOf(task.items, task.answer), 0);
    assert.equal(R.bestRule(task.items).errors, 0);
    if (prev) assert.notDeepEqual(task.answer, prev.answer);
    prev = task;
  }
});

test("makeFuzzyTask: hech bir qoida to'g'ri ishlamaydi, misollar esa yetarli", () => {
  for (let i = 0; i < 60; i++) {
    const task = R.makeFuzzyTask();
    assert.equal(task.items.length, 8);
    assert.equal(task.examples.length, 6);
    assert.ok(R.bestRule(task.items).errors >= 2, "qoida bilan yechib bo'ldi");
    assert.equal(R.nnErrors(task.examples, task.items), 0, "misollar bilan yechilmadi");
  }
});

test("makeRuleTask: tier bilan qiyinlashadi — chegara kengayadi, mos qoidalar kamayadi", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const values = new Set();
    for (let i = 0; i < 200; i++) {
      const task = R.makeRuleTask(prev, Math.random, tier);
      assert.equal(task.items.length, tier === 2 ? 10 : 8, `tier ${tier}: narsalar soni`);
      assert.equal(new Set(task.items.map((x) => `${x.size}:${x.dots}`)).size, task.items.length, "narsa takrorlandi");
      assert.equal(R.errorsOf(task.items, task.answer), 0);
      const lo = tier === 0 ? 3 : 2;
      const hi = tier === 0 ? 7 : 8;
      assert.ok(task.answer.value >= lo && task.answer.value <= hi, `tier ${tier}: chegara ${task.answer.value}`);
      assert.ok(R.zeroRules(task.items) <= [99, 4, 2][tier], `tier ${tier}: xatosiz qoidalar koʻp`);
      if (prev) assert.notDeepEqual(task.answer, prev.answer);
      values.add(task.answer.value);
      prev = task;
    }
    assert.equal(values.size, tier === 0 ? 5 : 7, `tier ${tier}: hamma chegaralar chiqishi kerak`);
  }
});

test("makeSetKindTask: 4 variant — 3 ta qoida va «hech qaysi»; faqat bittasi toʻgʻri", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    let qoida = 0;
    for (let i = 0; i < 120; i++) {
      const task = R.makeSetKindTask(i < 2 ? i : 5, prev, Math.random, tier);
      assert.equal(task.options.length, 4, "kamida 4 variant");
      assert.equal(task.items.length, 8, "toʻplam hajmi javobni aytib qoʻymasin");
      assert.deepEqual(task.options[3], { kind: "none" });
      const ruleOptions = task.options.slice(0, 3);
      assert.ok(ruleOptions.every((o) => o.kind === "rule"));
      assert.equal(new Set(ruleOptions.map((o) => `${o.rule.feature}${o.rule.op}${o.rule.value}`)).size, 3, "qoida takrorlandi");
      const zero = ruleOptions.filter((o) => R.errorsOf(task.items, o.rule) === 0);
      const solvable = R.bestRule(task.items).errors === 0;
      assert.equal(task.answer, solvable ? "qoida" : "misol");
      if (solvable) {
        assert.equal(zero.length, 1, "aynan bitta qoida xatosiz boʻlishi kerak");
        assert.equal(task.options[task.answerIndex], zero[0]);
        qoida++;
      } else {
        assert.equal(zero.length, 0, "chalkash toʻplamda hech bir qoida xatosiz emas");
        assert.equal(task.answerIndex, 3);
      }
      prev = task;
    }
    assert.ok(qoida > 30 && qoida < 90, `tier ${tier}: muvozanat buzilgan: ${qoida}`);
  }
  assert.equal(R.makeSetKindTask(0, null).answer, "qoida");
  assert.equal(R.makeSetKindTask(1, null).answer, "misol");
});

test("makeSetKindTask: tier 2 da chalgʻituvchi qoidalar «deyarli toʻgʻri» (xatosi kam)", () => {
  const avg = (tier) => {
    let sum = 0;
    let n = 0;
    for (let i = 0; i < 150; i++) {
      const task = R.makeSetKindTask(0, null, Math.random, tier);
      task.options.forEach((o, k) => {
        if (o.kind !== "rule" || k === task.answerIndex) return;
        sum += R.errorsOf(task.items, o.rule);
        n++;
      });
    }
    return sum / n;
  };
  const easy = avg(0);
  const hard = avg(2);
  assert.ok(easy >= 3, `tier 0 da chalgʻituvchilar ochiq xato boʻlishi kerak: ${easy}`);
  assert.ok(hard < 2.5 && hard < easy, `tier 2 da chalgʻituvchilar toʻgʻriga yaqin boʻlishi kerak: ${hard}`);
});

test("makeKindTask: hayotdan misol + «nega?» — 4 ta sabab, bittasi toʻgʻri", () => {
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 300; i++) {
    const task = R.makeKindTask(prev);
    const found = R.CASES.find((c) => c.text === task.text);
    assert.ok(found, task.text);
    assert.equal(task.answer, found.kind);
    assert.equal(task.whyOptions.length, 4, "kamida 4 variant");
    assert.equal(new Set(task.whyOptions).size, 4, "sabab takrorlandi");
    assert.equal(task.whyOptions[task.whyIndex], found.why);
    assert.equal(task.whyOptions.filter((w) => w === found.why).length, 1);
    const kinds = task.whyOptions.map((w) => R.CASES.find((c) => c.why === w).kind);
    assert.equal(kinds.filter((k) => k === found.kind).length, 2, "shu turdan bitta chalgʻituvchi boʻlishi kerak");
    seen.add(task.text);
    if (prev) assert.notEqual(task.text, prev.text);
    prev = task;
  }
  assert.equal(seen.size, R.CASES.length, "hamma holatlar chiqishi kerak");
});

test("hayotdan misollar ro'yxati: 24 ta, ikki turi teng, matn va sabablar takrorlanmaydi", () => {
  const qoida = R.CASES.filter((c) => c.kind === "qoida").length;
  const misol = R.CASES.filter((c) => c.kind === "misol").length;
  assert.equal(R.CASES.length, 24);
  assert.equal(qoida, 12);
  assert.equal(misol, 12);
  assert.equal(new Set(R.CASES.map((c) => c.text)).size, 24);
  assert.equal(new Set(R.CASES.map((c) => c.why)).size, 24, "sabablar har xil boʻlishi kerak — «nega?» savoli shunga tayanadi");
  for (const c of R.CASES) {
    assert.ok(c.text && c.why && ["qoida", "misol"].includes(c.kind));
    assert.ok(!/[`']/.test(c.text + c.why), `oʻ/gʻ U+02BB bilan yozilsin: ${c.text}`);
  }
});
