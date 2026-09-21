const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("rasmlar SVG va matnsiz", () => {
  for (const [name, svg] of [["easel", art.easel()], ...["phone", "zoom", "film"].map((n) => [n, art.story(n)])]) {
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
});
