// Aloqa sinovi sahifasi: skriptlar mavjud, onlayn qatlam sahifa skriptidan oldin, Supabase yo'q.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

test("index.html: skriptlar bor va tartibi to'g'ri", () => {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const f of scripts) assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  const at = (f) => scripts.indexOf(f);
  assert.ok(!scripts.some((f) => /supabase/.test(f)), "Supabase kutubxonasi yo'q");
  assert.ok(at("../umumiy/js/onlayn.js") >= 0);
  assert.ok(at("../umumiy/js/onlayn.js") < at("js/sinov.js"));
  assert.equal(scripts[scripts.length - 1], "js/sinov.js");
});

test("onlayn.js: o'z serverimizga ulanadi", () => {
  const O = require("../../umumiy/js/onlayn.js");
  assert.equal(O.SERVER, "wss://kelajagim.uz");
});
