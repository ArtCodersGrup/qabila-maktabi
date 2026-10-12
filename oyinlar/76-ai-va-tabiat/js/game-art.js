// 76-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  const quti = (x, rang, och) => `
    <path d="M${x} 62 h44 l-5 46 h-34 z" fill="${och}" stroke="#1E2230" stroke-width="3" stroke-linejoin="round"/>
    <rect x="${x - 4}" y="54" width="52" height="9" rx="3" fill="${rang}" stroke="#1E2230" stroke-width="3"/>`;

  // Tasma ustidagi buyumlar va uchta quti: plastik, qog'oz, organik
  const kirish = () => `
<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chiqindi tasmadan uchta qutiga saralanadi: plastik, qogʻoz, organik">
  <rect x="10" y="30" width="220" height="8" rx="4" fill="#DAD6CB" stroke="#1E2230" stroke-width="2.5"/>
  <path d="M30 8 h10 v6 h4 v16 h-18 v-16 h4 z" fill="#E8EAF6" stroke="#1E2230" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M104 12 h26 v18 h-26 z M109 18 h16 M109 24 h10" fill="#FFF4CC" stroke="#1E2230" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M190 28 q-2 -16 14 -18 q4 12 -6 18 z" fill="#DDF3EA" stroke="#1E2230" stroke-width="2.5" stroke-linejoin="round"/>
  ${quti(14, "#33408A", "#E8EAF6")}${quti(98, "#F0C040", "#FFF4CC")}${quti(182, "#1A9E77", "#DDF3EA")}
  <g fill="none" stroke="#6A665C" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 5">
    <path d="M36 40 v10"/><path d="M120 40 v10"/><path d="M204 40 v10"/>
  </g>
</svg>`;

  // Barg va belgi: model sinovdan o'tdi
  const yakun = () => `
<svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Yashil barg va tasdiq belgisi">
  <path d="M24 96 q-8 -62 78 -76 q10 70 -54 80 q-14 2 -24 -4 z" fill="#DDF3EA" stroke="#1A9E77" stroke-width="4" stroke-linejoin="round"/>
  <path d="M26 100 q26 -36 62 -62" fill="none" stroke="#1A9E77" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="104" cy="88" r="22" fill="#FFFFFF" stroke="#1E2230" stroke-width="3.5"/>
  <path d="M93 88 l8 8 14 -16" fill="none" stroke="#1A9E77" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { kirish, yakun };
})(window);
