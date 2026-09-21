const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;
const U = require("../js/units.js");

test("rasmlar SVG va matnsiz; har faylning ikonkasi bor", () => {
  const all = [["storehouse", art.storehouse()], ...["disk", "datacenter", "ladder"].map((n) => [n, art.story(n)])];
  for (const item of U.ITEMS) all.push([item.id, art.fileIcon(item.id)]);
  for (const [name, svg] of all) {
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
  assert.equal(art.fileIcon("yoq"), "");
});
