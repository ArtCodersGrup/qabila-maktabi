// 59-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6). Manzillar rasm ichida emas, HTML'da.
(function (root) {
  "use strict";

  const RANG = [["#D8E6FB", "#2F6FDE"], ["#FFE9C7", "#F08A24"], ["#D7F0E6", "#1A9E77"], ["#E7DBF7", "#8E5BD0"]];

  // Uy: devor va eshik rangi tartib bo'yicha (rang ko'rish buzilishida ham farqlanadi — manzil baribir yozilgan)
  const uy = (i) => {
    const [devor, eshik] = RANG[(i || 0) % RANG.length];
    return `
<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M8 34 L40 8 L72 34" fill="none" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="16" y="30" width="48" height="34" rx="3" fill="${devor}" stroke="#2B2B3A" stroke-width="3.5"/>
  <rect x="34" y="42" width="14" height="22" rx="2" fill="${eshik}" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="21" y="38" width="9" height="9" rx="1.5" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2"/>
</svg>`;
  };

  // Xarita: uylar, yo'llar va bitta konvert
  const xarita = () => `
<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qabila xaritasi: uylar, yoʻllar va konvert">
  <path d="M10 92 h200 M60 20 v100 M150 20 v100" stroke="#E8DCC2" stroke-width="12" stroke-linecap="round"/>
  ${[[18, 40, 0], [88, 34, 1], [170, 40, 2], [96, 82, 3]].map(([x, y, i]) => {
    const [devor, eshik] = RANG[i];
    return `<g transform="translate(${x} ${y})"><path d="M0 16 L16 3 L32 16" fill="none" stroke="#2B2B3A" stroke-width="3" stroke-linejoin="round"/><rect x="4" y="14" width="24" height="18" rx="2" fill="${devor}" stroke="#2B2B3A" stroke-width="2.5"/><rect x="13" y="20" width="7" height="12" fill="${eshik}"/></g>`;
  }).join("")}
  <g transform="translate(118 8) rotate(-8)"><rect width="34" height="22" rx="3" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="3"/><path d="M0 0 l17 12 17 -12" fill="none" stroke="#2B2B3A" stroke-width="2.5"/></g>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { uy, xarita };
})(window);
