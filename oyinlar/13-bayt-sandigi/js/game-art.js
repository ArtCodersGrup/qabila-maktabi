// 13-o'yinga xos SVG rasmlar: kompyuter, sandiq (8 bit), sahifa va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const ON = "#F0C040";
  const OFF = "#D9D2C3";

  // Qabilaga kelgan kompyuter: ekran, klaviatura
  const computer = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="40" y="8" width="120" height="84" rx="8" fill="${INK}"/>
  <rect x="50" y="18" width="100" height="64" rx="4" fill="#DCE8FA"/>
  <circle cx="72" cy="42" r="6" fill="${ON}" stroke="${INK}" stroke-width="2"/>
  <circle cx="90" cy="42" r="6" fill="${OFF}" stroke="${INK}" stroke-width="2"/>
  <circle cx="108" cy="42" r="6" fill="${ON}" stroke="${INK}" stroke-width="2"/>
  <circle cx="126" cy="42" r="6" fill="${ON}" stroke="${INK}" stroke-width="2"/>
  <rect x="66" y="60" width="68" height="6" rx="3" fill="#9FB6D8"/>
  <rect x="92" y="92" width="16" height="14" fill="#8A929A"/>
  <rect x="70" y="104" width="60" height="6" rx="3" fill="#8A929A"/>
  <rect x="24" y="116" width="152" height="20" rx="5" fill="#CED6DC" stroke="${INK}" stroke-width="2"/>
  <path d="M34 122 h10 M50 122 h10 M66 122 h10 M82 122 h10 M98 122 h10 M114 122 h10 M130 122 h10 M146 122 h10 M60 130 h80" stroke="#8A929A" stroke-width="4" stroke-linecap="round"/>
</svg>`;

  // Sandiq (bayt): yog'och quti, qopqog'i va 8 ta bit-doira. bits — "01000001" kabi satr
  function chest(bits) {
    const dots = [...bits].map((b, k) =>
      `<circle cx="${17 + k * 12.3}" cy="44" r="4.6" fill="${b === "1" ? ON : OFF}" stroke="${INK}" stroke-width="1.5"/>`).join("");
    return `<svg class="chest-svg" viewBox="0 0 120 64" aria-hidden="true">
  <path d="M6 20 Q60 2 114 20 L114 26 L6 26 Z" fill="#A8743F" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="6" y="26" width="108" height="34" rx="5" fill="#C98B5E" stroke="${INK}" stroke-width="2.5"/>
  <rect x="10" y="36" width="100" height="16" rx="8" fill="#FFF6E5"/>
  ${dots}
  <rect x="55" y="18" width="10" height="12" rx="2" fill="#E0B04A" stroke="${INK}" stroke-width="2"/>
</svg>`;
  }

  // Kitob sahifasi (kichik ikonka)
  const page = () => `<svg viewBox="0 0 40 50" aria-hidden="true">
  <path d="M4 3 H28 L36 11 V47 H4 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M28 3 V11 H36" fill="#E9E2D3" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M10 18 H30 M10 25 H30 M10 32 H30 M10 39 H22" stroke="#9FB6D8" stroke-width="3" stroke-linecap="round"/>
</svg>`;

  const STORY = {
    // Telefon va qisqa xabar pufagi
    sms: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="30" y="6" width="64" height="108" rx="10" fill="${INK}"/>
  <rect x="36" y="16" width="52" height="86" rx="4" fill="#DCE8FA"/>
  <rect x="42" y="26" width="38" height="16" rx="8" fill="#FFFFFF"/>
  <rect x="50" y="48" width="32" height="16" rx="8" fill="#1A9E77"/>
  <path d="M108 30 H182 Q190 30 190 38 V70 Q190 78 182 78 H134 L120 92 L122 78 H108 Q100 78 100 70 V38 Q100 30 108 30 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M114 46 H176 M114 60 H160" stroke="#9FB6D8" stroke-width="5" stroke-linecap="round"/>
</svg>`,
    // Qalin kitob
    book: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M40 24 L150 14 L170 30 L60 40 Z" fill="#F4F1EA" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 40 L170 30 L170 92 L60 104 Z" fill="#E9E2D3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M64 50 L166 40 M64 60 L166 50 M64 70 L166 60 M64 80 L166 70 M64 90 L166 80" stroke="#C9C2B4" stroke-width="2"/>
  <path d="M40 24 L60 40 L60 104 L40 88 Z" fill="#C8553D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M46 44 L54 50 M46 60 L54 66 M46 76 L54 82" stroke="#E0B04A" stroke-width="3" stroke-linecap="round"/>
</svg>`,
    // Kulgich (emoji) va kattaroq sandiqlar
    emoji: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <circle cx="60" cy="60" r="40" fill="${ON}" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="46" cy="50" rx="5" ry="7" fill="${INK}"/>
  <ellipse cx="74" cy="50" rx="5" ry="7" fill="${INK}"/>
  <path d="M40 70 Q60 92 80 70" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="120" y="18" width="60" height="18" rx="5" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
  <rect x="120" y="42" width="60" height="18" rx="5" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
  <rect x="120" y="66" width="60" height="18" rx="5" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
  <rect x="120" y="90" width="60" height="18" rx="5" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
</svg>`,
  };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { computer, chest, page, story });
})(window);
