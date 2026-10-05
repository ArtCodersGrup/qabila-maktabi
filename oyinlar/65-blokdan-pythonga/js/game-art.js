// 65-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Ikki ko'rinish: chapda bloklar, o'ngda matn qatorlari (chiziqlar), o'rtada ikki tomonlama o'q, tepada robot
  const ikkiKorinish = () => `
<svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bloklar va Python matni — bitta dastur">
  <g>
    <rect x="10" y="34" width="74" height="70" rx="10" fill="#FFF3DF" stroke="#F08A24" stroke-width="3"/>
    <rect x="18" y="42" width="34" height="10" rx="4" fill="#F08A24"/>
    <rect x="26" y="58" width="22" height="18" rx="5" fill="#D8E6FB" stroke="#2F6FDE" stroke-width="2.5"/>
    <path d="M31 67 h11 m-4 -4 l4 4 l-4 4" fill="none" stroke="#1B4A94" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="18" y="82" width="22" height="18" rx="5" fill="#D8E6FB" stroke="#2F6FDE" stroke-width="2.5"/>
    <path d="M29 85 v10 m-4 -4 l4 4 l4 -4" fill="none" stroke="#1B4A94" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <path d="M94 69 h28" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round"/>
  <path d="M100 62 l-7 7 l7 7 M116 62 l7 7 l-7 7" fill="none" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g>
    <rect x="132" y="34" width="80" height="70" rx="10" fill="#23232F"/>
    <rect x="142" y="46" width="44" height="7" rx="3.5" fill="#F08A24"/>
    <rect x="156" y="62" width="34" height="7" rx="3.5" fill="#9CD3FF"/>
    <rect x="142" y="78" width="38" height="7" rx="3.5" fill="#9CD3FF"/>
    <rect x="142" y="92" width="18" height="5" rx="2.5" fill="#8F8A7E"/>
  </g>
  <g transform="translate(96 4)">
    <rect x="2" y="10" width="24" height="18" rx="6" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
    <circle cx="10" cy="19" r="3" fill="#fff"/><circle cx="18" cy="19" r="3" fill="#fff"/>
    <path d="M14 10 V4" stroke="#2B2B3A" stroke-width="2.5"/><circle cx="14" cy="3" r="3" fill="#F08A24" stroke="#2B2B3A" stroke-width="2"/>
  </g>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { ikkiKorinish };
})(window);
