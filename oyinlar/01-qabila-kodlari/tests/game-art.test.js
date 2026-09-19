const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;
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

test("person: xursand va xafa holati farq qiladi", () => {
  assert.match(art.person(true, 0), /^<svg/);
  assert.notEqual(art.person(true, 0), art.person(false, 0));
});

test("umumiy qahramonlar ham joyida", () => {
  assert.match(art.elder(), /^<svg/);
  assert.match(art.apprentice(), /^<svg/);
});
