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

// ---------- 2026-10-02: qiyinlik zinasi (tier) ----------
test("tier: chegaralar o'sadi — yo'l uzayadi, tosh ko'payadi", () => {
  for (const stage of [1, 2, 3]) {
    const list = L.LIMITS[stage];
    assert.equal(list.length, 3);
    assert.deepEqual(L.STAGE[stage], list[0], "STAGE — tier 0");
    for (let t = 1; t < 3; t++) {
      assert.ok(list[t].max > list[t - 1].max, `${stage}-bosqich: max o'sadi`);
      assert.ok(list[t].min >= list[t - 1].min && list[t].walls >= list[t - 1].walls);
    }
  }
  assert.equal(L.LIMITS[2][2].max, 8);
  assert.equal(L.LIMITS[3][2].walls, 4);
});

test("tier: 1–2-bosqich maydonlari chegarada, tier 2 da eng qisqa yo'l sharti", () => {
  for (const stage of [1, 2]) {
    for (const tier of [0, 1, 2]) {
      const rng = rngFrom(100 + stage * 10 + tier);
      const lim = L.LIMITS[stage][tier];
      let prev = null;
      let top = 0;
      for (let k = 0; k < 60; k++) {
        const t = L.makeTask(stage, prev, rng, tier);
        assert.equal(t.type, "write");
        assert.equal(t.field.walls.length, lim.walls);
        const p = D.solve(t.field);
        assert.ok(p.length >= lim.min && p.length <= lim.max, `${stage}/${tier}: uzunlik ${p.length}`);
        assert.ok(D.turns(p) >= 1);
        assert.equal(t.shortest, tier === 2 ? p.length : undefined);
        assert.ok(L.checkTask(t, p), "eng qisqa yechim qabul qilinadi");
        if (prev) assert.notEqual(t.id, prev.id);
        top = Math.max(top, p.length);
        prev = t;
      }
      assert.ok(top >= lim.max - 1, `${stage}/${tier}: uzun yo'llar ham chiqadi (${top})`);
    }
  }
});

test("tier 2: uzunroq dastur gulxanga yetsa ham hisoblanmaydi", () => {
  const field = D.field({ robot: { x: 0, y: 4 }, goal: { x: 1, y: 3 } });
  const t = { type: "write", field, shortest: 2 };
  assert.equal(L.checkTask(t, ["right", "up"]), true);
  assert.equal(L.checkTask(t, ["up", "right"]), true, "boshqa eng qisqa yo'l ham to'g'ri");
  const long = ["left", "right", "right", "up"];
  assert.equal(D.run(field, ["right", "left", "right", "up"]).status, "goal");
  assert.equal(L.checkTask(t, ["right", "left", "right", "up"]), false, "aylanma yo'l — uzun");
  assert.equal(L.tooLong(t, ["right", "left", "right", "up"]), true);
  assert.equal(L.tooLong(t, ["up", "up"]), false, "yetmagan dastur — uzun emas, shunchaki xato");
  assert.equal(L.tooLong({ type: "write", field }, ["right", "left", "right", "up"]), false, "shart yo'q — uzun deyilmaydi");
  assert.equal(long.length, 4);
});

test("tier: 3-bosqich — o'qiladigan dastur uzayadi (3–5 → 4–6 → 5–7)", () => {
  for (const tier of [0, 1, 2]) {
    const rng = rngFrom(300 + tier);
    const lim = L.LIMITS[3][tier];
    const seen = new Set();
    let prev = null;
    for (let k = 0; k < 150; k++) {
      const t = L.makeTask(3, prev, rng, tier);
      seen.add(t.type);
      assert.equal(t.field.walls.length, lim.walls);
      if (t.type === "read") {
        assert.ok(t.program.length >= lim.read[0] && t.program.length <= lim.read[1], `uzunlik ${t.program.length}`);
        assert.deepEqual(t.answer, D.run(t.field, t.program).at);
      } else {
        assert.deepEqual(t.program, D.solve(t.field));
        assert.ok(t.program.length >= lim.min && t.program.length <= lim.max);
      }
      prev = t;
    }
    assert.deepEqual([...seen].sort(), ["read", "trace"]);
  }
});
