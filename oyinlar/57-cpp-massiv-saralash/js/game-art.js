// 57-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Bir qator katak (massiv) va saralangan ustunlar
  const massiv = () => `
<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kataklar qatori va saralangan ustunlar">
  <rect x="8" y="26" width="26" height="26" rx="5" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="36" y="26" width="26" height="26" rx="5" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="64" y="26" width="26" height="26" rx="5" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="92" y="26" width="26" height="26" rx="5" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="21" cy="39" r="7" fill="#2F6FDE"/>
  <circle cx="49" cy="39" r="7" fill="#C0392B"/>
  <circle cx="77" cy="39" r="7" fill="#1A9E77"/>
  <circle cx="105" cy="39" r="7" fill="#8E5BD0"/>
  <path d="M63 64 v14" stroke="#8A8577" stroke-width="5" stroke-linecap="round"/>
  <path d="M55 70 l8 9 l8 -9" fill="none" stroke="#8A8577" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="140" y="72" width="16" height="22" rx="4" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2"/>
  <rect x="160" y="58" width="16" height="36" rx="4" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>
  <rect x="180" y="40" width="16" height="54" rx="4" fill="#8E5BD0" stroke="#2B2B3A" stroke-width="2"/>
  <rect x="200" y="22" width="16" height="72" rx="4" fill="#C0392B" stroke="#2B2B3A" stroke-width="2"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { massiv };
})(window);
