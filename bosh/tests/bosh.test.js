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
const { GAMES, SECTIONS, CONTESTS, MASHQLAR, TOIFALAR, mos, bolimlar, oyinlar, toifaYorligi, number } = win.QK.bosh;
const toifa = (id) => TOIFALAR.find((t) => t.id === id);

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
  assert.deepEqual(CONTESTS.map((c) => c.dir), ["musobaqa", "poyga", "tank-duel", "onlayn", "tog", "tank-onlayn", "qala", "yozuv-poygasi"]);
  assert.deepEqual(CONTESTS.map((c) => c.mode), ["offline", "offline", "offline", "online", "online", "online", "online", "online"], "bitta ekranda — eski musobaqalar, onlayn — alohida");
  for (const c of CONTESTS) {
    assert.ok(fs.existsSync(path.join(ROOT, "oyinlar", c.dir, "index.html")), c.dir);
    assert.match(win.QK.boshArt.icon(c.icon), /^<svg[\s\S]*<\/svg>$/, c.icon);
    assert.ok(!win.QK.boshArt.icon(c.icon).includes("<text"), c.icon);
  }
  assert.equal(CONTESTS.find((c) => c.dir === "poyga").pc, true, "poygaga klaviatura kerak");
  assert.equal(CONTESTS.find((c) => c.dir === "yozuv-poygasi").pc, true, "onlayn poygaga ham klaviatura kerak");
  assert.equal(CONTESTS.find((c) => c.dir === "tank-onlayn").pc, true, "onlayn tankda kod yoziladi");
});

test("mashqlar: masalalar ro'yxati alohida bo'limda (o'yin emas — bosqichi yo'q)", () => {
  const { MASHQLAR } = win.QK.bosh;
  assert.deepEqual(MASHQLAR.map((m) => m.dir), ["masalalar", "cpp-shpargalka"]);
  for (const m of MASHQLAR) {
    assert.ok(fs.existsSync(path.join(ROOT, "oyinlar", m.dir, "index.html")), m.dir);
    assert.match(win.QK.boshArt.icon(m.icon), /^<svg[\s\S]*<\/svg>$/, m.icon);
    assert.ok(!GAMES.some((g) => g.dir === m.dir), m.dir + ": o'yinlar ro'yxatida turmasin");
    if (m.dir === "masalalar") assert.equal(m.pc, true, "kod yozish uchun klaviatura kerak");
  }
});

// Kartadagi raqam — TANLANGAN TOIFA ichidagi o'rin, shuning uchun har toifada alohida tekshiriladi
test("har toifada raqamlar 1 dan ketma-ket, bo'limlar tartibida", () => {
  for (const t of TOIFALAR) {
    const list = oyinlar(t);
    assert.ok(list.length > 0, t.id + ": bitta ham o'yin yo'q");
    assert.deepEqual(list.map((g) => number(g, t)), list.map((g, k) => k + 1), t.id);
    // Bo'limlar tartibi saqlanadi (toifaning o'z tartibi bo'yicha)
    const tartib = list.map((g) => bolimlar(t).findIndex((s) => s.id === g.topic));
    assert.deepEqual(tartib, [...tartib].sort((a, b) => a - b), t.id + ": bo'limlar tartibi buzilgan");
  }
  assert.equal(number(GAMES.find((g) => g.dir === "66-kompyuter-qismlari"), toifa("boshlangich")), 1, "kompyuter bilan tanishuv — birinchi");
  assert.equal(number(GAMES.find((g) => g.dir === "23-on-barmoq"), toifa("boshlangich")), 8, "klaviatura — tanishuvdan keyin");
});

test("har bo'limda kamida bitta o'yin bor va bo'sh bo'lim ko'rsatilmaydi", () => {
  for (const section of SECTIONS) {
    assert.ok(GAMES.some((g) => g.topic === section.id), section.id);
  }
  // Toifada bo'sh qolgan bo'lim bor (masalan 9–11 da "Klaviatura") — u chizilmasligi kerak
  const bosh = SECTIONS.filter((s) => !oyinlar(toifa("yuqori")).some((g) => g.topic === s.id));
  assert.ok(bosh.length > 0, "yuqori toifada hamma bo'lim to'lgan — filtr ishlamayaptimi?");
});

const UCH = ["boshlangich", "orta", "yuqori"];

// Har o'yin AYNAN BITTA toifada (muallif qarori, 2026-10-06): kattaroq o'quvchi kichiklar o'yinini ko'rmaydi
test("toifa: har o'yin aynan bitta toifada, taqsimot 16 / 43 / 12", () => {
  for (const g of GAMES) assert.ok(UCH.includes(g.toifa), g.dir + ": " + g.toifa);
  const soni = (id) => oyinlar(toifa(id)).length;
  assert.deepEqual(UCH.map(soni), [16, 43, 12]);
  assert.equal(soni("hammasi"), GAMES.length);
  const raqamlar = (id) => GAMES.filter((g) => g.toifa === id).map((g) => g.n).sort((a, b) => a - b);
  assert.deepEqual(raqamlar("boshlangich"), [2, 23, 26, 46, 47, 53, 62, 63, 64, 66, 67, 68, 69, 70, 71, 72]);
  assert.deepEqual(raqamlar("yuqori"), [38, 39, 40, 41, 42, 43, 44, 45, 54, 55, 56, 57]);
  // Blok qoidalari: sun'iy intellekt va Python — 5–8; kombinatorika va C++ — 9–11
  for (const g of GAMES) {
    if (["ai", "ai2", "python"].includes(g.topic)) assert.equal(g.toifa, "orta", g.dir);
    if (["kombinatorika", "cpp"].includes(g.topic)) assert.equal(g.toifa, "yuqori", g.dir);
    if (g.topic === "tanishuv") assert.equal(g.toifa, "boshlangich", g.dir);
  }
  assert.equal(toifaYorligi(GAMES.find((g) => g.n === 38)), "9–11");
  assert.equal(toifaYorligi(MASHQLAR[0]), "", "asbobda yorliq yo'q");
});

