// Bosh sahifa ro'yxati o'yinlarga mos kelishini tekshiradi.
// Ishga tushirish (loyiha ildizida): node --test bosh/tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { loadScript } = require("../../oyinlar/umumiy/tests/helpers.js");

const ROOT = path.join(__dirname, "../..");
const win = {};
loadScript(path.join(ROOT, "bosh/js/bosh-art.js"), win);
loadScript(path.join(ROOT, "bosh/js/bosh.js"), win);
const { GAMES, SECTIONS } = win.QK.bosh;

test("barcha o'yin papkalari ro'yxatda bor va aksincha", () => {
  const dirs = fs.readdirSync(path.join(ROOT, "oyinlar")).filter((d) => /^\d\d-/.test(d));
  assert.deepEqual(GAMES.map((g) => g.dir).sort(), dirs.sort());
});

test("kalit, sarlavha va bosqichlar soni o'yin main.js ga mos", () => {
  for (const game of GAMES) {
    const dir = path.join(ROOT, "oyinlar", game.dir);
    assert.ok(fs.existsSync(path.join(dir, "index.html")), game.dir);
    const src = fs.readFileSync(path.join(dir, "js/main.js"), "utf8");
    assert.ok(src.includes(`storageKey: "${game.key}"`), `${game.dir}: kalit`);
    assert.ok(src.includes(`title: "${game.title}"`), `${game.dir}: sarlavha`);
    const stages = src.match(/stageTitles: \[([^\]]*)\]/)[1].split(",").length;
    assert.equal(game.stages, stages, `${game.dir}: bosqichlar soni`);
  }
});

test("har o'yin mavjud bo'limda va ikonkasi bor", () => {
  const ids = SECTIONS.map((s) => s.id);
  for (const game of GAMES) {
    assert.ok(ids.includes(game.topic), `${game.dir}: ${game.topic}`);
    assert.match(win.QK.boshArt.icon(game.icon), /^<svg[\s\S]*<\/svg>$/, game.icon);
    assert.ok(!win.QK.boshArt.icon(game.icon).includes("<text"), game.icon);
  }
  assert.equal(win.QK.boshArt.icon("yoq"), "");
});

test("har bo'limda kamida bitta o'yin bor", () => {
  for (const section of SECTIONS) {
    assert.ok(GAMES.some((g) => g.topic === section.id), section.id);
  }
});
