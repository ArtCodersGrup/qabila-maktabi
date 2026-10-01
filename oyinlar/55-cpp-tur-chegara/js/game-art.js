// 55-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // To'lib ketgan idish: kichik quti sig'dira olmaydi, katta quti sig'diradi
  const chegara = () => `
<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kichik quti toʻlib toshdi, katta quti sigʻdiradi">
  <rect x="14" y="48" width="56" height="46" rx="8" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="20" y="58" width="44" height="30" rx="4" fill="#2F6FDE"/>
  <circle cx="26" cy="36" r="7" fill="#C0392B" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="46" cy="24" r="7" fill="#C0392B" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="66" cy="34" r="7" fill="#C0392B" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M88 60 h26" stroke="#8A8577" stroke-width="5" stroke-linecap="round"/>
  <path d="M106 52 l9 8 l-9 8" fill="none" stroke="#8A8577" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="128" y="22" width="78" height="72" rx="8" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="134" y="30" width="66" height="56" rx="4" fill="#1A9E77"/>
  <circle cx="150" cy="44" r="7" fill="#F3C969" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="170" cy="44" r="7" fill="#F3C969" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="190" cy="44" r="7" fill="#F3C969" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="160" cy="68" r="7" fill="#F3C969" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="180" cy="68" r="7" fill="#F3C969" stroke="#2B2B3A" stroke-width="2"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { chegara };
})(window);
