// 39-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Aralash ustunlar: biri belgilangan (almashtiriladigan juftlik)
  const ustunlar = () => {
    const balandlik = [40, 18, 64, 10, 52, 30];
    let out = "";
    balandlik.forEach((b, k) => {
      const belgi = k === 1 || k === 2;
      out += `<rect x="${10 + k * 36}" y="${80 - b}" width="26" height="${b}" rx="4" fill="${belgi ? "#2F6FDE" : "#F2E6CF"}" stroke="#2B2B3A" stroke-width="3"/>`;
    });
    return `
<svg viewBox="0 0 230 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Saralanmagan ustunlar">
  ${out}
  <path d="M8 86 H222" stroke="#8A8577" stroke-width="4" stroke-linecap="round"/>
  <path d="M60 14 h32" stroke="#1A9E77" stroke-width="4" stroke-linecap="round"/>
  <path d="M86 8 l8 6 l-8 6" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M66 20 l-8 -6 l8 -6" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  };

  root.QK = root.QK || {};
  root.QK.gameArt = { ustunlar };
})(window);
