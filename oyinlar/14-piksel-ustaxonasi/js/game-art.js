// 14-o'yinga xos SVG rasmlar: molbert (kirish) va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Kataklardan rasm: rows — "#" bo'yalgan, "." bo'sh; x, y — chap-yuqori burchak
  function cells(rows, x, y, s, color) {
    let out = "";
    rows.forEach((row, r) => [...row].forEach((ch, c) => {
      out += `<rect x="${x + c * s}" y="${y + r * s}" width="${s - 1}" height="${s - 1}" fill="${ch === "#" ? color : "#FFFFFF"}"/>`;
    }));
    return out;
  }

  const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];

  // Molbert va unda piksel-yurak
  const easel = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <path d="M70 130 L96 20 M130 130 L104 20 M100 20 L100 136" stroke="#8A5A2B" stroke-width="6" stroke-linecap="round"/>
  <rect x="52" y="24" width="96" height="78" rx="4" fill="#F4F1EA" stroke="${INK}" stroke-width="3"/>
  ${cells(HEART, 65, 34, 10, "#E0524A")}
  <rect x="48" y="100" width="104" height="8" rx="3" fill="#A8743F"/>
  <circle cx="160" cy="112" r="14" fill="#F0C040" stroke="${INK}" stroke-width="2"/>
  <circle cx="155" cy="108" r="3" fill="#2F6FDE"/><circle cx="164" cy="107" r="3" fill="#E0524A"/><circle cx="160" cy="117" r="3" fill="#1A9E77"/>
</svg>`;

  const STORY = {
    // Telefon va undagi surat (tog' va quyosh)
    phone: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="62" y="4" width="76" height="112" rx="12" fill="${INK}"/>
  <rect x="68" y="14" width="64" height="92" rx="4" fill="#9FC6E8"/>
  <circle cx="114" cy="36" r="9" fill="#F0C040"/>
  <path d="M68 92 L90 58 L104 76 L116 62 L132 86 L132 106 L68 106 Z" fill="#1A9E77"/>
  <path d="M84 68 L90 58 L96 67 Z" fill="#FFFFFF"/>
  <circle cx="100" cy="111" r="3" fill="#8A929A"/>
</svg>`,
    // Lupa ostida kataklar ko'rinadi
    zoom: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="14" y="14" width="92" height="92" rx="6" fill="#9FC6E8"/>
  <circle cx="44" cy="44" r="14" fill="#F0C040"/>
  <path d="M14 96 L50 60 L78 84 L106 62 L106 106 L14 106 Z" fill="#1A9E77"/>
  <circle cx="132" cy="60" r="42" fill="#FFFFFF" stroke="${INK}" stroke-width="5"/>
  ${cells(["..##..", ".####.", "######", "######", ".####.", "..##.."], 108, 36, 8, "#F0C040")}
  <line x1="162" y1="90" x2="188" y2="116" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
</svg>`,
    // Kinolenta: kadrlar ketma-ket
    film: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="6" y="24" width="188" height="72" rx="4" fill="${INK}"/>
  <path d="M14 30 h8 M34 30 h8 M54 30 h8 M74 30 h8 M94 30 h8 M114 30 h8 M134 30 h8 M154 30 h8 M174 30 h8 M14 90 h8 M34 90 h8 M54 90 h8 M74 90 h8 M94 90 h8 M114 90 h8 M134 90 h8 M154 90 h8 M174 90 h8" stroke="#FFF6E5" stroke-width="5"/>
  <rect x="14" y="38" width="52" height="44" rx="3" fill="#9FC6E8"/>
  <rect x="74" y="38" width="52" height="44" rx="3" fill="#9FC6E8"/>
  <rect x="134" y="38" width="52" height="44" rx="3" fill="#9FC6E8"/>
  <circle cx="28" cy="70" r="8" fill="#E0524A"/>
  <circle cx="100" cy="58" r="8" fill="#E0524A"/>
  <circle cx="172" cy="70" r="8" fill="#E0524A"/>
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { easel, story });
})(window);
