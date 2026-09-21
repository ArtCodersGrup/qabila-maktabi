const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("robot va yong'oq holatlari SVG qaytaradi", () => {
  assert.match(art.robot(), /^<svg[\s\S]*<\/svg>$/);
  for (const state of ["closed", "full", "empty"]) {
    assert.match(art.nut(state), /^<svg[\s\S]*<\/svg>$/, state);
  }
  assert.ok(art.nut("full").includes("#E8C98A"), "to'la yong'oqda mag'iz bor");
  assert.ok(!art.nut("empty").includes("#E8C98A"), "bo'sh yong'oqda mag'iz yo'q");
  assert.ok(art.nut("closed").includes("ellipse cx=\"32\""), "yopiq yong'oq butun");
});

test("hikoya rasmlari va matnsizlik", () => {
  for (const name of ["data", "cats", "biasCats", "human"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
  assert.ok(!art.robot().includes("<text"));
});
