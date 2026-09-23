// Tog'ga chiqish rasmlari: 12 hayvon boshi, tog' manzarasi (yon tomondan qiya bag'ir),
// bulut, quyosh, yo'l bezaklari va cho'qqi bayrog'i. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn yo'q.
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


  // ---------- Toʻliq qahramon: togʻga chiquvchi ----------
  // Bosh — hayvon boshi (quloq/shox shakli oʻsha), ostida kurtka, ryukzak, oyoq-etik va tayoq.
  // Kurtka rangi — qahramonning oʻz rangining toʻqrogʻi: kichik oʻlchamda ham kim kimligi bilinadi.
  // Holatlar CSS bilan: .yuradi (qadam tashlaydi), .pauzada (choʻkkalab dam oladi).
  function toq(hex, ulush) {
    const n = parseInt((hex || "#C98B5E").slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * ulush);
    const g = Math.round(((n >> 8) & 255) * ulush);
    const b = Math.round((n & 255) * ulush);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function qahramon(id, rang) {
    const ears = EARS[id] || EARS.ayiq;
    const color = rang || "#C98B5E";
    const kurtka = toq(color, 0.7);
    const shim = toq(color, 0.45);
    return `<svg class="chiqar" viewBox="0 0 44 64" aria-hidden="true">
  <g class="oyoqlar">
    <g class="oyoq oyoq-orqa">
      <line x1="19" y1="46" x2="15" y2="57" stroke="${shim}" stroke-width="5" stroke-linecap="round"/>
      <path d="M15 57 L10 58" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/>
    </g>
    <g class="oyoq oyoq-old">
      <line x1="25" y1="46" x2="29" y2="57" stroke="${shim}" stroke-width="5" stroke-linecap="round"/>
      <path d="M29 57 L34 58" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/>
    </g>
  </g>
  <g class="gavda">
    <path d="M12 29 Q8 36 9 45 L33 45 Q35 36 31 29 Z" fill="${kurtka}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M10 41 L32 41" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity="0.2"/>
    <path d="M9 30 Q1 34 3 43 Q5 48 10 46 Z" fill="#C86B3C" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M31 33 Q38 36 37 42" fill="none" stroke="${kurtka}" stroke-width="4.8" stroke-linecap="round"/>
    <path d="M31 33 Q38 36 37 42" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" opacity="0.3"/>
    <line class="tayoq" x1="39" y1="28" x2="34" y2="60" stroke="#8A5A2B" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="37" cy="42" r="2.6" fill="${color}" stroke="${INK}" stroke-width="1.6"/>
  </g>
  <g class="bosh">
    <g fill="${color}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" color="${color}" transform="translate(4.4 1) scale(0.78)">${ears}</g>
    <circle cx="22" cy="20" r="9.6" fill="${color}" stroke="${INK}" stroke-width="2"/>
    <circle cx="19" cy="19" r="1.7" fill="${INK}"/><circle cx="25.5" cy="19" r="1.7" fill="${INK}"/>
    <ellipse cx="22.5" cy="23.5" rx="2.5" ry="1.9" fill="${INK}"/>
  </g>
</svg>`;
  }

  // ---------- Tog' manzarasi ----------
  // Tog'ni yon tomondan ko'ramiz: chapda osmon, o'ngda tog' tanasi, orasida qiya bag'ir —
  // qahramonlar shu bag'ir bo'ylab yuqoriga chiqadi. Balandlikka qarab rang o'zgaradi:
  // o't → tuproq → qoya → qor. Cho'qqi ko'rinsa, uchburchak tepa va yon soyasi chiziladi.
  const MANZARA = {
    chimyon: { osmon: ["#9CCFEA", "#DFF1FA"], ot: "#5FA24A", tuproq: "#B08A5A", qoya: "#8B8578", bezak: "archa" },
    hazrati: { osmon: ["#A8CDEA", "#E4F0FA"], ot: "#6BA357", tuproq: "#B4915F", qoya: "#8A8275", bezak: "qoya" },
    pomir: { osmon: ["#9CC4EA", "#E6F1FB"], ot: "#6FA663", tuproq: "#A99274", qoya: "#8D96A3", bezak: "muz" },
    himolay: { osmon: ["#93BEE8", "#E9F3FC"], ot: "#71A566", tuproq: "#A08C78", qoya: "#8E93A0", bezak: "qor" },
  };

  const OT = 0.35; // shu balandlikkacha — o't bosgan yon bag'ir
  const QOYA = 0.6; // shundan yuqorisi — qoya
  const QOR = 0.8; // shundan yuqorisi — qor

  // Chekkasi to'lqinli chegara (tasodif yo'q — har chizishda bir xil chiqadi)
  function tolqin(y, amp) {
    let d = `M -12 ${y.toFixed(1)}`;
    for (let x = -12, k = 0; x < 118; x += 26, k++) {
      const yuqoriga = k % 2 === 0;
      d += ` Q ${(x + 13).toFixed(1)} ${(y + (yuqoriga ? -amp : amp)).toFixed(1)} ${(x + 26).toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  }

  // Bag'ir geometriyasi: oyna ichidagi pog'onalar chapdan o'ngga ko'tariladi.
  // oyna: { past, yuqori, pogona }. Qaytadi: { xOf, yOf, xAtY, chogqi, peak }
  function geometriya(oyna) {
    const { past, yuqori, pogona } = oyna;
    const n = Math.max(1, yuqori - past + 1);
    // Bag'ir burchagi quti shakliga moslanadi: baland va tor qutida ham chetga chiqib ketmasin
    const X0 = oyna.X0 == null ? 17 : oyna.X0;
    const X1 = oyna.X1 == null ? 53 : oyna.X1;
    const xOf = (s) => X0 + (X1 - X0) * ((s - past) / Math.max(1, n - 1));
    const yOf = (s) => 100 - ((s - past + 0.5) / n) * 100;
    // Chiziqni oyna chetlaridan tashqariga cho'zish uchun
    const qadamY = 100 / n;
    const qadamX = (X1 - X0) / Math.max(1, n - 1);
    const xAtY = (y) => xOf(past) + ((yOf(past) - y) / qadamY) * qadamX;
    const chogqi = yuqori >= pogona;
    // Cho'qqi oxirgi pog'onadan biroz tepada, lekin quti ichida qoladi (bayroq ko'rinsin)
    const peakY = Math.max(5, yOf(pogona) - qadamY * 0.5);
    return { xOf, yOf, xAtY, chogqi, peakY, peakX: xAtY(peakY), n };
  }

  function manzara(togId, oyna) {
    const m = MANZARA[togId] || MANZARA.hazrati;
    const g = geometriya(oyna);
    const { pogona } = oyna;
    const yBal = (a) => g.yOf(a * pogona); // balandlik ulushi → y
    const past = `${g.xAtY(112).toFixed(1)} 112`;

    // Tog' tanasi: cho'qqi ko'rinsa uchburchak, aks holda chap qirrasi qiya bo'lgan devor
    let tana;
    let yonSoya = "";
    if (g.chogqi) {
      const ong = g.peakX + (g.peakX - g.xAtY(112)) * 1.25;
      tana = `M ${past} L ${g.peakX.toFixed(1)} ${g.peakY.toFixed(1)} L ${Math.min(ong, 128).toFixed(1)} 112 Z`;
      yonSoya = `<path d="M ${g.peakX.toFixed(1)} ${g.peakY.toFixed(1)} L ${Math.min(ong, 128).toFixed(1)} 112 L ${g.peakX.toFixed(1)} 112 Z" fill="${INK}" opacity="0.1"/>`;
    } else {
      tana = `M ${past} L ${g.xAtY(-12).toFixed(1)} -12 L 128 -12 L 128 112 Z`;
    }

    // Balandlik qatlamlari — faqat tog' tanasi ichida ko'rinadi
    const qatlam = [];
    const yQoya = yBal(QOYA);
    const yQor = yBal(QOR);
    const yOt = yBal(OT);
    if (yQoya > -14) qatlam.push(`<path d="${tolqin(yQoya, 2.6)} L 118 -14 L -12 -14 Z" fill="${m.qoya}"/>`);
    if (yQor > -14) qatlam.push(`<path d="${tolqin(yQor, 3.2)} L 118 -14 L -12 -14 Z" fill="#FFFFFF"/>`);
    if (yOt < 114) qatlam.push(`<path d="${tolqin(yOt, 2.6)} L 118 114 L -12 114 Z" fill="${m.ot}"/>`);

    // Soʻqmoq: bagʻir qirrasidan sal oʻngda, tuproq rangli yoʻlka va har pogʻonada zina
    const yTop = g.chogqi ? g.peakY : -12;
    const xTop = g.chogqi ? g.peakX : g.xAtY(-12);
    const yol = `M ${g.xAtY(112).toFixed(1)} 112 L ${xTop.toFixed(1)} ${yTop.toFixed(1)} L ${(xTop + 5).toFixed(1)} ${yTop.toFixed(1)} L ${(g.xAtY(112) + 5).toFixed(1)} 112 Z`;
    const zinalar = [];
    for (let st = oyna.past; st <= oyna.yuqori; st++) {
      const zy = g.yOf(st);
      const zx = g.xOf(st);
      zinalar.push(`<path d="M ${zx.toFixed(1)} ${(zy + 0.9).toFixed(1)} L ${(zx + 5.4).toFixed(1)} ${(zy + 0.9).toFixed(1)}" stroke="#7E6A4C" stroke-opacity="0.5" stroke-width="1.1"/>`);
    }

    return `<svg class="manzara-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="tog-osmon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${m.osmon[0]}"/><stop offset="1" stop-color="${m.osmon[1]}"/>
    </linearGradient>
    <clipPath id="tog-tana"><path d="${tana}"/></clipPath>
  </defs>
  <rect x="-2" y="-2" width="104" height="104" fill="url(#tog-osmon)"/>
  <path d="${tana}" fill="${m.tuproq}"/>
  <g clip-path="url(#tog-tana)">${qatlam.join("")}${yonSoya}
    <path d="${yol}" fill="#CDB68F" fill-opacity="0.75"/>${zinalar.join("")}</g>
  <path d="M ${past} L ${(g.chogqi ? g.peakX : g.xAtY(-12)).toFixed(1)} ${(g.chogqi ? g.peakY : -12).toFixed(1)}"
    fill="none" stroke="${INK}" stroke-opacity="0.25" stroke-width="0.8"/>
</svg>`;
  }

  // ---------- Osmon va yo'l bezaklari (alohida, cho'zilmaydigan rasmlar) ----------
  const bulut = () => `<svg viewBox="0 0 60 28" aria-hidden="true">
  <path d="M12 24 Q2 24 3 17 Q4 11 11 12 Q13 3 23 4 Q31 4 34 11 Q44 8 48 15 Q56 15 56 21 Q56 24 50 24 Z" fill="#FFFFFF" opacity="0.92"/>
</svg>`;

  const quyosh = () => `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="14" fill="#FBD46A"/></svg>`;

  // Bag'irdagi bezaklar: pastda archa, o'rtada qoya, tepada muz/qor
  function bezak(kind) {
    if (kind === "archa") {
      return `<svg viewBox="0 0 30 34" aria-hidden="true"><path d="M15 2 L24 20 L6 20 Z" fill="#2F7A4F"/><path d="M15 10 L26 28 L4 28 Z" fill="#378C5A"/><rect x="13" y="27" width="4" height="6" fill="#6E4522"/></svg>`;
    }
    if (kind === "qoya") {
      return `<svg viewBox="0 0 34 24" aria-hidden="true"><path d="M2 23 L11 5 L17 14 L23 3 L32 23 Z" fill="#7A6E5E" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
    }
    if (kind === "muz") {
      return `<svg viewBox="0 0 30 26" aria-hidden="true"><path d="M2 25 L9 4 L15 14 L21 2 L28 25 Z" fill="#DCEBF8" stroke="#9FBBD6" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
    }
    return `<svg viewBox="0 0 34 20" aria-hidden="true"><path d="M2 19 Q9 4 17 6 Q25 3 32 19 Z" fill="#FFFFFF" stroke="#CFDDEA" stroke-width="1.2"/></svg>`;
  }

  // Balandlikka qarab qaysi bezak
  function bezakTuri(togId, balandlik) {
    const m = MANZARA[togId] || MANZARA.hazrati;
    if (balandlik >= QOR) return "qor";
    if (balandlik >= QOYA) return m.bezak === "archa" ? "qoya" : m.bezak === "qor" ? "muz" : m.bezak;
    if (balandlik >= OT) return "qoya";
    return "archa";
  }

  // Cho'qqi bayrog'i
  const chogqi = () => `<svg viewBox="0 0 40 44" aria-hidden="true">
  <rect x="6" y="4" width="4" height="38" rx="2" fill="#8A5A2B"/>
  <path d="M10 6 L34 13 L10 20 Z" fill="#C8553D" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.art = Object.assign(root.QK.art || {}, {
    hayvon, qahramon, toq, manzara, geometriya, bezak, bezakTuri, bulut, quyosh, chogqi, MANZARA, OT, QOYA, QOR,
  });
})(window);
