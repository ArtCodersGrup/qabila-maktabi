// Qal'a sahifasi: skriptlar tartibi, boshqa o'yinlar mantiqi ko'chirilishi, mashq va darslar internetsiz ishlashi, kesh.
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
  // 50/51/52 mantiqi QK.logic nomini bosib yozadi — har biri yuklangach qalaLib ga ko'chiriladi, keyin qala.js
  for (const f of ["../50-parol-kuchi/js/logic.js", "../51-bir-tomonlama-qulf/js/logic.js", "../52-firibgar-xat/js/logic.js", "../03-sezar-maktubi/js/caesar.js"]) {
    assert.ok(at(f) >= 0 && at(f) < at("js/qala.js"), f);
  }
  assert.ok(at("../umumiy/js/sanash.js") < at("../50-parol-kuchi/js/logic.js"), "sanash 50-mantiqdan oldin");
  assert.match(html, /QK\.qalaLib = \{ parol: window\.QK\.logic \}/);
  assert.match(html, /qalaLib\.qulf = window\.QK\.logic/);
  assert.match(html, /qalaLib\.xat = window\.QK\.logic/);
  assert.match(html, /qalaLib\.caesar = window\.QK\.caesar/);
  assert.ok(at("js/qala.js") < at("js/dars-mantiq.js") && at("js/qala.js") < at("js/protokol.js"));
  assert.ok(at("../umumiy/js/ui.js") < at("../umumiy/js/practice.js") && at("../umumiy/js/practice.js") < at("js/qala-ui.js"));
  assert.ok(at("js/qala-ui.js") < at("js/oyin-ui.js") && at("js/oyin-ui.js") < at("js/mashq.js") && at("js/oyin-ui.js") < at("js/onlayn-qala.js"));
  assert.ok(at("js/qala-ui.js") < at("js/dars.js") && at("js/dars.js") < at("js/main.js"));
  assert.ok(at("../umumiy/js/onlayn.js") < at("js/onlayn-qala.js"));
  assert.equal(scripts[scripts.length - 1], "js/main.js", "menyu oxirida ishga tushadi");
  assert.match(html, /<html lang="uz" data-toifa="orta">/, "kattalar ko'rinishi faylga yozilgan");
});

test("darslar va mashq internetsiz; onlayn qism faqat xona ochilganda", () => {
  for (const f of ["js/mashq.js", "js/dars.js", "js/lugat.js", "js/oyin-ui.js"]) {
    const kod = oqi(f).replace(/\/\/.*$/gm, "");
    assert.ok(!/onlayn|supabase|\.send\(|WebSocket/i.test(kod), `${f} tarmoqqa tegmaydi`);
  }
  assert.ok(scripts.includes("../umumiy/js/offline.js"), "offline.js");
  const sw = fs.readFileSync(path.join(__dirname, "../../../sw.js"), "utf8");
  for (const f of ["oyinlar/qala/index.html", "oyinlar/qala/js/qala.js", "oyinlar/qala/js/dars.js", "oyinlar/qala/js/mashq.js", "oyinlar/qala/js/onlayn-qala.js", "oyinlar/qala/css/style.css"]) {
    assert.ok(sw.includes(`"${f}"`), `keshda yo'q: ${f}`);
  }
});

test("matnlarda oddiy apostrof yo'q (ʻ va ʼ ishlatiladi)", () => {
  const dir = path.join(__dirname, "../js");
  for (const f of fs.readdirSync(dir)) {
    const kod = fs.readFileSync(path.join(dir, f), "utf8").replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const satrlar = [...kod.matchAll(/"([^"\\\n]|\\.)*"|`([^`\\]|\\.)*`/g)].map((m) => m[0]);
    const yomon = satrlar.filter((s) => /[a-zA-Z]'[a-zA-Z]/.test(s));
    assert.deepEqual(yomon.slice(0, 3), [], `${f}: ${yomon.slice(0, 3).join(" | ")}`);
  }
});
