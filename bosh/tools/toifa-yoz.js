#!/usr/bin/env node
// O'yin sahifalariga ko'rinish atributlarini katalogdan yozadi:
//   <html lang="uz" data-toifa="orta">  yoki  <html lang="uz" data-toifa="orta" data-maskot>
// va <meta name="theme-color"> ni shunga moslaydi. Bu yig'ish (build) emas — bir martalik yozuv:
// o'yin toifasi o'zgarsa yoki yangi o'yin qo'shilsa ishga tushiriladi (loyiha ildizida):
//   node bosh/tools/toifa-yoz.js
// Tekshiruvi: node --test bosh/tests/bosh.test.js
const fs = require("node:fs");
const path = require("node:path");
const { loadScript } = require("../../oyinlar/umumiy/tests/helpers.js");

const ROOT = path.join(__dirname, "../..");
const BOLA_FON = "#FFF6E5";
const KATTA_FON = "#FBFAF7"; // asos.css dagi kattalar --fon bilan bir xil

const jsFayllar = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? jsFayllar(p) : e.name.endsWith(".js") ? [p] : [];
}) : []);

// O'yin shogirdning qog'ozi yoki barabanini HAQIQATAN ishlatadimi (ui.paper("") — faqat tozalash, hisobga kirmaydi).
// Bunday o'yin qahramonsiz tushunarsiz — toifasidan qat'i nazar bolalar ko'rinishida qoladi.
function maskotKerak(dir) {
  return jsFayllar(path.join(ROOT, "oyinlar", dir, "js")).some((p) => {
    const src = fs.readFileSync(p, "utf8");
    if (/raisePaper\(|"drum"/.test(src)) return true;
    return (src.match(/ui\.paper\([^)]*\)/g) || []).some((m) => !/^ui\.paper\(\s*""\s*\)$/.test(m));
  });
}

// O'yin kattalar ko'rinishidami (asos.css oxiridagi bo'lim selektori bilan bir xil shart)
const kattami = (game) => game.toifa !== "boshlangich" && !maskotKerak(game.dir);

function yoz() {
  const win = {};
  loadScript(path.join(ROOT, "bosh/js/bosh.js"), win);
  let soni = 0;
  for (const game of win.QK.bosh.GAMES) {
    const p = path.join(ROOT, "oyinlar", game.dir, "index.html");
    const eski = fs.readFileSync(p, "utf8");
    const teg = `<html lang="uz" data-toifa="${game.toifa}"${maskotKerak(game.dir) ? " data-maskot" : ""}>`;
    const yangi = eski
      .replace(/<html[^>]*>/, teg)
      .replace(/(<meta name="theme-color" content=")[^"]*(")/, `$1${kattami(game) ? KATTA_FON : BOLA_FON}$2`);
    if (yangi !== eski) {
      fs.writeFileSync(p, yangi);
      soni++;
    }
  }
  return soni;
}

module.exports = { maskotKerak, kattami, yoz };
if (require.main === module) console.log(`toifa-yoz: ${yoz()} ta fayl yangilandi`);
