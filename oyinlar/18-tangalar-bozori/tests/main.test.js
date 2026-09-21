// main.js testi: umumiy qobiqqa (umumiy/js/app.js) qanday sozlamalar berilishini tekshiradi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

let captured = null;
const win = { QK: { app: { start: (cfg) => { captured = cfg; } } } };
loadScript(path.join(__dirname, "../js/main.js"), win);

test("main.js: saqlash kaliti, sarlavha va bosqich nomlari", () => {
  assert.equal(captured.storageKey, "tangalar-bozori:v1");
  assert.equal(captured.title, "Tangalar bozori");
  assert.deepEqual(captured.stageTitles, ["2-likdan oʻnlikka", "8-lik va 5-likdan", "16-likdan oʻnlikka"]);
});
