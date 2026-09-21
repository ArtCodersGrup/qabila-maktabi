const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("tosh va hikoya rasmlari SVG qaytaradi", () => {
  assert.match(art.stone(), /^<svg[\s\S]*<\/svg>$/);
  for (const n of ["abacus", "scroll", "scholar", "computer"]) {
    assert.match(art.story(n), /^<svg[\s\S]*<\/svg>$/, n);
  }
  assert.equal(art.story("yoq"), "");
});

test("rasm ichida matn yoʻq (QOIDALAR 6)", () => {
  for (const svg of [art.stone(), art.story("abacus"), art.story("scroll"), art.story("scholar"), art.story("computer")]) {
    assert.ok(!svg.includes("<text"), svg.slice(0, 40));
  }
});

test("abak: 4 ta tayoqcha va 16 ta toshcha", () => {
  const svg = art.story("abacus");
  assert.equal((svg.match(/<line /g) || []).length, 4);
  assert.equal((svg.match(/<circle /g) || []).length, 16);
});
