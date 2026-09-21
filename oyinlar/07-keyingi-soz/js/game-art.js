// 7-o'yinga xos SVG rasmlar: hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Millionlab kitob
  const books = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="24" y="86" width="152" height="12" rx="3" fill="#8A5A2B"/>
  <rect x="30" y="52" width="26" height="34" rx="3" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
  <rect x="58" y="42" width="26" height="44" rx="3" fill="#F08A24" stroke="${INK}" stroke-width="3"/>
  <rect x="86" y="58" width="26" height="28" rx="3" fill="#1A9E77" stroke="${INK}" stroke-width="3"/>
  <rect x="114" y="46" width="26" height="40" rx="3" fill="#8E5BD0" stroke="${INK}" stroke-width="3"/>
  <rect x="142" y="60" width="26" height="26" rx="3" fill="#E0524A" stroke="${INK}" stroke-width="3"/>
  <path d="M60 30 L100 14 L140 30 L100 40 Z" fill="#F4E3C3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

  // Robot javob yozmoqda: pufakda uchta nuqta (matn yo'q)
  const thinking = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="24" y="44" width="56" height="44" rx="12" fill="#B8C0C8" stroke="${INK}" stroke-width="3"/>
  <circle cx="42" cy="62" r="6" fill="#2F6FDE"/>
  <circle cx="62" cy="62" r="6" fill="#2F6FDE"/>
  <rect x="44" y="76" width="16" height="5" rx="2.5" fill="${INK}"/>
  <line x1="52" y1="44" x2="52" y2="34" stroke="${INK}" stroke-width="3"/>
  <circle cx="52" cy="31" r="4" fill="#F08A24" stroke="${INK}" stroke-width="2"/>
  <path d="M100 26 H184 a8 8 0 0 1 8 8 V66 a8 8 0 0 1 -8 8 H116 l-12 12 v-12 h-4 a8 8 0 0 1 -8 -8 V34 a8 8 0 0 1 8 -8 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="126" cy="50" r="5" fill="#8A929A"/>
  <circle cx="146" cy="50" r="5" fill="#8A929A"/>
  <circle cx="166" cy="50" r="5" fill="#8A929A"/>
</svg>`;

  // Odam javobni tekshiradi: lupa ostida yozuv satrlari
  const check = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="26" y="16" width="104" height="88" rx="8" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <rect x="40" y="34" width="70" height="7" rx="3.5" fill="#C9C1AF"/>
  <rect x="40" y="52" width="58" height="7" rx="3.5" fill="#C9C1AF"/>
  <rect x="40" y="70" width="66" height="7" rx="3.5" fill="#C9C1AF"/>
  <circle cx="132" cy="62" r="30" fill="rgba(47,111,222,0.12)" stroke="${INK}" stroke-width="4"/>
  <line x1="153" y1="84" x2="176" y2="106" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <path d="M120 62 L129 72 L146 52" stroke="#1A9E77" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const STORY = { books, thinking, check };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { story });
})(window);
