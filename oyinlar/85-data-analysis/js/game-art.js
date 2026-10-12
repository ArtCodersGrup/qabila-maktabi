// «Maʼlumot tahlili» oʻyiniga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Uch diagramma: ustunli, chiziqli, nuqtali
  const kirish = () => `
<svg viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Uch xil diagramma: ustunli, chiziqli va nuqtali">
  <g stroke="#1E2230" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" fill="none">
    <rect x="6" y="8" width="88" height="74" rx="8" fill="#FFFFFF"/>
    <rect x="106" y="8" width="88" height="74" rx="8" fill="#FFFFFF"/>
    <rect x="206" y="8" width="88" height="74" rx="8" fill="#FFFFFF"/>
    <path d="M18 70 h64 M118 70 h64 M218 70 h64 M218 70 v-52"/>
  </g>
  <rect x="24" y="46" width="12" height="24" fill="#33408A"/><rect x="44" y="28" width="12" height="42" fill="#F08A24"/><rect x="64" y="38" width="12" height="32" fill="#1A9E77"/>
  <path d="M122 60 l14 -18 14 8 14 -24 14 10" fill="none" stroke="#33408A" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <g fill="#33408A"><circle cx="122" cy="60" r="3.5"/><circle cx="136" cy="42" r="3.5"/><circle cx="150" cy="50" r="3.5"/><circle cx="164" cy="26" r="3.5"/><circle cx="178" cy="36" r="3.5"/></g>
  <g fill="#8E5BD0"><circle cx="228" cy="60" r="4"/><circle cx="238" cy="52" r="4"/><circle cx="246" cy="56" r="4"/><circle cx="254" cy="42" r="4"/><circle cx="264" cy="38" r="4"/><circle cx="272" cy="26" r="4"/></g>
</svg>`;

  // Diagramma ustida lupa: xulosani tekshirib qabul qilish
  const yakun = () => `
<svg viewBox="0 0 140 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagramma lupa ostida">
  <rect x="10" y="14" width="96" height="76" rx="8" fill="#FFFFFF" stroke="#1E2230" stroke-width="3"/>
  <path d="M22 78 h72" stroke="#1E2230" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="28" y="54" width="12" height="24" fill="#33408A"/><rect x="48" y="36" width="12" height="42" fill="#F08A24"/><rect x="68" y="46" width="12" height="32" fill="#1A9E77"/>
  <circle cx="96" cy="62" r="22" fill="#E8EAF6" fill-opacity="0.85" stroke="#1E2230" stroke-width="3.5"/>
  <path d="M112 78 l18 18" stroke="#1E2230" stroke-width="6" stroke-linecap="round"/>
  <path d="M86 62 l7 8 13 -15" fill="none" stroke="#1A9E77" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { kirish, yakun };
})(window);
