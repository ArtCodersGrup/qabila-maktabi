const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const T = require("../js/tog.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("har qahramon uchun rasm bor, matnsiz", () => {
  for (const q of T.QAHRAMONLAR) {
    const svg = art.hayvon(q.id, q.rang);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, q.id);
    assert.ok(!svg.includes("<text"), q.id);
    assert.ok(svg.includes(q.rang), `${q.id}: rangi`);
  }
  // Har hayvonning quloq/shox shakli boshqacha
  const shapes = T.QAHRAMONLAR.map((q) => art.hayvon(q.id, "#000").split('<circle cx="20" cy="24"')[0]);
  assert.equal(new Set(shapes).size, T.QAHRAMONLAR.length, "hayvonlar bir-biridan farq qiladi");
});

test("har tog'ning manzarasi bor: pastda va tepada boshqacha", () => {
  for (const t of T.TOGLAR) {
    const past = art.manzara(t.id, 0.1);
    const tepa = art.manzara(t.id, 0.9);
    for (const svg of [past, tepa]) {
      assert.match(svg, /^<svg[\s\S]*<\/svg>$/, t.id);
      assert.ok(!svg.includes("<text"), t.id);
    }
    assert.notEqual(past, tepa, `${t.id}: tepasi pastidan farq qiladi`);
    assert.ok(art.MANZARA[t.id], `${t.id}: manzara sozlamasi`);
  }
  assert.match(art.chogqi(), /^<svg[\s\S]*<\/svg>$/);
});
