// 48-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Ikki kalit va chiroq: ikkalasi yoniq bo'lsa — chiroq yonadi (and)
  const mantiq = () => `
<svg viewBox="0 0 170 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ikki kalit va chiroq">
  <path d="M10 60 H40" stroke="#8A8577" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 60 L62 48" stroke="#1A9E77" stroke-width="5" stroke-linecap="round"/>
  <circle cx="40" cy="60" r="5" fill="#2B2B3A"/><circle cx="66" cy="60" r="5" fill="#2B2B3A"/>
  <path d="M66 60 H92" stroke="#8A8577" stroke-width="5" stroke-linecap="round"/>
  <path d="M92 60 L114 48" stroke="#1A9E77" stroke-width="5" stroke-linecap="round"/>
  <circle cx="92" cy="60" r="5" fill="#2B2B3A"/><circle cx="118" cy="60" r="5" fill="#2B2B3A"/>
  <path d="M118 60 H136" stroke="#8A8577" stroke-width="5" stroke-linecap="round"/>
  <circle cx="148" cy="60" r="13" fill="#FFE9A8" stroke="#2B2B3A" stroke-width="3.5"/>
  <path d="M148 34 v-8 M166 42 l6 -6 M130 42 l-6 -6" stroke="#F08A24" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M20 86 H150" stroke="#D8CDB4" stroke-width="4" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { mantiq };
})(window);
