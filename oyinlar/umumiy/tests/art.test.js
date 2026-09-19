const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("./helpers.js");

const art = loadScript(path.join(__dirname, "../js/art.js"), {}).QK.art;

test("qahramonlar, baraban, ikonkalar SVG qaytaradi", () => {
  assert.match(art.elder(), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.elder(), /class="eyes"/);
  assert.match(art.apprentice(), /class="paper-text"/);
  assert.match(art.apprentice(), /class="arms-up"/);
  assert.match(art.drum(), /^<svg/);
  for (const n of ["home", "sound-on", "sound-off"]) assert.match(art.icon(n), /^<svg[\s\S]*<path/);
});

test("harf ranglari — QOIDALAR 6-bo'limidagi 4 ta rang", () => {
  assert.deepEqual(art.LETTER_COLORS, ["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"]);
});

test("umumiy rasmlarda o'yinga xos narsa yo'q", () => {
  assert.equal(art.tree, undefined);
  assert.equal(art.person, undefined);
});
