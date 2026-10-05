// O'yinchoq kompyuter belgilari: har biri SVG, matnsiz (QOIDALAR §6).
const test = require("node:test");
const assert = require("node:assert/strict");
const A = require("../js/stol-art.js");

test("belgilar: dasturlar, fayl turlari, savat va «Pusk» — SVG, ichida matn yo'q", () => {
  const kerak = ["rasm", "matn", "hisob", "musiqa", "fayllar", "internet", "papka", "f-rasm", "f-matn", "f-musiqa", "f-video", "savat", "savat-tola", "pusk"];
  assert.deepEqual(A.NOMLAR.slice().sort(), kerak.slice().sort());
  for (const nom of kerak) {
    const s = A.icon(nom);
    assert.match(s, /^<svg viewBox="0 0 48 48"[\s\S]*<\/svg>$/, nom);
    assert.ok(!s.includes("<text"), nom + ": rasm ichida matn bo'lmasin");
    assert.ok(!s.includes("undefined"), nom);
  }
  assert.equal(A.icon("yoq"), "");
  // Har belgi boshqasidan farq qiladi (ikki nom bitta rasmga tushib qolmasin)
  assert.equal(new Set(kerak.map(A.icon)).size, kerak.length);
});
