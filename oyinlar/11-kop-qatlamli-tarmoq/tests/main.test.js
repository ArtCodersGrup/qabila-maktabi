// main.js testi: umumiy qobiqqa (umumiy/js/app.js) qanday sozlamalar berilishini tekshiradi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

let captured = null;
const win = { QK: { app: { start: (cfg) => { captured = cfg; } } } };
loadScript(path.join(__dirname, "../js/main.js"), win);

test("main.js: saqlash kaliti, sarlavha va bosqich nomlari", () => {
  assert.equal(captured.storageKey, "kop-qatlamli-tarmoq:v1");
  assert.equal(captured.title, "Koʻp qatlamli tarmoq");
  assert.deepEqual(captured.stageTitles, ["Bitta neyron", "Qatlamlar", "Nega chuqur?"]);
});
