const test = require("node:test");
const assert = require("node:assert/strict");
const { loadScript } = require("./helpers.js");

const art = loadScript("js/art.js", {}).QK.art;
const count = (s, re) => (s.match(re) || []).length;

test("tree: 3 harf, 2 qavat — 12 tugun + ildiz, 12 chiziq, harfli yozuv", () => {
  const svg = art.tree(["A", "U", "F"], 2, { lit: new Set() });
  assert.equal(count(svg, /<circle/g), 13);
  assert.equal(count(svg, /<line/g), 12);
  assert.equal(count(svg, /<rect/g), 0);
});

test("tree: 27 barg — avtomatik ixcham, rangli kvadratchalar", () => {
  const svg = art.tree(["A", "U", "F"], 3, {});
  assert.equal(count(svg, /<rect/g), 81);
});

test("tree: yongan so'z yo'li rangli, qolgani kulrang", () => {
  const svg = art.tree(["A", "U"], 2, { lit: new Set(["AU"]) });
  assert.ok(svg.includes('fill="#2F6FDE"'), "A — ko'k");
  assert.ok(svg.includes('fill="#F08A24"'), "AU dagi U — to'q sariq");
  assert.ok(svg.includes('fill="#D9D2C3"'), "qolganlari kulrang");
});

test("tree: hech narsa yonmasa — rangli tugun yo'q", () => {
  const svg = art.tree(["A", "U"], 2, {});
  for (const c of art.LETTER_COLORS) assert.ok(!svg.includes(`fill="${c}"`), c);
});

test("tree: qavat sarlavhasi va o'sish animatsiyasi", () => {
  const svg = art.tree(["0", "1"], 3, { levelCounts: [3], animateLevel: 3, compact: false });
  assert.ok(svg.includes(">8 ta<"));
  assert.ok(svg.includes("grow"));
  assert.equal(count(svg, /<rect/g), 0);
});

test("qahramonlar, odam, baraban, ikonkalar SVG qaytaradi", () => {
  assert.match(art.elder(), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.elder(), /class="eyes"/);
  assert.match(art.apprentice(), /class="paper-text"/);
  assert.match(art.apprentice(), /class="arms-up"/);
  assert.match(art.person(true, 0), /^<svg/);
  assert.notEqual(art.person(true, 0), art.person(false, 0));
  assert.match(art.drum(), /^<svg/);
  for (const n of ["home", "sound-on", "sound-off"]) assert.match(art.icon(n), /^<svg[\s\S]*<path/);
});
