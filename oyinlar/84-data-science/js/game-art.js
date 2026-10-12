// «Data science» oʻyiniga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Besh bosqich zanjiri: lupa (savol) → jadval (yigʻish) → voronka (tozalash) → diagramma (tahlil) → belgi (xulosa)
  const yol = () => `
<svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Besh bosqich: savol, yigʻish, tozalash, tahlil, xulosa">
  <g fill="none" stroke="#8B8676" stroke-width="2.5" stroke-linecap="round">
    <path d="M52 40 h14"/><path d="M112 40 h14"/><path d="M172 40 h14"/><path d="M232 40 h14"/>
  </g>
  <g stroke="#1E2230" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="6" y="18" width="44" height="44" rx="8" fill="#E8EAF6"/>
    <circle cx="25" cy="37" r="9" fill="#FFFFFF"/><path d="M32 44 l9 9"/>
    <rect x="66" y="18" width="44" height="44" rx="8" fill="#FFE9CF"/>
    <rect x="75" y="28" width="26" height="24" fill="#FFFFFF"/><path d="M75 36 h26 M75 44 h26 M84 28 v24 M93 28 v24" stroke-width="1.5"/>
    <rect x="126" y="18" width="44" height="44" rx="8" fill="#DDF3EA"/>
    <path d="M135 28 h26 l-9 12 v10 l-8 4 v-14 z" fill="#FFFFFF"/>
    <rect x="186" y="18" width="44" height="44" rx="8" fill="#E7DBF7"/>
    <path d="M195 54 h26"/><rect x="197" y="42" width="5" height="12" fill="#33408A"/><rect x="205" y="32" width="5" height="22" fill="#33408A"/><rect x="213" y="37" width="5" height="17" fill="#33408A"/>
    <rect x="246" y="18" width="44" height="44" rx="8" fill="#FFF4CC"/>
    <path d="M257 41 l8 8 15 -17" fill="none" stroke="#1A9E77" stroke-width="4"/>
  </g>
</svg>`;

  // Toza jadval: kataklar va tasdiq belgisi
  const jadval = () => `
<svg viewBox="0 0 140 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tozalangan jadval">
  <rect x="12" y="14" width="96" height="78" rx="6" fill="#FFFFFF" stroke="#1E2230" stroke-width="3"/>
  <rect x="12" y="14" width="96" height="18" rx="6" fill="#E8EAF6" stroke="#1E2230" stroke-width="3"/>
  <path d="M12 52 h96 M12 72 h96 M44 14 v78 M76 14 v78" stroke="#8B8676" stroke-width="2"/>
  <circle cx="110" cy="84" r="20" fill="#DDF3EA" stroke="#1E2230" stroke-width="3"/>
  <path d="M100 84 l7 8 13 -15" fill="none" stroke="#1A9E77" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { yol, jadval };
})(window);
