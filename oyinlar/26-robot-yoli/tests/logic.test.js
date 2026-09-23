// logic.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const D = require("../../umumiy/js/dastur.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

test("bosqich chegaralari: 1-bosqich toshsiz, keyingilarida tosh bor", () => {
  assert.equal(L.STAGE[1].walls, 0);
  assert.ok(L.STAGE[2].walls > 0);
  assert.ok(L.STAGE[3].walls > 0);
  for (const s of [1, 2, 3]) {
    assert.ok(L.STAGE[s].min <= L.STAGE[s].max, `${s}: min ≤ max`);
    assert.ok(L.STAGE[s].max <= 8, `${s}: dastur ro'yxatiga sig'adi`);
    assert.equal(L.STAGE[s].needTurn, true);
  }
});

test("2-bosqich ko'rsatuvi: bir xil buyruqlar, tartibi boshqa", () => {
  const f = D.field(L.DEMO.field);
  assert.deepEqual([...L.DEMO.bad].sort(), [...L.DEMO.good].sort(), "buyruqlar to'plami bir xil");
  assert.notDeepEqual(L.DEMO.bad, L.DEMO.good, "tartibi boshqa");
  const bad = D.run(f, L.DEMO.bad);
  assert.equal(bad.status, "wall", "noto'g'ri tartib — toshga uriladi");
  assert.ok(bad.path.length > 1, "urilishdan oldin kamida bitta qadam ko'rinadi");
  assert.equal(D.run(f, L.DEMO.good).status, "goal");
});

test("1-bosqich vazifasi: toshsiz, yechim 2–4 buyruq va burilishli", () => {
  const rng = rngFrom(11);
  let prev = null;
  for (let k = 0; k < 60; k++) {
    const t = L.makeTask(1, prev, rng);
    assert.equal(t.type, "write");
    assert.equal(t.field.walls.length, 0);
    const p = D.solve(t.field);
    assert.ok(p.length >= 2 && p.length <= 4, `uzunlik ${p.length}`);
    assert.ok(D.turns(p) >= 1);
    prev = t;
  }
});

test("2-bosqich vazifasi: toshli, yechim 3–6 buyruq", () => {
  const rng = rngFrom(23);
  let prev = null;
  for (let k = 0; k < 60; k++) {
    const t = L.makeTask(2, prev, rng);
    assert.equal(t.type, "write");
    assert.equal(t.field.walls.length, L.STAGE[2].walls);
    const p = D.solve(t.field);
    assert.ok(p.length >= 3 && p.length <= 6, `uzunlik ${p.length}`);
    prev = t;
  }
});

test("3-bosqich vazifasi: ikki xil — dasturni o'qish va izdan tiklash", () => {
  const rng = rngFrom(5);
  const seen = new Set();
  let prev = null;
  for (let k = 0; k < 200; k++) {
    const t = L.makeTask(3, prev, rng);
    seen.add(t.type);
    if (t.type === "read") {
      const r = D.run(t.field, t.program);
      assert.deepEqual(t.answer, r.at, "javob — robot to'xtagan katak");
      assert.notEqual(r.status, "goal", "gulxanga yetsa savol ma'nosiz bo'ladi");
      assert.notEqual(r.status, "edge", "chekkaga urish — chalg'ituvchi");
      assert.ok(r.path.length >= 2, "robot joyidan qimirlaydi");
      assert.ok(!D.sameCell(r.at, t.field.robot), "boshlangan katakka qaytib kelmaydi");
      assert.ok(t.program.length >= 3 && t.program.length <= 5, `uzunlik ${t.program.length}`);
    } else {
      assert.equal(t.type, "trace");
      assert.deepEqual(t.program, D.solve(t.field), "iz — eng qisqa yo'l");
      assert.equal(D.run(t.field, t.program).status, "goal");
      assert.ok(D.turns(t.program) >= 1, "faqat to'g'ri chiziq bo'lmasin");
    }
    prev = t;
  }
  assert.deepEqual([...seen].sort(), ["read", "trace"]);
});

test("ketma-ket bir xil vazifa chiqmaydi", () => {
  for (const stage of [1, 2, 3]) {
    const rng = rngFrom(stage * 31);
    let prev = null;
    for (let k = 0; k < 100; k++) {
      const t = L.makeTask(stage, prev, rng);
      if (prev) assert.notEqual(t.id, prev.id, `${stage}-bosqich`);
      prev = t;
    }
  }
});

test("tekshirish: dastur yozish — gulxanga yetsa to'g'ri", () => {
  const t = { type: "write", field: D.field({ robot: { x: 0, y: 4 }, goal: { x: 1, y: 3 } }) };
  assert.equal(L.checkTask(t, ["right", "up"]), true);
  assert.equal(L.checkTask(t, ["up", "right"]), true, "boshqa to'g'ri yo'l ham bo'ladi");
  assert.equal(L.checkTask(t, ["up", "up"]), false);
  assert.equal(L.checkTask(t, []), false);
});

test("tekshirish: qayerga boradi — katak bosiladi", () => {
  const t = { type: "read", answer: { x: 2, y: 3 } };
  assert.equal(L.checkTask(t, { x: 2, y: 3 }), true);
  assert.equal(L.checkTask(t, { x: 2, y: 2 }), false);
});

test("tekshirish: izdan tiklash — yo'l bir xil bo'lsa to'g'ri", () => {
  const field = D.field({ robot: { x: 0, y: 4 }, goal: { x: 1, y: 3 } });
  const t = { type: "trace", field, program: ["up", "right"] };
  assert.equal(L.checkTask(t, ["up", "right"]), true);
  assert.equal(L.checkTask(t, ["right", "up"]), false, "boshqa yo'l — boshqa iz");
  assert.equal(L.checkTask(t, ["up", "right", "up"]), true, "gulxanda to'xtaydi, ortiqchasi bajarilmaydi");
  assert.equal(L.checkTask(t, ["up"]), false);
});
