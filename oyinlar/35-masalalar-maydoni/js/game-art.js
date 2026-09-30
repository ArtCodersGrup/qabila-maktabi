// 35-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Maydon: uchta daraja — uch pog'onali toshli minora; yechilganlari bo'yalgan.
  function tower(done) {
    const on = Math.max(0, Math.min(3, done || 0));
    const c = (k) => (k < on ? "#1A9E77" : "#D9C7A6");
    return `
<svg viewBox="0 0 180 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Uch pogʻonali minora">
  <rect x="20" y="92" width="140" height="26" rx="6" fill="${c(0)}" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="38" y="62" width="104" height="26" rx="6" fill="${c(1)}" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="56" y="32" width="68" height="26" rx="6" fill="${c(2)}" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M90 30 L90 10" stroke="#8A8577" stroke-width="4" stroke-linecap="round"/>
  <path d="M90 10 L118 17 L90 24 Z" fill="${on >= 3 ? "#F08A24" : "#D9C7A6"}"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { tower };
})(window);
