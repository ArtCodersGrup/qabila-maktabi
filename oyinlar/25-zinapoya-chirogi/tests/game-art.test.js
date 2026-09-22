const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const G = require("../js/gates.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

const isSvg = (svg, name) => {
  assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
  assert.ok(!svg.includes("<text"), name);
};

test("rasmlar SVG va matnsiz", () => {
  for (const [a, b] of G.PAIRS) isSvg(art.stairCircuit({ a, b }), `zinapoya ${a}${b}`);
  for (const name of ["stairs", "room", "chip"]) isSvg(art[name](), name);
  for (const tpl of Object.keys(G.TEMPLATES)) {
    const c = G.circuit(tpl, "and");
    isSvg(art.gatesSvg(c, G.evaluate(c, 1, 0)), tpl);
    isSvg(art.gatesSvg(c, null, { unknown: "g1" }), `${tpl} ?`);
  }
  assert.equal(typeof art.elder, "function", "umumiy rasmlar saqlanadi");
});

test("zinapoya: chiroq kalitlar har xil bo'lganda yonadi (XOR)", () => {
  for (const [a, b] of G.PAIRS) {
    assert.ok(art.stairCircuit({ a, b }).includes(a ^ b ? "lamp-on" : "lamp-off"), `${a}${b}`);
  }
  assert.ok(art.stairCircuit({ a: 1, b: 0, lamp: "unknown" }).includes("lamp-unknown"));
  for (const l of art.STAIR_LABELS) assert.ok(l.x > 0 && l.x < art.STAIR.w && l.y > 0 && l.y < art.STAIR.h);
});

test("amallar sxemasi: har quti va chiqish rasm ichida, simlar soni to'g'ri", () => {
  for (const tpl of Object.keys(G.TEMPLATES)) {
    const c = G.circuit(tpl, "or");
    const L = art.gateLayout(c);
    const inputsCount = c.gates.reduce((s, g) => s + g.in.length, 0);
    assert.equal(L.wires.length, inputsCount + c.outs.length, tpl);
    for (const b of Object.values(L.boxes)) {
      assert.ok(b.x - art.BOX.w / 2 > 0 && b.x + art.BOX.w / 2 < L.w, `${tpl}: x`);
      assert.ok(b.y - art.BOX.h / 2 > 0 && b.y + art.BOX.h / 2 < L.h, `${tpl}: y`);
    }
    for (const o of L.outs) assert.ok(o.x + 13 <= L.w && o.y + 13 <= L.h, `${tpl}: chiqish`);
    // Chiqishlar soni — chiroqlar soni
    const svg = art.gatesSvg(c, G.evaluate(c, 1, 1));
    assert.equal((svg.match(/class="lamp /g) || []).length, c.outs.length, tpl);
  }
  // Noma'lum qiymatlarda chiroq "?"
  assert.ok(art.gatesSvg(G.circuit("single", "and"), null).includes("lamp-unknown"));
  // reveal: faqat ko'rsatilgan simlar sariq (maslahat — birinchi amal)
  const c = G.circuit("thenNot", "and");
  const partial = art.gatesSvg(c, G.evaluate(c, 1, 1), { reveal: ["g1"] });
  assert.ok(partial.includes("lamp-unknown"));
});
