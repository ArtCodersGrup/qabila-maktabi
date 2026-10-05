// 67-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6): sichqoncha, ko'rsatkich, meva va tosh, sandiq, savat.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const OLTIN = "#F0C040";
  const KOK = "#2F6FDE";
  const POYA = "#8A5A2B";

  // Sichqoncha: chap tugma, o'ng tugma, o'rtada g'ildirak. tugma: "chap" | "ong" | "" —
  // kerakli tugma bo'yaladi, ichida nuqta va yonida "bosildi" chiziqlari (faqat rang bilan emas)
  function sichqoncha(tugma) {
    const chap = tugma === "chap";
    const ong = tugma === "ong";
    const nom = chap ? "Sichqoncha, chap tugmasi belgilangan" : ong ? "Sichqoncha, oʻng tugmasi belgilangan" : "Sichqoncha: chap tugma, oʻng tugma va gʻildirak";
    const chiziq = chap
      ? `<path d="M27.5 41.5 L17.6 31.6 M15.6 62.1 L2 58.5 M48.1 29.6 L44.5 16" fill="none" stroke="${KOK}" stroke-width="5" stroke-linecap="round"/><circle cx="38" cy="68" r="7" fill="#FFFFFF"/>`
      : ong
        ? `<path d="M92.5 41.5 L102.4 31.6 M104.4 62.1 L118 58.5 M71.9 29.6 L75.5 16" fill="none" stroke="${KOK}" stroke-width="5" stroke-linecap="round"/><circle cx="82" cy="68" r="7" fill="#FFFFFF"/>`
        : "";
    return `
<svg viewBox="0 0 120 166" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${nom}">
  <path d="M60 34 C60 20 52 14 60 3" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <rect x="20" y="34" width="80" height="126" rx="40" fill="#F4F1EA" stroke="${INK}" stroke-width="4"/>
  <path d="M20 94 V74 A40 40 0 0 1 60 34 V94 Z" fill="${chap ? KOK : "#FFFFFF"}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M60 34 A40 40 0 0 1 100 74 V94 H60 Z" fill="${ong ? KOK : "#FFFFFF"}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <rect x="53" y="48" width="14" height="30" rx="7" fill="#978B76" stroke="${INK}" stroke-width="4"/>
  ${chiziq}
</svg>`;
  }

  // Ekrandagi ko'rsatkich (o'qcha)
  const korsatkich = () => `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Koʻrsatkich — ekrandagi oʻqcha">
  <path d="M24 8 L24 80 L42 64 L54 92 L66 87 L54 60 L78 60 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
</svg>`;

  // Meva va tosh — 100 × 100 katak ichidagi chizma (savat yorlig'ida ham ishlatiladi)
  const ICHI = {
    olma: `
  <path d="M50 32 C36 18 10 26 10 54 C10 78 30 96 50 88 C70 96 90 78 90 54 C90 26 64 18 50 32 Z" fill="#1A9E77" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M50 32 C50 22 53 14 58 8" fill="none" stroke="${POYA}" stroke-width="5" stroke-linecap="round"/>
  <path d="M58 20 C66 6 80 6 88 12 C80 24 66 26 58 20 Z" fill="#137A58" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M24 52 C25 44 30 39 37 37" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.6"/>`,
    nok: `
  <path d="M50 16 C40 16 37 26 37 36 C37 48 20 54 20 72 C20 88 34 94 50 94 C66 94 80 88 80 72 C80 54 63 48 63 36 C63 26 60 16 50 16 Z" fill="${OLTIN}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M50 16 C50 10 53 6 58 4" fill="none" stroke="${POYA}" stroke-width="5" stroke-linecap="round"/>
  <path d="M31 74 C31 66 35 61 40 58" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.6"/>`,
    tosh: `
  <path d="M12 66 L22 40 L44 24 L72 28 L90 48 L86 74 L64 88 L28 84 Z" fill="#CFC5B2" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M44 24 L52 48 L90 48 M52 48 L28 84" fill="none" stroke="#978B76" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    uzum: `
  <path d="M50 30 V12" fill="none" stroke="${POYA}" stroke-width="5" stroke-linecap="round"/>
  <path d="M50 18 C58 6 74 8 80 16 C72 26 58 26 50 18 Z" fill="#1A9E77" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <g fill="#8E5BD0" stroke="${INK}" stroke-width="3.5">
    <circle cx="28" cy="44" r="12"/><circle cx="50" cy="42" r="12"/><circle cx="72" cy="44" r="12"/>
    <circle cx="39" cy="62" r="12"/><circle cx="61" cy="62" r="12"/>
    <circle cx="50" cy="81" r="12"/>
  </g>`,
    apelsin: `
  <circle cx="50" cy="52" r="40" fill="#F08A24" stroke="${INK}" stroke-width="4"/>
  <circle cx="50" cy="52" r="31" fill="#FFF4CC"/>
  <circle cx="50" cy="52" r="27" fill="#F08A24"/>
  <path d="M50 25 V79 M23 52 H77 M31 33 L69 71 M69 33 L31 71" fill="none" stroke="#FFF4CC" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="52" r="4" fill="#FFF4CC"/>`,
  };

  // Maydondagi narsa: olma | nok | tosh | uzum | apelsin. Nomi — tugmaning aria-label ida, rasm o'zi bezak.
  const narsa = (tur) => (ICHI[tur] ? `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ICHI[tur]}</svg>` : "");

  // ---------- Sandiq ----------
  // Har rangning o'z belgisi bor — rang ko'rishi zaif bola ham sandiqlarni ajratadi
  const SANDIQ = {
    kok: { rang: "#2F6FDE", toq: "#1F55B5", belgi: "doira" },
    sariq: { rang: "#F08A24", toq: "#B4560C", belgi: "uchburchak" },
    yashil: { rang: "#1A9E77", toq: "#137A58", belgi: "kvadrat" },
    binafsha: { rang: "#8E5BD0", toq: "#6A3FA3", belgi: "yulduz" },
  };

  // Besh qirrali yulduz (markazi cx, cy; tashqi radiusi R)
  function yulduz(cx, cy, R) {
    const nuqtalar = [];
    for (let k = 0; k < 10; k++) {
      const rad = k % 2 ? R * 0.42 : R;
      const burchak = -Math.PI / 2 + (k * Math.PI) / 5;
      nuqtalar.push((cx + rad * Math.cos(burchak)).toFixed(1) + " " + (cy + rad * Math.sin(burchak)).toFixed(1));
    }
    return "M" + nuqtalar.join(" L") + " Z";
  }

  // Belgi shakli: doira | uchburchak | kvadrat | yulduz (markazi cx, cy; yarim o'lchami s)
  function shakl(nom, cx, cy, s, rang) {
    if (nom === "doira") return `<circle cx="${cx}" cy="${cy}" r="${s * 0.8}" fill="${rang}"/>`;
    if (nom === "uchburchak") return `<path d="M${cx} ${cy - s} L${cx + s} ${cy + s * 0.8} H${cx - s} Z" fill="${rang}"/>`;
    if (nom === "kvadrat") return `<rect x="${cx - s * 0.8}" y="${cy - s * 0.8}" width="${s * 1.6}" height="${s * 1.6}" rx="1.5" fill="${rang}"/>`;
    return `<path d="${yulduz(cx, cy, s * 1.2)}" fill="${rang}"/>`;
  }

  // To'rt qirrali "yaltiroq" (tozalangan sandiq atrofida)
  const yalt = (cx, cy, s) => `<path d="M${cx} ${cy - s} Q${cx} ${cy} ${cx + s} ${cy} Q${cx} ${cy} ${cx} ${cy + s} Q${cx} ${cy} ${cx - s} ${cy} Q${cx} ${cy} ${cx} ${cy - s} Z" fill="${OLTIN}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;

  // Sandiq: rang — kok | sariq | yashil | binafsha; holat — "" (yopiq) | "ochiq" | "boya" | "qulfla" | "tozala" | "bezat"
  function sandiq(rang, holat) {
    const s = SANDIQ[rang];
    if (!s) return "";
    const ochiq = holat === "ochiq";
    // Qopqoq: ochiq bo'lsa — orqaga ko'tarilgan, ichida tangalar ko'rinadi
    const qopqoq = ochiq
      ? `<path d="M16 50 V32 C16 14 34 6 60 6 C86 6 104 14 104 32 V50 Z" fill="${s.toq}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <g fill="${OLTIN}" stroke="${INK}" stroke-width="3"><circle cx="36" cy="52" r="9"/><circle cx="54" cy="48" r="9"/><circle cx="72" cy="51" r="9"/><circle cx="88" cy="53" r="8"/></g>`
      : `<path d="M12 58 V44 C12 24 30 14 60 14 C90 14 108 24 108 44 V58 Z" fill="${s.toq}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M31 22 V58 M89 22 V58" fill="none" stroke="${OLTIN}" stroke-width="9"/>`;
    // Bo'yalgan: oq xol-xol naqsh
    const xollar = holat === "boya"
      ? `<g fill="#FFFFFF" opacity="0.9"><circle cx="46" cy="38" r="4.5"/><circle cx="74" cy="38" r="4.5"/><circle cx="60" cy="26" r="4.5"/><circle cx="20" cy="72" r="4.5"/><circle cx="20" cy="96" r="4.5"/><circle cx="44" cy="66" r="4.5"/><circle cx="76" cy="66" r="4.5"/><circle cx="100" cy="72" r="4.5"/><circle cx="100" cy="96" r="4.5"/></g>`
      : "";
    // Qulf: yopiq sandiqda kichik ilgak, qulflanganda — osma qulf
    const qulf = ochiq ? ""
      : holat === "qulfla"
        ? `<path d="M52 52 V44 A8 8 0 0 1 68 44 V52" fill="none" stroke="${INK}" stroke-width="8"/>
  <path d="M52 52 V44 A8 8 0 0 1 68 44 V52" fill="none" stroke="#F4F1EA" stroke-width="3.5"/>
  <rect x="47" y="50" width="26" height="20" rx="4" fill="${OLTIN}" stroke="${INK}" stroke-width="3"/>
  <circle cx="60" cy="58" r="3" fill="${INK}"/><path d="M60 58 V65" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
        : `<rect x="52" y="50" width="16" height="16" rx="3" fill="${OLTIN}" stroke="${INK}" stroke-width="3"/>`;
    const bezak = holat === "tozala" ? yalt(14, 20, 11) + yalt(106, 26, 9) + yalt(94, 8, 6)
      : holat === "bezat"
        ? `<path d="M60 15 L40 4 V26 Z M60 15 L80 4 V26 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="60" cy="15" r="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`
        : "";
    return `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${qopqoq}
  <rect x="12" y="58" width="96" height="50" rx="6" fill="${s.rang}" stroke="${INK}" stroke-width="4"/>
  ${xollar}
  <path d="M31 60 V106 M89 60 V106" fill="none" stroke="${OLTIN}" stroke-width="9"/>
  <circle cx="60" cy="86" r="16" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  ${shakl(s.belgi, 60, 86, 9, INK)}
  ${qulf}
  ${bezak}
</svg>`;
  }

  // Sandiq belgisining kichik nishoni — vazifa matni yonida (rang + shakl)
  function belgi(rang) {
    const s = SANDIQ[rang];
    if (!s) return "";
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="${s.rang}" stroke="${INK}" stroke-width="3"/>${shakl(s.belgi, 20, 20, 9, "#FFFFFF")}</svg>`;
  }

  // Savat: old tomonidagi oq yorliqda qaysi meva solinishi chizilgan. Tepasi bo'sh — tushgan mevalar shu yerda ko'rinadi.
  function savat(tur) {
    if (!ICHI[tur]) return "";
    return `
<svg viewBox="0 0 140 135" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M14 54 H126 L116 122 C115 128 111 131 105 131 H35 C29 131 25 128 24 122 Z" fill="#E0B04A" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M19 78 H121 M22 102 H118 M44 58 L48 129 M96 58 L92 129" fill="none" stroke="${POYA}" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
  <rect x="8" y="46" width="124" height="14" rx="7" fill="#A8743F" stroke="${INK}" stroke-width="4"/>
  <circle cx="70" cy="96" r="24" fill="#FFFFFF" stroke="${INK}" stroke-width="3.5"/>
  <g transform="translate(51 77) scale(0.38)">${ICHI[tur]}</g>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { sichqoncha, korsatkich, narsa, sandiq, belgi, savat };
})(window);
