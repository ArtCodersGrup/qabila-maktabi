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
const { GAMES, SECTIONS, CONTESTS, MASHQLAR, TOIFALAR, mos, oyinlar, yoshYorligi, number } = win.QK.bosh;

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
    // Sarlavha ichida vergul bo'lishi mumkin ("Medallar A(n,k)") — qo'shtirnoq juftlari sanaladi
    const stages = (src.match(/stageTitles: \[([^\]]*)\]/)[1].match(/"/g) || []).length / 2;
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

test("musobaqalar: bitta ekranda (savol-javob, poyga) va onlayn (aloqa sinovi), sahifasi va ikonkasi bor", () => {
  assert.deepEqual(CONTESTS.map((c) => c.dir), ["musobaqa", "poyga", "tank-duel", "onlayn", "tog", "yozuv-poygasi"]);
  assert.deepEqual(CONTESTS.map((c) => c.mode), ["offline", "offline", "offline", "online", "online", "online"], "bitta ekranda — eski musobaqalar, onlayn — alohida");
  for (const c of CONTESTS) {
    assert.ok(fs.existsSync(path.join(ROOT, "oyinlar", c.dir, "index.html")), c.dir);
    assert.match(win.QK.boshArt.icon(c.icon), /^<svg[\s\S]*<\/svg>$/, c.icon);
    assert.ok(!win.QK.boshArt.icon(c.icon).includes("<text"), c.icon);
  }
  assert.equal(CONTESTS.find((c) => c.dir === "poyga").pc, true, "poygaga klaviatura kerak");
  assert.equal(CONTESTS.find((c) => c.dir === "yozuv-poygasi").pc, true, "onlayn poygaga ham klaviatura kerak");
});

test("mashqlar: masalalar ro'yxati alohida bo'limda (o'yin emas — bosqichi yo'q)", () => {
  const { MASHQLAR } = win.QK.bosh;
  assert.deepEqual(MASHQLAR.map((m) => m.dir), ["masalalar"]);
  for (const m of MASHQLAR) {
    assert.ok(fs.existsSync(path.join(ROOT, "oyinlar", m.dir, "index.html")), m.dir);
    assert.match(win.QK.boshArt.icon(m.icon), /^<svg[\s\S]*<\/svg>$/, m.icon);
    assert.ok(!GAMES.some((g) => g.dir === m.dir), m.dir + ": o'yinlar ro'yxatida turmasin");
    assert.equal(m.pc, true, "kod yozish uchun klaviatura kerak");
  }
});

// Kartadagi raqam — TANLANGAN TOIFA ichidagi o'rin, shuning uchun har toifada alohida tekshiriladi
test("har toifada raqamlar 1 dan ketma-ket, bo'limlar tartibida", () => {
  for (const toifa of TOIFALAR) {
    const list = oyinlar(toifa);
    assert.ok(list.length > 0, toifa.id + ": bitta ham o'yin yo'q");
    assert.deepEqual(list.map((g) => number(g, toifa)), list.map((g, k) => k + 1), toifa.id);
    // Bo'limlar tartibi saqlanadi
    const tartib = list.map((g) => SECTIONS.findIndex((s) => s.id === g.topic));
    assert.deepEqual(tartib, [...tartib].sort((a, b) => a - b), toifa.id + ": bo'limlar tartibi buzilgan");
  }
  const kichik = TOIFALAR.find((t) => t.id === "kichik");
  assert.equal(number(GAMES.find((g) => g.dir === "23-on-barmoq"), kichik), 1, "klaviatura — birinchi");
});

test("har bo'limda kamida bitta o'yin bor va bo'sh bo'lim ko'rsatilmaydi", () => {
  for (const section of SECTIONS) {
    assert.ok(GAMES.some((g) => g.topic === section.id), section.id);
  }
  // Toifada bo'sh qolgan bo'lim bor (masalan kattada "Algoritm va dasturlash") — u chizilmasligi kerak
  const katta = TOIFALAR.find((t) => t.id === "katta");
  const bosh = SECTIONS.filter((s) => !oyinlar(katta).some((g) => g.topic === s.id));
  assert.ok(bosh.length > 0, "katta toifada hamma bo'lim to'lgan — filtr ishlamayaptimi?");
});

test("yosh oralig'i: har o'yinda bor, to'g'ri va kamida bitta toifaga tushadi", () => {
  for (const item of [...GAMES, ...MASHQLAR, ...CONTESTS]) {
    const nom = item.dir;
    assert.ok(Array.isArray(item.yosh) && item.yosh.length === 2, nom + ": yosh oralig'i yo'q");
    const [a, b] = item.yosh;
    assert.ok(Number.isInteger(a) && Number.isInteger(b) && a >= 8 && b <= 16 && a <= b, nom + ": " + item.yosh);
    assert.ok(TOIFALAR.some((t) => mos(item, t)), nom + ": hech bir toifaga tushmaydi");
  }
  // Blok qoidalari: Python/algoritm/kombinatorika — faqat katta toifa
  for (const game of GAMES) {
    if (["python", "algoritm", "kombinatorika"].includes(game.topic)) assert.deepEqual(game.yosh, [12, 16], game.dir);
  }
  assert.equal(yoshYorligi({ yosh: [10, 16] }), "10–16");
});

// Bitta mavzu ikki toifada bo'lishi mumkin (muallif talabi) — shu haqiqatan ishlayaptimi
test("ikki toifada turadigan o'yinlar bor va har joyda o'z raqami bilan", () => {
  const ikkala = GAMES.filter((g) => TOIFALAR.filter((t) => t.id !== "hammasi" && mos(g, t)).length === 2);
  assert.ok(ikkala.length >= 10, "ikki toifadagi o'yinlar: " + ikkala.length);
  const [kichik, katta] = [TOIFALAR.find((t) => t.id === "kichik"), TOIFALAR.find((t) => t.id === "katta")];
  const choti = GAMES.find((g) => g.dir === "17-qabila-choti");
  assert.ok(mos(choti, kichik) && mos(choti, katta));
  assert.notEqual(number(choti, kichik), number(choti, katta), "raqam toifaga qarab o'zgarishi kerak");
});

// 💻 — bolaga haqiqiy klaviatura kerak: kod yoki matn teriladigan o'yinlar
test("💻 belgisi: kod yoziladigan o'yinlarda bor, qolganlarida yo'q", () => {
  const bloklar = ["klaviatura", "python", "algoritm", "kombinatorika"];
  // Boshqa blokda turgan, lekin kod yoziladigan o'yinlar — ataylab sanab o'tiladi
  const qoshimcha = ["48-mantiq-kodda"];
  for (const game of GAMES) {
    const kerak = bloklar.includes(game.topic) || qoshimcha.includes(game.dir);
    assert.equal(!!game.pc, kerak, game.dir);
  }
});

// O'yin matnidagi havolalar RAQAM emas, NOM bilan yoziladi ("«Izlash» o'yinida ko'rgan eding").
// Sabab: kartadagi raqam tanlangan toifaga bog'liq, bitta o'yin ikki toifada ikki xil raqamga ega bo'ladi.
test("o'yin matnida raqamli havola qolmagan", () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "tests" ? [] : walk(p);
    return e.name.endsWith(".js") ? [p] : [];
  });
  const topilgan = [];
  for (const p of walk(path.join(ROOT, "oyinlar"))) {
    const src = fs.readFileSync(p, "utf8");
    const re = /\d+[-–]?\d*-oʻyin/g;
    let m;
    while ((m = re.exec(src))) {
      const lineStart = src.lastIndexOf("\n", m.index) + 1;
      if (/^\s*(\/\/|\*)/.test(src.slice(lineStart, m.index))) continue; // izohlar hisobga olinmaydi
      topilgan.push(path.relative(ROOT, p) + ": «" + m[0] + "»");
    }
  }
  assert.deepEqual(topilgan, [], "raqam o'rniga o'yin nomini yoz: «Izlash» o'yinida …");
});

// Nom bilan yozilgan havola haqiqiy o'yinni ko'rsatishi kerak
test("«…» ichidagi o'yin nomlari ro'yxatdagi nomlarga mos", () => {
  const nomlar = new Set(GAMES.map((g) => g.title));
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "tests" ? [] : walk(p);
    return e.name.endsWith(".js") ? [p] : [];
  });
  for (const p of walk(path.join(ROOT, "oyinlar"))) {
    const src = fs.readFileSync(p, "utf8");
    const re = /«([^»]{3,40})» (oʻyini|oʻyinida|oʻyinini|oʻyinlarida|oʻyinidagi)/g;
    let m;
    while ((m = re.exec(src))) {
      assert.ok(nomlar.has(m[1]), path.relative(ROOT, p) + ": «" + m[1] + "» — bunday o'yin yo'q");
    }
  }
});
