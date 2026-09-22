// Tog'ga chiqish rasmlari: 12 hayvon boshi, tog' manzarasi (har tog'ning o'z rangi va bezagi),
// cho'qqi bayrog'i. QK.art ga qo'shiladi. DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // ---------- Hayvon boshlari (qahramonlar) ----------
  // Har biri 40 × 40: quloq/shox shakli har xil, rangi tog.js dagi qahramon rangi
  const EARS = {
    tulki: '<path d="M8 14 L10 3 L18 10 Z"/><path d="M32 14 L30 3 L22 10 Z"/>',
    burgut: '<path d="M20 4 Q28 6 30 14 L10 14 Q12 6 20 4 Z"/>',
    echki: '<path d="M10 12 Q2 4 6 2 Q12 4 14 10 Z"/><path d="M30 12 Q38 4 34 2 Q28 4 26 10 Z"/>',
    ayiq: '<circle cx="10" cy="10" r="6"/><circle cx="30" cy="10" r="6"/>',
    irbis: '<path d="M9 13 L11 5 L18 10 Z"/><path d="M31 13 L29 5 L22 10 Z"/>',
    bori: '<path d="M8 13 L9 2 L19 10 Z"/><path d="M32 13 L31 2 L21 10 Z"/>',
    quyon: '<ellipse cx="13" cy="7" rx="4" ry="9"/><ellipse cx="27" cy="7" rx="4" ry="9"/>',
    boyqush: '<path d="M8 12 L12 4 L18 11 Z"/><path d="M32 12 L28 4 L22 11 Z"/>',
    kiyik: '<path d="M12 12 L8 2 M8 6 L3 4 M28 12 L32 2 M32 6 L37 4" stroke-width="2.5" fill="none" stroke="currentColor"/>',
    olmaxon: '<ellipse cx="11" cy="8" rx="5" ry="6"/><ellipse cx="29" cy="8" rx="5" ry="6"/>',
    tipratikan: '<path d="M6 16 L4 6 L11 11 L12 2 L18 10 L21 2 L26 10 L30 4 L33 13 L38 12"/>',
    lochin: '<path d="M20 3 Q30 7 31 15 L9 15 Q10 7 20 3 Z"/>',
  };

  function hayvon(id, rang) {
    const ears = EARS[id] || EARS.ayiq;
    const color = rang || "#C98B5E";
    return `<svg class="hayvon" viewBox="0 0 40 40" aria-hidden="true">
  <g fill="${color}" stroke="${INK}" stroke-width="2" stroke-linejoin="round" color="${color}">${ears}</g>
  <circle cx="20" cy="24" r="13" fill="${color}" stroke="${INK}" stroke-width="2"/>
  <circle cx="15" cy="22" r="2.2" fill="${INK}"/><circle cx="25" cy="22" r="2.2" fill="${INK}"/>
  <ellipse cx="20" cy="29" rx="3.4" ry="2.6" fill="${INK}"/>
</svg>`;
  }

  // ---------- Tog' manzarasi ----------
  // Har tog'ning fon ranglari va bezagi (archa, qoya, muz, qor)
  const MANZARA = {
    chimyon: { osmon: ["#BFE3F5", "#EAF6FB"], tosh: "#8C9A6B", bezak: "archa" },
    hazrati: { osmon: ["#CFE0F0", "#F2F7FC"], tosh: "#9A8F7E", bezak: "qoya" },
    pomir: { osmon: ["#D7E6F5", "#F4F9FE"], tosh: "#9FB6D8", bezak: "muz" },
    himolay: { osmon: ["#C9DCF2", "#FFFFFF"], tosh: "#E8EEF6", bezak: "qor" },
  };

  // Yon bezaklar: chap va o'ng chetda. Balandlikka qarab shakli o'zgaradi (past — archa, tepa — qor)
  function bezak(kind, x, y, s) {
    if (kind === "archa") {
      return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L-9 0 L0 -22 L9 0 Z" fill="#2F7A4F"/><rect x="-2" y="0" width="4" height="7" fill="#6E4522"/></g>`;
    }
    if (kind === "qoya") {
      return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 0 L-4 -16 L2 -6 L8 -18 L14 0 Z" fill="#7A6E5E" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/></g>`;
    }
    if (kind === "muz") {
      return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 0 L-3 -20 L3 -8 L9 -22 L13 0 Z" fill="#CFE3F5" stroke="#8FAFD0" stroke-width="1.5" stroke-linejoin="round"/></g>`;
    }
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-11 0 Q-6 -14 0 -18 Q7 -13 12 0 Z" fill="#FFFFFF" stroke="#C9D8E8" stroke-width="1.5"/></g>`;
  }

  // Manzara: 100 × 100 tanasi (CSS bilan cho'ziladi). qism — 0 (pastki) … 1 (cho'qqi)
  function manzara(togId, qism) {
    const m = MANZARA[togId] || MANZARA.hazrati;
    const past = qism < 0.34;
    const kind = past ? m.bezak : qism < 0.7 ? (m.bezak === "archa" ? "qoya" : m.bezak) : (m.bezak === "qor" ? "qor" : "muz");
    return `<svg class="manzara-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id="osmon-${togId}-${past ? "p" : "t"}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${m.osmon[1]}"/><stop offset="1" stop-color="${m.osmon[0]}"/></linearGradient></defs>
  <rect width="100" height="100" fill="url(#osmon-${togId}-${past ? "p" : "t"})"/>
  <path d="M0 100 L0 ${past ? 40 : 18} Q26 ${past ? 28 : 8} 50 ${past ? 34 : 4} Q74 ${past ? 28 : 8} 100 ${past ? 40 : 18} L100 100 Z" fill="${m.tosh}" opacity="0.5"/>
</svg>
<svg class="bezak-svg" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
  ${bezak(kind, 10, 55, 0.9)}${bezak(kind, 90, 58, 1.1)}${bezak(kind, 26, 30, 0.6)}${bezak(kind, 76, 26, 0.7)}
</svg>`;
  }

  // Cho'qqi bayrog'i
  const chogqi = () => `<svg viewBox="0 0 40 44" aria-hidden="true">
  <rect x="6" y="4" width="4" height="38" rx="2" fill="#8A5A2B"/>
  <path d="M10 6 L34 13 L10 20 Z" fill="#C8553D" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.art = Object.assign(root.QK.art || {}, { hayvon, manzara, chogqi, MANZARA });
})(window);
