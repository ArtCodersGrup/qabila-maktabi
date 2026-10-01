// 54-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Kod varag'i → kompilyator → mashina kodi (chip): C++ shu yo'ldan o'tadi
  const ikkiTil = () => `
<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kod varagʻi kompilyatordan oʻtib mashina kodiga aylanadi">
  <rect x="8" y="16" width="62" height="78" rx="8" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M20 34 h30 M20 46 h38 M20 58 h24 M20 70 h34 M20 82 h20" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>
  <path d="M74 55 h22" stroke="#8A8577" stroke-width="5" stroke-linecap="round"/>
  <path d="M90 47 l9 8 l-9 8" fill="none" stroke="#8A8577" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="102" y="26" width="52" height="58" rx="10" fill="#F08A24" stroke="#2B2B3A" stroke-width="3.5"/>
  <circle cx="128" cy="55" r="15" fill="none" stroke="#2B2B3A" stroke-width="4"/>
  <path d="M128 40 v-6 M128 76 v-6 M113 55 h-6 M149 55 h-6" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round"/>
  <path d="M158 55 h22" stroke="#8A8577" stroke-width="5" stroke-linecap="round"/>
  <path d="M174 47 l9 8 l-9 8" fill="none" stroke="#8A8577" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="186" y="34" width="28" height="42" rx="6" fill="#1A9E77" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M186 44 h-7 M186 55 h-7 M186 66 h-7 M214 44 h7 M214 55 h7 M214 66 h7" stroke="#2B2B3A" stroke-width="3" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { ikkiTil };
})(window);
