// 10-o'yinga xos SVG rasmlar: hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Telefon kamerasi yuzni topadi
  const camera = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="56" y="6" width="88" height="108" rx="12" fill="#2B2B3A"/>
  <rect x="64" y="16" width="72" height="88" rx="6" fill="#DCE8FA"/>
  <circle cx="100" cy="52" r="18" fill="#E2A77E" stroke="${INK}" stroke-width="2"/>
  <path d="M84 44 Q100 30 116 44 Q100 38 84 44 Z" fill="#4A3B2E"/>
  <circle cx="94" cy="52" r="2.2" fill="${INK}"/>
  <circle cx="106" cy="52" r="2.2" fill="${INK}"/>
  <path d="M82 72 Q100 84 118 72 L118 96 L82 96 Z" fill="#1A9E77"/>
  <path d="M76 34 h12 M76 34 v12 M124 34 h-12 M124 34 v12 M76 82 h12 M76 82 v-12 M124 82 h-12 M124 82 v-12" stroke="#F08A24" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

  // Yo'l belgisi va mashina
  const roadsign = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="0" y="96" width="200" height="24" fill="#8A929A"/>
  <path d="M10 108 h30 M60 108 h30 M110 108 h30 M160 108 h30" stroke="#FFFFFF" stroke-width="4"/>
  <rect x="44" y="52" width="6" height="46" fill="#8A929A"/>
  <circle cx="47" cy="38" r="26" fill="#E0524A" stroke="#FFFFFF" stroke-width="5"/>
  <rect x="33" y="33" width="28" height="9" rx="2" fill="#FFFFFF"/>
  <path d="M112 92 L120 66 h44 l10 26 z" fill="#2F6FDE" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="124" y="70" width="18" height="16" rx="3" fill="#DCE8FA"/>
  <rect x="146" y="70" width="18" height="16" rx="3" fill="#DCE8FA"/>
  <circle cx="126" cy="94" r="8" fill="${INK}"/>
  <circle cx="166" cy="94" r="8" fill="${INK}"/>
</svg>`;

  // Rentgen rasmi va lupa
  const xray = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="26" y="8" width="100" height="104" rx="8" fill="#1E3A5F" stroke="${INK}" stroke-width="3"/>
  <path d="M76 24 v72" stroke="#9FC6E8" stroke-width="5"/>
  <path d="M56 40 q20 -12 40 0 M52 56 q24 -10 48 0 M56 72 q20 -8 40 0" stroke="#9FC6E8" stroke-width="4" fill="none"/>
  <circle cx="92" cy="60" r="7" fill="#F08A24"/>
  <circle cx="140" cy="60" r="28" fill="rgba(47,111,222,0.12)" stroke="${INK}" stroke-width="4"/>
  <line x1="160" y1="80" x2="182" y2="102" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
</svg>`;

  const STORY = { camera, roadsign, xray };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { story });
})(window);
