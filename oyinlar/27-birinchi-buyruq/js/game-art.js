// 27-o'yinga xos rasmlar (SVG, kod bilan chiziladi; ichida matn yo'q — QOIDALAR §6).
(function (root) {
  "use strict";

  // Kompyuter ekrani: ichida kod satrlari — ranglangan to'rtburchaklar
  const screen = () => `
<svg viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kompyuter ekranida kod">
  <rect x="14" y="10" width="192" height="126" rx="12" fill="#2B2B3A"/>
  <rect x="24" y="20" width="172" height="106" rx="7" fill="#FFFDF7"/>
  <rect x="36" y="34" width="44" height="9" rx="4.5" fill="#8E5BD0"/>
  <rect x="86" y="34" width="62" height="9" rx="4.5" fill="#1A9E77"/>
  <rect x="36" y="52" width="30" height="9" rx="4.5" fill="#2F6FDE"/>
  <rect x="72" y="52" width="48" height="9" rx="4.5" fill="#F08A24"/>
  <rect x="36" y="70" width="86" height="9" rx="4.5" fill="#1A9E77"/>
  <rect x="36" y="88" width="26" height="9" rx="4.5" fill="#D9D2C3"/>
  <rect x="68" y="88" width="12" height="9" rx="3" fill="#2B2B3A"/>
  <rect x="86" y="136" width="48" height="14" fill="#2B2B3A"/>
  <rect x="62" y="150" width="96" height="12" rx="6" fill="#2B2B3A"/>
</svg>`;

  // Ilon — hikoya uchun (Python nomi ilondan emasligini aytamiz, lekin belgisi tanish)
  const snake = () => `
<svg viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilon">
  <path d="M40 130 q0 -34 36 -34 h68 q28 0 28 -26 q0 -26 -28 -26 h-56"
        fill="none" stroke="#2F6FDE" stroke-width="22" stroke-linecap="round"/>
  <path d="M40 130 h34" fill="none" stroke="#F08A24" stroke-width="22" stroke-linecap="round"/>
  <circle cx="88" cy="44" r="15" fill="#2F6FDE"/>
  <circle cx="82" cy="40" r="3.4" fill="#FFFFFF"/>
  <circle cx="82" cy="40" r="1.6" fill="#2B2B3A"/>
  <path d="M74 50 q-10 4 -16 0" fill="none" stroke="#F08A24" stroke-width="3" stroke-linecap="round"/>
  <circle cx="150" cy="70" r="5" fill="#FFFDF7" opacity="0.5"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { screen, snake };
})(window);
