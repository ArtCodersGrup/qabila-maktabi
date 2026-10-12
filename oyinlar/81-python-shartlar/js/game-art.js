// «Shartlar va tarmoqlanish»ga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Chegara chizig'i: model baholari (nuqtalar) o'qda turadi, chegara ularni ikki sinfga ajratadi.
  // limit — chegara o'rni (0…1); points — nuqtalar (0…1).
  function threshold(limit, points) {
    const t = limit == null ? 0.5 : limit;
    const list = points || [0.08, 0.2, 0.33, 0.46, 0.58, 0.7, 0.82, 0.93];
    const x = (v) => 20 + v * 260;
    const dots = list.map((v) => (v >= t
      ? `<circle cx="${x(v)}" cy="62" r="9" fill="#F08A24" stroke="#B4560C" stroke-width="2"/>`
      : `<rect x="${x(v) - 8}" y="54" width="16" height="16" rx="3" fill="#33408A"/>`)).join("");
    return `
<svg viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chegara nuqtalarni ikki sinfga ajratadi">
  <rect x="20" y="24" width="${x(t) - 20}" height="76" rx="8" fill="#E8EAF6"/>
  <rect x="${x(t)}" y="24" width="${280 - x(t)}" height="76" rx="8" fill="#FFE9CF"/>
  <path d="M20 62 H280" stroke="#8B8676" stroke-width="3" stroke-linecap="round"/>
  ${dots}
  <path d="M${x(t)} 10 V104" stroke="#1E2230" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 9"/>
  <path d="M${x(t) - 9} 6 H${x(t) + 9} L${x(t)} 20 Z" fill="#1E2230"/>
</svg>`;
  }

  // Qaror daraxti: ildizdagi savol ikki tarmoqqa, o'ng tarmoq yana ikkiga bo'linadi.
  function tree() {
    return `
<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qaror daraxti">
  <path d="M150 28 L80 78 M150 28 L210 70 M210 70 L165 122 M210 70 L255 122" fill="none" stroke="#8B8676" stroke-width="5" stroke-linecap="round"/>
  <rect x="128" y="8" width="44" height="40" rx="8" fill="#FFFFFF" stroke="#1E2230" stroke-width="4"/>
  <rect x="190" y="52" width="40" height="36" rx="8" fill="#FFFFFF" stroke="#1E2230" stroke-width="4"/>
  <circle cx="80" cy="84" r="16" fill="#33408A"/>
  <circle cx="165" cy="126" r="16" fill="#F08A24"/>
  <circle cx="255" cy="126" r="16" fill="#1A9E77"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { threshold, tree };
})(window);
