// Umumiy SVG rasmlar: qahramonlar, baraban, ikonkalar. O'yinga xos rasmlar — o'yinning game-art.js faylida.
// Hammasi SVG satr qaytaradi va DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const LETTER_COLORS = ["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"];
  const INK = "#2B2B3A";

  // Oqsoqol: tayoq, chopon, oq soqol, patli bosh bog'ich
  function elder() {
    return `<svg class="actor-svg" viewBox="0 0 120 150" aria-hidden="true">
  <g class="body">
    <rect x="14" y="40" width="6" height="108" rx="3" fill="#8A5A2B"/>
    <circle cx="17" cy="38" r="7" fill="#A8743F"/>
    <path d="M32 150 L40 88 Q60 78 80 88 L88 150 Z" fill="#7A4E9A"/>
    <path d="M56 84 L60 150 L64 84 Z" fill="#5E3A7A"/>
    <rect x="38" y="112" width="44" height="7" rx="3" fill="#E0B04A"/>
    <path d="M42 92 Q28 100 20 96" stroke="#7A4E9A" stroke-width="10" stroke-linecap="round" fill="none"/>
    <circle cx="19" cy="95" r="5" fill="#E2A77E"/>
    <g class="arm">
      <path d="M78 92 Q92 104 94 118" stroke="#7A4E9A" stroke-width="10" stroke-linecap="round" fill="none"/>
      <circle cx="94" cy="120" r="5" fill="#E2A77E"/>
    </g>
    <g class="head">
      <circle cx="60" cy="56" r="22" fill="#E2A77E"/>
      <path d="M40 58 Q42 98 60 100 Q78 98 80 58 Q72 70 60 70 Q48 70 40 58 Z" fill="#F4F1EA"/>
      <path d="M50 66 Q60 61 70 66" stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" fill="none"/>
      <ellipse class="mouth" cx="60" cy="72" rx="4" ry="2" fill="#7A3B2E"/>
      <g class="eyes">
        <ellipse cx="52" cy="53" rx="2.6" ry="3" fill="${INK}"/>
        <ellipse cx="68" cy="53" rx="2.6" ry="3" fill="${INK}"/>
      </g>
      <path d="M46 46 Q52 43 57 46 M63 46 Q68 43 74 46" stroke="#F4F1EA" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M37 42 Q60 24 83 42 L83 36 Q60 18 37 36 Z" fill="#C8553D"/>
      <path d="M78 34 Q92 12 86 4 Q80 18 73 32 Z" fill="#1A9E77"/>
    </g>
  </g>
</svg>`;
  }

  // Shogird: qog'oz ushlaydi; .pose-raise da qo'llar va qog'oz tepaga ko'tariladi (CSS)
  function apprentice() {
    return `<svg class="actor-svg" viewBox="0 0 120 150" aria-hidden="true">
  <g class="body">
    <path d="M38 150 L44 100 Q60 92 76 100 L82 150 Z" fill="#C8553D"/>
    <rect x="42" y="126" width="36" height="6" rx="3" fill="#8A5A2B"/>
    <g class="head">
      <circle cx="60" cy="74" r="20" fill="#C98B5E"/>
      <path d="M40 72 Q42 50 60 52 Q78 50 80 72 Q74 60 60 60 Q48 60 40 72 Z" fill="#3A2A1E"/>
      <g class="eyes">
        <ellipse cx="53" cy="74" rx="2.6" ry="3" fill="${INK}"/>
        <ellipse cx="67" cy="74" rx="2.6" ry="3" fill="${INK}"/>
      </g>
      <path class="mouth" d="M54 83 Q60 88 66 83" stroke="#7A3B2E" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    </g>
    <g class="arms-down">
      <path d="M46 104 Q38 112 37 122" stroke="#C8553D" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M74 104 Q82 112 83 122" stroke="#C8553D" stroke-width="9" stroke-linecap="round" fill="none"/>
    </g>
    <g class="arms-up">
      <path d="M46 104 Q34 76 37 30" stroke="#C8553D" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M74 104 Q86 76 83 30" stroke="#C8553D" stroke-width="9" stroke-linecap="round" fill="none"/>
    </g>
    <g class="paper">
      <rect x="34" y="104" width="52" height="38" rx="4" fill="#FFFFFF" stroke="#C9C2B4" stroke-width="2"/>
      <text class="paper-text" x="60" y="131" text-anchor="middle" font-size="22" font-weight="900" fill="${INK}"></text>
    </g>
    <g class="arms-down">
      <circle cx="37" cy="124" r="5" fill="#C98B5E"/>
      <circle cx="83" cy="124" r="5" fill="#C98B5E"/>
    </g>
    <g class="arms-up">
      <circle cx="37" cy="28" r="5" fill="#C98B5E"/>
      <circle cx="83" cy="28" r="5" fill="#C98B5E"/>
    </g>
  </g>
</svg>`;
  }

  function drum() {
    return `<svg class="drum" viewBox="0 0 100 80" aria-hidden="true">
  <path d="M14 20 L20 68 Q50 80 80 68 L86 20 Z" fill="#C8553D" stroke="#8A5A2B" stroke-width="3"/>
  <path d="M22 30 L34 66 M50 32 L50 72 M78 30 L66 66" stroke="#F4E3C3" stroke-width="3"/>
  <ellipse cx="50" cy="20" rx="36" ry="10" fill="#F4E3C3" stroke="#8A5A2B" stroke-width="3"/>
</svg>`;
  }

  const ICONS = {
    home: '<path d="M3 11 L12 3 L21 11 V21 H14 V15 H10 V21 H3 Z" fill="currentColor"/>',
    "sound-on": '<path d="M3 9 H7 L12 5 V19 L7 15 H3 Z" fill="currentColor"/><path d="M16 8 Q19 12 16 16 M18.5 5.5 Q23 12 18.5 18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
    "sound-off": '<path d="M3 9 H7 L12 5 V19 L7 15 H3 Z" fill="currentColor"/><path d="M16 9 L22 15 M22 9 L16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

  root.QK = root.QK || {};
  root.QK.art = { LETTER_COLORS, elder, apprentice, drum, icon };
})(window);
