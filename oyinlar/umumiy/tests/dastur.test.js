// umumiy/js/dastur.js testlari: robot maydoni, buyruqlarni bajarish, eng qisqa yo'l, tasodifiy maydon.
// Ishga tushirish (loyiha ildizida): node --test oyinlar/umumiy/tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/dastur.js");

// Testlar uchun aniq (takrorlanadigan) tasodif
function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const at = (x, y) => ({ x, y });

test("yo'nalishlar: to'rtta, o'qi va siljishi bor", () => {
  assert.deepEqual(D.ORDER, ["left", "up", "down", "right"]);
  assert.deepEqual(D.ORDER.map((k) => D.DIRS[k].arrow), ["⬅", "⬆", "⬇", "➡"]);
  assert.deepEqual(D.DIRS.up, { dx: 0, dy: -1, arrow: "⬆", name: "yuqoriga" });
  assert.deepEqual(D.DIRS.right, { dx: 1, dy: 0, arrow: "➡", name: "oʻngga" });
});

test("maydon: o'lchov, robot, gulxan, toshlar va id", () => {
  const f = D.field({ robot: at(0, 4), goal: at(2, 2), walls: [at(1, 4)] });
  assert.equal(f.w, 5);
  assert.equal(f.h, 5);
  assert.deepEqual(f.robot, at(0, 4));
  assert.deepEqual(f.goal, at(2, 2));
  assert.ok(D.isWall(f, at(1, 4)));
  assert.ok(!D.isWall(f, at(2, 2)));
  assert.ok(D.inside(f, at(4, 0)));
  assert.ok(!D.inside(f, at(5, 0)));
  assert.ok(!D.inside(f, at(0, -1)));
  // id — takrorlanmaslikni tekshirish uchun: bir xil maydon — bir xil id
  assert.equal(f.id, D.field({ robot: at(0, 4), goal: at(2, 2), walls: [at(1, 4)] }).id);
  assert.notEqual(f.id, D.field({ robot: at(0, 4), goal: at(2, 3), walls: [at(1, 4)] }).id);
});

test("bajarish: gulxanga yetsa — 'goal', yo'l esa bosib o'tilgan kataklar", () => {
  const f = D.field({ robot: at(0, 4), goal: at(2, 4) });
  const r = D.run(f, ["right", "right"]);
  assert.equal(r.status, "goal");
  assert.deepEqual(r.at, at(2, 4));
  assert.deepEqual(r.path, [at(0, 4), at(1, 4), at(2, 4)]);
  assert.equal(r.used, 2);
});

test("bajarish: gulxanga yetgach to'xtaydi — ortiqcha buyruq bajarilmaydi", () => {
  const f = D.field({ robot: at(0, 4), goal: at(1, 4) });
  const r = D.run(f, ["right", "right", "up"]);
  assert.equal(r.status, "goal");
  assert.equal(r.used, 1);
  assert.deepEqual(r.at, at(1, 4));
});

test("bajarish: tosh — robot oldingi katakda to'xtaydi", () => {
  const f = D.field({ robot: at(0, 4), goal: at(4, 4), walls: [at(2, 4)] });
  const r = D.run(f, ["right", "right", "right"]);
  assert.equal(r.status, "wall");
  assert.deepEqual(r.at, at(1, 4));
  assert.equal(r.used, 1, "to'xtatgan buyruq bajarilmagan hisoblanadi");
  assert.deepEqual(r.blocked, at(2, 4), "urilgan katak");
});

test("bajarish: maydon chekkasi — 'edge'", () => {
  const f = D.field({ robot: at(0, 4), goal: at(4, 4) });
  const r = D.run(f, ["left"]);
  assert.equal(r.status, "edge");
  assert.deepEqual(r.at, at(0, 4));
  assert.equal(r.used, 0);
  assert.deepEqual(r.blocked, at(-1, 4));
});

test("bajarish: buyruqlar tugadi, gulxan topilmadi — 'end'", () => {
  const f = D.field({ robot: at(0, 4), goal: at(4, 0) });
  const r = D.run(f, ["up", "right"]);
  assert.equal(r.status, "end");
  assert.deepEqual(r.at, at(1, 3));
  assert.equal(r.used, 2);
  assert.equal(r.blocked, null);
});

test("bajarish: bo'sh dastur — robot joyida", () => {
  const f = D.field({ robot: at(0, 4), goal: at(4, 0) });
  const r = D.run(f, []);
  assert.equal(r.status, "end");
  assert.deepEqual(r.path, [at(0, 4)]);
});

test("yechim: eng qisqa yo'l topiladi va u ishlaydi", () => {
  const f = D.field({ robot: at(0, 4), goal: at(2, 2) });
  const p = D.solve(f);
  assert.equal(p.length, 4);
  assert.equal(D.run(f, p).status, "goal");
});

test("yechim: toshni aylanib o'tadi", () => {
  const f = D.field({ robot: at(0, 4), goal: at(2, 4), walls: [at(1, 4)] });
  const p = D.solve(f);
  assert.equal(D.run(f, p).status, "goal");
  assert.ok(p.length > 2, "to'g'ri chiziq yopiq, aylanib o'tiladi");
});

test("yechim: yo'l yo'q bo'lsa — null", () => {
  const f = D.field({ robot: at(0, 4), goal: at(4, 0), walls: [at(1, 4), at(0, 3)] });
  assert.equal(D.solve(f), null);
});

test("burilishlar: ketma-ket boshqa yo'nalish sanaladi", () => {
  assert.equal(D.turns([]), 0);
  assert.equal(D.turns(["right", "right", "right"]), 0);
  assert.equal(D.turns(["right", "up"]), 1);
  assert.equal(D.turns(["right", "up", "right"]), 2);
});

test("iz → dastur: robot yurgan yo'ldan buyruqlar tiklanadi", () => {
  const f = D.field({ robot: at(0, 4), goal: at(2, 3) });
  const p = ["right", "up", "right"];
  const r = D.run(f, p);
  assert.deepEqual(D.pathToProgram(r.path), p);
  assert.deepEqual(D.pathToProgram([at(1, 1)]), []);
});

test("tasodifiy maydon: har doim yechiladi va chegaraga sig'adi", () => {
  const rng = rngFrom(7);
  let prev = null;
  for (let k = 0; k < 200; k++) {
    const f = D.randomField({ walls: 3, min: 3, max: 6, needTurn: true }, prev, rng);
    const p = D.solve(f);
    assert.ok(p, "yechimi bor");
    assert.ok(p.length >= 3 && p.length <= 6, `uzunlik ${p.length}`);
    assert.ok(D.turns(p) >= 1, "kamida bitta burilish");
    assert.equal(D.run(f, p).status, "goal");
    assert.ok(!D.sameCell(f.robot, f.goal));
    assert.ok(!D.isWall(f, f.robot) && !D.isWall(f, f.goal));
    if (prev) assert.notEqual(f.id, prev.id, "oldingi maydon takrorlanmaydi");
    prev = f;
  }
});

test("tasodifiy maydon: toshsiz bosqich uchun tosh qo'yilmaydi", () => {
  const rng = rngFrom(3);
  for (let k = 0; k < 50; k++) {
    const f = D.randomField({ walls: 0, min: 2, max: 4, needTurn: true }, null, rng);
    assert.equal(f.walls.length, 0);
    const p = D.solve(f);
    assert.ok(p.length >= 2 && p.length <= 4, `uzunlik ${p.length}`);
    assert.ok(D.turns(p) >= 1);
  }
});
