// main.js testi: umumiy qobiqqa (umumiy/js/app.js) qanday sozlamalar berilishini tekshiradi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { loadScript } = require("../../umumiy/tests/helpers.js");

let captured = null;
const win = { QK: { app: { start: (cfg) => { captured = cfg; } } } };
loadScript(path.join(__dirname, "../js/main.js"), win);

test("main.js: saqlash kaliti, sarlavha va bosqich nomlari", () => {
  assert.equal(captured.storageKey, "zinapoya-chirogi:v1");
  assert.equal(captured.title, "Zinapoya chirogʻi");
  assert.deepEqual(captured.stageTitles, ["Faqat bittasi", "Amallar zanjiri", "Kompyuter qanday qoʻshadi"]);
});

test("index.html: hamma skriptlar bor va main.js oxirida", () => {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const f of scripts) assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  for (const f of ["js/gates.js", "js/game-art.js", "js/gates-ui.js", "../umumiy/js/practice.js", "js/scenes/final.js"]) assert.ok(scripts.includes(f), f);
  assert.equal(scripts[scripts.length - 1], "js/main.js");
  assert.ok(scripts.indexOf("js/gates.js") < scripts.indexOf("js/gates-ui.js"));
  assert.ok(scripts.indexOf("../umumiy/js/mantiq-ui.js") < scripts.indexOf("js/gates-ui.js"), "umumiy kalitlar va jadval oldin");
  assert.match(html, /\.\.\/umumiy\/css\/mantiq\.css/);
  assert.ok(scripts.indexOf("../umumiy/js/practice.js") < scripts.indexOf("js/scenes/common.js"));
});
