// 75-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Katakli chizma → sonlar qatori (nuqtalar) → yorliq
  const kirish = () => `
<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Katakli chizma sonlarga aylanadi va model unga yorliq qoʻyadi">
  <rect x="8" y="15" width="80" height="80" rx="6" fill="#FFFFFF" stroke="#1E2230" stroke-width="3"/>
  <g fill="#1E2230">
    <rect x="38" y="25" width="20" height="10"/><rect x="28" y="35" width="10" height="10"/><rect x="58" y="35" width="10" height="10"/>
    <rect x="18" y="45" width="10" height="20"/><rect x="68" y="45" width="10" height="20"/>
    <rect x="28" y="65" width="10" height="10"/><rect x="58" y="65" width="10" height="10"/><rect x="38" y="75" width="20" height="10"/>
  </g>
  <path d="M96 55 h22 m-8 -8 l8 8 -8 8" fill="none" stroke="#33408A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g>
    <rect x="126" y="33" width="10" height="10" fill="#DAD6CB"/><rect x="138" y="33" width="10" height="10" fill="#1E2230"/><rect x="150" y="33" width="10" height="10" fill="#1E2230"/>
    <rect x="126" y="45" width="10" height="10" fill="#1E2230"/><rect x="138" y="45" width="10" height="10" fill="#DAD6CB"/><rect x="150" y="45" width="10" height="10" fill="#DAD6CB"/>
    <rect x="126" y="57" width="10" height="10" fill="#1E2230"/><rect x="138" y="57" width="10" height="10" fill="#DAD6CB"/><rect x="150" y="57" width="10" height="10" fill="#1E2230"/>
    <rect x="126" y="69" width="10" height="10" fill="#DAD6CB"/><rect x="138" y="69" width="10" height="10" fill="#1E2230"/><rect x="150" y="69" width="10" height="10" fill="#DAD6CB"/>
  </g>
  <path d="M168 55 h22 m-8 -8 l8 8 -8 8" fill="none" stroke="#33408A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M198 38 h26 l10 17 -10 17 h-26 z" fill="#DDF3EA" stroke="#1A9E77" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="213" cy="55" r="8" fill="none" stroke="#1E2230" stroke-width="3"/>
</svg>`;

  // Lupa ostida chizma: model topdi
  const topildi = () => `
<svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lupa ostidagi chizma tanildi">
  <rect x="14" y="14" width="72" height="72" rx="6" fill="#FFFFFF" stroke="#1E2230" stroke-width="3"/>
  <g fill="#1E2230">
    <rect x="23" y="23" width="54" height="9"/><rect x="23" y="68" width="54" height="9"/>
    <rect x="23" y="32" width="9" height="36"/><rect x="68" y="32" width="9" height="36"/>
  </g>
  <circle cx="84" cy="70" r="26" fill="#E8EAF6" fill-opacity="0.7" stroke="#33408A" stroke-width="5"/>
  <path d="M103 90 l22 22" stroke="#33408A" stroke-width="8" stroke-linecap="round"/>
  <path d="M72 70 l9 9 16 -18" fill="none" stroke="#1A9E77" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { kirish, topildi };
})(window);
