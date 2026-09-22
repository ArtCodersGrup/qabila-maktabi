const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

const isSvg = (svg, name) => {
  assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
  assert.ok(!svg.includes("<text"), name);
};

test("rasmlar SVG va matnsiz", () => {
  for (const kind of ["series", "parallel", "single", "inverse"]) {
    for (const lamp of ["on", "off", "unknown"]) isSvg(art.circuit(kind, { a: 1, b: 0, lamp }), `${kind}/${lamp}`);
  }
  for (const name of ["book", "chip", "venn"]) isSvg(art[name](), name);
  assert.equal(typeof art.elder, "function", "umumiy rasmlar saqlanadi");
});

test("sxema: kalitlar soni va holati", () => {
  const count = (svg, re) => (svg.match(re) || []).length;
  assert.equal(count(art.circuit("series", { a: 1, b: 1, lamp: "on" }), /class="switch/g), 2);
  assert.equal(count(art.circuit("parallel", { a: 0, b: 1, lamp: "on" }), /class="switch closed"/g), 1);
  assert.equal(count(art.circuit("single", { a: 1 }), /class="switch closed"/g), 1);
  // Teskari kalit: bosilsa (1) — uziladi
  assert.equal(count(art.circuit("inverse", { a: 1, lamp: "off" }), /class="switch closed"/g), 0);
  assert.equal(count(art.circuit("inverse", { a: 0, lamp: "on" }), /class="switch closed"/g), 1);
  assert.ok(art.circuit("series", { lamp: "on" }).includes("lamp-on"));
  assert.ok(art.circuit("series", { lamp: "unknown" }).includes("lamp-unknown"));
  // "B qanday bo'lsin?": B noma'lum, chiroq — maqsad holatida, simlar sariq emas
  const need = art.circuit("parallel", { a: 1, b: null, lamp: "on", wires: false });
  assert.equal(count(need, /class="switch unknown"/g), 1);
  assert.ok(need.includes("lamp-on") && !need.includes("#F0C040\" stroke-width=\"6"));
});

test("kalit harflari rasm ichida", () => {
  const { w, h } = art.CIRCUIT_SIZE;
  for (const kind of ["series", "parallel", "single", "inverse"]) {
    const labels = art.circuitLabels(kind);
    assert.equal(labels.length, kind === "series" || kind === "parallel" ? 2 : 1, kind);
    for (const l of labels) assert.ok(l.x > 0 && l.x < w && l.y >= 0 && l.y < h, `${kind} ${l.key}`);
  }
});
