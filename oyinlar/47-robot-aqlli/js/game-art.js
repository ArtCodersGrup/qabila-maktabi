// 47-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Robot va ikki yo'l: biri tosh bilan yopiq, ikkinchisi aylanma
  const robot = () => `
<svg viewBox="0 0 170 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Robot ikki yoʻl oldida">
  <path d="M30 70 H70" stroke="#D8CDB4" stroke-width="10" stroke-linecap="round"/>
  <path d="M70 70 H120" stroke="#D8CDB4" stroke-width="10" stroke-linecap="round"/>
  <path d="M70 70 C 70 36, 96 30, 120 30 L 120 60" fill="none" stroke="#1A9E77" stroke-width="7" stroke-linecap="round" stroke-dasharray="9 8"/>
  <rect x="86" y="58" width="24" height="24" rx="6" fill="#8A8577" stroke="#2B2B3A" stroke-width="3"/>
  <g>
    <rect x="16" y="54" width="30" height="26" rx="7" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>
    <circle cx="25" cy="66" r="4" fill="#fff"/><circle cx="37" cy="66" r="4" fill="#fff"/>
    <path d="M31 54 V44" stroke="#2B2B3A" stroke-width="3"/><circle cx="31" cy="41" r="4" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  </g>
  <path d="M128 24 l10 6 l-10 6" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { robot };
})(window);
