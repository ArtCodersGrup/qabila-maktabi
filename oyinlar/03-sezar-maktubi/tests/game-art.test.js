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
const inners = (svg) => [...svg.matchAll(/class="w-inner"[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);

test("g'ildirak: 29 ta tashqi va 29 ta ichki harf, markazda kalit", () => {
  const svg = art.wheel(C.ALPHABET, 3);
  assert.equal(count(svg, /class="w-outer"/g), 29);
  assert.equal(count(svg, /class="w-inner"/g), 29);
  assert.match(svg, />3<\/text>/);
  assert.equal(inners(svg)[0], "E"); // A ostida — E
  assert.deepEqual(inners(svg), C.ALPHABET.map((_, i) => C.ALPHABET[(i + 3) % 29])); // oldinga surilgan
});

test("g'ildirak: kalit 0 da ichki halqa tashqisi bilan bir xil, belgilangan harf yonadi", () => {
  const plain = art.wheel(C.ALPHABET, 0);
  assert.deepEqual(inners(plain), C.ALPHABET);
  assert.ok(!plain.includes("#F08A24"));
  assert.equal(count(art.wheel(C.ALPHABET, 3, new Set([0])), /#F08A24/g), 2); // A va uning ostidagi E
  assert.equal(count(art.wheel(C.ALPHABET, 3, new Set([0]), true), /#F08A24/g), 1); // faqat tashqi A
});

test("hikoya rasmlari SVG qaytaradi", () => {
  for (const n of ["caesar", "scroll", "key", "keys", "book", "phone"]) {
    assert.match(art.story(n), /^<svg[\s\S]*<\/svg>$/, n);
  }
  assert.equal(art.story("yoq"), "");
});
