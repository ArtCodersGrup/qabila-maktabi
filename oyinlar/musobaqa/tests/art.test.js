// Musobaqa rasmlari: SVG, ichida matn yo'q (QOIDALAR 6).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../js/musobaqa-art.js"), win);
const art = win.QK.musobaqaArt;

test("rasmlar SVG va matnsiz", () => {
  const all = [art.pause(), art.heart(true), art.heart(false)];
  for (const side of ["left", "right"]) all.push(art.emblem(side), art.coinFace(side), art.flag(side));
  for (const svg of all) {
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
    assert.ok(!svg.includes("<text"));
  }
});

test("tomon ranglari: Oy — ko'k, Quyosh — binafsha", () => {
  assert.equal(art.COLORS.left, "#2F6FDE");
  assert.equal(art.COLORS.right, "#8E5BD0");
  assert.ok(art.emblem("left").includes("#2F6FDE"));
  assert.ok(art.flag("right").includes("#8E5BD0"));
});

test("yo'qotilgan yurak bo'sh chiziladi", () => {
  assert.match(art.heart(false), /class="heart lost"/);
  assert.match(art.heart(false), /fill="none"/);
  assert.match(art.heart(true), /fill="currentColor"/);
});
