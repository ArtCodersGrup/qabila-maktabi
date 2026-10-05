// 64-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6): robot va uning xotira qutisi (sanoq chiziqlari).
(function (root) {
  "use strict";

  // Robot yo'lakda toshgacha yuradi; tepada — xotira qutisi, ichida sanoq chiziqlari
  const robot = () => `
<svg viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Robot va xotira qutisi">
  <path d="M20 88 H140" stroke="#D8CDB4" stroke-width="10" stroke-linecap="round"/>
  <g fill="#B9AFA0"><circle cx="58" cy="88" r="4"/><circle cx="82" cy="88" r="4"/><circle cx="106" cy="88" r="4"/></g>
  <rect x="140" y="72" width="28" height="28" rx="7" fill="#8A8577" stroke="#2B2B3A" stroke-width="3"/>
  <g>
    <rect x="16" y="64" width="30" height="26" rx="7" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>
    <circle cx="25" cy="76" r="4" fill="#fff"/><circle cx="37" cy="76" r="4" fill="#fff"/>
    <path d="M31 64 V54" stroke="#2B2B3A" stroke-width="3"/><circle cx="31" cy="51" r="4" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  </g>
  <path d="M44 46 C 54 40, 60 34, 66 30" fill="none" stroke="#2B2B3A" stroke-width="2.5" stroke-dasharray="4 4" stroke-linecap="round"/>
  <rect x="66" y="8" width="70" height="34" rx="8" fill="#FFF4CC" stroke="#F0C040" stroke-width="3"/>
  <g stroke="#2B2B3A" stroke-width="4" stroke-linecap="round">
    <path d="M82 16 V34"/><path d="M94 16 V34"/><path d="M106 16 V34"/>
  </g>
  <path d="M118 18 V32" stroke="#1A9E77" stroke-width="4" stroke-linecap="round"/>
  <path d="M112 25 H124" stroke="#1A9E77" stroke-width="4" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { robot };
})(window);
