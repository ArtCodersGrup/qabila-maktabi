const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("hikoya rasmlari SVG qaytaradi", () => {
  for (const n of ["telegraph", "ship", "lighthouse", "radio", "eye"]) {
    assert.match(art.story(n), /^<svg[\s\S]*<\/svg>$/, n);
  }
});

test("mayoqda yonib-o'chadigan chiroq bor", () => {
  assert.match(art.story("lighthouse"), /class="lamp"/);
  assert.match(art.story("lighthouse"), /class="lamp-light"/);
});

test("noma'lum rasm — bo'sh satr", () => {
  assert.equal(art.story("yoq"), "");
});

test("umumiy qahramonlar joyida", () => {
  assert.match(art.elder(), /^<svg/);
  assert.match(art.drum(), /^<svg/);
});
