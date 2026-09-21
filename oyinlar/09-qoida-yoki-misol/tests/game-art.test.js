const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("narsa rasmi: kattaligi radiusni, dog'lari nuqtalar sonini belgilaydi", () => {
  assert.match(art.thing(5, 3), /^<svg[\s\S]*<\/svg>$/);
  const small = art.thing(2, 1);
  const big = art.thing(9, 1);
  const radius = (svg) => Number(svg.match(/circle cx="32" cy="34" r="([\d.]+)"/)[1]);
  assert.ok(radius(big) > radius(small), "katta narsa kattaroq chizilmadi");
  const spots = (svg) => (svg.match(/fill="#7A4E2A"/g) || []).length;
  assert.equal(spots(art.thing(5, 4)), 4);
  assert.equal(spots(art.thing(5, 7)), 7);
});

test("hikoya rasmlari SVG va matnsiz", () => {
  for (const name of ["calculator", "cats", "circles"]) {
    const svg = art.story(name);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
    assert.ok(!svg.includes("<text"), name);
  }
  assert.equal(art.story("yoq"), "");
  assert.ok(!art.thing(5, 3).includes("<text"));
});
