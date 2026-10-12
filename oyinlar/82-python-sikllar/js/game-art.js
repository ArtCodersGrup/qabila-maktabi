// «for va while»ga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // O'qitish davrlari: har ustun — bir davrdagi xato; punktir — chegara. Chegaradan past ustun yashil.
  // bars — xato qiymatlari (0…1), limit — chegara (0…1).
  function epochs(bars, limit) {
    const list = bars || [0.9, 0.62, 0.44, 0.3, 0.2, 0.12];
    const t = limit == null ? 0.18 : limit;
    const w = 260 / list.length;
    const y = (v) => 120 - v * 100;
    const cols = list.map((v, k) => `<rect x="${24 + k * w + 5}" y="${y(v)}" width="${w - 10}" height="${v * 100}" rx="4" fill="${v <= t ? "#1A9E77" : "#33408A"}"/>`).join("");
    return `
<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Xato davrdan davrga kamayadi va chegaradan pastga tushadi">
  ${cols}
  <path d="M20 120 H288" stroke="#8B8676" stroke-width="4" stroke-linecap="round"/>
  <path d="M20 ${y(t)} H288" stroke="#B4560C" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 9"/>
</svg>`;
  }

  // Sikl: aylanma strelka — tana qayta-qayta bajariladi
  function loop() {
    return `
<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sikl: buyruqlar qayta bajariladi">
  <path d="M100 22 A44 44 0 1 1 58 52" fill="none" stroke="#33408A" stroke-width="10" stroke-linecap="round"/>
  <path d="M40 34 L62 60 L72 30 Z" fill="#33408A"/>
  <rect x="80" y="50" width="40" height="10" rx="5" fill="#F08A24"/>
  <rect x="80" y="68" width="40" height="10" rx="5" fill="#F08A24"/>
  <rect x="80" y="86" width="26" height="10" rx="5" fill="#F08A24"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { epochs, loop };
})(window);
