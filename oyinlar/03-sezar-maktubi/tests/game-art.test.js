const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const C = require("../js/caesar.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;
const count = (s, re) => (s.match(re) || []).length;

test("g'ildirak: 29 ta tashqi va 29 ta ichki harf, markazda kalit", () => {
  const svg = art.wheel(C.ALPHABET, 3);
  assert.equal(count(svg, /class="w-outer"/g), 29);
  assert.equal(count(svg, /class="w-inner"/g), 29);
  assert.match(svg, />3<\/text>/);
  assert.match(svg, /class="w-inner"[^>]*>E<\/text>/); // A ostida — E
});

test("g'ildirak: kalit 0 da ichki halqa tashqisi bilan bir xil, belgilangan harf yonadi", () => {
  const plain = art.wheel(C.ALPHABET, 0);
  assert.match(plain, /class="w-inner"[^>]*>A<\/text>/);
  assert.ok(!plain.includes("#F08A24"));
  assert.ok(art.wheel(C.ALPHABET, 3, new Set([0])).includes("#F08A24"));
});

test("hikoya rasmlari SVG qaytaradi", () => {
  for (const n of ["caesar", "scroll", "key", "keys", "book", "phone"]) {
    assert.match(art.story(n), /^<svg[\s\S]*<\/svg>$/, n);
  }
  assert.equal(art.story("yoq"), "");
});
