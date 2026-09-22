// main.js testi: umumiy qobiqqa (umumiy/js/app.js) qanday sozlamalar berilishini tekshiradi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { loadScript } = require("../../umumiy/tests/helpers.js");

let captured = null;
const win = { QK: { app: { start: (cfg) => { captured = cfg; } } } };
loadScript(path.join(__dirname, "../js/main.js"), win);

test("main.js: saqlash kaliti, sarlavha, bosqich nomlari va poyga kartasi", () => {
  assert.equal(captured.storageKey, "on-barmoq:v1");
  assert.equal(captured.title, "Oʻn barmoq");
  assert.deepEqual(captured.stageTitles, ["Asosiy qator", "Yuqori qator", "Pastki qator va katta harflar"]);
  assert.deepEqual(captured.extras, [{ scene: "race", title: "Poyga: doʻsting bilan", icon: "🏁" }]);
});

test("index.html: poyga uchun musobaqa rasmlari va barcha sahnalar ulangan", () => {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const f of ["js/typing.js", "js/game-art.js", "js/typing-ui.js", "../musobaqa/js/musobaqa-art.js",
    "js/scenes/common.js", "js/scenes/stage1.js", "js/scenes/stage2.js", "js/scenes/stage3.js",
    "js/scenes/race.js", "js/scenes/final.js", "../umumiy/js/offline.js", "js/main.js"]) {
    assert.ok(scripts.includes(f), f);
    assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  }
  assert.equal(scripts[scripts.length - 1], "js/main.js");
  // typing-ui.js mantiq va rasmlardan keyin, sahnalar undan keyin
  assert.ok(scripts.indexOf("js/typing.js") < scripts.indexOf("js/typing-ui.js"));
  assert.ok(scripts.indexOf("js/typing-ui.js") < scripts.indexOf("js/scenes/common.js"));
});
