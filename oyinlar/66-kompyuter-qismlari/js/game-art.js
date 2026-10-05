// 66-o'yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6): 9 ta qism, stol foni, bola chizgan rasm, yakuniy rasm.
// Hammasi SVG satr qaytaradi va DOM bilan ishlamaydi — Node'da test qilinadi (tests/logic.test.js).
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const KOK = "#2F6FDE";
  const SARIQ = "#F08A24";
  const YASHIL = "#1A9E77";
  const BINAFSHA = "#8E5BD0";
  const OLTIN = "#F0C040";
  const KUL = "#CED6DC";
  const KUL2 = "#B8C0C8";
  const OCH = "#EEF1F5";
  const OQ = "#FFFFFF";

  // Klaviatura tugmalari: 3 qator × 10 ta + pastki qator (o'rtada uzun bo'sh joy tugmasi)
  function tugmalar() {
    let s = "";
    for (let q = 0; q < 3; q++) {
      for (let k = 0; k < 10; k++) {
        const rang = q === 0 && k === 0 ? SARIQ : q === 1 && k === 9 ? KOK : OQ;
        s += `<rect x="${11 + 11 * k}" y="${11 + 11 * q}" width="9" height="8" rx="2" fill="${rang}"/>`;
      }
    }
    for (const [x, w] of [[11, 14], [27, 14], [43, 44], [89, 14], [105, 14]]) {
      s += `<rect x="${x}" y="44" width="${w}" height="8" rx="2" fill="${OQ}"/>`;
    }
    return s;
  }

  // Har qism: vb — o'z o'lchami (eni, bo'yi), ichi — chizmasi. Shakl va rang har birida boshqa,
  // 2–4-sinf bolasi rasmga qarab taniy olishi kerak.
  const QISM = {
    // Monitor: oyoqli ekran, ichida manzara (rasm ko'rsatadi)
    monitor: {
      vb: [120, 100],
      ichi: `
  <rect x="50" y="74" width="20" height="16" fill="${KUL2}" stroke="${INK}" stroke-width="3"/>
  <rect x="32" y="88" width="56" height="8" rx="4" fill="${KUL2}" stroke="${INK}" stroke-width="3"/>
  <rect x="5" y="5" width="110" height="72" rx="8" fill="${KUL}" stroke="${INK}" stroke-width="3"/>
  <rect x="13" y="13" width="94" height="52" rx="4" fill="#D8E6FB" stroke="${INK}" stroke-width="2"/>
  <circle cx="88" cy="28" r="7" fill="${OLTIN}"/>
  <path d="M14 52 Q32 36 52 50 Q70 38 106 52 V60 Q106 64 102 64 H18 Q14 64 14 60 Z" fill="${YASHIL}"/>
  <circle cx="60" cy="71" r="2.5" fill="${YASHIL}"/>`,
    },
    // Klaviatura: yassi quti, qator-qator tugmalar
    klaviatura: {
      vb: [130, 64],
      ichi: `
  <rect x="3" y="4" width="124" height="56" rx="8" fill="${KUL}" stroke="${INK}" stroke-width="3"/>
  ${tugmalar()}`,
    },
    // Sichqoncha: tuxumsimon, ikki tugma, g'ildirak va sim
    sichqoncha: {
      vb: [70, 100],
      ichi: `
  <path d="M35 24 C35 10 50 14 52 3" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <rect x="12" y="22" width="46" height="74" rx="23" fill="${OCH}" stroke="${INK}" stroke-width="3"/>
  <path d="M35 22 A23 23 0 0 0 12 45 V52 H35 Z" fill="#D8E6FB"/>
  <rect x="12" y="22" width="46" height="74" rx="23" fill="none" stroke="${INK}" stroke-width="3"/>
  <path d="M12 52 H58 M35 22 V52" fill="none" stroke="${INK}" stroke-width="2.5"/>
  <rect x="30.5" y="29" width="9" height="16" rx="4.5" fill="${SARIQ}" stroke="${INK}" stroke-width="2"/>`,
    },
    // Tizim bloki: tik quti, disk o'rinlari, yoqish tugmasi, chiroqchalar
    blok: {
      vb: [70, 110],
      ichi: `
  <rect x="13" y="100" width="12" height="7" rx="2" fill="${INK}"/>
  <rect x="45" y="100" width="12" height="7" rx="2" fill="${INK}"/>
  <rect x="8" y="4" width="54" height="98" rx="6" fill="${KUL2}" stroke="${INK}" stroke-width="3"/>
  <rect x="16" y="13" width="38" height="9" rx="2" fill="${OCH}" stroke="${INK}" stroke-width="2"/>
  <rect x="16" y="27" width="38" height="9" rx="2" fill="${OCH}" stroke="${INK}" stroke-width="2"/>
  <circle cx="35" cy="54" r="9" fill="${KOK}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M35 48.5 V54" fill="none" stroke="${OQ}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M31.2 51 A5 5 0 1 0 38.8 51" fill="none" stroke="${OQ}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="24" cy="72" r="3" fill="${YASHIL}"/>
  <circle cx="34" cy="72" r="3" fill="${OLTIN}"/>
  <path d="M18 84 H52 M18 91 H52" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>`,
    },
    // Kolonka: binafsha quti, ikki dumaloq karnay, yonida ovoz to'lqinlari
    kolonka: {
      vb: [90, 100],
      ichi: `
  <rect x="6" y="6" width="50" height="88" rx="8" fill="${BINAFSHA}" stroke="${INK}" stroke-width="3"/>
  <circle cx="31" cy="27" r="8" fill="${INK}"/>
  <circle cx="31" cy="27" r="3" fill="${KUL}"/>
  <circle cx="31" cy="64" r="17" fill="${INK}"/>
  <circle cx="31" cy="64" r="10" fill="${KUL}"/>
  <circle cx="31" cy="64" r="4" fill="${INK}"/>
  <path d="M64 38 Q72 50 64 62" fill="none" stroke="${SARIQ}" stroke-width="4" stroke-linecap="round"/>
  <path d="M73 29 Q87 50 73 71" fill="none" stroke="${SARIQ}" stroke-width="4" stroke-linecap="round"/>`,
    },
    // Printer: tepasida toza qog'oz, oldidan chop etilgan varaq chiqyapti
    printer: {
      vb: [120, 100],
      ichi: `
  <rect x="34" y="5" width="52" height="34" rx="2" fill="${OQ}" stroke="${INK}" stroke-width="3"/>
  <rect x="7" y="30" width="106" height="42" rx="8" fill="${KUL}" stroke="${INK}" stroke-width="3"/>
  <rect x="15" y="38" width="20" height="6" rx="3" fill="${KOK}"/>
  <circle cx="99" cy="41" r="4" fill="${YASHIL}"/>
  <rect x="24" y="56" width="72" height="7" rx="3.5" fill="${INK}"/>
  <rect x="30" y="59" width="60" height="36" rx="2" fill="${OQ}" stroke="${INK}" stroke-width="3"/>
  <path d="M38 69 H82" fill="none" stroke="${KOK}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M38 77 H72" fill="none" stroke="${SARIQ}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M38 85 H78" fill="none" stroke="${YASHIL}" stroke-width="3.5" stroke-linecap="round"/>`,
    },
    // Mikrofon: to'q sariq bosh, yoysimon ushlagich, oyoqcha
    mikrofon: {
      vb: [70, 110],
      ichi: `
  <path d="M35 70 V94" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <rect x="15" y="92" width="40" height="11" rx="5.5" fill="${KUL2}" stroke="${INK}" stroke-width="3"/>
  <path d="M13 42 Q13 70 35 70 Q57 70 57 42" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <rect x="22" y="6" width="26" height="52" rx="13" fill="${SARIQ}" stroke="${INK}" stroke-width="3"/>
  <path d="M23.5 24 H46.5 M23.5 33 H46.5 M23.5 42 H46.5" fill="none" stroke="${INK}" stroke-width="2.5"/>`,
    },
    // Kamera (veb-kamera): dumaloq, katta ko'k linza, monitor ustiga qo'yiladigan oyoqcha
    kamera: {
      vb: [80, 80],
      ichi: `
  <path d="M27 56 L20 74 H60 L53 56 Z" fill="${KUL2}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="40" cy="34" r="27" fill="${KUL}" stroke="${INK}" stroke-width="3"/>
  <circle cx="40" cy="34" r="16" fill="${INK}"/>
  <circle cx="40" cy="34" r="9" fill="${KOK}"/>
  <circle cx="36" cy="30" r="3" fill="${OQ}"/>
  <circle cx="40" cy="12" r="2.5" fill="${YASHIL}"/>`,
    },
    // Quloqchin: bosh yoyi va ikki yashil quloq yostiqchasi
    quloqchin: {
      vb: [100, 100],
      ichi: `
  <path d="M19 60 V48 A31 31 0 0 1 81 48 V60" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <rect x="7" y="54" width="24" height="40" rx="10" fill="${YASHIL}" stroke="${INK}" stroke-width="3"/>
  <rect x="69" y="54" width="24" height="40" rx="10" fill="${YASHIL}" stroke="${INK}" stroke-width="3"/>
  <rect x="27" y="59" width="9" height="30" rx="4.5" fill="${KUL}" stroke="${INK}" stroke-width="2.5"/>
  <rect x="64" y="59" width="9" height="30" rx="4.5" fill="${KUL}" stroke="${INK}" stroke-width="2.5"/>`,
    },
  };

  const svg = (vb, ichi) => `<svg viewBox="0 0 ${vb[0]} ${vb[1]}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ichi}
</svg>`;

  // Bitta qism rasmi. Noma'lum nom — bo'sh satr.
  const qism = (id) => (QISM[id] ? svg(QISM[id].vb, QISM[id].ichi) : "");

  // Katta rasm ichiga joylash (yakuniy rasm uchun)
  const ichki = (id, x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${QISM[id].vb[0]} ${QISM[id].vb[1]}">${QISM[id].ichi}
  </svg>`;

  // ---------- Stol ustidagi kompyuter ----------
  // Fon alohida (devor, tokcha, stol), qismlar esa uning ustiga alohida tugma bo'lib qo'yiladi (scenes/common.js).
  // STOL — fon o'lchami; JOY — har qismning joyi [x, y, eni, bo'yi] shu o'lchamda.
  // Eng tor ekranda (360 px → rasm eni 324 px) har tugma 48×48 px dan kichik bo'lmasligi shart — test tekshiradi.
  const STOL = [320, 270];
  const JOY = {
    monitor: [101, 62, 118, 98],
    klaviatura: [122, 199, 120, 59],
    sichqoncha: [254, 184, 52, 74],
    blok: [232, 44, 75, 118],
    kolonka: [34, 92, 63, 70],
    printer: [8, 7, 90, 75],
    mikrofon: [6, 176, 54, 84],
    kamera: [134, 16, 52, 52],
    quloqchin: [62, 203, 56, 56],
  };

  const stol = () => `
<svg viewBox="0 0 ${STOL[0]} ${STOL[1]}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
  <rect width="320" height="270" fill="#E6EEFC"/>
  <path d="M14 88 V104 L30 88 Z" fill="#8A6B4A"/>
  <rect x="-4" y="81" width="112" height="8" rx="3" fill="#C9A26B" stroke="${INK}" stroke-width="2.5"/>
  <rect x="0" y="150" width="320" height="120" fill="#E9C99A"/>
  <rect x="0" y="150" width="320" height="5" fill="#C9A26B"/>
  <rect x="0" y="262" width="320" height="8" fill="#8A6B4A"/>
</svg>`;

  // Shogird chizgan rasm (3-bosqich ko'rsatishi: saqlanmasa — yo'qoladi)
  const rasmcha = () => `
<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="120" height="80" fill="${OQ}"/>
  <circle cx="96" cy="20" r="10" fill="${OLTIN}"/>
  <rect x="0" y="62" width="120" height="18" fill="${YASHIL}"/>
  <path d="M28 42 L52 22 L76 42 Z" fill="${SARIQ}"/>
  <rect x="35" y="42" width="34" height="24" fill="${KOK}"/>
  <rect x="47" y="50" width="10" height="16" fill="#FFE9C7"/>
</svg>`;

  // Tabrik rasmi: monitor, klaviatura, sichqoncha va ✓
  const toplam = () => `
<svg viewBox="0 0 220 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${ichki("monitor", 40, 0, 120, 100)}
  ${ichki("klaviatura", 34, 102, 96, 47)}
  ${ichki("sichqoncha", 142, 98, 36, 52)}
  <path d="M176 34 l10 10 20 -24" fill="none" stroke="${YASHIL}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { qism, stol, rasmcha, toplam, STOL, JOY, IDS: Object.keys(QISM) };
})(window);
