// main.js testlari: umumiy qobiqqa (umumiy/js/app.js) qanday sozlamalar berilishini tekshiradi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

let captured = null;
const win = { QK: { app: { start: (cfg) => { captured = cfg; } } } };
loadScript(path.join(__dirname, "../js/main.js"), win);

test("main.js: saqlash kaliti, sarlavha va bosqich nomlari", () => {
  assert.equal(captured.storageKey, "qabila-morzesi:v1");
  assert.equal(captured.title, "Qabila Morzesi");
  assert.deepEqual(captured.stageTitles, ["Oʻqish", "Yozish", "Hikoya"]);
});
