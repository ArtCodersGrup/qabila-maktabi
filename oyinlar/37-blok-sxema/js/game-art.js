// 37-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Blok-sxema ko'rinishi: oval → to'rtburchak → romb (ikki shox) → oval
  const sxema = () => `
<svg viewBox="0 0 160 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Blok-sxema">
  <rect x="50" y="6" width="60" height="22" rx="11" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M80 28 V42" stroke="#8A8577" stroke-width="3"/>
  <path d="M80 46 l-5 -7 h10 z" fill="#8A8577"/>
  <rect x="46" y="46" width="68" height="24" rx="4" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M80 70 V84" stroke="#8A8577" stroke-width="3"/>
  <path d="M80 88 l-5 -7 h10 z" fill="#8A8577"/>
  <path d="M80 88 L112 108 L80 128 L48 108 Z" fill="#8E5BD0" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M48 108 H22 V146" stroke="#8A8577" stroke-width="3" fill="none"/>
  <path d="M112 108 H138 V146" stroke="#8A8577" stroke-width="3" fill="none"/>
  <rect x="4" y="146" width="36" height="20" rx="4" fill="#1A9E77" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="120" y="146" width="36" height="20" rx="4" fill="#F08A24" stroke="#2B2B3A" stroke-width="3"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { sxema };
})(window);
