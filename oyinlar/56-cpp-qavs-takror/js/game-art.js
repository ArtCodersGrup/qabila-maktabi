// 56-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Qavs ichidagi blok va aylanma strelka: shart va takror
  const takror = () => `
<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qavs ichidagi blok va aylanadigan strelka">
  <path d="M40 18 q-18 0 -18 18 v14 q0 10 -12 10 q12 0 12 10 v14 q0 18 18 18" fill="none" stroke="#F08A24" stroke-width="7" stroke-linecap="round"/>
  <path d="M118 18 q18 0 18 18 v14 q0 10 12 10 q-12 0 -12 10 v14 q0 18 -18 18" fill="none" stroke="#F08A24" stroke-width="7" stroke-linecap="round"/>
  <rect x="52" y="34" width="54" height="10" rx="5" fill="#2F6FDE"/>
  <rect x="52" y="50" width="42" height="10" rx="5" fill="#2F6FDE"/>
  <rect x="52" y="66" width="48" height="10" rx="5" fill="#2F6FDE"/>
  <path d="M166 32 a26 26 0 1 1 -8 48" fill="none" stroke="#1A9E77" stroke-width="7" stroke-linecap="round"/>
  <path d="M158 22 l10 10 l-10 10" fill="none" stroke="#1A9E77" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { takror };
})(window);
