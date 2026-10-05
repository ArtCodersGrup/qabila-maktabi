// 62-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Bir xil do'nglik uch marta: yo'l, ustidagi ikki do'nglik to'q sariq (★ bo'lagi), robot va gulxan
  const yol = () => `
<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Robot va bir xil boʻlaklari bor yoʻl">
  <path d="M28 78 H52 V48 H84 V78 H104 V48 H136 V78 H146 V48 H178 V78 H196" fill="none" stroke="#D8CDB4" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M52 78 V48 H84 V78" fill="none" stroke="#F08A24" stroke-width="5" stroke-linejoin="round" stroke-dasharray="8 6"/>
  <path d="M104 78 V48 H136 V78" fill="none" stroke="#F08A24" stroke-width="5" stroke-linejoin="round" stroke-dasharray="8 6"/>
  <path d="M146 78 V48 H178 V78" fill="none" stroke="#F08A24" stroke-width="5" stroke-linejoin="round" stroke-dasharray="8 6"/>
  <path d="M68 22 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1 z" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
  <g>
    <rect x="10" y="62" width="30" height="26" rx="7" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>
    <circle cx="19" cy="74" r="4" fill="#fff"/><circle cx="31" cy="74" r="4" fill="#fff"/>
    <path d="M25 62 V52" stroke="#2B2B3A" stroke-width="3"/><circle cx="25" cy="49" r="4" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  </g>
  <g>
    <path d="M196 86 l-12 -6 M196 86 l12 -6" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/>
    <path d="M196 82 C 186 72, 192 64, 196 56 C 200 64, 206 72, 196 82 Z" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M196 80 C 192 75, 194 70, 196 66 C 198 70, 200 75, 196 80 Z" fill="#FFD25A"/>
  </g>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { yol };
})(window);
