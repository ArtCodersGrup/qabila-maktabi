const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
loadScript(path.join(__dirname, "../../umumiy/js/art.js"), win);
loadScript(path.join(__dirname, "../js/game-art.js"), win);
const art = win.QK.art;

test("chiroq: 3 holat har xil rangda, yoniqda nur bor", () => {
  assert.match(art.lamp(0), /#D9D2C3/);
  assert.ok(!art.lamp(0).includes("lamp-glow"));
  assert.match(art.lamp(1), /#F0C040/);
  assert.ok(art.lamp(1).includes("lamp-glow"));
  assert.match(art.lamp(2), /#2F6FDE/);
  assert.match(art.lamp(2), /data-state="2"/);
});

test("hikoya rasmlari SVG qaytaradi", () => {
  for (const n of ["hills", "bits", "byte", "pixel", "screen"]) {
    assert.match(art.story(n), /^<svg[\s\S]*<\/svg>$/, n);
  }
  assert.equal(art.story("yoq"), "");
});
