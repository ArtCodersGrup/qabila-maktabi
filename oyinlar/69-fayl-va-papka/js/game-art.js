// 69-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6): hikoya rasmlari, ochilgan fayl ko'rinishi,
// bo'sh varaq va asboblar qatori belgilari. Papka, fayl turlari va savat belgilari — umumiy/js/stol-art.js da.
(function (root) {
  "use strict";

  const Q = "#2B2B3A"; // qora chiziq

  // Kirish: kompyuter ekranida fayllar sochilib yotibdi
  const sochilgan = () => `
<svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kompyuter ekranida fayllar sochilib yotibdi">
  <rect x="20" y="6" width="180" height="100" rx="10" fill="#CFE6F5" stroke="${Q}" stroke-width="4"/>
  <path d="M94 106h32l4 14h-40z" fill="#C9D3E3" stroke="${Q}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M70 123h80" stroke="${Q}" stroke-width="4" stroke-linecap="round"/>
  <g stroke="${Q}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <g transform="rotate(-16 54 42)">
      <rect x="42" y="26" width="24" height="30" rx="2" fill="#FFFFFF"/>
      <path d="M47 35h14M47 42h14M47 49h8" stroke="#2F6FDE"/>
    </g>
    <g transform="rotate(12 100 68)">
      <rect x="88" y="52" width="24" height="30" rx="2" fill="#FFFFFF"/>
      <rect x="92" y="59" width="16" height="13" rx="1.5" fill="#D7F0E6" stroke-width="2"/>
    </g>
    <g transform="rotate(-9 148 38)">
      <rect x="136" y="22" width="24" height="30" rx="2" fill="#FFFFFF"/>
      <path d="M146 45V33l7-2v11" fill="none" stroke="#8E5BD0"/>
    </g>
    <g transform="rotate(21 168 78)">
      <rect x="156" y="62" width="24" height="30" rx="2" fill="#FFFFFF"/>
      <path d="M164 71v12l9-6z" fill="#F08A24" stroke-width="2"/>
    </g>
    <g transform="rotate(8 50 82)">
      <path d="M34 72a2 2 0 0 1 2-2h8l3 4h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H36a2 2 0 0 1-2-2z" fill="#F0C040"/>
    </g>
  </g>
</svg>`;

  // Tabrik: hamma narsa papkalarda, tartibda
  const papkaCha = (x, rang) => `
  <rect x="${x + 16}" y="30" width="18" height="18" rx="2" fill="#FFFFFF" stroke="${Q}" stroke-width="2.5"/>
  <path d="M${x} 46a3 3 0 0 1 3-3h12l5 6h23a3 3 0 0 1 3 3v26a3 3 0 0 1-3 3H${x + 3}a3 3 0 0 1-3-3z" fill="${rang}" stroke="${Q}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M${x} 57h46" stroke="${Q}" stroke-width="2.5"/>`;
  const tartibli = () => `
<svg viewBox="0 0 180 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fayllar papkalarga tartib bilan joylangan">
  ${papkaCha(8, "#F0C040")}${papkaCha(67, "#8DB4F2")}${papkaCha(126, "#F0C040")}
  <path d="M74 14l10 10 20-20" fill="none" stroke="#1A9E77" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6 90h168" stroke="${Q}" stroke-width="3" stroke-linecap="round"/>
</svg>`;

  // Ochilgan fayl: rasm — manzara, matn — satrlar, musiqa — nota, video — ekran va «ijro» uchburchagi
  const OCHIQ = {
    rasm: `
  <rect x="6" y="6" width="108" height="78" rx="8" fill="#D8E6FB" stroke="${Q}" stroke-width="4"/>
  <circle cx="34" cy="30" r="10" fill="#F0C040"/>
  <path d="M10 80l30-34 20 20 14-14 36 28z" fill="#1A9E77"/>`,
    matn: `
  <rect x="24" y="4" width="72" height="82" rx="6" fill="#FFFFFF" stroke="${Q}" stroke-width="4"/>
  <path d="M36 22h48M36 36h48M36 50h48M36 64h30" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>`,
    musiqa: `
  <circle cx="60" cy="45" r="40" fill="#E7DBF7" stroke="${Q}" stroke-width="4"/>
  <path d="M52 60V26l26-6v32" fill="none" stroke="${Q}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  <ellipse cx="45" cy="60" rx="8" ry="6.5" fill="${Q}"/><ellipse cx="71" cy="52" rx="8" ry="6.5" fill="${Q}"/>`,
    video: `
  <rect x="6" y="10" width="108" height="70" rx="8" fill="#FFE9C7" stroke="${Q}" stroke-width="4"/>
  <path d="M50 30v30l26-15z" fill="#F08A24" stroke="${Q}" stroke-width="3" stroke-linejoin="round"/>`,
  };
  const ochiq = (tur) => (OCHIQ[tur] ? `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${OCHIQ[tur]}</svg>` : "");

  // Bo'sh varaq: turi belgisidan ko'rinmaydigan fayl («bu nima?» savoli — faqat nom oxiriga qarab)
  const varaq = () => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 5h17l8 8v28a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="#FFFFFF" stroke="${Q}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M29 5v8h8" fill="none" stroke="${Q}" stroke-width="2.5" stroke-linejoin="round"/>
</svg>`;

  // Asboblar qatori belgilari. Chiziq — currentColor: o'chirilgan tugmada belgi ham kulrang bo'ladi
  const C = `stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"`;
  const ASBOB = {
    orqaga: `<path d="M20 12H5M11 5l-7 7 7 7" fill="none" ${C} stroke-width="2.6"/>`,
    yangi: `<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#F0C040" ${C} stroke-width="2"/>
  <path d="M12 11v6M9 14h6" fill="none" ${C} stroke-width="2.2"/>`,
    nomla: `<path d="M4 20l1-4.5L16.5 4a2.1 2.1 0 0 1 3 3L8 18.5z" fill="#FFE9C7" ${C} stroke-width="2"/>
  <path d="M14.5 6l3 3" fill="none" ${C} stroke-width="2"/>`,
    nusxa: `<rect x="8" y="8" width="12" height="13" rx="2" fill="#FFFFFF" ${C} stroke-width="2"/>
  <path d="M5 16V5a2 2 0 0 1 2-2h8" fill="none" ${C} stroke-width="2"/>`,
    kes: `<circle cx="6" cy="6.5" r="2.8" fill="none" ${C} stroke-width="2"/><circle cx="6" cy="17.5" r="2.8" fill="none" ${C} stroke-width="2"/>
  <path d="M8.3 8.2L20 18M8.3 15.8L20 6" fill="none" ${C} stroke-width="2"/>`,
    qoy: `<rect x="5" y="5" width="14" height="16" rx="2" fill="#FFE9C7" ${C} stroke-width="2"/>
  <rect x="9" y="2.5" width="6" height="5" rx="1.5" fill="#FFFFFF" ${C} stroke-width="2"/>
  <path d="M9 13h6M9 17h4" fill="none" ${C} stroke-width="2"/>`,
    ochir: `<path d="M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" fill="#FFFFFF" ${C} stroke-width="2"/>
  <path d="M4 7.5h16M9.5 7.5V4.5h5v3M10 11.5v6M14 11.5v6" fill="none" ${C} stroke-width="2"/>`,
    qaytar: `<path d="M5 10h9a5 5 0 0 1 0 10h-4" fill="none" ${C} stroke-width="2.4"/>
  <path d="M9 5.5L4.5 10 9 14.5" fill="none" ${C} stroke-width="2.4"/>`,
  };
  // Noma'lum nom — bo'sh satr
  const asbob = (nom) => (ASBOB[nom] ? `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ASBOB[nom]}</svg>` : "");

  root.QK = root.QK || {};
  root.QK.gameArt = { sochilgan, tartibli, ochiq, varaq, asbob };
})(window);
