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
  assert.equal(captured.storageKey, "mantiq-kalitlari:v1");
  assert.equal(captured.title, "Mantiq kalitlari");
  assert.deepEqual(captured.stageTitles, ["VA — ikkalasi ham", "YOKI — kamida bittasi", "EMAS va birgalikda"]);
});

test("index.html: hamma skriptlar bor va main.js oxirida", () => {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const f of scripts) assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  for (const f of ["js/logic.js", "js/game-art.js", "js/logic-ui.js", "../umumiy/js/practice.js", "js/scenes/final.js"]) assert.ok(scripts.includes(f), f);
  assert.equal(scripts[scripts.length - 1], "js/main.js");
  assert.ok(scripts.indexOf("js/logic.js") < scripts.indexOf("js/logic-ui.js"));
  assert.ok(scripts.indexOf("../umumiy/js/practice.js") < scripts.indexOf("js/scenes/common.js"));
});
