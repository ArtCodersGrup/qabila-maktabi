// 58-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Uydan uyga: xat bo'laklarga bo'linib, uch xil yo'ldan ketadi
  const yol = () => `
<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Xat boʻlaklarga boʻlinib, har xil yoʻldan doʻstning uyiga boradi">
  <path d="M14 58 l22 -20 22 20 v40 h-44 z" fill="#FFE9C7" stroke="#2B2B3A" stroke-width="3" stroke-linejoin="round"/>
  <rect x="29" y="74" width="14" height="24" rx="2" fill="#2F6FDE"/>
  <path d="M162 58 l22 -20 22 20 v40 h-44 z" fill="#D7F0E6" stroke="#2B2B3A" stroke-width="3" stroke-linejoin="round"/>
  <rect x="177" y="74" width="14" height="24" rx="2" fill="#1A9E77"/>
  <path d="M60 70 q50 -60 100 0" fill="none" stroke="#2F6FDE" stroke-width="3" stroke-dasharray="6 6"/>
  <path d="M60 80 h100" fill="none" stroke="#F08A24" stroke-width="3" stroke-dasharray="6 6"/>
  <path d="M60 90 q50 40 100 0" fill="none" stroke="#8E5BD0" stroke-width="3" stroke-dasharray="6 6"/>
  <g stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round">
    <rect x="98" y="34" width="24" height="16" rx="2" fill="#FFFFFF"/><path d="M98 34 l12 9 12 -9" fill="none"/>
    <rect x="98" y="72" width="24" height="16" rx="2" fill="#FFFFFF"/><path d="M98 72 l12 9 12 -9" fill="none"/>
    <rect x="98" y="102" width="24" height="16" rx="2" fill="#FFFFFF"/><path d="M98 102 l12 9 12 -9" fill="none"/>
  </g>
</svg>`;

  // Pochta qutisi: hamma konvertlar yetib keldi
  const quti = () => `
<svg viewBox="0 0 140 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pochta qutisi, konvertlar yetib keldi">
  <rect x="62" y="70" width="12" height="54" fill="#8A6B4A" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M28 44 q0 -26 40 -26 h22 q22 0 22 26 v34 h-84 z" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M112 30 v-20 h18 v12 h-18" fill="#F08A24" stroke="#2B2B3A" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round">
    <rect x="40" y="30" width="30" height="20" rx="2" fill="#FFFFFF" transform="rotate(-10 55 40)"/>
    <rect x="58" y="36" width="30" height="20" rx="2" fill="#FFF4CC" transform="rotate(8 73 46)"/>
  </g>
  <path d="M96 100 l8 8 16 -18" fill="none" stroke="#1A9E77" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { yol, quti };
})(window);
