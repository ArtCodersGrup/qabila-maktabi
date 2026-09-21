const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("hikoya rasmlari SVG va matnsiz", () => {
  for (const name of ["layers", "brain", "blackbox"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
});

test("qatlamlar rasmi: 4 ta ustun, 14 ta neyron", () => {
  assert.equal((art.story("layers").match(/<circle /g) || []).length, 14);
});
