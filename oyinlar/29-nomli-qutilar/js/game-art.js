// 29-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Yorliqli qutilar: biri ochiq, ichida qiymat (dumaloq tosh)
  const boxes = () => `
<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Yorliqli qutilar">
  <rect x="18" y="58" width="84" height="66" rx="10" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="4"/>
  <rect x="18" y="44" width="84" height="20" rx="8" fill="#D9C7A6" stroke="#2B2B3A" stroke-width="4"/>
  <rect x="34" y="72" width="52" height="16" rx="8" fill="#2F6FDE"/>
  <circle cx="60" cy="106" r="12" fill="#F08A24"/>
  <rect x="118" y="58" width="84" height="66" rx="10" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="4"/>
  <path d="M118 58 h84 l-8 -18 h-68 z" fill="#D9C7A6" stroke="#2B2B3A" stroke-width="4" stroke-linejoin="round"/>
  <rect x="134" y="72" width="52" height="16" rx="8" fill="#1A9E77"/>
  <circle cx="160" cy="106" r="12" fill="#8E5BD0"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { boxes };
})(window);
