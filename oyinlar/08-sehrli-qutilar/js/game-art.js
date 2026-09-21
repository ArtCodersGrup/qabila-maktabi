// 8-o'yinga xos SVG rasmlar: tosh, quti va hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const WOOD = "#C9945A";

  // Tosh
  const stone = () => `<svg viewBox="0 0 40 32" aria-hidden="true">
  <path d="M4 22 Q2 10 14 6 Q26 1 34 8 Q40 14 36 22 Q30 30 18 30 Q8 30 4 22 Z" fill="#B5AFA1" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M12 12 Q18 9 24 12" stroke="#D6D0C2" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

  // Quti: "closed" — yopiq, "open" — tortmasi chiqqan
  function box(state) {
    if (state === "open") {
      return `<svg viewBox="0 0 80 56" aria-hidden="true">
  <rect x="4" y="16" width="52" height="34" rx="5" fill="#F4E3C3" stroke="${INK}" stroke-width="3"/>
  <rect x="26" y="6" width="50" height="34" rx="5" fill="${WOOD}" stroke="${INK}" stroke-width="3"/>
  <rect x="34" y="14" width="34" height="18" rx="3" fill="#B07A44"/>
</svg>`;
    }
    return `<svg viewBox="0 0 80 56" aria-hidden="true">
  <rect x="8" y="8" width="64" height="40" rx="6" fill="${WOOD}" stroke="${INK}" stroke-width="3"/>
  <rect x="18" y="18" width="44" height="20" rx="4" fill="#B07A44"/>
</svg>`;
  }

  // 1961-yildagi mashina: ko'p gugurt qutisi
  function matchboxes() {
    let out = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        out += `<rect x="${16 + c * 34}" y="${16 + r * 30}" width="30" height="24" rx="4" fill="${WOOD}" stroke="${INK}" stroke-width="2.5"/>`;
        out += `<rect x="${22 + c * 34}" y="${22 + r * 30}" width="18" height="12" rx="2" fill="#B07A44"/>`;
      }
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">${out}</svg>`;
  }

  // O'yin taxtasi (shaxmat/Go)
  function board() {
    let cells = "";
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        cells += `<rect x="${28 + c * 24}" y="${10 + r * 16}" width="24" height="16" fill="${(r + c) % 2 ? "#E8DCC0" : "#C9B48E"}"/>`;
      }
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">
  ${cells}
  <rect x="28" y="10" width="144" height="96" fill="none" stroke="${INK}" stroke-width="3"/>
  <circle cx="64" cy="42" r="9" fill="${INK}"/>
  <circle cx="112" cy="74" r="9" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <circle cx="136" cy="42" r="9" fill="${INK}"/>
</svg>`;
  }

  // Yurishni o'rganayotgan robot
  const walker = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="80" y="30" width="44" height="34" rx="10" fill="#B8C0C8" stroke="${INK}" stroke-width="3"/>
  <circle cx="94" cy="46" r="5" fill="#2F6FDE"/>
  <circle cx="110" cy="46" r="5" fill="#2F6FDE"/>
  <rect x="88" y="66" width="28" height="26" rx="6" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>
  <path d="M88 92 L78 110 M116 92 L128 110" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 60 Q46 50 40 36" stroke="#8A929A" stroke-width="4" fill="none" stroke-dasharray="5 5" stroke-linecap="round"/>
  <path d="M144 60 Q158 50 164 36" stroke="#8A929A" stroke-width="4" fill="none" stroke-dasharray="5 5" stroke-linecap="round"/>
  <rect x="20" y="110" width="160" height="6" rx="3" fill="#C9B48E"/>
</svg>`;

  // Mukofot: qo'l yulduz beradi
  const star = `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M100 14 L114 52 L154 54 L122 78 L133 116 L100 94 L67 116 L78 78 L46 54 L86 52 Z" fill="#F0C040" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 108 Q44 92 62 96" stroke="#E2A77E" stroke-width="12" stroke-linecap="round" fill="none"/>
  <circle cx="66" cy="98" r="8" fill="#E2A77E" stroke="${INK}" stroke-width="2"/>
</svg>`;

  const STORY = { matchboxes: matchboxes(), board: board(), walker, star };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { stone, box, story });
})(window);
