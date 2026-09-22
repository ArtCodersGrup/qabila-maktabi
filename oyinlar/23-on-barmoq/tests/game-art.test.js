const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const T = require("../js/typing.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

const isSvg = (svg, name) => {
  assert.match(svg, /^<svg[\s\S]*<\/svg>$/, name);
  assert.ok(!svg.includes("<text"), name);
};

test("rasmlar SVG va matnsiz", () => {
  for (const name of ["hands", "runner", "flag", "typewriter", "trophy"]) isSvg(art[name](), name);
  assert.equal(typeof art.elder, "function", "umumiy rasmlar saqlanadi");
});

test("qo'llar: 10 ta barmoq, har biri mantiqdagi barmoq nomi bilan", () => {
  const svg = art.hands();
  assert.equal((svg.match(/class="finger"/g) || []).length, 10);
  const names = [...svg.matchAll(/data-f="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(names)].sort(), [...T.FINGERS].sort());
  assert.equal(names.filter((n) => n === "th").length, 2);
});

test("xabarchi kiyimi o'yinchi rangida (currentColor)", () => {
  assert.ok(art.runner().includes("currentColor"));
});
