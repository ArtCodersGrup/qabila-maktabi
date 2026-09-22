// Aloqa sinovi sahifasi: skriptlar mavjud, kutubxona onlayn qatlamdan oldin, ommaviy kalit qo'yilgan.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

test("index.html: skriptlar bor va tartibi to'g'ri", () => {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const f of scripts) assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  const at = (f) => scripts.indexOf(f);
  assert.ok(at("../umumiy/js/supabase.min.js") >= 0 && at("../umumiy/js/supabase.min.js") < at("../umumiy/js/onlayn.js"));
  assert.ok(at("../umumiy/js/onlayn.js") < at("js/sinov.js"));
  assert.equal(scripts[scripts.length - 1], "js/sinov.js");
});

test("onlayn.js: ommaviy kalit qo'yilgan (bo'sh joy emas)", () => {
  const O = require("../../umumiy/js/onlayn.js");
  assert.ok(!O.CONFIG.key.startsWith("__"), "kalit hali qo'yilmagan");
  assert.match(O.CONFIG.key, /^(sb_publishable_|eyJ)/);
});
