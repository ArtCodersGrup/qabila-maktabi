// 50-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Qulf va kalit o'rnida belgilar qatori
  const qulf = () => `
<svg viewBox="0 0 170 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qulf va parol belgilari">
  <path d="M55 48 v-12 a20 20 0 0 1 40 0 v12" fill="none" stroke="#8A8577" stroke-width="9" stroke-linecap="round"/>
  <rect x="38" y="46" width="74" height="54" rx="10" fill="#F08A24" stroke="#2B2B3A" stroke-width="3.5"/>
  <circle cx="75" cy="68" r="8" fill="#2B2B3A"/>
  <path d="M75 72 v14" stroke="#2B2B3A" stroke-width="5" stroke-linecap="round"/>
  <circle cx="128" cy="30" r="7" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="146" cy="46" r="7" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="128" cy="62" r="7" fill="#8E5BD0" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="146" cy="78" r="7" fill="#C0392B" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M14 30 h12 M14 50 h12 M14 70 h12" stroke="#D8CDB4" stroke-width="5" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { qulf };
})(window);
