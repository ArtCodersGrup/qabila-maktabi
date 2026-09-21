// 5-o'yinga xos SVG rasmlar: tosh lavha va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q (yozuvlar HTML'da).
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Tosh lavha: o'rtasi silliq — ustiga HTML yozuv qo'yiladi
  const stone = () => `<svg class="stone-svg" viewBox="0 0 240 150" aria-hidden="true">
  <path d="M20 28 Q16 8 40 8 L198 4 Q228 4 230 30 L236 120 Q238 144 210 144 L34 146 Q6 146 8 118 Z" fill="#A9A08E" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M34 26 L204 22 Q216 22 217 34 L220 112 Q220 126 206 126 L42 128 Q28 128 28 114 Z" fill="#C9C1AF"/>
  <path d="M206 36 L196 50 L204 58" stroke="#857C6B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 116 L54 106 L60 110" stroke="#857C6B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 134 Q30 142 46 138" stroke="#6E9E4B" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`;

  // Hisob taxtasi (abak): ramka, 4 ta tayoqcha va toshchalar
  function abacus() {
    const colors = ["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"];
    const left = [3, 1, 4, 2];
    let rods = "";
    [34, 56, 78, 100].forEach((y, i) => {
      rods += `<line x1="20" y1="${y}" x2="180" y2="${y}" stroke="#6A4A2B" stroke-width="3"/>`;
      for (let k = 0; k < left[i]; k++) {
        rods += `<circle cx="${36 + k * 18}" cy="${y}" r="8" fill="${colors[i]}" stroke="${INK}" stroke-width="2"/>`;
      }
      for (let k = 0; k < 4 - left[i]; k++) {
        rods += `<circle cx="${164 - k * 18}" cy="${y}" r="8" fill="${colors[i]}" stroke="${INK}" stroke-width="2"/>`;
      }
    });
    return `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="8" y="8" width="184" height="114" rx="10" fill="#8A5A2B"/>
  <rect x="20" y="20" width="160" height="90" rx="4" fill="#F4E3C3"/>
  ${rods}
</svg>`;
  }

  // Hindistondan kelgan qo'lyozma: palma bargi, ipi va yozuv chiziqlari
  const scroll = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="10" y="26" width="180" height="60" rx="16" fill="#E8C98A" stroke="${INK}" stroke-width="3"/>
  <path d="M26 44 q7 -8 14 0 t14 0 t14 0 t14 0" stroke="#8A5A2B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M26 58 q7 -8 14 0 t14 0 t14 0 t14 0 t14 0 t14 0" stroke="#8A5A2B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M26 72 q7 -8 14 0 t14 0 t14 0" stroke="#8A5A2B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="150" cy="56" r="5" fill="${INK}"/>
  <path d="M150 61 Q150 96 132 108" stroke="#B0412E" stroke-width="3" fill="none"/>
</svg>`;

  // Olim: salla, soqol, kitob; orqada deraza va yulduz
  const scholar = `<svg viewBox="0 0 200 150" aria-hidden="true">
  <path d="M18 146 L18 62 Q18 26 48 26 Q78 26 78 62 L78 146 Z" fill="#2B4C7E"/>
  <circle cx="48" cy="58" r="9" fill="#F0C040"/>
  <path d="M80 148 Q84 96 120 90 Q156 96 160 148 Z" fill="#1A9E77" stroke="${INK}" stroke-width="3"/>
  <circle cx="120" cy="64" r="20" fill="#E8B98A" stroke="${INK}" stroke-width="3"/>
  <path d="M102 68 Q120 102 138 68 Q130 80 120 80 Q110 80 102 68 Z" fill="#6B4E3D"/>
  <path d="M98 58 Q98 34 120 34 Q142 34 142 58 Q120 48 98 58 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <circle cx="113" cy="62" r="2.5" fill="${INK}"/>
  <circle cx="127" cy="62" r="2.5" fill="${INK}"/>
  <path d="M92 116 L120 122 L148 116 L148 136 L120 142 L92 136 Z" fill="#F4E3C3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M120 122 L120 142" stroke="${INK}" stroke-width="3"/>
</svg>`;

  // Kompyuter: ekranda qadamlar (rangli chiziqlar)
  const computer = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="30" y="8" width="140" height="88" rx="8" fill="${INK}"/>
  <rect x="40" y="18" width="120" height="68" rx="4" fill="#1E3A5F"/>
  <rect x="50" y="28" width="42" height="8" rx="4" fill="#F0C040"/>
  <rect x="60" y="44" width="62" height="8" rx="4" fill="#1A9E77"/>
  <rect x="60" y="58" width="46" height="8" rx="4" fill="#8FB8F0"/>
  <rect x="50" y="72" width="32" height="8" rx="4" fill="#F08A24"/>
  <rect x="90" y="96" width="20" height="12" fill="#6A6A6A"/>
  <rect x="40" y="108" width="120" height="16" rx="4" fill="#8A8A8A"/>
</svg>`;

  const STORY = { abacus: abacus(), scroll, scholar, computer };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { stone, story });
})(window);
