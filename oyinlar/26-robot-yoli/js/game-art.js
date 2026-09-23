// 26-o'yinga xos SVG rasmlar: choy algoritmi (to'rt qadam), kitob va qalam, telefon, xarita.
// QK.art ga qo'shiladi. DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Choy damlash: suv quy → qaynat → choy sol → kut. Har qadam — bitta kartochka.
  function teaSteps() {
    const card = (x, body) => `
    <g class="step" transform="translate(${x} 4)">
      <rect x="0" y="0" width="52" height="52" rx="12" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
      ${body}
    </g>`;
    const arrow = (x) => `<path d="M${x} 30 L${x + 10} 30 M${x + 5} 25 L${x + 10} 30 L${x + 5} 35" stroke="#9A8F7E" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const water = `<path d="M26 12 Q34 24 34 31 A8 8 0 0 1 18 31 Q18 24 26 12 Z" fill="#2F6FDE"/>
      <path d="M14 40 H38" stroke="#8A929A" stroke-width="4" stroke-linecap="round"/>`;
    const boil = `<path d="M26 40 Q16 32 20 22 Q22 28 26 26 Q22 16 30 10 Q28 20 34 24 Q38 30 34 36 Q31 40 26 40 Z" fill="#F08A24"/>
      <path d="M14 44 H38" stroke="#8A929A" stroke-width="4" stroke-linecap="round"/>`;
    const leaf = `<path d="M14 34 Q26 10 40 18 Q38 36 18 40 Z" fill="#1A9E77"/>
      <path d="M18 38 Q28 28 36 22" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const wait = `<circle cx="26" cy="26" r="15" fill="none" stroke="#8E5BD0" stroke-width="4"/>
      <path d="M26 17 V26 L33 30" stroke="#8E5BD0" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<svg viewBox="0 0 262 60" aria-hidden="true">
  ${card(0, water)}${arrow(54)}${card(70, boil)}${arrow(124)}${card(140, leaf)}${arrow(194)}${card(210, wait)}
</svg>`;
  }

  // Kitob va qalam: al-Xorazmiy kitobi
  const bookPen = () => `<svg viewBox="0 0 200 130" aria-hidden="true">
  <path d="M20 26 Q54 14 96 26 V106 Q54 94 20 106 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M96 26 Q138 14 172 26 V106 Q138 94 96 106 Z" fill="#F7F1E4" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M96 26 V106" stroke="${INK}" stroke-width="3"/>
  <path d="M34 44 H80 M34 58 H80 M34 72 H70" stroke="#B9AFA0" stroke-width="4" stroke-linecap="round"/>
  <path d="M112 44 H158 M112 58 H158 M112 72 H146" stroke="#B9AFA0" stroke-width="4" stroke-linecap="round"/>
  <path d="M150 96 L178 60 L188 68 L160 104 L146 108 Z" fill="#F08A24" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M146 108 L152 98" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
</svg>`;

  // Telefon: ichida ilova kataklari — har biri kimdir yozgan dastur
  const phone = () => `<svg viewBox="0 0 200 130" aria-hidden="true">
  <rect x="62" y="8" width="76" height="114" rx="14" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <rect x="70" y="24" width="60" height="82" rx="6" fill="#F3F7FF"/>
  <rect x="88" y="14" width="24" height="5" rx="2.5" fill="#DCE8FA"/>
  <rect x="76" y="32" width="22" height="22" rx="6" fill="#2F6FDE"/>
  <rect x="102" y="32" width="22" height="22" rx="6" fill="#F08A24"/>
  <rect x="76" y="58" width="22" height="22" rx="6" fill="#1A9E77"/>
  <rect x="102" y="58" width="22" height="22" rx="6" fill="#8E5BD0"/>
  <rect x="86" y="86" width="28" height="12" rx="6" fill="#DCE8FA"/>
</svg>`;

  // Xarita: yo'l chizig'i va belgi — "nima aytsang, shuni bajaradi"
  const roadMap = () => `<svg viewBox="0 0 200 130" aria-hidden="true">
  <path d="M18 24 L70 14 L130 28 L182 16 V106 L130 118 L70 104 L18 114 Z" fill="#FFFDF7" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M70 14 V104 M130 28 V118" stroke="${INK}" stroke-width="2.5" stroke-dasharray="7 7"/>
  <path d="M34 98 Q54 70 86 76 Q118 82 132 52 Q140 38 158 36" fill="none" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round" stroke-dasharray="11 8"/>
  <circle cx="34" cy="98" r="7" fill="#2F6FDE"/>
  <path d="M158 20 Q170 20 170 32 Q170 42 158 52 Q146 42 146 32 Q146 20 158 20 Z" fill="#F08A24" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="158" cy="32" r="5" fill="#FFFFFF"/>
</svg>`;


  // Tabrik: robot gulxanga yetdi
  const robotFire = () => `<svg viewBox="0 0 200 130" aria-hidden="true">
  <ellipse cx="100" cy="116" rx="72" ry="9" fill="#EFE8DA"/>
  <g transform="translate(24 34)">
    <rect x="0" y="14" width="46" height="40" rx="11" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
    <rect x="9" y="24" width="28" height="17" rx="7" fill="#FFFFFF"/>
    <circle cx="18" cy="32" r="4" fill="${INK}"/>
    <circle cx="28" cy="32" r="4" fill="${INK}"/>
    <rect x="21" y="2" width="4" height="12" rx="2" fill="${INK}"/>
    <circle cx="23" cy="2" r="5" fill="#F08A24" stroke="${INK}" stroke-width="2.5"/>
    <rect x="-10" y="24" width="10" height="9" rx="4" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5"/>
    <rect x="46" y="18" width="10" height="9" rx="4" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5" transform="rotate(-25 51 22)"/>
  </g>
  <g transform="translate(112 42)">
    <path d="M2 56 L54 42 M2 42 L54 56" stroke="#8A5A2B" stroke-width="8" stroke-linecap="round"/>
    <path d="M28 2 Q44 20 38 34 Q34 42 28 42 Q22 42 18 34 Q12 20 28 2 Z" fill="#F08A24"/>
    <path d="M28 14 Q38 24 34 34 Q31 39 28 39 Q25 39 22 34 Q18 24 28 14 Z" fill="#FFC83D"/>
  </g>
</svg>`;

  root.QK = root.QK || {};
  root.QK.art = Object.assign(root.QK.art || {}, { teaSteps, bookPen, phone, roadMap, robotFire });
})(window);
