// 51-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Bir tomonlama voronka: parol tushadi, pastdan kichik iz chiqadi, orqaga yo'l yopiq.
  const voronka = () => `
<svg viewBox="0 0 180 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bir tomonlama voronka: parol kiradi, iz chiqadi">
  <rect x="38" y="6" width="74" height="22" rx="7" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M75 32 v10" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round"/>
  <path d="M69 38 l6 7 6-7" fill="none" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M26 48 h98 l-30 34 h-38 z" fill="#FFE9C7" stroke="#2B2B3A" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M40 58 h70" stroke="#D8CDB4" stroke-width="4" stroke-linecap="round"/>
  <path d="M75 84 v10" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round"/>
  <path d="M69 90 l6 7 6-7" fill="none" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="60" y="100" width="30" height="22" rx="7" fill="#1A9E77" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M124 108 q38 -30 18 -62" fill="none" stroke="#F08A24" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 7"/>
  <path d="M135 52 l7 -12 8 11" fill="none" stroke="#F08A24" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M136 84 l18 18 M154 84 l-18 18" stroke="#C0392B" stroke-width="5" stroke-linecap="round"/>
</svg>`;

  // Barmoq izi kartasi
  const barmoq = () => `
<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barmoq izi">
  <rect x="8" y="8" width="104" height="114" rx="16" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="3.5"/>
  <path d="M60 36 q22 0 22 26 q0 26 -22 32" fill="none" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 36 q-22 0 -22 26 q0 26 22 32" fill="none" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 50 q12 1 12 14 q0 14 -12 18" fill="none" stroke="#8E5BD0" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 50 q-12 1 -12 14 q0 14 12 18" fill="none" stroke="#8E5BD0" stroke-width="5" stroke-linecap="round"/>
  <circle cx="60" cy="66" r="5" fill="#1A9E77"/>
</svg>`;

  // Sayt bazasi: silindr, ichida faqat izlar
  const baza = () => `
<svg viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sayt bazasi: faqat izlar saqlanadi">
  <path d="M25 26 v68 q0 14 50 14 q50 0 50 -14 v-68" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="3.5"/>
  <ellipse cx="75" cy="26" rx="50" ry="14" fill="#D8E6FB" stroke="#2B2B3A" stroke-width="3.5"/>
  <path d="M40 54 q10 -10 20 0 M40 66 q10 -10 20 0 M40 78 q10 -10 20 0" fill="none" stroke="#2F6FDE" stroke-width="4" stroke-linecap="round"/>
  <path d="M90 54 q10 -10 20 0 M90 66 q10 -10 20 0 M90 78 q10 -10 20 0" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { voronka, barmoq, baza };
})(window);
