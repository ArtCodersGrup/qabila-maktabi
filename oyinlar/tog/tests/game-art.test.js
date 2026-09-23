const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const T = require("../js/tog.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("har qahramon: bir xil odamcha, faqat rangi boshqa", () => {
  const shakllar = new Set();
  const ranglar = new Set();
  for (const q of T.QAHRAMONLAR) {
    const svg = art.odam(q.rang);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, q.id);
    assert.ok(!svg.includes("<text"), q.id);
    assert.ok(svg.includes(q.rang), `${q.id}: oʻz rangi`);
    // Ranglarni olib tashlagach hammasi bir xil chizma boʻlishi kerak
    shakllar.add(svg.replace(/#[0-9a-f]{3,6}/gi, "RANG"));
    ranglar.add(q.rang.toLowerCase());
  }
  assert.equal(shakllar.size, 1, "odamchalar bir xil chizilgan");
  assert.equal(ranglar.size, T.QAHRAMONLAR.length, "ranglar takrorlanmaydi");
});

test("ranglar bir-biridan yetarlicha farq qiladi", () => {
  // Faqat rang bilan ajratamiz — yaqin ranglar boʻlmasligi kerak
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const list = T.QAHRAMONLAR.map((q) => ({ id: q.id, c: rgb(q.rang) }));
  let eng = 1e9;
  let juft = "";
  for (let i = 0; i < list.length; i++) {
    for (let k = i + 1; k < list.length; k++) {
      const d = Math.sqrt(list[i].c.reduce((s, v, j) => s + (v - list[k].c[j]) ** 2, 0));
      if (d < eng) { eng = d; juft = `${list[i].id}–${list[k].id}`; }
    }
  }
  assert.ok(eng > 70, `juda yaqin ranglar: ${juft} (${eng.toFixed(0)})`);
});

test("nishon: roʻyxat uchun kichik rasm, oʻsha rangda", () => {
  for (const q of T.QAHRAMONLAR) {
    const svg = art.nishon(q.rang);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, q.id);
    assert.ok(svg.includes(q.rang), q.id);
    assert.ok(!svg.includes("<text"), q.id);
  }
});

test("har tog'ning manzarasi bor: pastda va tepada boshqacha", () => {
  for (const t of T.TOGLAR) {
    const past = art.manzara(t.id, { past: 0, yuqori: 7, pogona: t.pogona });
    const tepa = art.manzara(t.id, { past: t.pogona - 7, yuqori: t.pogona, pogona: t.pogona });
    for (const svg of [past, tepa]) {
      assert.match(svg, /^<svg[\s\S]*<\/svg>$/, t.id);
      assert.ok(!svg.includes("<text"), t.id);
    }
    assert.notEqual(past, tepa, `${t.id}: tepasi pastidan farq qiladi`);
    assert.ok(art.MANZARA[t.id], `${t.id}: manzara sozlamasi`);
    // Pastda o't, tepada qor va cho'qqi bo'ladi
    assert.ok(past.includes(art.MANZARA[t.id].ot), `${t.id}: pastda o't`);
    assert.ok(tepa.includes("#FFFFFF"), `${t.id}: tepada qor`);
  }
  assert.match(art.chogqi(), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.bulut(), /^<svg[\s\S]*<\/svg>$/);
  assert.match(art.quyosh(), /^<svg[\s\S]*<\/svg>$/);
});

test("bag'ir geometriyasi: pastki pog'ona chapda, yuqorisi o'ngda va tepada", () => {
  const g = art.geometriya({ past: 0, yuqori: 7, pogona: 15 });
  assert.ok(g.xOf(0) < g.xOf(7), "yuqoriga chiqqan sari o'ngga siljiydi");
  assert.ok(g.yOf(7) < g.yOf(0), "yuqoridagi pog'ona tepada");
  assert.equal(g.chogqi, false, "cho'qqi bu oynada ko'rinmaydi");
  const tepa = art.geometriya({ past: 8, yuqori: 15, pogona: 15 });
  assert.equal(tepa.chogqi, true);
  assert.ok(tepa.peakY < tepa.yOf(15), "cho'qqi oxirgi pog'onadan tepada");
});

test("balandlikka qarab bezak: pastda archa, tepada qor", () => {
  for (const t of T.TOGLAR) {
    assert.equal(art.bezakTuri(t.id, 0.05), "archa");
    assert.equal(art.bezakTuri(t.id, 0.9), "qor");
    for (const b of [0.05, 0.4, 0.65, 0.9]) {
      assert.match(art.bezak(art.bezakTuri(t.id, b)), /^<svg[\s\S]*<\/svg>$/);
    }
  }
});
