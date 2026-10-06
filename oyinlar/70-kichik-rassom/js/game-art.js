// 70-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6): asbob belgilari, amal belgilari, hikoya rasmlari.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const KOK = "#2F6FDE";
  const SARIQ = "#F0C040";
  const QIZIL = "#C0392B";
  const YASHIL = "#1A9E77";

  // Asbob va amal belgilari — 24×24, currentColor bilan chiziladi (tanlangan tugmada rang o'zgaradi)
  const ICONS = {
    qalam: '<path d="M4 20 L5.5 15 L16 4.5 A1.5 1.5 0 0 1 18.2 4.5 L19.5 5.8 A1.5 1.5 0 0 1 19.5 8 L9 18.5 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M14.5 6 L18 9.5 M5.5 15 L9 18.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    ochirgich: '<path d="M3.5 15.5 L12.5 6.5 A2 2 0 0 1 15.3 6.5 L19.5 10.7 A2 2 0 0 1 19.5 13.5 L12 21 H7.5 L3.5 17 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 11 L15 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 21 H21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    chiziq: '<path d="M4 19 L20 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="4" cy="19" r="2.2" fill="currentColor"/><circle cx="20" cy="5" r="2.2" fill="currentColor"/>',
    tortburchak: '<rect x="4" y="6" width="16" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    doira: '<ellipse cx="12" cy="12" rx="8.5" ry="7" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    uchburchak: '<path d="M12 4.5 L20.5 19 H3.5 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>',
    chelak: '<path d="M5 10 L12 3.5 L19.5 11 L12 18.5 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M5 10 L12 3.5" stroke="currentColor" stroke-width="2.2"/><path d="M19.5 11 C21.5 13.5 22.5 15.5 22.5 17 A2 2 0 0 1 18.5 17 C18.5 15.5 19 14 19.5 11 Z" fill="currentColor"/><path d="M6.5 12 L4.5 14.5 A3 3 0 0 0 3 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    "toliq-on": '<rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor"/>',
    "toliq-off": '<rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    bekor: '<path d="M9 7 L4 11.5 L9 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 11.5 H15 A4.5 4.5 0 0 1 15 20.5 H10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    qaytar: '<path d="M15 7 L20 11.5 L15 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.5 11.5 H9 A4.5 4.5 0 0 0 9 20.5 H14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    tozalash: '<rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M9 9 L15 15 M15 9 L9 15" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    saqlash: '<path d="M12 3.5 V14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M8 10.5 L12 14.5 L16 10.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14.5 V19 A1.5 1.5 0 0 0 5.5 20.5 H18.5 A1.5 1.5 0 0 0 20 19 V14.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    yuklab: '<path d="M12 3.5 V14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M8 10.5 L12 14.5 L16 10.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18.5 H20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    ochish: '<path d="M3 7.5 A1.5 1.5 0 0 1 4.5 6 H9 L11 8 H19.5 A1.5 1.5 0 0 1 21 9.5 V18 A1.5 1.5 0 0 1 19.5 19.5 H4.5 A1.5 1.5 0 0 1 3 18 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    ochir: '<path d="M5 7 H19 M9.5 7 V4.5 H14.5 V7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 7 L7.5 20 H16.5 L17.5 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 10.5 V17 M14 10.5 V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    tayyor: '<path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;

  // Hikoya: stol ustidagi kompyuter, ekranida katakli uy rasmi
  const kompyuter = () => `
<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kompyuter, ekranida katakli uy rasmi">
  <rect x="30" y="10" width="160" height="106" rx="10" fill="#F4F1EA" stroke="${INK}" stroke-width="4"/>
  <rect x="42" y="22" width="136" height="82" rx="4" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <g stroke="#E6DECB" stroke-width="1">
    ${Array.from({ length: 15 }, (_, k) => `<path d="M${50 + k * 8} 26 V100"/>`).join("")}
    ${Array.from({ length: 9 }, (_, k) => `<path d="M46 ${30 + k * 8} H174"/>`).join("")}
  </g>
  <rect x="90" y="62" width="40" height="30" fill="${KOK}"/>
  <path d="M82 62 L110 38 L138 62 Z" fill="${QIZIL}"/>
  <rect x="98" y="76" width="10" height="16" fill="#8A5A10"/>
  <rect x="114" y="68" width="10" height="8" fill="${SARIQ}"/>
  <rect x="96" y="116" width="28" height="12" fill="#978B76" stroke="${INK}" stroke-width="3"/>
  <rect x="66" y="128" width="88" height="8" rx="4" fill="#978B76" stroke="${INK}" stroke-width="3"/>
  <rect x="166" y="124" width="26" height="18" rx="9" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M179 124 V133" stroke="${INK}" stroke-width="2"/>
</svg>`;

  // Tabrik: rassom palitrasi va moʻyqalam
  const palitra = () => `
<svg viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rassom palitrasi va moʻyqalam">
  <path d="M80 10 C120 10 150 36 150 66 C150 88 134 96 118 92 C106 89 100 96 102 106 C104 118 94 124 80 124 C42 124 12 98 12 66 C12 36 42 10 80 10 Z" fill="#F4E4C8" stroke="${INK}" stroke-width="4"/>
  <circle cx="48" cy="46" r="10" fill="${QIZIL}"/>
  <circle cx="78" cy="32" r="10" fill="${SARIQ}"/>
  <circle cx="110" cy="44" r="10" fill="${KOK}"/>
  <circle cx="40" cy="78" r="10" fill="${YASHIL}"/>
  <circle cx="62" cy="100" r="10" fill="#8E5BD0"/>
  <path d="M96 118 L142 24" stroke="#8A5A10" stroke-width="7" stroke-linecap="round"/>
  <path d="M142 24 L150 8" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M149 10 L156 4" stroke="${KOK}" stroke-width="6" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { icon, kompyuter, palitra };
})(window);
