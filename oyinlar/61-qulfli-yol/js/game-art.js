// 61-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  const qulf = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="2.5" fill="#1A9E77"/><path d="M8 10 V7 a4 4 0 0 1 8 0 V10" fill="none" stroke="#137A58" stroke-width="2.6"/><circle cx="12" cy="16" r="1.8" fill="#FFFFFF"/></svg>`;
  const ogoh = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 L22 21 H2 Z" fill="#F08A24" stroke="#B4560C" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9 v6" stroke="#2B2B3A" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="18" r="1.3" fill="#2B2B3A"/></svg>`;
  const ochiq = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="20" height="14" rx="2" fill="#FFF4CC" stroke="#2B2B3A" stroke-width="1.8"/><path d="M2 8 l10 -5 10 5" fill="none" stroke="#2B2B3A" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  const koz = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12 q10 -10 20 0 q-10 10 -20 0 z" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="1.8"/><circle cx="12" cy="12" r="3.6" fill="#2F6FDE"/></svg>`;

  // Kirish: uydan saytga yo'l, yo'lda ko'zli tugunlar
  const yolRasm = () => `
<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Xabar uydan saytga koʻp tugun orqali boradi">
  <path d="M30 60 H190" stroke="#978B76" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 12"/>
  <path d="M8 56 l20 -18 20 18 v30 h-40 z" fill="#FFE9C7" stroke="#2B2B3A" stroke-width="3" stroke-linejoin="round"/>
  <rect x="172" y="34" width="40" height="52" rx="5" fill="#E7DBF7" stroke="#2B2B3A" stroke-width="3"/>
  ${[72, 110, 148].map((x) => `<g transform="translate(${x - 13} 47)"><circle cx="13" cy="13" r="15" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2.5"/><path d="M3 13 q10 -9 20 0 q-10 9 -20 0 z" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="1.8"/><circle cx="13" cy="13" r="3.4" fill="#2F6FDE"/></g>`).join("")}
</svg>`;

  const qulfKatta = () => `
<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qulf">
  <path d="M34 56 V38 a26 26 0 0 1 52 0 V56" fill="none" stroke="#137A58" stroke-width="10"/>
  <rect x="18" y="54" width="84" height="66" rx="12" fill="#1A9E77" stroke="#2B2B3A" stroke-width="3.5"/>
  <circle cx="60" cy="82" r="9" fill="#FFFFFF"/><rect x="56" y="86" width="8" height="18" rx="3" fill="#FFFFFF"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { qulf, ogoh, ochiq, koz, yolRasm, qulfKatta };
})(window);
