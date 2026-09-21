// 18-o'yinga xos SVG rasmlar: bozor rastasi (kirish) va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const coin = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#F0C040" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r * 0.6}" fill="none" stroke="#C98B2E" stroke-width="2"/>`;

  // Bozor rastasi: soyabon, peshtaxta, tangalar
  const market = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <path d="M20 40 L100 10 L180 40 Z" fill="#C8553D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M20 40 Q40 54 60 40 Q80 54 100 40 Q120 54 140 40 Q160 54 180 40" fill="#F4E3C3" stroke="${INK}" stroke-width="3"/>
  <rect x="30" y="44" width="6" height="80" fill="#8A5A2B"/>
  <rect x="164" y="44" width="6" height="80" fill="#8A5A2B"/>
  <rect x="24" y="92" width="152" height="36" rx="4" fill="#A8743F" stroke="${INK}" stroke-width="3"/>
  ${coin(60, 82, 11)}${coin(92, 84, 8)}${coin(118, 85, 6)}${coin(140, 86, 4.5)}
</svg>`;

  const STORY = {
    // Rang palitrasi: to'q sariq rang
    paint: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M100 10 C150 10 188 40 188 70 C188 92 168 100 150 92 C136 86 128 96 132 108 C136 118 120 116 100 116 C50 116 12 92 12 62 C12 32 50 10 100 10 Z" fill="#F4E3C3" stroke="${INK}" stroke-width="3"/>
  <circle cx="58" cy="44" r="14" fill="#FF8800" stroke="${INK}" stroke-width="2"/>
  <circle cx="98" cy="34" r="12" fill="#E0524A" stroke="${INK}" stroke-width="2"/>
  <circle cx="136" cy="44" r="12" fill="#1A9E77" stroke="${INK}" stroke-width="2"/>
  <circle cx="52" cy="82" r="12" fill="#2F6FDE" stroke="${INK}" stroke-width="2"/>
  <circle cx="90" cy="88" r="10" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
</svg>`,
    // Teskari yo'l: o'q ikki tomonga
    arrows: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="14" y="36" width="56" height="48" rx="10" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <rect x="130" y="36" width="56" height="48" rx="10" fill="#F0C040" stroke="${INK}" stroke-width="3"/>
  <path d="M78 50 H120 M110 40 L122 50 L110 60" stroke="#2F6FDE" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M122 72 H80 M90 62 L78 72 L90 82" stroke="#F08A24" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { market, story });
})(window);
