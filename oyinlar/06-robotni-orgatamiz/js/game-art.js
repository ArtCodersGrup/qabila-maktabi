// 6-o'yinga xos SVG rasmlar: yong'oq (yopiq/to'la/bo'sh) va hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const METAL = "#B8C0C8";

  // Yong'oq: "closed" — yopiq, "full" — chaqilgan, mag'izli, "empty" — chaqilgan, bo'sh
  function nut(state) {
    if (state === "closed") {
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
  <ellipse cx="32" cy="35" rx="22" ry="24" fill="#A9743F" stroke="${INK}" stroke-width="3"/>
  <path d="M32 12 V58" stroke="#7A4E2A" stroke-width="3"/>
  <path d="M20 22 q10 12 0 24 M44 22 q-10 12 0 24" stroke="#7A4E2A" stroke-width="2.5" fill="none"/>
  <path d="M27 11 q5 -7 10 0" stroke="#6B4220" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;
    }
    const inside = state === "full"
      ? `<ellipse cx="32" cy="35" rx="10" ry="15" fill="#E8C98A" stroke="${INK}" stroke-width="2"/>
  <path d="M32 22 V48 M27 28 q5 7 0 14 M37 28 q-5 7 0 14" stroke="#C49A5A" stroke-width="2" fill="none"/>`
      : `<ellipse cx="32" cy="35" rx="10" ry="15" fill="none" stroke="#8A8A8A" stroke-width="2" stroke-dasharray="4 4"/>`;
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
  <ellipse cx="17" cy="35" rx="13" ry="23" fill="#A9743F" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="47" cy="35" rx="13" ry="23" fill="#A9743F" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="17" cy="35" rx="8" ry="17" fill="#C79763"/>
  <ellipse cx="47" cy="35" rx="8" ry="17" fill="#C79763"/>
  ${inside}
</svg>`;
  }

  // Mushuk boshi (hikoya rasmlari uchun)
  const catFace = (cx, cy, r, fur) => `
  <path d="M${cx - r * 0.75} ${cy - r * 0.45} L${cx - r * 0.4} ${cy - r * 1.25} L${cx + r * 0.05} ${cy - r * 0.75} Z" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <path d="M${cx + r * 0.75} ${cy - r * 0.45} L${cx + r * 0.4} ${cy - r * 1.25} L${cx - r * 0.05} ${cy - r * 0.75} Z" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <circle cx="${cx - r * 0.35}" cy="${cy - r * 0.12}" r="${r * 0.13}" fill="${INK}"/>
  <circle cx="${cx + r * 0.35}" cy="${cy - r * 0.12}" r="${r * 0.13}" fill="${INK}"/>
  <path d="M${cx} ${cy + r * 0.22} l${-r * 0.18} ${r * 0.2} M${cx} ${cy + r * 0.22} l${r * 0.18} ${r * 0.2}" stroke="${INK}" stroke-width="2" fill="none"/>`;

  // Ko'p misollar: kartochkalar to'ri
  function data() {
    const colors = ["#2F6FDE", "#1A9E77", "#F08A24", "#8E5BD0"];
    let cards = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        cards += `<rect x="${10 + c * 36}" y="${12 + r * 34}" width="30" height="28" rx="5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`;
        cards += `<circle cx="${25 + c * 36}" cy="${26 + r * 34}" r="8" fill="${colors[(r * 5 + c) % 4]}"/>`;
      }
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">${cards}</svg>`;
  }

  // Minglab mushuk rasmlari
  function cats() {
    let grid = "";
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) grid += catFace(30 + c * 47, 38 + r * 50, 15, "#F4F1EA");
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">${grid}</svg>`;
  }

  // Ma'lumotda faqat oq mushuklar — qora mushuk tanishsiz qoladi
  function biasCats() {
    let grid = "";
    for (let c = 0; c < 3; c++) grid += catFace(38 + c * 45, 42, 15, "#F4F1EA");
    return `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="10" y="12" width="140" height="62" rx="10" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="6 5"/>
  ${grid}
  ${catFace(170, 95, 16, "#4A4A55")}
</svg>`;
  }

  // Muhim qarorni odam qabul qiladi
  const human = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="120" y="54" width="46" height="40" rx="8" fill="${METAL}" stroke="${INK}" stroke-width="3"/>
  <rect x="130" y="36" width="26" height="22" rx="6" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>
  <circle cx="137" cy="47" r="3" fill="#2F6FDE"/>
  <circle cx="149" cy="47" r="3" fill="#2F6FDE"/>
  <line x1="143" y1="36" x2="143" y2="28" stroke="${INK}" stroke-width="3"/>
  <circle cx="143" cy="25" r="4" fill="#F08A24" stroke="${INK}" stroke-width="2"/>
  <rect x="120" y="94" width="46" height="8" rx="3" fill="#8A929A"/>
  <path d="M34 126 Q36 84 60 80 Q84 84 86 126 Z" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
  <circle cx="60" cy="58" r="18" fill="#E2A77E" stroke="${INK}" stroke-width="3"/>
  <path d="M42 52 Q60 34 78 52 Q60 44 42 52 Z" fill="#4A3B2E"/>
  <circle cx="53" cy="58" r="2.5" fill="${INK}"/>
  <circle cx="67" cy="58" r="2.5" fill="${INK}"/>
  <path d="M84 92 Q104 86 112 74" stroke="#2F6FDE" stroke-width="10" stroke-linecap="round" fill="none"/>
  <circle cx="114" cy="72" r="6" fill="#E2A77E" stroke="${INK}" stroke-width="2"/>
</svg>`;

  const STORY = { data: data(), cats: cats(), biasCats: biasCats(), human };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { nut, story });
})(window);
