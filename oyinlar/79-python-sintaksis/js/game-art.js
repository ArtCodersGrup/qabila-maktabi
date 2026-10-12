// «Python: sintaksis» ga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Kod oynasi: chapda satrlar (biri surilgan — otstup), o'ngda chiqish. xato=true — bitta satr "yana" rangida.
  function oyna(xato) {
    const satr = (y, x, w, rang) => `<rect x="${x}" y="${y}" width="${w}" height="9" rx="4.5" fill="${rang}"/>`;
    return `
<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kod oynasi va chiqish">
  <rect x="6" y="8" width="170" height="134" rx="12" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="4"/>
  <circle cx="24" cy="24" r="4" fill="#F08A24"/><circle cx="38" cy="24" r="4" fill="#1A9E77"/><circle cx="52" cy="24" r="4" fill="#2F6FDE"/>
  ${satr(42, 22, 84, "#B9B4A6")}
  ${satr(60, 22, 120, "#2F6FDE")}
  ${satr(78, 22, 96, xato ? "#F08A24" : "#2F6FDE")}
  ${satr(96, 22, 60, "#8E5BD0")}
  ${satr(114, 46, 100, "#2F6FDE")}
  <path d="M184 75 H206" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round"/>
  <path d="M200 67 L210 75 L200 83" fill="none" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="218" y="30" width="76" height="90" rx="12" fill="#2B2B3A"/>
  ${satr(48, 230, 50, "#FFFDF7")}
  ${satr(66, 230, 36, "#1A9E77")}
  ${satr(84, 230, 44, "#FFFDF7")}
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { oyna };
})(window);
