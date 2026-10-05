// O'yinchoq kompyuter belgilari (SVG, matnsiz — QOIDALAR §6): dasturlar, fayl turlari, savat, «Pusk».
// 68 «Ekran va oynalar» va 69 «Fayl va papka» ishlatadi. Ko'rinishi: umumiy/css/stol.css.
(function (root) {
  "use strict";

  const Q = "#2B2B3A"; // qora chiziq
  const svg = (ichi) => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ichi}</svg>`;

  // Burchagi bukilgan varaq — hamma fayl turlarining asosi
  const varaq = `
  <path d="M12 5h17l8 8v28a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="#FFFFFF" stroke="${Q}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M29 5v8h8" fill="none" stroke="${Q}" stroke-width="2.5" stroke-linejoin="round"/>`;

  const papkaShakli = (rang) => `
  <path d="M5 13a3 3 0 0 1 3-3h10l4 5h18a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" fill="${rang}" stroke="${Q}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M5 21h38" stroke="${Q}" stroke-width="2.5"/>`;

  const savatShakli = (rang) => `
  <path d="M12 15h24l-2 25a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="${rang}" stroke="${Q}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M20 21v16M28 21v16" stroke="#978B76" stroke-width="2.5" stroke-linecap="round"/>`;

  const ICONS = {
    // ---------- Dasturlar ----------
    // Rasm chizish: bo'yoq taxtachasi
    rasm: svg(`
  <path d="M24 6C14 6 6 13.5 6 23s7 17 16 17c3 0 4-2 3-4.5S26 31 29 31h5c5 0 8-3.5 8-8C42 13 34 6 24 6z" fill="#FFE9C7" stroke="${Q}" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="15" cy="20" r="3" fill="#2F6FDE"/><circle cx="23" cy="14" r="3" fill="#F08A24"/>
  <circle cx="32" cy="17" r="3" fill="#1A9E77"/><circle cx="13" cy="29" r="3" fill="#8E5BD0"/>`),
    // Matn yozish: varaq va satrlar
    matn: svg(`
  <rect x="10" y="5" width="28" height="38" rx="3" fill="#FFFFFF" stroke="${Q}" stroke-width="2.5"/>
  <path d="M16 15h16M16 22h16M16 29h10" stroke="#2F6FDE" stroke-width="3" stroke-linecap="round"/>`),
    // Hisoblagich
    hisob: svg(`
  <rect x="11" y="5" width="26" height="38" rx="4" fill="#F0C040" stroke="${Q}" stroke-width="2.5"/>
  <rect x="15" y="9" width="18" height="9" rx="2" fill="#FFFFFF" stroke="${Q}" stroke-width="2"/>
  <g fill="${Q}"><rect x="15" y="23" width="5" height="5" rx="1"/><rect x="21.5" y="23" width="5" height="5" rx="1"/><rect x="28" y="23" width="5" height="5" rx="1"/>
  <rect x="15" y="31" width="5" height="5" rx="1"/><rect x="21.5" y="31" width="5" height="5" rx="1"/><rect x="28" y="31" width="5" height="5" rx="1"/></g>`),
    // Musiqa: nota
    musiqa: svg(`
  <circle cx="24" cy="24" r="19" fill="#E7DBF7" stroke="${Q}" stroke-width="2.5"/>
  <path d="M21 31V15l12-3v15" fill="none" stroke="${Q}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <ellipse cx="17.5" cy="31" rx="4" ry="3.2" fill="${Q}"/><ellipse cx="29.5" cy="27" rx="4" ry="3.2" fill="${Q}"/>`),
    // Fayllar dasturi: ko'k papka, ichidan varaq chiqib turibdi
    fayllar: svg(`
  <rect x="24" y="5" width="14" height="14" rx="2" fill="#FFFFFF" stroke="${Q}" stroke-width="2"/>
  ${papkaShakli("#8DB4F2")}`),
    // Internet: yer shari
    internet: svg(`
  <circle cx="24" cy="24" r="18" fill="#D8E6FB" stroke="${Q}" stroke-width="2.5"/>
  <ellipse cx="24" cy="24" rx="8" ry="18" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>
  <path d="M6 24h36M9 15h30M9 33h30" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>`),

    // ---------- Papka va fayl turlari ----------
    papka: svg(papkaShakli("#F0C040")),
    "f-rasm": svg(`${varaq}
  <rect x="15" y="20" width="18" height="15" rx="1.5" fill="#D7F0E6" stroke="${Q}" stroke-width="2"/>
  <circle cx="20" cy="25" r="2" fill="#F08A24"/><path d="M16 34l6-7 4 4 3-3 3 6z" fill="#1A9E77"/>`),
    "f-matn": svg(`${varaq}
  <path d="M16 22h16M16 28h16M16 34h10" stroke="#2F6FDE" stroke-width="3" stroke-linecap="round"/>`),
    "f-musiqa": svg(`${varaq}
  <path d="M22 35V23l9-2v11" fill="none" stroke="#8E5BD0" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  <ellipse cx="19.5" cy="35" rx="3" ry="2.4" fill="#8E5BD0"/><ellipse cx="28.5" cy="32" rx="3" ry="2.4" fill="#8E5BD0"/>`),
    "f-video": svg(`${varaq}
  <rect x="15" y="20" width="18" height="15" rx="2" fill="#FFE9C7" stroke="${Q}" stroke-width="2"/>
  <path d="M22 23.5v8l7-4z" fill="#F08A24" stroke="${Q}" stroke-width="1.5" stroke-linejoin="round"/>`),

    // ---------- Savat va «Pusk» ----------
    savat: svg(`${savatShakli("#FFFFFF")}
  <path d="M9 14h30M19 14V8h10v6" fill="none" stroke="${Q}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`),
    // Ichida narsa bor savat: qopqog'i yo'q, g'ijimlangan qog'ozlar ko'rinib turibdi
    "savat-tola": svg(`
  <circle cx="19" cy="12" r="5" fill="#FFE9C7" stroke="${Q}" stroke-width="2"/><circle cx="29" cy="11" r="5.5" fill="#FFFFFF" stroke="${Q}" stroke-width="2"/>
  ${savatShakli("#FFF4CC")}`),
    pusk: svg(`
  <rect x="8" y="8" width="14" height="14" rx="2" fill="#2F6FDE"/><rect x="26" y="8" width="14" height="14" rx="2" fill="#F08A24"/>
  <rect x="8" y="26" width="14" height="14" rx="2" fill="#1A9E77"/><rect x="26" y="26" width="14" height="14" rx="2" fill="#F0C040"/>`),
  };

  // Belgi; noma'lum nom — bo'sh satr
  const icon = (nom) => ICONS[nom] || "";

  const api = { icon, NOMLAR: Object.keys(ICONS) };
  root.QK = root.QK || {};
  root.QK.stolArt = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
