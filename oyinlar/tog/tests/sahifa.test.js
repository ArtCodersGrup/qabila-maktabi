// Tog'ga chiqish sahifasi: skriptlar tartibi, mashq rejimi internetsiz ishlashi,
// onlayn qism esa faqat xona ochilganda ishga tushishi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const at = (f) => scripts.indexOf(f);
const oqi = (f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8");

test("skriptlar bor va tartibi to'g'ri", () => {
  for (const f of scripts) assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  for (const f of ["../musobaqa/js/savollar.js", "js/tog.js", "js/protokol.js", "js/game-art.js", "js/tog-ui.js", "js/ekran.js", "../umumiy/js/savol-ui.js"]) {
    assert.ok(at(f) >= 0 && at(f) < at("js/main.js"), f);
  }
  assert.ok(at("../umumiy/js/art.js") < at("js/game-art.js"), "game-art art.js ga qo'shiladi");
  assert.ok(at("../umumiy/js/supabase.min.js") < at("../umumiy/js/onlayn.js"), "kutubxona onlayn qatlamdan oldin");
  assert.ok(at("../umumiy/js/onlayn.js") < at("js/onlayn-tog.js"));
  assert.ok(at("js/ekran.js") < at("js/mashq.js") && at("js/ekran.js") < at("js/onlayn-tog.js"));
  assert.equal(scripts[scripts.length - 1], "js/main.js", "menyu oxirida ishga tushadi");
});

test("savollar.js kutgan mavzu fayllari yuklangan", () => {
  const musobaqa = fs.readFileSync(path.join(__dirname, "../../musobaqa/index.html"), "utf8");
  const kerak = [...musobaqa.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])
    .filter((f) => f.startsWith("../") && !f.startsWith("../umumiy/") && f !== "js/savollar.js");
  for (const f of kerak) assert.ok(scripts.includes(f), f);
  assert.ok(oqi("../musobaqa/js/savollar.js").includes("QK.savollar"), "savollar.js QK ga yozadi");
});

test("mashq rejimi internetsiz ishlaydi", () => {
  // Mashq onlayn qatlamga umuman tegmaydi — internet yo'qligi unga halal bermaydi
  const mashq = oqi("js/mashq.js").replace(/\/\/.*$/gm, "");
  assert.ok(!/onlayn|supabase|room|\.send\(/i.test(mashq), "mashq faqat o'zida hisoblaydi");
  // Kutubxona keshda bor, shuning uchun sahifa internetsiz ham ochiladi
  const sw = fs.readFileSync(path.join(__dirname, "../../../sw.js"), "utf8");
  for (const f of ["oyinlar/umumiy/js/supabase.min.js", "oyinlar/tog/js/main.js", "oyinlar/tog/js/ekran.js", "oyinlar/tog/js/protokol.js", "oyinlar/tog/js/onlayn-tog.js", "oyinlar/umumiy/css/onlayn.css"]) {
    assert.ok(sw.includes(`"${f}"`), `keshda yo'q: ${f}`);
  }
  assert.ok(scripts.includes("../umumiy/js/offline.js"), "offline.js");
  assert.match(html, /css\/style\.css/);
  assert.match(html, /umumiy\/css\/savol\.css/);
  assert.match(html, /umumiy\/css\/onlayn\.css/);
});

test("tarmoqqa erkin matn chiqmaydi: faqat protokoldagi turlar", () => {
  const P = require("../js/protokol.js");
  const src = oqi("js/onlayn-tog.js");
  const yuborilgan = [...src.matchAll(/\.send\("([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(yuborilgan.length >= 3, "xabar yuboriladi");
  for (const t of yuborilgan) assert.ok(P.TYPES.includes(t), `protokolda yo'q tur: ${t}`);
  // Savol matni hech qachon yuborilmaydi — har qurilma savolni o'zi hosil qiladi
  assert.ok(!/send\([^)]*text/.test(src), "savol matni yuborilmaydi");
});
