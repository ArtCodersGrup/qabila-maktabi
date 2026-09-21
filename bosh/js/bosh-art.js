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

  const ICONS = { kodlar, morze, sezar: sezar(), chiroq: chiroq(), rim, robot, gap, qutilar, qoida, koz: koz(), tarmoq: tarmoq(), xarita, sandiq: sandiq(), piksel: piksel(), kadr, ombor, choti: choti() };

  // Ikonka; noma'lum nom — bo'sh satr
  const icon = (name) => ICONS[name] || "";

  root.QK = root.QK || {};
  root.QK.boshArt = { icon };
})(window);
