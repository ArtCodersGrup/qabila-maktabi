const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("xarita rasmi: uch ichma-ich doira, matnsiz", () => {
  const svg = art.story("map");
  assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
  assert.equal((svg.match(/<ellipse /g) || []).length, 3);
  assert.ok(!svg.includes("<text"));
  assert.equal(art.story("yoq"), "");
});
