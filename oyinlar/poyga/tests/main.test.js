// Tez yozish poygasi sahifasi: skriptlar mavjud va tartibi to'g'ri (yozish qismi 23-o'yindan).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

test("index.html: hamma skriptlar bor, yozish 23-o'yindan, main.js oxirida", () => {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const f of scripts) assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  const at = (f) => scripts.indexOf(f);
  for (const f of ["../23-on-barmoq/js/typing.js", "../23-on-barmoq/js/typing-ui.js", "../23-on-barmoq/js/typing-play.js", "../musobaqa/js/musobaqa-art.js", "js/race.js"]) {
    assert.ok(at(f) >= 0, f);
  }
  assert.ok(at("../23-on-barmoq/js/typing-play.js") < at("js/race.js"));
  assert.equal(scripts[scripts.length - 1], "js/main.js");
  assert.match(html, /\.\.\/23-on-barmoq\/css\/style\.css/);
  assert.match(html, /\.\.\/umumiy\/js\/offline\.js/);
});