// Asbob va musobaqa — o'yin emas: bir nechta toifada ko'rinishi mumkin
test("asbob va musobaqalar: toifalar ro'yxati bor va to'g'ri", () => {
  for (const item of [...MASHQLAR, ...CONTESTS]) {
    assert.ok(Array.isArray(item.toifalar) && item.toifalar.length > 0, item.dir);
    for (const id of item.toifalar) assert.ok(UCH.includes(id), item.dir + ": " + id);
    assert.ok(mos(item, toifa("hammasi")), item.dir);
  }
  const kim = (dir) => [...MASHQLAR, ...CONTESTS].find((x) => x.dir === dir).toifalar;
  assert.deepEqual(kim("masalalar"), ["orta", "yuqori"]);
  assert.deepEqual(kim("cpp-shpargalka"), ["yuqori"]);
  assert.deepEqual(kim("tank-onlayn"), ["orta", "yuqori"]);
  assert.deepEqual(kim("tog"), ["boshlangich", "orta"]);
  assert.deepEqual(kim("poyga"), UCH);
});

// 💻 — bolaga kompyuter kerak: kod yoki matn teriladigan o'yinlar va sichqoncha o'yini
test("💻 belgisi: kod yoziladigan o'yinlarda bor, qolganlarida yo'q", () => {
  const bloklar = ["klaviatura", "python", "algoritm", "kombinatorika", "cpp"];
  // Boshqa blokda turgan, lekin kod yoziladigan o'yinlar — ataylab sanab o'tiladi
  const qoshimcha = ["48-mantiq-kodda", "67-chaqqon-sichqoncha", "71-matn-yozamiz"];
  for (const game of GAMES) {
    const kerak = bloklar.includes(game.topic) || qoshimcha.includes(game.dir);
    assert.equal(!!game.pc, kerak, game.dir);
  }
});

// O'yin matnidagi havolalar RAQAM emas, NOM bilan yoziladi ("«Izlash» o'yinida ko'rgan eding").
// Sabab: kartadagi raqam tanlangan toifaga bog'liq (o'qituvchining "Hammasi" ro'yxatida u boshqa).
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

// Ko'rinish <html> atributlaridan olinadi va o'yin faylida YOZILGAN bo'ladi (JS kutilmaydi).
// Atributlarni bosh/tools/toifa-yoz.js katalogdan yozadi: node bosh/tools/toifa-yoz.js
const { maskotKerak, kattami } = require("../tools/toifa-yoz.js");

test("o'yin sahifasi: data-toifa katalogga teng, data-maskot — faqat qog'oz/baraban ishlatadiganlarda", () => {
  for (const g of GAMES) {
    const html = fs.readFileSync(path.join(ROOT, "oyinlar", g.dir, "index.html"), "utf8");
    const teg = html.match(/<html[^>]*>/)[0];
    assert.equal((teg.match(/data-toifa="([^"]*)"/) || [])[1], g.toifa, g.dir);
    assert.equal(/\sdata-maskot[\s>]/.test(teg), maskotKerak(g.dir), g.dir + ": data-maskot");
    assert.match(html, new RegExp('name="theme-color" content="' + (kattami(g) ? "#FBFAF7" : "#FFF6E5") + '"'), g.dir);
  }
  const maskotli = GAMES.filter((g) => maskotKerak(g.dir)).map((g) => g.n).sort((a, b) => a - b);
  assert.deepEqual(maskotli, [2], "qog'oz yoki baraban ishlatadigan o'yinlar");
});

// toifa.js har o'yinning <head> ida, uslublardan oldin (kelajakdagi ko'rinish sozlamalari uchun; hozir faqat
// yozib qo'yilgan data-toifa ni hurmat qiladi)
test("o'yin sahifasi: toifa.js <head> da, uslublardan oldin", () => {
  const { SKRIPT } = require("../tools/toifa-yoz.js");
  for (const g of GAMES) {
    const html = fs.readFileSync(path.join(ROOT, "oyinlar", g.dir, "index.html"), "utf8");
    const head = html.slice(0, html.indexOf("</head>"));
    assert.ok(head.includes(SKRIPT), g.dir);
    assert.ok(head.indexOf(SKRIPT) < head.indexOf("asos.css"), g.dir + ": toifa.js uslubdan oldin");
  }
});

// 5–8 o'rganish yo'li: kodlashdan boshlanadi, Python va algoritmlar oxirida (muallif 2026-10-07)
test("5–8 bo'limlar tartibi: birinchi o'yin kodlashdan, Python algoritmdan oldin; har bo'lim bir marta", () => {
  const orta = toifa("orta");
  const ids = bolimlar(orta).map((s) => s.id);
  assert.equal(new Set(ids).size, SECTIONS.length, "har bo'lim aynan bir marta");
  assert.equal(oyinlar(orta)[0].topic, "kod");
  assert.ok(ids.indexOf("python") < ids.indexOf("algoritm"));
  assert.ok(ids.indexOf("ikkilik") < ids.indexOf("python"));
  assert.deepEqual(bolimlar(toifa("boshlangich")), SECTIONS, "1–4 tartibi o'zgarmadi");
});
