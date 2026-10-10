// Bosh sahifadagi o'yin ikonkalari (64×64 SVG). Matn yozilmaydi — faqat shakllar.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const svg = (body) => `<svg viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;

  // 1-o'yin: harf kartochkalaridan so'z yasash
  const kodlar = svg(`
  <rect x="3" y="10" width="26" height="26" rx="7" fill="#2F6FDE"/>
  <rect x="35" y="10" width="26" height="26" rx="7" fill="#F08A24"/>
  <rect x="19" y="30" width="26" height="26" rx="7" fill="#1A9E77" stroke="#FFF6E5" stroke-width="3"/>`);

  // 2-o'yin: Morze nuqta va chiziqlari
  const morze = svg(`
  <circle cx="11" cy="19" r="7" fill="#2F6FDE"/>
  <circle cx="29" cy="19" r="7" fill="#2F6FDE"/>
  <rect x="41" y="12" width="21" height="14" rx="7" fill="#F08A24"/>
  <rect x="3" y="38" width="21" height="14" rx="7" fill="#F08A24"/>
  <circle cx="37" cy="45" r="7" fill="#1A9E77"/>
  <circle cx="55" cy="45" r="7" fill="#8E5BD0"/>`);

  // 3-o'yin: Sezar g'ildiragi
  function sezar() {
    let ticks = "";
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const x1 = 32 + Math.sin(a) * 27;
      const y1 = 32 - Math.cos(a) * 27;
      const x2 = 32 + Math.sin(a) * 21;
      const y2 = 32 - Math.cos(a) * 21;
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    return svg(`
  <circle cx="32" cy="32" r="29" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  ${ticks}
  <circle cx="32" cy="32" r="17" fill="#8E5BD0"/>
  <path d="M32 18 L40 30 L24 30 Z" fill="#F08A24"/>`);
  }

  // 4-o'yin: chiroqlar (ikkitasi yoniq)
  function chiroq() {
    const bulb = (x, on) => `
  <circle cx="${x}" cy="26" r="13" fill="${on ? "#F0C040" : "#D9D2C3"}" stroke="${INK}" stroke-width="3"/>
  <rect x="${x - 6}" y="40" width="12" height="7" rx="2" fill="#8A8A8A"/>
  <rect x="${x - 4}" y="48" width="8" height="6" rx="2" fill="#6A6A6A"/>`;
    return svg(bulb(14, 1) + bulb(32, 0) + bulb(50, 1));
  }

  // 5-o'yin: toshdagi o'yilgan belgilar
  const rim = svg(`
  <path d="M7 15 Q6 7 14 7 L51 5 Q59 5 59 13 L61 50 Q61 58 53 58 L13 59 Q5 59 5 51 Z" fill="#C9C1AF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 22 L16 42 M24 22 L24 42 M32 22 L32 42" stroke="#857C6B" stroke-width="4" stroke-linecap="round"/>
  <path d="M41 22 L47 42 L53 22" stroke="#857C6B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`);

  // 6-o'yin: robot boshi
  const robot = svg(`
  <line x1="32" y1="14" x2="32" y2="6" stroke="${INK}" stroke-width="3"/>
  <circle cx="32" cy="5" r="4" fill="#F08A24" stroke="${INK}" stroke-width="2"/>
  <rect x="10" y="14" width="44" height="34" rx="10" fill="#B8C0C8" stroke="${INK}" stroke-width="3"/>
  <circle cx="23" cy="29" r="6" fill="#2F6FDE"/>
  <circle cx="41" cy="29" r="6" fill="#2F6FDE"/>
  <rect x="24" y="39" width="16" height="5" rx="2.5" fill="${INK}"/>
  <rect x="18" y="50" width="28" height="10" rx="4" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>`);

  // 7-o'yin: gap pufagi va so'z kartochkalari
  const gap = svg(`
  <path d="M6 12 H58 a4 4 0 0 1 4 4 V40 a4 4 0 0 1 -4 4 H26 l-10 10 V44 H6 a4 4 0 0 1 -4 -4 V16 a4 4 0 0 1 4 -4 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="10" y="20" width="20" height="7" rx="3.5" fill="#2F6FDE"/>
  <rect x="34" y="20" width="20" height="7" rx="3.5" fill="#F08A24"/>
  <rect x="10" y="32" width="14" height="7" rx="3.5" fill="#1A9E77"/>
  <rect x="28" y="32" width="26" height="7" rx="3.5" fill="#8E5BD0"/>`);

  // 8-o'yin: munchoqli quti
  const qutilar = svg(`
  <rect x="6" y="18" width="52" height="34" rx="6" fill="#C9945A" stroke="${INK}" stroke-width="3"/>
  <rect x="14" y="26" width="36" height="18" rx="3" fill="#B07A44"/>
  <circle cx="24" cy="35" r="5" fill="#2F6FDE" stroke="${INK}" stroke-width="2"/>
  <circle cx="38" cy="35" r="5" fill="#F0C040" stroke="${INK}" stroke-width="2"/>
  <path d="M44 8 L48 16 L57 17 L50 23 L52 32 L44 27 L36 32 L38 23 L31 17 L40 16 Z" fill="#F0C040" stroke="${INK}" stroke-width="2" stroke-linejoin="round" transform="translate(4,-6) scale(0.6)"/>`);

  // 9-o'yin: qaror (qoida) belgisi — romb va ikki yo'nalish
  const qoida = svg(`
  <path d="M32 6 L54 26 L32 46 L10 26 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 46 V52 H14 V58" stroke="#1A9E77" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M32 46 V52 H50 V58" stroke="#F08A24" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="14" cy="59" r="4" fill="#1A9E77"/>
  <circle cx="50" cy="59" r="4" fill="#F08A24"/>
  <circle cx="24" cy="26" r="3.5" fill="#2F6FDE"/>
  <circle cx="40" cy="26" r="3.5" fill="#8E5BD0"/>`);

  // 10-o'yin: kataklardan iborat rasm (kompyuter ko'rish)
  function koz() {
    let cells = "";
    const on = [9, 10, 13, 14, 17, 18, 19, 20, 21, 22, 25, 26, 29, 30];
    for (let i = 0; i < 36; i++) {
      const x = 6 + (i % 6) * 9;
      const y = 6 + Math.floor(i / 6) * 9;
      cells += `<rect x="${x}" y="${y}" width="8" height="8" rx="1.5" fill="${on.includes(i) ? INK : "#E6DFD0"}"/>`;
    }
    return svg(`${cells}<rect x="4" y="4" width="56" height="56" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>`);
  }

  // 11-o'yin: qatlamli tarmoq
  function tarmoq() {
    const cols = [[12, [16, 32, 48]], [32, [12, 26, 40, 54]], [52, [24, 40]]];
    let out = "";
    for (let c = 0; c + 1 < cols.length; c++) {
      for (const y1 of cols[c][1]) for (const y2 of cols[c + 1][1]) out += `<line x1="${cols[c][0]}" y1="${y1}" x2="${cols[c + 1][0]}" y2="${y2}" stroke="#C9BFA6" stroke-width="1.5"/>`;
    }
    const colors = ["#2F6FDE", "#F0C040", "#1A9E77"];
    cols.forEach(([x, ys], c) => { for (const y of ys) out += `<circle cx="${x}" cy="${y}" r="5.5" fill="${colors[c]}" stroke="${INK}" stroke-width="2"/>`; });
    return svg(out);
  }

  // 12-o'yin: ichma-ich doiralar (AI xaritasi)
  const xarita = svg(`
  <rect x="3" y="3" width="58" height="58" rx="10" fill="#F4EEE2" stroke="#B5AC98" stroke-width="2.5" stroke-dasharray="4 3"/>
  <ellipse cx="32" cy="34" rx="25" ry="22" fill="#DCE8FA" stroke="#2F6FDE" stroke-width="3"/>
  <ellipse cx="33" cy="38" rx="16" ry="15" fill="#D6F0E4" stroke="#1A9E77" stroke-width="3"/>
  <ellipse cx="34" cy="42" rx="8" ry="8" fill="#EFE0FA" stroke="#8E5BD0" stroke-width="3"/>`);

  // 13-o'yin: sandiq (bayt) va 8 ta bit
  function sandiq() {
    let dots = "";
    const bits = "01000001";
    for (let k = 0; k < 8; k++) dots += `<circle cx="${10.5 + k * 6.1}" cy="41" r="2.6" fill="${bits[k] === "1" ? "#F0C040" : "#D9D2C3"}"/>`;
    return svg(`
  <path d="M5 24 Q32 10 59 24 L59 29 L5 29 Z" fill="#A8743F" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="5" y="29" width="54" height="26" rx="4" fill="#C98B5E" stroke="${INK}" stroke-width="3"/>
  <rect x="7" y="36" width="50" height="10" rx="5" fill="#FFF6E5"/>${dots}
  <rect x="28" y="21" width="8" height="10" rx="2" fill="#E0B04A" stroke="${INK}" stroke-width="2"/>`);
  }

  // 14-o'yin: rangli piksellar
  function piksel() {
    const colors = ["#E0524A", "#F0C040", "#1A9E77", "#2F6FDE", "#FFFFFF", "#E0524A", "#8E5BD0", "#F0C040", "#1A9E77"];
    let cells = "";
    colors.forEach((c, i) => { cells += `<rect x="${7 + (i % 3) * 17}" y="${7 + Math.floor(i / 3) * 17}" width="15" height="15" rx="2.5" fill="${c}"/>`; });
    return svg(`<rect x="4" y="4" width="56" height="56" rx="6" fill="${INK}"/>${cells}`);
  }

  // 15-o'yin: kinolenta — uchta kadr
  const kadr = svg(`
  <rect x="3" y="12" width="58" height="40" rx="4" fill="${INK}"/>
  <path d="M7 16 h5 M19 16 h5 M31 16 h5 M43 16 h5 M55 16 h3 M7 48 h5 M19 48 h5 M31 48 h5 M43 48 h5 M55 48 h3" stroke="#FFF6E5" stroke-width="3"/>
  <rect x="7" y="21" width="15" height="22" rx="2" fill="#9FC6E8"/>
  <rect x="25" y="21" width="15" height="22" rx="2" fill="#9FC6E8"/>
  <rect x="43" y="21" width="15" height="22" rx="2" fill="#9FC6E8"/>
  <circle cx="12" cy="36" r="3.5" fill="#E0524A"/>
  <circle cx="32" cy="29" r="3.5" fill="#E0524A"/>
  <circle cx="52" cy="36" r="3.5" fill="#E0524A"/>`);

  // 16-o'yin: ichma-ich qutilar (xotira ombori)
  const ombor = svg(`
  <rect x="4" y="4" width="56" height="56" rx="7" fill="#C98B5E" stroke="${INK}" stroke-width="3"/>
  <rect x="13" y="13" width="38" height="38" rx="6" fill="#E6B98E" stroke="${INK}" stroke-width="2.5"/>
  <rect x="22" y="22" width="20" height="20" rx="4" fill="#FFF6E5" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="5" fill="#F0C040" stroke="${INK}" stroke-width="2"/>`);

  // 17-o'yin: cho't
  function choti() {
    const counts = [1, 3, 2];
    const colors = ["#8E5BD0", "#1A9E77", "#F08A24"];
    let out = `<rect x="6" y="6" width="52" height="52" rx="6" fill="none" stroke="#8A5A2B" stroke-width="5"/>`;
    counts.forEach((n, i) => {
      const x = 20 + i * 12;
      out += `<rect x="${x - 1}" y="10" width="2" height="44" fill="#5A3A1E"/>`;
      for (let k = 0; k < n; k++) out += `<rect x="${x - 5}" y="${46 - k * 7}" width="10" height="6" rx="3" fill="${colors[i]}"/>`;
    });
    return svg(out);
  }

  // 18-o'yin: tangalar
  const tanga = svg(`
  <circle cx="24" cy="36" r="17" fill="#F0C040" stroke="${INK}" stroke-width="3"/>
  <circle cx="24" cy="36" r="10" fill="none" stroke="#C98B2E" stroke-width="3"/>
  <circle cx="46" cy="22" r="12" fill="#F0C040" stroke="${INK}" stroke-width="3"/>
  <circle cx="48" cy="48" r="8" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>`);

  // 19-o'yin: qop va olma
  const qop = svg(`
  <path d="M16 20 Q8 58 32 60 Q56 58 48 20 Z" fill="#C98B5E" stroke="${INK}" stroke-width="3"/>
  <path d="M20 20 Q32 8 44 20" stroke="#8A5A2B" stroke-width="4" fill="none"/>
  <circle cx="50" cy="50" r="9" fill="#E0524A" stroke="${INK}" stroke-width="2"/>
  <path d="M50 41 q2 -5 6 -6" stroke="#1A9E77" stroke-width="3" fill="none" stroke-linecap="round"/>`);

  // 20-o'yin: ikkilik qo'shish — chiroqlar va plyus
  const hisob2 = svg(`
  <circle cx="14" cy="18" r="8" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="32" cy="18" r="8" fill="#D9D2C3" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="50" cy="18" r="8" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
  <path d="M32 32 V52 M22 42 H42" stroke="#1A9E77" stroke-width="6" stroke-linecap="round"/>
  <circle cx="14" cy="42" r="5" fill="#F0C040" stroke="${INK}" stroke-width="2"/>
  <circle cx="50" cy="42" r="5" fill="#F0C040" stroke="${INK}" stroke-width="2"/>`);

  // 21-o'yin: rang kvadratlari 2 × 2
  const rang16 = svg(`
  <rect x="6" y="6" width="24" height="24" rx="5" fill="#FF8800" stroke="${INK}" stroke-width="2.5"/>
  <rect x="34" y="6" width="24" height="24" rx="5" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5"/>
  <rect x="6" y="34" width="24" height="24" rx="5" fill="#1A9E77" stroke="${INK}" stroke-width="2.5"/>
  <rect x="34" y="34" width="24" height="24" rx="5" fill="#8E5BD0" stroke="${INK}" stroke-width="2.5"/>`);

  // 22-o'yin: halqali sayyora
  const sayyora = svg(`
  <circle cx="32" cy="32" r="18" fill="#F08A24" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="32" cy="34" rx="29" ry="8" fill="none" stroke="#8E5BD0" stroke-width="4"/>
  <circle cx="54" cy="10" r="3" fill="#F0C040"/><circle cx="10" cy="54" r="2.5" fill="#F0C040"/>`);

  // 23-o'yin: klaviatura — tugmalar barmoq ranglarida, F va J da bo'rtiq
  const klaviatura = svg(`
  <rect x="3" y="14" width="58" height="38" rx="7" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  ${["#8E5BD0", "#1A9E77", "#F08A24", "#2F6FDE", "#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"].map((c, k) => `<rect x="${8 + k * 6.3}" y="20" width="5" height="8" rx="1.5" fill="${c}"/><rect x="${9.5 + k * 6.3}" y="31" width="5" height="8" rx="1.5" fill="${c}"/>`).join("")}
  <rect x="18" y="42" width="28" height="5" rx="2.5" fill="#8A929A"/>`);

  // 24-o'yin: ikki kalit va yoniq chiroq
  const mantiq = svg(`
  <path d="M6 40 H16 M36 40 H26 M26 40 L36 30" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M16 40 L24 30" stroke="#F08A24" stroke-width="4" stroke-linecap="round"/>
  <circle cx="16" cy="40" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="26" cy="40" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
  <path d="M36 40 H44" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  ${[0, 60, 120, 180, 240, 300].map((a) => `<rect x="50" y="8" width="4" height="7" rx="2" fill="#FFC83D" transform="rotate(${a} 52 26)"/>`).join("")}
  <circle cx="52" cy="26" r="9" fill="#FFD54A" stroke="${INK}" stroke-width="3"/>
  <path d="M44 40 H52 V35" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>`);

  // 25-o'yin: zinapoya, pastda va tepada kalit, yoniq chiroq
  const zinapoya = svg(`
  <path d="M4 60 H18 V48 H30 V36 H42 V24 H60 V60 Z" fill="#E8DCC8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="7" y="40" width="8" height="12" rx="2" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
  <rect x="50" y="10" width="8" height="12" rx="2" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
  ${[0, 60, 120, 180, 240, 300].map((a) => `<rect x="24" y="2" width="3.5" height="6" rx="1.75" fill="#FFC83D" transform="rotate(${a} 26 16)"/>`).join("")}
  <circle cx="26" cy="16" r="7" fill="#FFD54A" stroke="${INK}" stroke-width="2.5"/>`);

  // Tez yozish poygasi: yo'lak, ikki xabarchi (Oy va Quyosh rangida) va bayroq
  const poyga = svg(`
  <path d="M4 50 H50" stroke="#D9D2C3" stroke-width="4" stroke-dasharray="7 5" stroke-linecap="round"/>
  <circle cx="16" cy="22" r="6" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5"/>
  <path d="M12 44 L16 30 L20 44" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="34" cy="26" r="6" fill="#8E5BD0" stroke="${INK}" stroke-width="2.5"/>
  <path d="M30 46 L34 34 L38 46" stroke="#8E5BD0" stroke-width="5" stroke-linecap="round" fill="none"/>
  <rect x="52" y="10" width="4" height="44" rx="2" fill="#8A5A2B"/>
  <path d="M56 12 L64 17 L56 23 Z" fill="#1A9E77" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);

  // Onlayn: ikki qurilma va ular orasidagi to'lqinlar
  const onlayn = svg(`
  <rect x="4" y="18" width="18" height="30" rx="4" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5"/>
  <rect x="42" y="18" width="18" height="30" rx="4" fill="#8E5BD0" stroke="${INK}" stroke-width="2.5"/>
  <rect x="8" y="23" width="10" height="18" rx="2" fill="#DCE8FA"/>
  <rect x="46" y="23" width="10" height="18" rx="2" fill="#EDE3F8"/>
  <path d="M27 27 Q32 33 27 39 M31 23 Q39 33 31 43" stroke="#1A9E77" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M37 27 Q32 33 37 39" stroke="#1A9E77" stroke-width="3" stroke-linecap="round" fill="none"/>`);

  // Togʻga chiqish: uch cho'qqi, bayroq va chiquvchi
  const tog = svg(`
  <path d="M2 54 L20 24 L30 40 L42 16 L62 54 Z" fill="#9A8F7E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M42 16 L36 26 L42 30 L48 26 Z" fill="#FFFFFF"/>
  <path d="M20 24 L16 31 L20 34 L24 31 Z" fill="#FFFFFF"/>
  <rect x="41" y="4" width="3" height="13" rx="1.5" fill="#8A5A2B"/>
  <path d="M44 5 L56 9 L44 13 Z" fill="#C8553D" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="26" cy="44" r="5" fill="#F08A24" stroke="${INK}" stroke-width="2.5"/>`);

  // Musobaqa: Oy (ko'k) va Quyosh (binafsha) yonma-yon
  const musobaqa = svg(`
  <circle cx="21" cy="32" r="18" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
  <path d="M24 21 A11.5 11.5 0 1 0 24 43 A9 9 0 1 1 24 21 Z" fill="#FFE9A8"/>
  <circle cx="43" cy="32" r="18" fill="#8E5BD0" stroke="${INK}" stroke-width="3"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="41.5" y="18" width="3" height="5" rx="1.5" fill="#FFC83D" transform="rotate(${a} 43 32)"/>`).join("")}
  <circle cx="43" cy="32" r="6.5" fill="#FFC83D"/>`);

  // 26-o'yin: katakli maydon, robot yo'li va gulxan
  const yol = svg(`
  <rect x="5" y="5" width="54" height="54" rx="10" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M23 5 V59 M41 5 V59 M5 23 H59 M5 41 H59" stroke="#E4DCCB" stroke-width="2.5"/>
  <path d="M14 50 V32 H44" stroke="#2F6FDE" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 26 L48 32 L40 38 Z" fill="#2F6FDE"/>
  <rect x="8" y="45" width="12" height="11" rx="3.5" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="11.5" cy="50.5" r="1.6" fill="#FFFFFF"/>
  <circle cx="16.5" cy="50.5" r="1.6" fill="#FFFFFF"/>
  <path d="M44 20 L56 15 M44 15 L56 20" stroke="#8A5A2B" stroke-width="3" stroke-linecap="round"/>
  <path d="M50 3 Q57 9 54 14 Q52 17 50 17 Q48 17 46 14 Q43 9 50 3 Z" fill="#F08A24"/>`);

  // Yozuv poygasi: klaviatura va orqada togʻ — yozgan sari koʻtarilasan
  const yozuv = svg(`
  <path d="M2 46 L20 16 L30 28 L42 8 L62 46 Z" fill="#9A8F7E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M42 8 L36 17 L42 21 L48 17 Z" fill="#FFFFFF"/>
  <path d="M20 16 L16 22 L20 25 L24 22 Z" fill="#FFFFFF"/>
  <rect x="4" y="40" width="56" height="20" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <rect x="10" y="45" width="9" height="5" rx="2" fill="#2F6FDE"/>
  <rect x="22" y="45" width="9" height="5" rx="2" fill="#F08A24"/>
  <rect x="34" y="45" width="9" height="5" rx="2" fill="#1A9E77"/>
  <rect x="46" y="45" width="8" height="5" rx="2" fill="#8E5BD0"/>
  <rect x="18" y="53" width="28" height="4" rx="2" fill="#DCE8FA"/>`);

  // 27-o'yin: ekranda kod satri va kursor
  const buyruq = svg(`
  <rect x="4" y="10" width="56" height="38" rx="7" fill="#2B2B3A"/>
  <rect x="9" y="15" width="46" height="28" rx="4" fill="#FFFDF7"/>
  <rect x="14" y="21" width="14" height="5" rx="2.5" fill="#8E5BD0"/>
  <rect x="31" y="21" width="19" height="5" rx="2.5" fill="#1A9E77"/>
  <rect x="14" y="31" width="10" height="5" rx="2.5" fill="#2F6FDE"/>
  <rect x="27" y="31" width="6" height="5" rx="1.5" fill="#F08A24"/>
  <rect x="24" y="52" width="16" height="4" fill="#2B2B3A"/>
  <rect x="16" y="56" width="32" height="5" rx="2.5" fill="#2B2B3A"/>`);

  // 29-o'yin: ikkita yorliqli quti — o'zgaruvchilar
  const qutilar2 = svg(`
  <rect x="4" y="22" width="26" height="24" rx="5" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="4" y="16" width="26" height="9" rx="4" fill="#D9C7A6" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="17" cy="35" r="6" fill="#2F6FDE"/>
  <rect x="34" y="22" width="26" height="24" rx="5" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="34" y="16" width="26" height="9" rx="4" fill="#D9C7A6" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="47" cy="35" r="6" fill="#F08A24"/>
  <path d="M26 54 h12" stroke="#1A9E77" stroke-width="3" stroke-linecap="round"/>`);

  // 28-o'yin: teng bo'lingan toshlar va ortgani
  const bolish = svg(`
  <rect x="4" y="16" width="24" height="24" rx="6" fill="#FFFDF7" stroke="#D9C7A6" stroke-width="3"/>
  <circle cx="12" cy="24" r="4" fill="#2F6FDE"/><circle cx="21" cy="24" r="4" fill="#2F6FDE"/>
  <circle cx="12" cy="33" r="4" fill="#2F6FDE"/><circle cx="21" cy="33" r="4" fill="#2F6FDE"/>
  <rect x="32" y="16" width="24" height="24" rx="6" fill="#FFFDF7" stroke="#D9C7A6" stroke-width="3"/>
  <circle cx="40" cy="24" r="4" fill="#2F6FDE"/><circle cx="49" cy="24" r="4" fill="#2F6FDE"/>
  <circle cx="40" cy="33" r="4" fill="#2F6FDE"/><circle cx="49" cy="33" r="4" fill="#2F6FDE"/>
  <circle cx="26" cy="52" r="6" fill="#F08A24"/>
  <circle cx="42" cy="52" r="6" fill="#F08A24"/>`);

  // 30-o'yin: ayrilgan yo'l — shart
  const ayri = svg(`
  <path d="M32 58 V38" fill="none" stroke="#8A8577" stroke-width="7" stroke-linecap="round"/>
  <path d="M32 38 Q32 22 16 16" fill="none" stroke="#2F6FDE" stroke-width="7" stroke-linecap="round"/>
  <path d="M32 38 Q32 22 48 16" fill="none" stroke="#8E5BD0" stroke-width="7" stroke-linecap="round"/>
  <circle cx="32" cy="38" r="6" fill="#FFF6E5" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="14" cy="14" r="5" fill="#2F6FDE"/>
  <circle cx="50" cy="14" r="5" fill="#8E5BD0"/>`);

  // 31-o'yin: suv charxi — takror
  const charx = svg(`
  <circle cx="32" cy="32" r="21" fill="none" stroke="#8A8577" stroke-width="4"/>
  <rect x="26" y="4" width="12" height="9" rx="2" fill="#2F6FDE"/>
  <rect x="51" y="26" width="9" height="12" rx="2" fill="#2F6FDE"/>
  <rect x="26" y="51" width="12" height="9" rx="2" fill="#D9C7A6"/>
  <rect x="4" y="26" width="9" height="12" rx="2" fill="#2F6FDE"/>
  <rect x="43" y="11" width="10" height="9" rx="2" fill="#2F6FDE" transform="rotate(45 48 15)"/>
  <rect x="11" y="43" width="10" height="9" rx="2" fill="#D9C7A6" transform="rotate(45 16 47)"/>
  <circle cx="32" cy="32" r="6" fill="#FFF6E5" stroke="#2B2B3A" stroke-width="3"/>`);

  // 32-o'yin: zinapoya — aniq sonli takror
  const zina = svg(`
  <rect x="6" y="44" width="14" height="14" fill="#2F6FDE"/>
  <rect x="20" y="30" width="14" height="28" fill="#2F6FDE"/>
  <rect x="34" y="16" width="14" height="42" fill="#2F6FDE" opacity="0.75"/>
  <rect x="48" y="6" width="12" height="52" fill="#D9C7A6"/>
  <rect x="4" y="58" width="58" height="4" rx="2" fill="#8A8577"/>`);

  // 33-o'yin: raqamlangan qutilar qatori — ro'yxat
  const qator = svg(`
  <rect x="3" y="18" width="17" height="20" rx="4" fill="#2F6FDE"/>
  <rect x="23" y="18" width="17" height="20" rx="4" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="43" y="18" width="17" height="20" rx="4" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="6" y="46" width="9" height="4" rx="2" fill="#8A8577"/>
  <circle cx="29" cy="48" r="3" fill="#8A8577"/>
  <circle cx="47" cy="48" r="3" fill="#8A8577"/><circle cx="56" cy="48" r="3" fill="#8A8577"/>`);

  // 34-o'yin: dastgoh — kiruvchi va chiquvchi
  const dastgoh = svg(`
  <rect x="20" y="18" width="24" height="28" rx="6" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="32" cy="29" r="6" fill="#8E5BD0"/>
  <path d="M3 32 H17" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>
  <path d="M12 26 L19 32 L12 38 Z" fill="#2F6FDE"/>
  <path d="M47 32 H61" stroke="#1A9E77" stroke-width="5" stroke-linecap="round"/>
  <path d="M54 26 L61 32 L54 38 Z" fill="#1A9E77"/>
  <rect x="18" y="50" width="28" height="5" rx="2.5" fill="#8A8577"/>`);

  // 35-o'yin: uch pog'onali minora — uch daraja
  const minora = svg(`
  <rect x="8" y="44" width="48" height="13" rx="3" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="14" y="30" width="36" height="13" rx="3" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="20" y="16" width="24" height="13" rx="3" fill="#D9C7A6" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M32 15 V6" stroke="#8A8577" stroke-width="3" stroke-linecap="round"/>
  <path d="M32 6 L46 10 L32 14 Z" fill="#F08A24"/>`);

  // 36-o'yin: ikki yo'l — biri uzun, biri qisqa
  const ikkiyol = svg(`
  <path d="M10 30 C 20 8, 30 52, 40 30 S 54 8, 58 22" fill="none" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>
  <path d="M10 48 H56" fill="none" stroke="#1A9E77" stroke-width="5" stroke-linecap="round"/>
  <circle cx="9" cy="39" r="6" fill="#8E5BD0"/>
  <rect x="52" y="33" width="12" height="12" rx="3" fill="#F08A24"/>`);

  // 37-o'yin: blok-sxema
  const sxema = svg(`
  <rect x="20" y="4" width="24" height="10" rx="5" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M32 14 V20" stroke="#8A8577" stroke-width="2.5"/>
  <rect x="18" y="20" width="28" height="11" rx="2" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M32 31 V36" stroke="#8A8577" stroke-width="2.5"/>
  <path d="M32 36 L46 45 L32 54 L18 45 Z" fill="#8E5BD0" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M18 45 H8" stroke="#8A8577" stroke-width="2.5"/>
  <path d="M46 45 H56" stroke="#8A8577" stroke-width="2.5"/>`);

  // 38-o'yin: izlash — kataklar va lupa
  const lupa = svg(`
  <rect x="4" y="34" width="13" height="16" rx="3" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="20" y="34" width="13" height="16" rx="3" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="36" y="34" width="13" height="16" rx="3" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="52" y="34" width="8" height="16" rx="3" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="28" cy="18" r="11" fill="none" stroke="#1A9E77" stroke-width="4"/>
  <path d="M36 26 L46 36" stroke="#1A9E77" stroke-width="5" stroke-linecap="round"/>`);

  // 39-o'yin: saralash — aralash ustunlar
  const saralash = svg(`
  <rect x="6" y="34" width="11" height="22" rx="2" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="20" y="44" width="11" height="12" rx="2" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="34" y="18" width="11" height="38" rx="2" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="48" y="28" width="11" height="28" rx="2" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M4 58 H61" stroke="#8A8577" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 10 h22" stroke="#1A9E77" stroke-width="3" stroke-linecap="round"/>
  <path d="M38 6 l5 4 l-5 4" fill="none" stroke="#1A9E77" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);

  // 40-o'yin: qadamlar soni — uch xil o'sish chizig'i
  const osish = svg(`
  <path d="M8 6 V54 H58" fill="none" stroke="#8A8577" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 48 H54" fill="none" stroke="#1A9E77" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M8 50 L54 30" fill="none" stroke="#F08A24" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M8 51 Q38 50 54 10" fill="none" stroke="#8E5BD0" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="54" cy="48" r="4" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="54" cy="30" r="4" fill="#F08A24" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="54" cy="10" r="4" fill="#8E5BD0" stroke="#2B2B3A" stroke-width="2"/>`);

  // 41-o'yin: tanlov daraxti — ildiz, shoxlar va barglar
  const daraxt = svg(`
  <path d="M12 32 C 22 32, 24 12, 34 12" fill="none" stroke="#8A8577" stroke-width="3"/>
  <path d="M12 32 C 22 32, 24 32, 34 32" fill="none" stroke="#8A8577" stroke-width="3"/>
  <path d="M12 32 C 22 32, 24 52, 34 52" fill="none" stroke="#8A8577" stroke-width="3"/>
  <path d="M34 12 C 44 12, 46 6, 54 6" fill="none" stroke="#8A8577" stroke-width="2.5"/>
  <path d="M34 12 C 44 12, 46 20, 54 20" fill="none" stroke="#8A8577" stroke-width="2.5"/>
  <path d="M34 52 C 44 52, 46 44, 54 44" fill="none" stroke="#8A8577" stroke-width="2.5"/>
  <path d="M34 52 C 44 52, 46 58, 54 58" fill="none" stroke="#8A8577" stroke-width="2.5"/>
  <circle cx="12" cy="32" r="7" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="34" cy="12" r="6" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="34" cy="32" r="6" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="34" cy="52" r="6" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="54" cy="6" r="4.5" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="54" cy="20" r="4.5" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="54" cy="44" r="4.5" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="54" cy="58" r="4.5" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>`);

  // 42-o'yin: qatorga terish — uch bola qatorda, o'rinlari almashadi
  const qator3 = svg(`
  <circle cx="16" cy="26" r="8" fill="#F2D2B6" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M7 52 v-13 a9 9 0 0 1 18 0 v13 z" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="32" cy="26" r="8" fill="#F2D2B6" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M23 52 v-13 a9 9 0 0 1 18 0 v13 z" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="48" cy="26" r="8" fill="#F2D2B6" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M39 52 v-13 a9 9 0 0 1 18 0 v13 z" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M6 56 H58" stroke="#8A8577" stroke-width="3" stroke-linecap="round"/>
  <path d="M14 12 h20" stroke="#8E5BD0" stroke-width="3" stroke-linecap="round"/>
  <path d="M30 8 l5 4 l-5 4" fill="none" stroke="#8E5BD0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 16 l-5 -4 l5 -4" fill="none" stroke="#8E5BD0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);

  // 43-o'yin: jamoa tanlash — beshtadan uchtasi doira ichida
  const jamoa = svg(`
  <rect x="4" y="18" width="37" height="38" rx="11" fill="none" stroke="#1A9E77" stroke-width="3" stroke-dasharray="6 5"/>
  <circle cx="13" cy="30" r="6" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M6 52 v-10 a7 7 0 0 1 14 0 v10 z" fill="#BDE6D4" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="30" cy="30" r="6" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M23 52 v-10 a7 7 0 0 1 14 0 v10 z" fill="#BDE6D4" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="47" cy="30" r="6" fill="#E8DEC8" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M40 52 v-10 a7 7 0 0 1 14 0 v10 z" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>`);

  // 44-o'yin: Paskal uchburchagi — kataklar piramidasi
  const paskal = svg(`
  <circle cx="32" cy="12" r="7" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="22" cy="28" r="7" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="42" cy="28" r="7" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="12" cy="44" r="7" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="32" cy="44" r="7" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="52" cy="44" r="7" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M22 35 L32 44 M42 35 L32 44" stroke="#2F6FDE" stroke-width="3" stroke-linecap="round"/>
  <circle cx="22" cy="58" r="5" fill="#E8DEC8" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="42" cy="58" r="5" fill="#E8DEC8" stroke="#2B2B3A" stroke-width="2"/>`);

  // 45-o'yin: kaptarxona — to'rt uya, bittasida ikkita
  const kaptar = svg(`
  <path d="M4 22 L32 8 L60 22" fill="none" stroke="#8A8577" stroke-width="3" stroke-linejoin="round"/>
  <rect x="7" y="22" width="22" height="34" rx="5" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="35" y="22" width="22" height="34" rx="5" fill="#FFE9C7" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="18" cy="42" r="6" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="46" cy="34" r="6" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="46" cy="47" r="6" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>`);

  // 46-o'yin: tezkor tugmalar — ikki tugma birga bosiladi
  const tezkor = svg(`
  <rect x="5" y="22" width="30" height="24" rx="6" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M13 34 h14" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <rect x="41" y="22" width="22" height="24" rx="6" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M48 28 v12 M48 28 h6 a4 4 0 0 1 0 9 h-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M36 34 h4 M38 32 v4" stroke="#2B2B3A" stroke-width="3" stroke-linecap="round"/>
  <path d="M12 54 q22 -6 44 0" fill="none" stroke="#1A9E77" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 6"/>`);

  // 47-o'yin: robot aqlli bo'ldi — takror va ikki yo'l
  const robotaql = svg(`
  <path d="M8 46 H56" stroke="#D8CDB4" stroke-width="7" stroke-linecap="round"/>
  <path d="M30 46 C 30 24, 44 20, 56 20 L 56 36" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 5"/>
  <rect x="38" y="38" width="16" height="16" rx="4" fill="#8A8577" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="8" y="32" width="22" height="20" rx="5" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="15" cy="42" r="3" fill="#fff"/><circle cx="24" cy="42" r="3" fill="#fff"/>
  <path d="M19 32 V24" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="19" cy="21" r="3.5" fill="#F08A24" stroke="#2B2B3A" stroke-width="2"/>`);

  // 48-o'yin: mantiq kodda — ikki kalit va chiroq
  const mantiqkod = svg(`
  <path d="M6 38 H20" stroke="#8A8577" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M20 38 L32 30" stroke="#1A9E77" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="20" cy="38" r="3.5" fill="#2B2B3A"/><circle cx="34" cy="38" r="3.5" fill="#2B2B3A"/>
  <path d="M34 38 H44" stroke="#8A8577" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="52" cy="38" r="9" fill="#FFE9A8" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M52 20 v-5 M64 26 l4 -4 M40 26 l-4 -4" stroke="#F08A24" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 54 H60" stroke="#D8CDB4" stroke-width="3" stroke-linecap="round"/>`);

  // 49-o'yin: tank jangi — tepadan ko'rinadigan tank
  const tank = svg(`
  <rect x="10" y="16" width="38" height="7" rx="3" fill="#6B6558" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="10" y="41" width="38" height="7" rx="3" fill="#6B6558" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="13" y="22" width="32" height="20" rx="5" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="29" cy="32" r="8" fill="#1B4A94" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="36" y="29" width="22" height="6" rx="2" fill="#1B4A94" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="60" cy="32" r="3.5" fill="#F08A24" stroke="#2B2B3A" stroke-width="2"/>`);

  // 50-o'yin: parol kuchi — qulf
  const qulf = svg(`
  <path d="M22 28 v-6 a10 10 0 0 1 20 0 v6" fill="none" stroke="#8A8577" stroke-width="5" stroke-linecap="round"/>
  <rect x="14" y="26" width="36" height="28" rx="6" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="32" cy="37" r="4.5" fill="#2B2B3A"/>
  <path d="M32 39 v8" stroke="#2B2B3A" stroke-width="3" stroke-linecap="round"/>
  <circle cx="56" cy="20" r="4" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="56" cy="34" r="4" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="56" cy="48" r="4" fill="#8E5BD0" stroke="#2B2B3A" stroke-width="2"/>`);

  // Tank dueli: ikki tank yuzma-yuz
  const tankduel = svg(`
  <rect x="4" y="18" width="24" height="14" rx="4" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="24" y="22" width="14" height="5" rx="2" fill="#1B4A94" stroke="#2B2B3A" stroke-width="2"/>
  <rect x="36" y="34" width="24" height="14" rx="4" fill="#C0392B" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="26" y="38" width="14" height="5" rx="2" fill="#8E2B20" stroke="#2B2B3A" stroke-width="2"/>
  <path d="M8 56 H58" stroke="#8A8577" stroke-width="3" stroke-linecap="round"/>
  <circle cx="44" cy="12" r="3" fill="#F08A24"/><circle cx="52" cy="8" r="2.5" fill="#F08A24"/>`);

  // 53-o'yin: xato ovi — lupa va xato belgisi
  const xatoovi = svg(`
  <path d="M8 50 H26 V26 H42" fill="none" stroke="#D8CDB4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="34" y="18" width="16" height="16" rx="4" fill="#C0392B" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M38 22 l8 8 M46 22 l-8 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="6" y="42" width="16" height="14" rx="4" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="11" cy="49" r="2" fill="#fff"/><circle cx="17" cy="49" r="2" fill="#fff"/>
  <circle cx="46" cy="46" r="11" fill="none" stroke="#8A8577" stroke-width="3.5"/>
  <path d="M54 54 L62 62" stroke="#8A8577" stroke-width="4" stroke-linecap="round"/>`);

  // 62-o'yin: o'z buyrug'im — yulduz bloki ichida naqsh, yo'lda ikki marta
  const yulduzbuy = svg(`
  <path d="M6 50 V38 H18 V50 H28 V38 H40 V50 H52" fill="none" stroke="#D8CDB4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="30" y="6" width="28" height="24" rx="6" fill="#FFE9CF" stroke="#F08A24" stroke-width="3"/>
  <path d="M44 10 l3 6.5 l7 .8 l-5.2 4.8 l1.5 7 l-6.3 -3.6 l-6.3 3.6 l1.5 -7 l-5.2 -4.8 l7 -.8 z" fill="#F08A24" stroke="#2B2B3A" stroke-width="1.5" stroke-linejoin="round"/>
  <rect x="4" y="12" width="18" height="16" rx="4" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="10" cy="20" r="2.2" fill="#fff"/><circle cx="16" cy="20" r="2.2" fill="#fff"/>`);

  // 63-o'yin: to'siqqacha — robot toshgacha yuradi (uzuq o'q)
  const tosiqqacha = svg(`
  <path d="M8 44 H58" stroke="#D8CDB4" stroke-width="7" stroke-linecap="round"/>
  <path d="M26 30 H44" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 4"/>
  <path d="M42 24 l6 6 l-6 6" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M50 46 Q48 32 56 28 Q62 30 62 46 Z" fill="#9A8F7E" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="4" y="30" width="20" height="18" rx="5" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="10" cy="39" r="2.5" fill="#fff"/><circle cx="18" cy="39" r="2.5" fill="#fff"/>`);

  // 64-o'yin: robot sanaydi — robot va ichida chiziqchalar (sanoq) bor quti
  const sanoq = svg(`
  <rect x="32" y="12" width="28" height="26" rx="6" fill="#FFF4CC" stroke="#F0C040" stroke-width="3"/>
  <path d="M38 18 V32 M43 18 V32 M48 18 V32 M53 18 V32" stroke="#2B2B3A" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M36 30 L56 20" stroke="#F08A24" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M6 54 H58" stroke="#D8CDB4" stroke-width="6" stroke-linecap="round"/>
  <rect x="6" y="28" width="22" height="20" rx="5" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="13" cy="38" r="2.5" fill="#fff"/><circle cx="21" cy="38" r="2.5" fill="#fff"/>
  <path d="M17 28 V21" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="17" cy="18" r="3.5" fill="#F08A24" stroke="#2B2B3A" stroke-width="2"/>`);

  // 65-o'yin: bloklardan Pythonga — chapda bloklar, o'ngda kod satrlari
  const blokpy = svg(`
  <rect x="4" y="10" width="20" height="10" rx="3" fill="#D8E6FB" stroke="#2F6FDE" stroke-width="2.5"/>
  <rect x="4" y="24" width="24" height="18" rx="4" fill="#FFF3DF" stroke="#F08A24" stroke-width="2.5"/>
  <rect x="9" y="30" width="14" height="8" rx="2" fill="#D8E6FB" stroke="#2F6FDE" stroke-width="2"/>
  <rect x="4" y="46" width="20" height="10" rx="3" fill="#D8E6FB" stroke="#2F6FDE" stroke-width="2.5"/>
  <path d="M29 33 h5" stroke="#2B2B3A" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="34" y="8" width="26" height="50" rx="5" fill="#23232F"/>
  <path d="M38 16 H54 M38 26 H52 M43 34 H56 M43 42 H52 M38 50 H50" stroke="#9CD3FF" stroke-width="3" stroke-linecap="round"/>`);

  // 51-o'yin: bir tomonlama qulf — parol izga aylanadi, orqaga qaytmaydi
  const izqulf = svg(`
  <rect x="4" y="18" width="22" height="28" rx="6" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="11" cy="28" r="2.5" fill="#fff"/><circle cx="19" cy="28" r="2.5" fill="#fff"/>
  <circle cx="11" cy="37" r="2.5" fill="#fff"/><circle cx="19" cy="37" r="2.5" fill="#fff"/>
  <path d="M29 26 H41" stroke="#1A9E77" stroke-width="4" stroke-linecap="round"/>
  <path d="M36 21 l5 5 l-5 5" fill="none" stroke="#1A9E77" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M41 42 H29" stroke="#C0392B" stroke-width="4" stroke-linecap="round"/>
  <path d="M30 46 l10 -8" stroke="#C0392B" stroke-width="4" stroke-linecap="round"/>
  <circle cx="51" cy="34" r="12" fill="#F3C969" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M45 34 a6 6 0 0 1 12 0" fill="none" stroke="#2B2B3A" stroke-width="2"/>
  <path d="M48 38 a3.5 3.5 0 0 1 7 0" fill="none" stroke="#2B2B3A" stroke-width="2"/>
  <path d="M42 29 a9.5 9.5 0 0 1 18 0" fill="none" stroke="#2B2B3A" stroke-width="2"/>`);

  // 52-o'yin: firibgar xat — qarmoqqa ilingan xat
  const qarmoq = svg(`
  <path d="M44 6 V30 a10 10 0 0 1 -20 0" fill="none" stroke="#8A8577" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="6" y="26" width="40" height="28" rx="5" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M6 29 L26 43 L46 29" fill="none" stroke="#2B2B3A" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="48" cy="46" r="10" fill="#C0392B" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M48 40 v7" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <circle cx="48" cy="51" r="1.8" fill="#fff"/>`);

  // 58-o'yin: xabar bo'laklari — raqamlangan uchta konvert
  const bolaklar = svg(`
  <rect x="4" y="30" width="22" height="16" rx="2" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2.5" transform="rotate(-8 15 38)"/>
  <rect x="22" y="22" width="22" height="16" rx="2" fill="#FFF4CC" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="38" y="34" width="22" height="16" rx="2" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2.5" transform="rotate(8 49 42)"/>
  <circle cx="12" cy="24" r="5" fill="#2F6FDE"/><circle cx="33" cy="16" r="5" fill="#F08A24"/><circle cx="54" cy="28" r="5" fill="#1A9E77"/>`);

  // 59-o'yin: qabila manzillari — uy va manzil taxtachasi
  const manzil = svg(`
  <path d="M8 30 L28 12 L48 30" fill="none" stroke="#2B2B3A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="13" y="28" width="30" height="24" rx="2" fill="#D8E6FB" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="24" y="36" width="9" height="16" fill="#2F6FDE"/>
  <rect x="40" y="6" width="20" height="12" rx="3" fill="#FFF4CC" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="45" cy="12" r="1.6" fill="#2B2B3A"/><circle cx="50" cy="12" r="1.6" fill="#2B2B3A"/><circle cx="55" cy="12" r="1.6" fill="#2B2B3A"/>`);

  // 60-o'yin: paket yo'li — tugunlar to'ri va yashil yo'l
  const tugunlar = svg(`
  <path d="M12 16 H52 M12 16 V48 M32 16 V48 M52 16 V48 M12 48 H52" stroke="#978B76" stroke-width="3"/>
  <path d="M12 16 V48 H52" fill="none" stroke="#1A9E77" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="12" cy="16" r="6" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="32" cy="16" r="5" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2"/><circle cx="52" cy="16" r="5" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="12" cy="48" r="5" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2"/><circle cx="32" cy="48" r="5" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="52" cy="48" r="6" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>`);

  // 61-o'yin: qulfli yo'l — manzil satri va yashil qulf
  const yolqulf = svg(`
  <rect x="4" y="14" width="56" height="16" rx="8" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M22 22 H52" stroke="#978B76" stroke-width="3" stroke-linecap="round"/>
  <rect x="9" y="19" width="8" height="7" rx="1.5" fill="#1A9E77"/>
  <path d="M24 46 V40 a8 8 0 0 1 16 0 V46" fill="none" stroke="#137A58" stroke-width="4"/>
  <rect x="18" y="44" width="28" height="16" rx="4" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2.5"/>
  <circle cx="32" cy="52" r="2.6" fill="#FFFFFF"/>`);

  // 54-o'yin: C++ — kod varag'i va ikki qo'shuv belgisi
  const cpp = svg(`
  <rect x="6" y="10" width="34" height="44" rx="6" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M14 22 h16 M14 30 h18 M14 38 h12 M14 46 h15" stroke="#2F6FDE" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="44" cy="40" r="15" fill="#F08A24" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M39 40 h-1" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M44 22 v10 M39 27 h10" stroke="#1A9E77" stroke-width="4" stroke-linecap="round"/>
  <path d="M56 36 v8 M52 40 h8" stroke="#1A9E77" stroke-width="4" stroke-linecap="round"/>
  <path d="M38 44 a7 7 0 1 0 0 -8" fill="none" stroke="#2B2B3A" stroke-width="3.5" stroke-linecap="round"/>`);

  // 55-o'yin: tur va chegara — kichik quti to'lib toshdi
  const cpptur = svg(`
  <rect x="5" y="28" width="26" height="26" rx="5" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="9" y="34" width="18" height="14" rx="3" fill="#2F6FDE"/>
  <circle cx="11" cy="20" r="5" fill="#C0392B" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="25" cy="14" r="5" fill="#C0392B" stroke="#2B2B3A" stroke-width="2"/>
  <path d="M35 40 h8" stroke="#8A8577" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M40 35 l6 5 l-6 5" fill="none" stroke="#8A8577" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="38" y="14" width="22" height="40" rx="5" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <rect x="42" y="19" width="14" height="30" rx="3" fill="#1A9E77"/>
  <circle cx="45" cy="26" r="3.5" fill="#F3C969" stroke="#2B2B3A" stroke-width="1.5"/>
  <circle cx="53" cy="26" r="3.5" fill="#F3C969" stroke="#2B2B3A" stroke-width="1.5"/>
  <circle cx="49" cy="38" r="3.5" fill="#F3C969" stroke="#2B2B3A" stroke-width="1.5"/>`);

  // 56-o'yin: qavs va takror — qavs ichidagi blok va aylanma strelka
  const cppsikl = svg(`
  <path d="M22 12 q-9 0 -9 9 v7 q0 5 -6 5 q6 0 6 5 v7 q0 9 9 9" fill="none" stroke="#F08A24" stroke-width="4" stroke-linecap="round"/>
  <path d="M44 12 q9 0 9 9 v7 q0 5 6 5 q-6 0 -6 5 v7 q0 9 -9 9" fill="none" stroke="#F08A24" stroke-width="4" stroke-linecap="round"/>
  <rect x="26" y="20" width="16" height="5" rx="2.5" fill="#2F6FDE"/>
  <rect x="26" y="29" width="12" height="5" rx="2.5" fill="#2F6FDE"/>
  <rect x="26" y="38" width="15" height="5" rx="2.5" fill="#2F6FDE"/>
  <path d="M44 56 a14 14 0 1 1 10 -20" fill="none" stroke="#1A9E77" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M48 30 l7 6 l-8 4" fill="none" stroke="#1A9E77" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`);

  // 57-o'yin: massiv va saralash — kataklar qatori va saralangan ustunlar
  const cppmassiv = svg(`
  <rect x="5" y="12" width="14" height="14" rx="3" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2"/>
  <rect x="21" y="12" width="14" height="14" rx="3" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2"/>
  <rect x="37" y="12" width="14" height="14" rx="3" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2"/>
  <circle cx="12" cy="19" r="4" fill="#2F6FDE"/>
  <circle cx="28" cy="19" r="4" fill="#C0392B"/>
  <circle cx="44" cy="19" r="4" fill="#1A9E77"/>
  <path d="M28 30 v6" stroke="#8A8577" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M23 32 l5 6 l5 -6" fill="none" stroke="#8A8577" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="10" y="48" width="11" height="10" rx="2.5" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="2"/>
  <rect x="26" y="42" width="11" height="16" rx="2.5" fill="#1A9E77" stroke="#2B2B3A" stroke-width="2"/>
  <rect x="42" y="34" width="11" height="24" rx="2.5" fill="#C0392B" stroke="#2B2B3A" stroke-width="2"/>`);

  // Shpargalka: varaq va qisqa yozuvlar
  const varaq = svg(`
  <rect x="12" y="6" width="40" height="52" rx="6" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="2.5"/>
  <path d="M20 18 h24 M20 27 h24 M20 36 h16 M20 45 h20" stroke="#2F6FDE" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M44 36 h8" stroke="#F08A24" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M46 45 h6" stroke="#1A9E77" stroke-width="3.5" stroke-linecap="round"/>`);

  // 66-o'yin: kompyuter qismlari — monitor va tizim bloki
  const qismlar = svg(`
  <rect x="4" y="10" width="38" height="28" rx="4" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <rect x="9" y="15" width="28" height="18" rx="2" fill="#D8E6FB"/>
  <path d="M23 38 v8 M14 48 h18" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="47" y="10" width="13" height="40" rx="3" fill="#F3EFE3" stroke="${INK}" stroke-width="3"/>
  <circle cx="53.5" cy="18" r="2.5" fill="#1A9E77"/>
  <path d="M51 27 h5 M51 33 h5" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`);

  // 67-o'yin: sichqoncha — chap tugmasi bo'yalgan
  const sichqoncha = svg(`
  <path d="M32 9 q0 -6 9 -6" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <rect x="17" y="9" width="30" height="48" rx="15" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M32 10.5 V29 H18.5 V24 a13.5 13.5 0 0 1 13.5 -13.5 z" fill="#2F6FDE"/>
  <path d="M17 29 H47 M32 9 V29" stroke="${INK}" stroke-width="3"/>
  <rect x="29" y="14" width="6" height="10" rx="3" fill="#F08A24" stroke="${INK}" stroke-width="2"/>`);

  // 68-o'yin: ekran va oynalar — ikki ustma-ust oyna, oldingisi faol
  const oynalar = svg(`
  <rect x="5" y="7" width="38" height="30" rx="4" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M5 16 h38" stroke="${INK}" stroke-width="3"/>
  <rect x="21" y="24" width="38" height="32" rx="4" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M21 34 v-6 a4 4 0 0 1 4 -4 h30 a4 4 0 0 1 4 4 v6 z" fill="#2F6FDE" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 27 l4 4 M54 27 l-4 4" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M28 42 h20 M28 49 h12" stroke="#C9D3E3" stroke-width="3.5" stroke-linecap="round"/>`);

  // 69-o'yin: fayl va papka — papkadan varaq chiqib turibdi
  const papka = svg(`
  <rect x="33" y="7" width="20" height="20" rx="2.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
  <path d="M38 13 h10 M38 18 h10" stroke="#2F6FDE" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M4 19 a4 4 0 0 1 4 -4 h15 l6 7 h27 a4 4 0 0 1 4 4 v25 a4 4 0 0 1 -4 4 H8 a4 4 0 0 1 -4 -4 z" fill="#F0C040" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M4 31 h56" stroke="${INK}" stroke-width="3"/>`);

  // 70-o'yin: kichik rassom — katakli rasm va mo'yqalam
  const rassom = svg(`
  <rect x="4" y="8" width="42" height="34" rx="4" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M4 19 h42 M4 30 h42 M15 8 v34 M26 8 v34 M37 8 v34" stroke="#E6E0D0" stroke-width="2"/>
  <rect x="15" y="19" width="11" height="11" fill="#2F6FDE"/><rect x="26" y="19" width="11" height="11" fill="#F0C040"/>
  <rect x="15" y="30" width="11" height="11" fill="#1A9E77"/><rect x="26" y="8" width="11" height="11" fill="#F08A24"/>
  <path d="M58 20 L40 44" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M58 20 L40 44" stroke="#8A5A10" stroke-width="4" stroke-linecap="round"/>
  <path d="M38 46 l-6 10 l12 -4 z" fill="#8E5BD0" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`);

  // 71-o'yin: matn yozamiz — varaq, satrlar va kursor
  const muharrir = svg(`
  <rect x="10" y="4" width="44" height="56" rx="5" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M18 16 h20 M18 25 h28 M18 34 h22 M18 43 h14" stroke="#2F6FDE" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M40 16 h8" stroke="#F08A24" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M35 40 v10" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M31 40 h8 M31 50 h8" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`);

  // 72-o'yin: brauzer va sayt — oyna, manzil satri va yer shari
  const brauzer = svg(`
  <rect x="3" y="8" width="58" height="48" rx="5" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M3 22 h58" stroke="${INK}" stroke-width="3"/>
  <circle cx="11" cy="15" r="2.5" fill="#F08A24"/><circle cx="19" cy="15" r="2.5" fill="#F0C040"/>
  <rect x="26" y="11" width="30" height="8" rx="4" fill="#E6EEFC" stroke="${INK}" stroke-width="2"/>
  <circle cx="32" cy="39" r="12" fill="#D8E6FB" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="32" cy="39" rx="5" ry="12" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>
  <path d="M20 39 h24 M22 33 h20 M22 45 h20" fill="none" stroke="#2F6FDE" stroke-width="2.5"/>`);

  // Qal'a: ikki minora, devor va qalqon — hakerlar va himoyachilar
  const qala = svg(`
  <rect x="6" y="26" width="12" height="30" rx="2" fill="#9A8F7E" stroke="${INK}" stroke-width="3"/>
  <rect x="46" y="26" width="12" height="30" rx="2" fill="#9A8F7E" stroke="${INK}" stroke-width="3"/>
  <path d="M6 26 v-6 h4 v4 h4 v-4 h4 v6 M46 26 v-6 h4 v4 h4 v-4 h4 v6" fill="#9A8F7E" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="18" y="34" width="28" height="22" fill="#C9BFA9" stroke="${INK}" stroke-width="3"/>
  <path d="M18 34 v-5 h5 v4 h6 v-4 h6 v4 h6 v-4 h5 v5" fill="#C9BFA9" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M32 6 l11 4 v8 c0 7 -5 11 -11 14 c-6 -3 -11 -7 -11 -14 v-8 z" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M27 18 l4 4 l7 -8" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="28" y="44" width="8" height="12" rx="4" fill="#2B2B3A"/>`);

  const ICONS = { muharrir, brauzer, rassom, qismlar, sichqoncha, oynalar, papka, musobaqa, kodlar, morze, sezar: sezar(), chiroq: chiroq(), rim, robot, gap, qutilar, qoida, koz: koz(), tarmoq: tarmoq(), xarita, sandiq: sandiq(), piksel: piksel(), kadr, ombor, choti: choti(), tanga, qop, hisob2, rang16, sayyora, klaviatura, mantiq, zinapoya, yol, buyruq, bolish, qutilar2, ayri, charx, zina, qator, dastgoh, minora, ikkiyol, sxema, lupa, saralash, osish, daraxt, qator3, jamoa, paskal, kaptar, tezkor, robotaql, mantiqkod, tank, tankduel, varaq, cpp, cpptur, cppsikl, cppmassiv, qulf, izqulf, qarmoq, bolaklar, manzil, tugunlar, yolqulf, xatoovi, yulduzbuy, tosiqqacha, sanoq, blokpy, poyga, yozuv, onlayn, tog, qala };

  // Ikonka; noma'lum nom — bo'sh satr
  const icon = (name) => ICONS[name] || "";

  root.QK = root.QK || {};
  root.QK.boshArt = { icon };
})(window);
