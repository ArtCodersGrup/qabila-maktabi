// 72-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6): sahifa rasmlari (o'yinchoq saytlar), qulf belgisi,
// «bunday sayt yo'q», vaziyat belgilari, hikoya rasmlari. «Internet» dastur belgisi — umumiy/js/stol-art.js da.
(function (root) {
  "use strict";

  const Q = "#2B2B3A"; // qora chiziq
  const ch = `stroke="${Q}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const rasm = (ichi, w, hh) => `<svg viewBox="0 0 ${w || 120} ${hh || 80}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ichi}</svg>`;

  // ---------- Sahifa rasmlari (120×80) ----------
  const SAHIFA = {
    // Qabila: tog' va o'tov
    qabila: `
  <path d="M4 70 L34 24 L58 58 L74 36 L116 70 Z" fill="#8DB4F2" ${ch}/>
  <path d="M30 72 q20 -34 40 0 z" fill="#FFE9C7" ${ch}/><path d="M50 72 v-14 h-10 v14" fill="#F08A24" ${ch}/>
  <circle cx="96" cy="18" r="9" fill="#F0C040" ${ch}/>`,
    // Maktab: bino, eshik, derazalar, bayroq
    maktab: `
  <rect x="18" y="26" width="84" height="48" rx="3" fill="#FFE9C7" ${ch}/>
  <path d="M12 28 L60 8 L108 28 Z" fill="#F08A24" ${ch}/>
  <rect x="50" y="48" width="20" height="26" fill="#2F6FDE" ${ch}/>
  <rect x="26" y="36" width="14" height="12" fill="#D8E6FB" ${ch}/><rect x="80" y="36" width="14" height="12" fill="#D8E6FB" ${ch}/>
  <path d="M60 8 v-6 h14 l-3 3 3 3 h-14" fill="#1A9E77" ${ch}/>`,
    // Ob-havo: quyosh, bulut, tomchilar
    obhavo: `
  <circle cx="40" cy="30" r="16" fill="#F0C040" ${ch}/>
  <path d="M46 62 h46 a12 12 0 0 0 0 -24 a18 18 0 0 0 -34 -4 a14 14 0 0 0 -12 28 z" fill="#FFFFFF" ${ch}/>
  <path d="M58 68 l-4 8 M74 68 l-4 8 M90 68 l-4 8" fill="none" stroke="#2F6FDE" stroke-width="3.5" stroke-linecap="round"/>`,
    // Hayvonlar: panja izi
    hayvonlar: `
  <ellipse cx="60" cy="54" rx="20" ry="16" fill="#F08A24" ${ch}/>
  <circle cx="36" cy="34" r="8" fill="#F08A24" ${ch}/><circle cx="52" cy="22" r="8" fill="#F08A24" ${ch}/>
  <circle cx="70" cy="22" r="8" fill="#F08A24" ${ch}/><circle cx="86" cy="34" r="8" fill="#F08A24" ${ch}/>`,
    // Tuya: ikki o'rkach, bo'yin, qum
    tuya: `
  <path d="M6 72 h108" stroke="#F0C040" stroke-width="6" stroke-linecap="round"/>
  <path d="M28 64 v-20 q8 -18 20 -4 q10 -18 20 0 v24 M84 64 v-28 q0 -14 12 -14 q8 0 8 8 v6 h-8 M40 64 v-10 M58 64 v-10 M84 64 v-10" fill="#FFE9C7" ${ch}/>
  <path d="M28 44 q8 -18 20 -4 q10 -18 20 0 v20 h-40 z" fill="#FFE9C7"/><circle cx="98" cy="26" r="2" fill="${Q}"/>`,
    // Fil: tana, quloq, xartum
    fil: `
  <ellipse cx="54" cy="46" rx="30" ry="22" fill="#C9D3E3" ${ch}/>
  <path d="M36 68 v8 M50 68 v8 M64 68 v8" fill="none" ${ch}/>
  <circle cx="86" cy="36" r="16" fill="#C9D3E3" ${ch}/><ellipse cx="74" cy="34" rx="9" ry="12" fill="#D8E6FB" ${ch}/>
  <path d="M96 46 q10 14 -2 28 q-8 6 -12 -2" fill="none" ${ch}/><circle cx="90" cy="32" r="2" fill="${Q}"/>`,
    // Qush: tana, qanot, tumshuq
    qush: `
  <ellipse cx="56" cy="46" rx="26" ry="18" fill="#8DB4F2" ${ch}/>
  <path d="M40 44 q18 -22 40 -6 q-14 8 -40 6 z" fill="#2F6FDE" ${ch}/>
  <circle cx="84" cy="34" r="12" fill="#8DB4F2" ${ch}/><path d="M94 34 l12 4 -12 4 z" fill="#F08A24" ${ch}/>
  <circle cx="86" cy="31" r="2" fill="${Q}"/><path d="M30 46 l-18 -8 v16 z" fill="#2F6FDE" ${ch}/><path d="M50 64 v10 M62 64 v10" fill="none" ${ch}/>`,
    // Tuyaqush: uzun bo'yin, yumaloq tana, uzun oyoqlar
    tuyaqush: `
  <ellipse cx="50" cy="44" rx="24" ry="16" fill="#978B76" ${ch}/>
  <path d="M70 40 q8 -30 10 -30 v22" fill="none" ${ch} stroke-width="5"/>
  <circle cx="80" cy="10" r="6" fill="#FFE9C7" ${ch}/><path d="M86 10 l8 2 -8 2 z" fill="#F08A24" ${ch}/>
  <path d="M42 58 v18 l-6 2 M58 58 v18 l6 2" fill="none" ${ch}/>`,
    // Sayyoralar: quyosh va orbitadagi uchta sayyora
    sayyoralar: `
  <circle cx="24" cy="40" r="16" fill="#F0C040" ${ch}/>
  <path d="M44 20 q24 20 0 40 M64 10 q36 30 0 60" fill="none" stroke="#978B76" stroke-width="2" stroke-dasharray="5 5"/>
  <circle cx="54" cy="40" r="6" fill="#2F6FDE" ${ch}/><circle cx="80" cy="18" r="5" fill="#F08A24" ${ch}/>
  <circle cx="92" cy="54" r="11" fill="#FFE9C7" ${ch}/><ellipse cx="92" cy="54" rx="18" ry="4" fill="none" ${ch} stroke-width="2.5"/>`,
    // Mars: qizil sayyora va ikki yo'ldosh
    mars: `
  <circle cx="56" cy="42" r="28" fill="#F08A24" ${ch}/>
  <circle cx="46" cy="34" r="5" fill="#B4560C"/><circle cx="66" cy="50" r="7" fill="#B4560C"/><circle cx="62" cy="28" r="3" fill="#B4560C"/>
  <circle cx="102" cy="22" r="5" fill="#C9D3E3" ${ch}/><circle cx="12" cy="62" r="4" fill="#C9D3E3" ${ch}/>`,
    // Ertaklar: ochiq kitob
    ertaklar: `
  <path d="M14 20 q23 -8 46 4 v50 q-23 -12 -46 -4 z" fill="#FFFFFF" ${ch}/>
  <path d="M106 20 q-23 -8 -46 4 v50 q23 -12 46 -4 z" fill="#FFFFFF" ${ch}/>
  <path d="M24 32 q12 -3 26 2 M24 44 q12 -3 26 2 M70 34 q12 -5 26 -2 M70 46 q12 -5 26 -2" fill="none" stroke="#8E5BD0" stroke-width="3" stroke-linecap="round"/>`,
    // Zumrad: sandiq
    zumrad: `
  <rect x="20" y="36" width="80" height="38" rx="4" fill="#B4560C" ${ch}/>
  <path d="M20 36 q0 -18 40 -18 q40 0 40 18 z" fill="#F08A24" ${ch}/>
  <rect x="54" y="34" width="12" height="14" rx="2" fill="#F0C040" ${ch}/><path d="M24 54 h72" stroke="#F0C040" stroke-width="3"/>`,
    // Susambil: yo'l, tepaliklar, quyosh
    susambil: `
  <path d="M4 60 q30 -30 60 0 q30 -30 56 0 v16 h-116 z" fill="#1A9E77" ${ch}/>
  <path d="M50 76 q10 -24 36 -40" fill="none" stroke="#FFE9C7" stroke-width="7" stroke-linecap="round"/>
  <circle cx="22" cy="20" r="10" fill="#F0C040" ${ch}/>`,
    // Qidiruv: lupa
    qidiruv: `
  <circle cx="50" cy="36" r="24" fill="#D8E6FB" ${ch} stroke-width="5"/>
  <path d="M68 54 l30 24" fill="none" ${ch} stroke-width="9"/>`,
    // O'yinlar: joystik
    oyin: `
  <rect x="14" y="24" width="92" height="40" rx="20" fill="#8E5BD0" ${ch}/>
  <path d="M36 36 v16 M28 44 h16" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
  <circle cx="80" cy="38" r="5" fill="#F0C040"/><circle cx="92" cy="48" r="5" fill="#1A9E77"/>`,
    // Sovg'a: quti va lenta
    sovga: `
  <rect x="24" y="34" width="72" height="40" rx="4" fill="#F08A24" ${ch}/>
  <rect x="18" y="22" width="84" height="14" rx="3" fill="#F0C040" ${ch}/>
  <path d="M60 22 v52 M48 22 q-16 -16 -4 -16 q8 0 16 16 q8 -16 16 -16 q12 0 -4 16" fill="none" ${ch}/>`,
    // Kino: film klapan
    kino: `
  <rect x="18" y="34" width="84" height="40" rx="4" fill="#2B2B3A"/>
  <path d="M14 20 l84 -8 4 18 -84 8 z" fill="#FFFFFF" ${ch}/>
  <path d="M28 18 l6 16 M48 16 l6 16 M68 14 l6 16 M88 12 l6 16" stroke="${Q}" stroke-width="3"/>
  <circle cx="60" cy="54" r="9" fill="#F0C040"/>`,
    // Bunday sayt yo'q: uzilgan sim
    yoq: `
  <path d="M8 40 h32 M80 40 h32" fill="none" ${ch} stroke-width="5"/>
  <rect x="34" y="28" width="16" height="24" rx="3" fill="#C9D3E3" ${ch}/><rect x="70" y="28" width="16" height="24" rx="3" fill="#C9D3E3" ${ch}/>
  <path d="M56 32 l-4 8 6 4 -4 8" fill="none" stroke="#F08A24" stroke-width="3.5" stroke-linecap="round"/>`,
  };
  const sahifa = (nom) => (SAHIFA[nom] ? rasm(SAHIFA[nom]) : "");

  // ---------- Vaziyat belgilari (3-bosqich savollari) ----------
  const VAZIYAT = {
    // Chat: ikki pufak
    chat: `
  <path d="M10 14 h56 a6 6 0 0 1 6 6 v24 a6 6 0 0 1 -6 6 h-30 l-14 12 v-12 h-12 a6 6 0 0 1 -6 -6 v-24 a6 6 0 0 1 6 -6 z" fill="#D8E6FB" ${ch}/>
  <path d="M112 34 h-44 a6 6 0 0 0 -6 6 v20 a6 6 0 0 0 6 6 h26 l12 10 v-10 h6 a6 6 0 0 0 6 -6 v-20 a6 6 0 0 0 -6 -6 z" fill="#FFE9C7" ${ch}/>`,
    // Ogoh: sariq uchburchak, ichida chiziq va nuqta
    ogoh: `
  <path d="M60 8 L112 72 H8 Z" fill="#F0C040" ${ch}/>
  <path d="M60 30 v22" fill="none" ${ch} stroke-width="6"/><circle cx="60" cy="62" r="4" fill="${Q}"/>`,
    // Qulfsiz: ochiq qulf
    qulfsiz: `
  <rect x="34" y="38" width="52" height="36" rx="6" fill="#C9D3E3" ${ch}/>
  <path d="M46 38 V26 a14 14 0 0 1 28 0" fill="none" ${ch} stroke-width="5"/>
  <circle cx="60" cy="56" r="5" fill="${Q}"/>`,
  };
  const vaziyat = (nom) => (VAZIYAT[nom] ? rasm(VAZIYAT[nom]) : "");

  // Manzil satridagi qulf: yopiq (yashil) — sayt yaxshi; ochiq (kulrang) — ehtiyot bo'l
  const qulf = (on) => on
    ? `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="2.5" fill="#1A9E77"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#137A58" stroke-width="2.6"/><circle cx="12" cy="16" r="1.8" fill="#FFFFFF"/></svg>`
    : `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="2.5" fill="#978B76"/><path d="M8 10V7a4 4 0 0 1 8 0" fill="none" stroke="#6B6558" stroke-width="2.6"/><circle cx="12" cy="16" r="1.8" fill="#FFFFFF"/></svg>`;

  // Kirish: o'tovga antenna va yer shari — qabilaga internet keldi
  const kelgan = () => `
<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qabilaga internet keldi: oʻtov ustida antenna, osmonda yer shari">
  <path d="M10 108 q40 -60 80 0 z" fill="#FFE9C7" ${ch}/><path d="M60 108 v-22 h-18 v22" fill="#F08A24" ${ch}/>
  <path d="M50 50 v-20" fill="none" ${ch}/><path d="M36 30 q14 -14 28 0" fill="none" ${ch}/><path d="M42 24 q8 -8 16 0" fill="none" stroke="#2F6FDE" stroke-width="3" stroke-linecap="round"/>
  <path d="M70 40 q40 -40 80 20" fill="none" stroke="#2F6FDE" stroke-width="3" stroke-dasharray="6 6"/>
  <circle cx="170" cy="60" r="30" fill="#D8E6FB" ${ch}/><ellipse cx="170" cy="60" rx="13" ry="30" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>
  <path d="M140 60 h60 M145 45 h50 M145 75 h50" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>
</svg>`;

  // Tabrik: yer shari va ✓
  const tabrik = () => `
<svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Yer shari va tasdiq belgisi">
  <circle cx="60" cy="62" r="44" fill="#D8E6FB" ${ch} stroke-width="3.5"/><ellipse cx="60" cy="62" rx="19" ry="44" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>
  <path d="M16 62 h88 M22 40 h76 M22 84 h76" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>
  <circle cx="110" cy="28" r="22" fill="#1A9E77" ${ch}/><path d="M98 28 l8 8 16 -16" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { sahifa, vaziyat, qulf, kelgan, tabrik };
})(window);
