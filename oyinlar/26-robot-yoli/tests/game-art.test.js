// game-art.js testlari: hikoya rasmlari SVG va matnsiz bo'lsin.
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
  assert.ok(!svg.includes("<text"), name + ": rasm ichida matn yo'q");
};

test("hikoya rasmlari: kitob va qalam, telefon, xarita", () => {
  for (const name of ["bookPen", "phone", "roadMap", "robotFire"]) isSvg(art[name](), name);
  assert.equal(typeof art.elder, "function", "umumiy rasmlar saqlanadi");
});

test("choy algoritmi rasmi: to'rt qadam", () => {
  const svg = art.teaSteps();
  isSvg(svg, "teaSteps");
  assert.equal((svg.match(/class="step"/g) || []).length, 4);
});
