// 2-o'yinga xos SVG rasmlar: hikoya sahnalari. QK.art.story(name) sifatida qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const WOOD = "#8A5A2B";

  const STORY = {
    // Telegraf: taglik, kalit (richag), sim va ustun
    telegraph: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="10" y="84" width="104" height="18" rx="4" fill="${WOOD}"/>
  <rect x="22" y="74" width="16" height="10" fill="#C9C2B4"/>
  <path d="M30 72 L96 62" stroke="#C9C2B4" stroke-width="8" stroke-linecap="round"/>
  <circle cx="98" cy="60" r="9" fill="${INK}"/>
  <path d="M114 92 Q146 70 168 36" stroke="${INK}" stroke-width="3" fill="none"/>
  <rect x="164" y="24" width="8" height="90" fill="${WOOD}"/>
  <rect x="150" y="30" width="36" height="6" rx="2" fill="${WOOD}"/>
  <path d="M168 36 L200 30" stroke="${INK}" stroke-width="3"/>
</svg>`,
    // Kema: ikki yelkan, korpus, to'lqinlar
    ship: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="96" y="14" width="6" height="58" fill="${WOOD}"/>
  <path d="M102 18 L150 64 L102 64 Z" fill="#FFFFFF" stroke="#C9C2B4" stroke-width="2"/>
  <path d="M96 24 L60 64 L96 64 Z" fill="#F4E3C3" stroke="#C9C2B4" stroke-width="2"/>
  <path d="M26 70 L174 70 L154 96 L46 96 Z" fill="#7A4E9A"/>
  <circle cx="70" cy="82" r="4" fill="#F4E3C3"/>
  <circle cx="100" cy="82" r="4" fill="#F4E3C3"/>
  <circle cx="130" cy="82" r="4" fill="#F4E3C3"/>
  <path d="M0 100 Q25 90 50 100 T100 100 T150 100 T200 100 V120 H0 Z" fill="#3E7CB1"/>
</svg>`,
    // Mayoq: .lamp guruhi "on" sinfi bilan yonadi (Morze chirog'i)
    lighthouse: `<svg viewBox="0 0 200 140" aria-hidden="true">
  <g class="lamp">
    <path class="lamp-light" d="M112 44 L200 18 L200 70 Z" fill="#F0C040"/>
    <path class="lamp-light" d="M88 44 L0 18 L0 70 Z" fill="#F0C040"/>
  </g>
  <path d="M78 134 L88 52 L112 52 L122 134 Z" fill="#FFFFFF" stroke="#C8553D" stroke-width="3"/>
  <rect x="84" y="76" width="32" height="10" fill="#C8553D"/>
  <rect x="81" y="104" width="38" height="10" fill="#C8553D"/>
  <rect x="86" y="36" width="28" height="16" rx="2" fill="${INK}"/>
  <circle cx="100" cy="44" r="6" fill="#F0C040"/>
  <path d="M84 36 L100 22 L116 36 Z" fill="#C8553D"/>
</svg>`,
    // Radio va samolyot
    radio: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="16" y="58" width="90" height="50" rx="8" fill="${WOOD}"/>
  <circle cx="44" cy="83" r="14" fill="#F4E3C3"/>
  <rect x="68" y="72" width="28" height="6" rx="3" fill="#F4E3C3"/>
  <rect x="68" y="86" width="28" height="6" rx="3" fill="#F4E3C3"/>
  <path d="M90 58 L108 18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <path d="M114 20 Q122 12 130 20 M110 12 Q122 0 134 12" stroke="#F08A24" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M136 52 L192 44 L188 52 L160 56 L150 74 L142 74 L148 57 L138 58 Z" fill="#3E7CB1"/>
</svg>`,
    // Ko'z
    eye: `<svg viewBox="0 0 200 100" aria-hidden="true">
  <path d="M16 50 Q100 -12 184 50 Q100 112 16 50 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="4"/>
  <circle cx="100" cy="50" r="22" fill="#3E7CB1"/>
  <circle cx="100" cy="50" r="10" fill="${INK}"/>
  <circle cx="107" cy="43" r="4" fill="#FFFFFF"/>
</svg>`,
  };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { story });
})(window);
