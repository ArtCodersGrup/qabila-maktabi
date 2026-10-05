// index.html tekshiruvi: skriptlar va uslublar joyida, tartibi to'g'ri.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);

test("hamma fayl mavjud, main.js oxirida", () => {
  for (const f of scripts.concat(styles)) assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  assert.equal(scripts[scripts.length - 1], "js/main.js");
});

test("qayta ishlatilgan qismlar ulangan: yozish, tog' va onlayn xona", () => {
  for (const f of ["../23-on-barmoq/js/typing.js", "../23-on-barmoq/js/typing-ui.js", "../23-on-barmoq/js/typing-play.js",
    "../tog/js/tog.js", "../tog/js/game-art.js", "../tog/js/tog-ui.js",
    "../umumiy/js/onlayn.js", "../umumiy/js/offline.js"]) {
    assert.ok(scripts.includes(f), f);
  }
  for (const f of ["../tog/css/style.css", "../23-on-barmoq/css/style.css", "../umumiy/css/onlayn.css"]) {
    assert.ok(styles.includes(f), f);
  }
});

test("tartib: mantiq ekrandan oldin, onlayn qatlam sahifadan oldin", () => {
  const oldin = (a, b) => assert.ok(scripts.indexOf(a) < scripts.indexOf(b), `${a} < ${b}`);
  oldin("../23-on-barmoq/js/typing.js", "js/poyga.js");
  oldin("../tog/js/tog.js", "js/poyga.js");
  oldin("js/poyga.js", "js/protokol.js");
  oldin("js/protokol.js", "js/ekran.js");
  oldin("../umumiy/js/ui.js", "../23-on-barmoq/js/typing-ui.js");
  oldin("../tog/js/game-art.js", "../tog/js/tog-ui.js");
  oldin("js/ekran.js", "js/onlayn-poyga.js");
  oldin("../umumiy/js/onlayn.js", "js/onlayn-poyga.js");
});

test("sahifa: zonalar va tugmalar bor", () => {
  for (const id of ["btn-home", "btn-sound", "bubble", "actor-elder", "actor-apprentice", "zone-work", "zone-control", "play"]) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  assert.match(html, /<title>Yozuv poygasi<\/title>/);
});
