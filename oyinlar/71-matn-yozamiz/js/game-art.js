// 71-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6): hikoya rasmlari va asboblar qatori belgilari.
// «Matn» dasturi va hujjat belgisi — umumiy/js/stol-art.js da (QK.stolArt.icon("matn"), "f-matn").
(function (root) {
  "use strict";

  const Q = "#2B2B3A"; // qora chiziq

  // Kirish: kompyuter ekranida xat — satrlar va milt-milt kursor
  const xat = () => `
<svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kompyuter ekranida yozilayotgan xat va kursor">
  <rect x="20" y="6" width="180" height="100" rx="10" fill="#CFE6F5" stroke="${Q}" stroke-width="4"/>
  <path d="M94 106h32l4 14h-40z" fill="#C9D3E3" stroke="${Q}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M70 123h80" stroke="${Q}" stroke-width="4" stroke-linecap="round"/>
  <rect x="44" y="20" width="132" height="72" rx="6" fill="#FFFFFF" stroke="${Q}" stroke-width="3"/>
  <rect x="44" y="20" width="132" height="14" rx="6" fill="#2F6FDE"/>
  <rect x="44" y="28" width="132" height="6" fill="#2F6FDE"/>
  <g stroke="#2F6FDE" stroke-width="4" stroke-linecap="round">
    <path d="M56 48h70M56 60h90M56 72h40"/>
  </g>
  <rect x="100" y="66" width="3" height="13" fill="${Q}">
    <animate attributeName="opacity" values="1;1;0;0" dur="1s" repeatCount="indefinite"/>
  </rect>
</svg>`;

  // Tabrik: saqlangan hujjat va ✓
  const saqlangan = () => `
<svg viewBox="0 0 140 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Saqlangan hujjat">
  <path d="M34 12h52l24 24v76a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="#FFFFFF" stroke="${Q}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M86 12v24h24" fill="none" stroke="${Q}" stroke-width="4" stroke-linejoin="round"/>
  <g stroke-width="5" stroke-linecap="round">
    <path d="M46 54h36" stroke="#2F6FDE"/>
    <path d="M46 68h48" stroke="#8E5BD0"/>
    <path d="M46 82h30" stroke="#1A9E77"/>
  </g>
  <circle cx="106" cy="100" r="22" fill="#1A9E77" stroke="${Q}" stroke-width="3"/>
  <path d="M94 100l8 8 16 -18" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  // Asboblar qatori belgilari (24×24). Chiziq — currentColor: o'chirilgan tugmada belgi ham kulrang
  const C = `stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"`;
  const rangDoira = (hex) => `<circle cx="12" cy="12" r="8" fill="${hex}" stroke="${Q}" stroke-width="2"/>`;
  const ASBOB = {
    // Qalin: ikki yo'g'on satr
    qalin: `<path d="M5 8h14M5 16h14" fill="none" ${C} stroke-width="5"/>`,
    // Kursiv: yotiq ingichka satrlar
    kursiv: `<path d="M9 6h10M7 12h10M5 18h10" fill="none" ${C} stroke-width="2.6"/>`,
    kok: rangDoira("#2F6FDE"),
    yashil: rangDoira("#1A9E77"),
    binafsha: rangDoira("#8E5BD0"),
    // Saqlash: varaq pastdagi javonga tushadi
    saqlash: `<path d="M12 3v11M8 10l4 4 4-4" fill="none" ${C} stroke-width="2.4"/>
  <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" fill="none" ${C} stroke-width="2.4"/>`,
    // Tayyor: belgi
    tayyor: `<path d="M5 12.5l5 5L19 7" fill="none" ${C} stroke-width="3"/>`,
    // Ochish: varaq va o'q
    ochish: `<path d="M6 3h8l4 4v14H6z" fill="#FFFFFF" ${C} stroke-width="2"/><path d="M14 3v4h4M9 13h6M12 10v6" fill="none" ${C} stroke-width="2"/>`,
    // O'chirish: savat
    ochir: `<path d="M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" fill="#FFFFFF" ${C} stroke-width="2"/>
  <path d="M4 7.5h16M9.5 7.5V4.5h5v3M10 11.5v6M14 11.5v6" fill="none" ${C} stroke-width="2"/>`,
  };
  // Noma'lum nom — bo'sh satr
  const asbob = (nom) => (ASBOB[nom] ? `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ASBOB[nom]}</svg>` : "");

  root.QK = root.QK || {};
  root.QK.gameArt = { xat, saqlangan, asbob };
})(window);
