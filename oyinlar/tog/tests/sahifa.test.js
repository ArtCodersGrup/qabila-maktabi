// Tog'ga chiqish sahifasi: skriptlar mavjud, savol mantig'i mashq.js dan oldin yuklanadi,
// o'yin internetsiz ham ishlashi kerak — Supabase kutubxonasi bu sahifada yo'q.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const at = (f) => scripts.indexOf(f);

test("skriptlar bor va tartibi to'g'ri", () => {
  for (const f of scripts) assert.ok(fs.existsSync(path.join(__dirname, "..", f)), f);
  for (const f of ["../musobaqa/js/savollar.js", "js/tog.js", "js/game-art.js", "js/tog-ui.js", "../umumiy/js/savol-ui.js"]) {
    assert.ok(at(f) >= 0 && at(f) < at("js/mashq.js"), f);
  }
  assert.ok(at("../umumiy/js/art.js") < at("js/game-art.js"), "game-art art.js ga qo'shiladi");
  assert.equal(scripts[scripts.length - 1], "js/mashq.js");
});

test("savollar.js kutgan mavzu fayllari yuklangan", () => {
  const savollar = fs.readFileSync(path.join(__dirname, "../../musobaqa/js/savollar.js"), "utf8");
  const musobaqa = fs.readFileSync(path.join(__dirname, "../../musobaqa/index.html"), "utf8");
  const kerak = [...musobaqa.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])
    .filter((f) => f.startsWith("../") && !f.startsWith("../umumiy/") && f !== "js/savollar.js");
  for (const f of kerak) {
    const bu = f.replace(/^\.\.\//, "../");
    assert.ok(scripts.includes(bu) || scripts.includes("../musobaqa/" + f.replace(/^\.\.\//, "")), f);
  }
  assert.ok(savollar.includes("QK.savollar"), "savollar.js QK ga yozadi");
});

test("mashq rejimi internetsiz ishlaydi: Supabase yo'q, offline.js bor", () => {
  assert.ok(!scripts.some((f) => f.includes("supabase")), "mashqda kutubxona kerak emas");
  assert.ok(scripts.includes("../umumiy/js/offline.js"), "offline.js");
  assert.match(html, /css\/style\.css/);
  assert.match(html, /umumiy\/css\/savol\.css/);
});
