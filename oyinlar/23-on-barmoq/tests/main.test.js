// main.js testi: umumiy qobiqqa (umumiy/js/app.js) qanday sozlamalar berilishini tekshiradi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { loadScript } = require("../../umumiy/tests/helpers.js");

let captured = null;
const win = { QK: { app: { start: (cfg) => { captured = cfg; } } } };
loadScript(path.join(__dirname, "../js/main.js"), win);

test("main.js: saqlash kaliti, sarlavha va bosqich nomlari (poyga — alohida sahifa oyinlar/poyga/)", () => {
  assert.equal(captured.storageKey, "on-barmoq:v1");
  assert.equal(captured.title, "Oʻn barmoq");
  assert.deepEqual(captured.stageTitles, ["Asosiy qator", "Yuqori qator", "Pastki qator va katta harflar"]);
  assert.equal(captured.extras, undefined);
});

test("index.html: barcha sahnalar ulangan", () => {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const f of ["js/typing.js", "js/game-art.js", "js/typing-ui.js", "js/typing-play.js",
    "js/scenes/common.js", "js/scenes/stage1.js", "js/scenes/stage2.js", "js/scenes/stage3.js",
    "js/scenes/final.js", "../umumiy/js/offline.js", "js/main.js"]) {
    assert.ok(scripts.includes(f), f);
    assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  }
  assert.equal(scripts[scripts.length - 1], "js/main.js");
  // typing-ui.js mantiq va rasmlardan keyin, sahnalar undan keyin
  assert.ok(scripts.indexOf("js/typing.js") < scripts.indexOf("js/typing-ui.js"));
  assert.ok(scripts.indexOf("js/typing-ui.js") < scripts.indexOf("js/typing-play.js"));
  assert.ok(scripts.indexOf("js/typing-play.js") < scripts.indexOf("js/scenes/common.js"));
});
