// O'yin matnidagi raqamli havolalarni ("18-oʻyindagi ...") bosh sahifa tartibiga moslaydi.
// Yangi blok qo'shilganda undan keyingi hamma raqam suriladi — shuni qo'lda tuzatmaslik uchun.
// Ishga tushirish (loyiha ildizida):  node bosh/tools/renumber.js
const path = require("node:path");
const fs = require("node:fs");
const { loadScript } = require("../../oyinlar/umumiy/tests/helpers.js");

const ROOT = path.join(__dirname, "../..");
const win = {};
loadScript(path.join(ROOT, "bosh/js/bosh-art.js"), win);
loadScript(path.join(ROOT, "bosh/js/bosh.js"), win);
const { GAMES, number } = win.QK.bosh;

const refs = JSON.parse(fs.readFileSync(path.join(ROOT, "bosh/tests/havolalar.json"), "utf8"));
const num = (dir) => number(GAMES.find((g) => g.dir === dir));

let files = 0;
let fixed = 0;
for (const [file, pattern, dirs] of refs) {
  const full = path.join(ROOT, "oyinlar", file);
  const src = fs.readFileSync(full, "utf8");
  const m = new RegExp(pattern, "d").exec(src);
  if (!m) {
    console.error("TOPILMADI:", file, "«" + pattern + "»");
    process.exitCode = 1;
    continue;
  }
  const want = dirs.map(num);
  let out = src;
  let hits = 0;
  // Guruhlarni oxiridan boshlab almashtiramiz — oldingi indekslar buzilmaydi
  for (let k = m.length - 1; k >= 1; k--) {
    const [start, end] = m.indices[k];
    const now = src.slice(start, end);
    if (now === String(want[k - 1])) continue;
    out = out.slice(0, start) + String(want[k - 1]) + out.slice(end);
    hits++;
  }
  if (!hits) continue;
  fs.writeFileSync(full, out);
  files++;
  fixed += hits;
  console.log(file + ": " + hits + " ta raqam yangilandi «" + m[0].trim() + "»");
}
console.log(fixed ? `\nTayyor: ${files} faylda ${fixed} ta raqam.` : "Hammasi joyida — o'zgarish kerak emas.");
