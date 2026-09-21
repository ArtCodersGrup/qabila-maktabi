// 15-o'yinga xos SVG rasmlar: daftar (kirish), kadr ikonkasi va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Varaqlari aylanayotgan daftar, chetida koptok
  const notebook = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <path d="M40 30 L150 22 L156 118 L46 126 Z" fill="#E9E2D3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M44 26 L152 16 L158 112 L50 120 Z" fill="#F4F1EA" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M48 22 L154 10 Q176 40 170 74 L62 92 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 40 L140 30 M62 54 L142 44 M64 68 L144 58" stroke="#C9C2B4" stroke-width="2"/>
  <circle cx="130" cy="86" r="8" fill="#E0524A" opacity="0.35"/>
  <circle cx="140" cy="72" r="8" fill="#E0524A" opacity="0.6"/>
  <circle cx="150" cy="62" r="9" fill="#E0524A" stroke="${INK}" stroke-width="2"/>
  <path d="M112 100 Q124 96 132 104" stroke="#8A929A" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

  // Bitta kadr (kinolenta bo'lagi) — mashqlarda "kadrlar" belgisi
  const frame = () => `<svg viewBox="0 0 40 34" aria-hidden="true">
  <rect x="1.5" y="1.5" width="37" height="31" rx="3" fill="${INK}"/>
  <path d="M6 5 h4 M18 5 h4 M30 5 h4 M6 29 h4 M18 29 h4 M30 29 h4" stroke="#FFF6E5" stroke-width="3"/>
  <rect x="6" y="9" width="28" height="16" rx="2" fill="#9FC6E8"/>
  <circle cx="16" cy="18" r="4" fill="#E0524A"/>
  <rect x="6" y="22" width="28" height="3" fill="#1A9E77"/>
</svg>`;

  const STORY = {
    // Kinolenta
    film: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="6" y="24" width="188" height="72" rx="4" fill="${INK}"/>
  <path d="M14 30 h8 M34 30 h8 M54 30 h8 M74 30 h8 M94 30 h8 M114 30 h8 M134 30 h8 M154 30 h8 M174 30 h8 M14 90 h8 M34 90 h8 M54 90 h8 M74 90 h8 M94 90 h8 M114 90 h8 M134 90 h8 M154 90 h8 M174 90 h8" stroke="#FFF6E5" stroke-width="5"/>
  <rect x="14" y="38" width="52" height="44" rx="3" fill="#9FC6E8"/>
  <rect x="74" y="38" width="52" height="44" rx="3" fill="#9FC6E8"/>
  <rect x="134" y="38" width="52" height="44" rx="3" fill="#9FC6E8"/>
  <rect x="24" y="56" width="16" height="16" fill="#F08A24"/>
  <rect x="92" y="56" width="16" height="16" fill="#F08A24"/>
  <rect x="160" y="56" width="16" height="16" fill="#F08A24"/>
</svg>`,
    // Karnay va tovush to'lqinlari
    speaker: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M40 46 H66 L100 20 V100 L66 74 H40 Z" fill="#8E5BD0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M116 42 Q128 60 116 78 M132 30 Q152 60 132 90 M148 18 Q176 60 148 102" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`,
    // Telefonda video va internet belgisi
    stream: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="30" y="16" width="120" height="84" rx="10" fill="${INK}"/>
  <rect x="38" y="24" width="104" height="68" rx="4" fill="#9FC6E8"/>
  <circle cx="90" cy="58" r="20" fill="#FFFFFF" opacity="0.9"/>
  <path d="M84 47 L101 58 L84 69 Z" fill="#E0524A"/>
  <path d="M160 40 Q176 30 192 40 M165 50 Q176 43 187 50" stroke="#1A9E77" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="176" cy="60" r="4" fill="#1A9E77"/>
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { notebook, frame, story });
})(window);
