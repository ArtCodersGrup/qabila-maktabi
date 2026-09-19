// 4-o'yinga xos SVG rasmlar: chiroq (holatlari) va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  // Holat ranglari: 0 — o'chiq, 1 — yoniq (sariq), 2 — ko'k
  const LAMP_COLORS = ["#D9D2C3", "#F0C040", "#2F6FDE"];

  // Chiroq: o'chiqda kulrang, yoniqda rangli va atrofida nur
  function lamp(state) {
    const fill = LAMP_COLORS[state];
    const glow = state ? `<circle class="lamp-glow" cx="30" cy="27" r="28" fill="${fill}" opacity="0.3"/>` : "";
    const wire = state ? "#FFFFFF" : "#A89F90";
    return `<svg class="lamp-svg" viewBox="0 0 60 72" data-state="${state}" aria-hidden="true">${glow}
  <path d="M30 5 C16 5 8 15 8 27 C8 36 14 41 18 47 L42 47 C46 41 52 36 52 27 C52 15 44 5 30 5 Z" fill="${fill}" stroke="${INK}" stroke-width="3"/>
  <path d="M23 36 L27 28 L30 34 L33 28 L37 36" stroke="${wire}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="19" y="49" width="22" height="8" rx="2" fill="#8A8A8A"/>
  <rect x="21" y="58" width="18" height="7" rx="2" fill="#6A6A6A"/>
</svg>`;
  }

  // Doira-chiroqlar qatori (hikoya rasmlari uchun)
  const dots = (states, x0, step, r) => states
    .map((s, k) => `<circle cx="${x0 + k * step}" cy="40" r="${r}" fill="${LAMP_COLORS[s]}" stroke="${INK}" stroke-width="2"/>`)
    .join("");

  const STORY = {
    // Tunda ikki tepalik va chiroqli ustunlar
    hills: `<svg viewBox="0 0 200 110" aria-hidden="true">
  <rect width="200" height="110" rx="8" fill="${INK}"/>
  <circle cx="170" cy="22" r="10" fill="#F4E3C3"/>
  <path d="M0 110 Q40 50 90 110 Z" fill="#3E7CB1"/>
  <path d="M100 110 Q150 40 200 110 Z" fill="#1A9E77"/>
  <rect x="42" y="62" width="4" height="22" fill="#8A5A2B"/>
  <circle cx="44" cy="58" r="6" fill="#F0C040"/>
  <rect x="150" y="54" width="4" height="22" fill="#8A5A2B"/>
  <circle cx="152" cy="50" r="6" fill="#F0C040"/>
  <path d="M56 56 Q98 30 140 50" stroke="#F0C040" stroke-width="2" stroke-dasharray="4 6" fill="none"/>
</svg>`,
    // Bitlar: yoniq/o'chiq chiroqlar
    bits: `<svg viewBox="0 0 200 80" aria-hidden="true">${dots([1, 0, 1, 1, 0, 1], 20, 32, 12)}</svg>`,
    // Bayt: 8 ta bit bir ramkada
    byte: `<svg viewBox="0 0 200 80" aria-hidden="true">
  <rect x="4" y="22" width="192" height="36" rx="10" fill="none" stroke="#8E5BD0" stroke-width="3"/>
  ${dots([0, 1, 0, 0, 0, 0, 0, 1], 16, 24, 9)}
</svg>`,
    // Piksel: qizil, yashil, ko'k kichik chiroqlar
    pixel: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="40" y="10" width="120" height="100" rx="8" fill="${INK}"/>
  <rect x="52" y="20" width="28" height="80" rx="4" fill="#E0524A"/>
  <rect x="86" y="20" width="28" height="80" rx="4" fill="#1A9E77"/>
  <rect x="120" y="20" width="28" height="80" rx="4" fill="#2F6FDE"/>
</svg>`,
    // Rangli ekran
    screen: `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="20" y="8" width="160" height="96" rx="8" fill="${INK}"/>
  <rect x="30" y="18" width="23" height="76" fill="#E0524A"/>
  <rect x="53" y="18" width="23" height="76" fill="#F08A24"/>
  <rect x="76" y="18" width="23" height="76" fill="#F0C040"/>
  <rect x="99" y="18" width="24" height="76" fill="#1A9E77"/>
  <rect x="123" y="18" width="23" height="76" fill="#2F6FDE"/>
  <rect x="146" y="18" width="24" height="76" fill="#8E5BD0"/>
  <rect x="90" y="104" width="20" height="14" fill="#6A6A6A"/>
  <rect x="70" y="118" width="60" height="8" rx="3" fill="#6A6A6A"/>
</svg>`,
  };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { lamp, story });
})(window);
