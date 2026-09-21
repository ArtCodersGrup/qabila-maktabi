const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

const isSvg = (svg, name) => {
  assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
  assert.ok(!svg.includes("<text"), name);
};

test("rasmlar SVG va matnsiz", () => {
  isSvg(art.computer(), "computer");
  isSvg(art.page(), "page");
  for (const name of ["sms", "book", "emoji"]) isSvg(art.story(name), name);
  assert.equal(art.story("yoq"), "");
});

test("sandiq: 8 ta bit-doira, yoniqlari sariq", () => {
  const svg = art.chest("01000001");
  isSvg(svg, "chest");
  assert.equal((svg.match(/<circle/g) || []).length, 8);
  assert.equal((svg.match(/#F0C040/g) || []).length, 2);
});
