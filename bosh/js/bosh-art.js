// Bosh sahifadagi o'yin ikonkalari (64×64 SVG). Matn yozilmaydi — faqat shakllar.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const svg = (body) => `<svg viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;

  // 1-o'yin: harf kartochkalaridan so'z yasash
  const kodlar = svg(`
  <rect x="3" y="10" width="26" height="26" rx="7" fill="#2F6FDE"/>
  <rect x="35" y="10" width="26" height="26" rx="7" fill="#F08A24"/>
  <rect x="19" y="30" width="26" height="26" rx="7" fill="#1A9E77" stroke="#FFF6E5" stroke-width="3"/>`);

  // 2-o'yin: Morze nuqta va chiziqlari
  const morze = svg(`
  <circle cx="11" cy="19" r="7" fill="#2F6FDE"/>
  <circle cx="29" cy="19" r="7" fill="#2F6FDE"/>
  <rect x="41" y="12" width="21" height="14" rx="7" fill="#F08A24"/>
  <rect x="3" y="38" width="21" height="14" rx="7" fill="#F08A24"/>
  <circle cx="37" cy="45" r="7" fill="#1A9E77"/>
  <circle cx="55" cy="45" r="7" fill="#8E5BD0"/>`);

  // 3-o'yin: Sezar g'ildiragi
  function sezar() {
    let ticks = "";
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const x1 = 32 + Math.sin(a) * 27;
      const y1 = 32 - Math.cos(a) * 27;
      const x2 = 32 + Math.sin(a) * 21;
      const y2 = 32 - Math.cos(a) * 21;
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    return svg(`
  <circle cx="32" cy="32" r="29" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  ${ticks}
  <circle cx="32" cy="32" r="17" fill="#8E5BD0"/>
  <path d="M32 18 L40 30 L24 30 Z" fill="#F08A24"/>`);
  }

  // 4-o'yin: chiroqlar (ikkitasi yoniq)
  function chiroq() {
    const bulb = (x, on) => `
  <circle cx="${x}" cy="26" r="13" fill="${on ? "#F0C040" : "#D9D2C3"}" stroke="${INK}" stroke-width="3"/>
  <rect x="${x - 6}" y="40" width="12" height="7" rx="2" fill="#8A8A8A"/>
  <rect x="${x - 4}" y="48" width="8" height="6" rx="2" fill="#6A6A6A"/>`;
    return svg(bulb(14, 1) + bulb(32, 0) + bulb(50, 1));
  }

  // 5-o'yin: toshdagi o'yilgan belgilar
  const rim = svg(`
  <path d="M7 15 Q6 7 14 7 L51 5 Q59 5 59 13 L61 50 Q61 58 53 58 L13 59 Q5 59 5 51 Z" fill="#C9C1AF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 22 L16 42 M24 22 L24 42 M32 22 L32 42" stroke="#857C6B" stroke-width="4" stroke-linecap="round"/>
  <path d="M41 22 L47 42 L53 22" stroke="#857C6B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`);

  // 6-o'yin: robot boshi
  const robot = svg(`
  <line x1="32" y1="14" x2="32" y2="6" stroke="${INK}" stroke-width="3"/>
  <circle cx="32" cy="5" r="4" fill="#F08A24" stroke="${INK}" stroke-width="2"/>
  <rect x="10" y="14" width="44" height="34" rx="10" fill="#B8C0C8" stroke="${INK}" stroke-width="3"/>
  <circle cx="23" cy="29" r="6" fill="#2F6FDE"/>
  <circle cx="41" cy="29" r="6" fill="#2F6FDE"/>
  <rect x="24" y="39" width="16" height="5" rx="2.5" fill="${INK}"/>
  <rect x="18" y="50" width="28" height="10" rx="4" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>`);

  const ICONS = { kodlar, morze, sezar: sezar(), chiroq: chiroq(), rim, robot };

  // Ikonka; noma'lum nom — bo'sh satr
  const icon = (name) => ICONS[name] || "";

  root.QK = root.QK || {};
  root.QK.boshArt = { icon };
})(window);
