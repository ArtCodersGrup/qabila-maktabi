// 53-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Robot noto'g'ri yo'ldan ketdi: iz chalkash, lupa xatoni ko'rsatadi
  const xato = () => `
<svg viewBox="0 0 170 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Xato yoʻl va lupa">
  <path d="M18 86 H60 V46 H96" fill="none" stroke="#D8CDB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M60 86 H104" fill="none" stroke="#1A9E77" stroke-width="5" stroke-linecap="round" stroke-dasharray="7 7"/>
  <rect x="86" y="34" width="24" height="24" rx="5" fill="#C0392B" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M92 40 l12 12 M104 40 l-12 12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="8" y="76" width="22" height="20" rx="5" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="15" cy="86" r="3" fill="#fff"/><circle cx="24" cy="86" r="3" fill="#fff"/>
  <circle cx="128" cy="52" r="20" fill="none" stroke="#8A8577" stroke-width="5"/>
  <path d="M143 67 L158 82" stroke="#8A8577" stroke-width="6" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { xato };
})(window);
