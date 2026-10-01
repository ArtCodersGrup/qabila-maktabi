// 52-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Xat qarmoqqa ilingan — "firibgar xat" g'oyasi
  const xat = () => `
<svg viewBox="0 0 190 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qarmoqqa ilingan xat">
  <path d="M168 6 V62 a18 18 0 0 1 -36 2" fill="none" stroke="#8A8577" stroke-width="6" stroke-linecap="round"/>
  <path d="M132 64 l-9 -7" fill="none" stroke="#8A8577" stroke-width="6" stroke-linecap="round"/>
  <rect x="16" y="44" width="126" height="76" rx="10" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="3.5"/>
  <path d="M16 52 L79 96 L142 52" fill="none" stroke="#2B2B3A" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M30 108 h44 M30 96 h28" stroke="#D8CDB4" stroke-width="5" stroke-linecap="round"/>
  <circle cx="124" cy="102" r="13" fill="#F08A24" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M124 95 v8" stroke="#2B2B3A" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="124" cy="109" r="2" fill="#2B2B3A"/>
</svg>`;

  // Qalqon: himoya tomoni
  const qalqon = () => `
<svg viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qalqon">
  <path d="M60 8 L108 25 v43 c0 30 -22 48 -48 58 -26 -10 -48 -28 -48 -58 V25 Z" fill="#1A9E77" stroke="#2B2B3A" stroke-width="3.5"/>
  <path d="M38 66 l15 16 29 -33" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { xat, qalqon };
})(window);
