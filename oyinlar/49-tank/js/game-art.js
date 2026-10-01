// 49-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Tank tepadan: tana, zanjirlar, minora va quvur
  const tank = () => `
<svg viewBox="0 0 170 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tepadan koʻrinadigan tank">
  <rect x="34" y="18" width="78" height="12" rx="5" fill="#6B6558" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="34" y="80" width="78" height="12" rx="5" fill="#6B6558" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="38" y="28" width="70" height="54" rx="8" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3.5"/>
  <circle cx="73" cy="55" r="17" fill="#1B4A94" stroke="#2B2B3A" stroke-width="3.5"/>
  <rect x="88" y="49" width="56" height="12" rx="4" fill="#1B4A94" stroke="#2B2B3A" stroke-width="3.5"/>
  <circle cx="152" cy="55" r="7" fill="#F08A24" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M14 55 h14 M18 40 l-6 -6 M18 70 l-6 6" stroke="#8A8577" stroke-width="4" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { tank };
})(window);
