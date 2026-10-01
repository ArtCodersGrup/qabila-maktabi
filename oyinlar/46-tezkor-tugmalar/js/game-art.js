// 46-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Ikki tugma: kattasi (turgich) va kichigi, ikkalasi bosilgan holatda
  const tugmalar = () => `
<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ikki tugma birga bosilgan">
  <rect x="10" y="30" width="62" height="40" rx="9" fill="#D8E6FB" stroke="#2B2B3A" stroke-width="3.5"/>
  <rect x="10" y="26" width="62" height="40" rx="9" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3.5"/>
  <path d="M24 46 h34" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  <rect x="88" y="30" width="46" height="40" rx="9" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="3.5"/>
  <rect x="88" y="26" width="46" height="40" rx="9" fill="#F08A24" stroke="#2B2B3A" stroke-width="3.5"/>
  <path d="M104 38 v16 M104 38 h10 a6 6 0 0 1 0 12 h-10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M78 46 h6 M81 43 v6" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round"/>
  <path d="M30 80 q50 -10 100 0" fill="none" stroke="#1A9E77" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="6 7"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { tugmalar };
})(window);
