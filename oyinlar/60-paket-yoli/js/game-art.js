// 60-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Pochta bo'limlari zanjiri: uch bino sim bilan ulangan, konvert yo'lda
  const pochta = () => `
<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pochta boʻlimlari sim bilan ulangan, konvert yoʻlda">
  <path d="M40 70 L110 40 L180 70" fill="none" stroke="#978B76" stroke-width="5" stroke-linecap="round"/>
  ${[[16, 52], [86, 22], [156, 52]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect width="48" height="40" rx="6" fill="#D8E6FB" stroke="#2B2B3A" stroke-width="3"/><path d="M-4 4 L24 -14 L52 4" fill="none" stroke="#2B2B3A" stroke-width="3.5" stroke-linejoin="round"/><rect x="18" y="18" width="12" height="22" fill="#2F6FDE"/></g>`).join("")}
  <g transform="translate(130 44) rotate(-20)"><rect width="26" height="17" rx="2" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2.5"/><path d="M0 0 l13 9 13 -9" fill="none" stroke="#2B2B3A" stroke-width="2"/></g>
</svg>`;

  const noutbuk = () => `
<svg viewBox="0 0 90 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="14" y="8" width="62" height="42" rx="4" fill="#D8E6FB" stroke="#2B2B3A" stroke-width="3.5"/>
  <path d="M6 56 h78 l-6 8 h-66 z" fill="#E8DCC2" stroke="#2B2B3A" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="45" cy="29" r="9" fill="#FFE9C7" stroke="#2B2B3A" stroke-width="2.5"/>
</svg>`;

  const server = () => `
<svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${[6, 30, 54].map((y) => `<rect x="8" y="${y}" width="54" height="20" rx="4" fill="#E7DBF7" stroke="#2B2B3A" stroke-width="3"/><circle cx="18" cy="${y + 10}" r="3.5" fill="#1A9E77"/><path d="M30 ${y + 10} h24" stroke="#8E5BD0" stroke-width="3" stroke-linecap="round"/>`).join("")}
</svg>`;

  // Sahifadagi rasm: tog' va quyosh
  const rasm = () => `
<svg viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="160" height="70" fill="#D8E6FB"/>
  <circle cx="128" cy="18" r="9" fill="#F0C040"/>
  <path d="M0 70 L46 22 L80 52 L104 34 L160 70 z" fill="#1A9E77"/>
  <path d="M46 22 l9 9 h-18 z" fill="#FFFFFF"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { pochta, noutbuk, server, rasm };
})(window);
