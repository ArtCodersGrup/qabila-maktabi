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
const { GAMES, SECTIONS, CONTESTS, number } = win.QK.bosh;

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

test("musobaqalar: savol-javob va tez yozish poygasi, sahifasi va ikonkasi bor", () => {
  assert.deepEqual(CONTESTS.map((c) => c.dir), ["musobaqa", "poyga"]);
  for (const c of CONTESTS) {
    assert.ok(fs.existsSync(path.join(ROOT, "oyinlar", c.dir, "index.html")), c.dir);
    assert.match(win.QK.boshArt.icon(c.icon), /^<svg[\s\S]*<\/svg>$/, c.icon);
    assert.ok(!win.QK.boshArt.icon(c.icon).includes("<text"), c.icon);
  }
  assert.equal(CONTESTS.find((c) => c.dir === "poyga").pc, true, "poygaga klaviatura kerak");
});

test("bosh sahifadagi raqamlar 1 dan ketma-ket, bo'limlar tartibida", () => {
  const shown = SECTIONS.flatMap((sec) => GAMES.filter((g) => g.topic === sec.id)).map(number);
  assert.deepEqual(shown, GAMES.map((g, k) => k + 1));
  assert.equal(number(GAMES.find((g) => g.dir === "23-on-barmoq")), 1, "klaviatura — birinchi");
});

test("har bo'limda kamida bitta o'yin bor", () => {
  for (const section of SECTIONS) {
    assert.ok(GAMES.some((g) => g.topic === section.id), section.id);
  }
});

test("yosh belgisi: umumiy yoki o'yinning o'zi (sanoq tizimlari bloki — 10–12)", () => {
  for (const game of GAMES) {
    if (game.age != null) assert.match(game.age, /^\d+–\d+$/, game.dir);
    if (game.topic === "sanoq" && game.n >= 17) assert.equal(game.age, "10–12", game.dir);
  }
});

test("💻 belgisi: klaviatura bloki o'yinlariga haqiqiy klaviatura kerak", () => {
  for (const game of GAMES) assert.equal(!!game.pc, game.topic === "klaviatura", game.dir);
});

// O'yinlar ichidagi "5-oʻyindagi chiroqlarni esla" kabi havolalar bosh sahifadagi raqamga mos bo'lishi kerak.
// Ro'yxat: bosh/tests/havolalar.json — [fayl, matn namunasi, havola qilingan papkalar]. Tartib o'zgarsa, test eslatadi.
test("o'yinlardagi raqamli havolalar bosh sahifa tartibiga mos va hammasi ro'yxatda", () => {
  const refs = JSON.parse(fs.readFileSync(path.join(__dirname, "havolalar.json"), "utf8"));
  const num = (dir) => number(GAMES.find((g) => g.dir === dir));
  const covered = {};
  for (const [file, pattern, dirs] of refs) {
    const src = fs.readFileSync(path.join(ROOT, "oyinlar", file), "utf8");
    const m = new RegExp(pattern).exec(src);
    assert.ok(m, `${file}: «${pattern}» topilmadi`);
    assert.deepEqual(m.slice(1).map(Number), dirs.map(num), `${file}: «${m[0]}»`);
    (covered[file] = covered[file] || []).push([m.index, m.index + m[0].length]);
  }
  // Ro'yxatga kirmay qolgan havola yo'q (izohlar hisobga olinmaydi)
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "tests" ? [] : walk(p);
    return e.name.endsWith(".js") ? [p] : [];
  });
  for (const p of walk(path.join(ROOT, "oyinlar"))) {
    const file = path.relative(path.join(ROOT, "oyinlar"), p).split(path.sep).join("/");
    const src = fs.readFileSync(p, "utf8");
    const re = /\d+[-–]?\d*-oʻyin/g;
    let m;
    while ((m = re.exec(src))) {
      const lineStart = src.lastIndexOf("\n", m.index) + 1;
      if (/^\s*(\/\/|\*)/.test(src.slice(lineStart, m.index))) continue;
      const ok = (covered[file] || []).some(([a, b]) => m.index >= a && m.index < b);
      assert.ok(ok, `${file}: «${m[0]}» havolalar.json da yo'q`);
    }
  }
});
