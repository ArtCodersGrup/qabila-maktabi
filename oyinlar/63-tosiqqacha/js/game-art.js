// 63-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Robot tosh devorlar orasidagi yo'lakda: oldinga qaraydi, yo'lak oxirida tosh, burilishdan keyin gulxan
  const yolak = () => `
<svg viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Robot yoʻlakda, oxirida tosh, burilishdan keyin gulxan">
  <g fill="#8A8577" stroke="#2B2B3A" stroke-width="2.5">
    <rect x="8" y="14" width="22" height="22" rx="6"/><rect x="34" y="14" width="22" height="22" rx="6"/>
    <rect x="60" y="14" width="22" height="22" rx="6"/><rect x="86" y="14" width="22" height="22" rx="6"/>
    <rect x="112" y="14" width="22" height="22" rx="6"/><rect x="138" y="40" width="22" height="22" rx="6"/>
    <rect x="8" y="66" width="22" height="22" rx="6"/><rect x="34" y="66" width="22" height="22" rx="6"/>
    <rect x="60" y="66" width="22" height="22" rx="6"/><rect x="86" y="66" width="22" height="22" rx="6"/>
  </g>
  <path d="M30 51 H122" stroke="#D8CDB4" stroke-width="10" stroke-linecap="round"/>
  <path d="M123 51 V88" stroke="#D8CDB4" stroke-width="10" stroke-linecap="round"/>
  <path d="M58 51 H104" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 7"/>
  <path d="M100 44 l8 7 l-8 7" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(123 96)">
    <path d="M-9 4 Q-10 -8 -2 -14 Q-3 -6 3 -8 Q2 -14 6 -18 Q12 -8 9 4 Z" fill="#F08A24" stroke="#2B2B3A" stroke-width="2"/>
    <path d="M-3 4 Q-4 -3 1 -6 Q4 -2 3 4 Z" fill="#FFD25A"/>
  </g>
  <g>
    <rect x="18" y="38" width="30" height="26" rx="7" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>
    <circle cx="33" cy="50" r="4" fill="#fff"/><circle cx="43" cy="50" r="4" fill="#fff"/>
    <circle cx="34.5" cy="50" r="1.8" fill="#2B2B3A"/><circle cx="44.5" cy="50" r="1.8" fill="#2B2B3A"/>
    <path d="M33 38 V29" stroke="#2B2B3A" stroke-width="3"/><circle cx="33" cy="26" r="4" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  </g>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { yolak };
})(window);
