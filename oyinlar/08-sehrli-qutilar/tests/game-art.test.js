const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("tosh va quti rasmlari", () => {
  assert.match(art.stone(), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.box("closed"), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.box("open"), /^<svg[\s\S]*<\/svg>$/);
  assert.notEqual(art.box("open"), art.box("closed"));
});

test("hikoya rasmlari SVG va matnsiz", () => {
  for (const name of ["matchboxes", "board", "walker", "star"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
  assert.match(art.robot(), /^<svg[\s\S]*<\/svg>$/);
});

test("1961-yil mashinasi: 15 ta quti", () => {
  assert.equal((art.story("matchboxes").match(/rx="4"/g) || []).length, 15);
});
