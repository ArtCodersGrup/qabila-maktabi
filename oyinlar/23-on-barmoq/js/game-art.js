// 23-o'yinga xos SVG rasmlar: qo'llar (barmoqlar rangi — klaviatura zonalari), xabarchi, bayroq,
// yozuv mashinkasi va kubok. QK.art ga qo'shiladi. DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const SKIN = "#E2A77E";
  // Barmoq ranglari (QOIDALAR 6 dagi belgi ranglari): jimjiloq — binafsha, nomsiz — yashil, o'rta — to'q sariq, ko'rsatkich — ko'k
  const FINGER_COLORS = { p: "#8E5BD0", r: "#1A9E77", m: "#F08A24", i: "#2F6FDE", th: "#8A929A" };

  const finger = (f, color, x, y, h) =>
    `<rect class="finger" data-f="${f}" x="${x}" y="${y}" width="17" height="${h}" rx="8.5" fill="${color}" stroke="${INK}" stroke-width="2"/>`;

  // Bitta qo'l: side "l" — chap (jimjiloq chapda, bosh barmoq o'ngda), "r" — o'ng (ko'zgudagidek)
  function hand(side, cx) {
    const order = side === "l" ? ["p", "r", "m", "i"] : ["i", "m", "r", "p"];
    const tops = { p: 34, r: 18, m: 11, i: 20 };
    const fingers = order.map((k, n) => finger(side + k, FINGER_COLORS[k], cx - 39 + n * 19.5, tops[k], 64 - tops[k] + 12)).join("");
    const thumbX = side === "l" ? cx + 30 : cx - 47;
    const tilt = side === "l" ? 38 : -38; // bosh barmoq yuqoriga va ichkariga (Probel tomonga)
    const thumb = `<g transform="rotate(${tilt} ${thumbX + 8.5} 92)">${finger("th", FINGER_COLORS.th, thumbX, 62, 40)}</g>`;
    const palm = `<rect x="${cx - 42}" y="58" width="84" height="56" rx="24" fill="${SKIN}" stroke="${INK}" stroke-width="2"/>`;
    return `<g class="hand hand-${side}">${thumb}${fingers}${palm}</g>`;
  }

  // Ikki qo'l klaviatura ustida (tepadan ko'rinish)
  const hands = () => `<svg class="hands-svg" viewBox="0 0 320 120" aria-hidden="true">
  ${hand("l", 88)}${hand("r", 232)}
</svg>`;

  // Xabarchi: yugurayotgan shogird, qo'lida o'ram xat. Kiyimi — currentColor (poygada o'yinchi rangi)
  const runner = () => `<svg class="runner-svg" viewBox="0 0 40 44" aria-hidden="true">
  <path class="leg-a" d="M18 30 L12 42" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <path class="leg-b" d="M22 30 L28 42" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M12 32 L15 18 Q20 15 25 18 L28 32 Z" fill="currentColor" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M24 21 L32 17" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <rect x="30" y="11" width="6" height="10" rx="2" fill="#FFF6E5" stroke="${INK}" stroke-width="1.5"/>
  <circle cx="20" cy="10" r="7" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
  <path d="M13 9 Q14 2 20 3 Q26 2 27 9 Q23 6 20 6 Q16 6 13 9 Z" fill="#3A2A1E"/>
</svg>`;

  // Yo'lak oxiridagi bayroq
  const flag = () => `<svg class="flag-svg" viewBox="0 0 30 44" aria-hidden="true">
  <rect x="5" y="3" width="4" height="40" rx="2" fill="#8A5A2B"/>
  <path d="M9 5 L27 11 L9 18 Z" fill="#1A9E77" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

  // Yozuv mashinkasi (hikoya): qog'oz, tugmalar qatorlari, dastak
  function typewriter() {
    let keys = "";
    [[42, 10], [48, 9], [56, 8]].forEach(([x0, n], row) => {
      for (let k = 0; k < n; k++) keys += `<circle cx="${x0 + k * 14}" cy="${96 + row * 13}" r="5" fill="#F4F1EA" stroke="${INK}" stroke-width="1.5"/>`;
    });
    return `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="62" y="6" width="76" height="52" rx="2" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
  <path d="M72 20 H128 M72 30 H120 M72 40 H112" stroke="#9FB6D8" stroke-width="3" stroke-linecap="round"/>
  <rect x="40" y="50" width="120" height="16" rx="8" fill="#5C6570" stroke="${INK}" stroke-width="2.5"/>
  <path d="M160 58 L180 44" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="182" cy="42" r="5" fill="#E0B04A" stroke="${INK}" stroke-width="2"/>
  <path d="M26 132 L40 64 H160 L174 132 Z" fill="#2F4858" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  ${keys}
  <rect x="70" y="124" width="60" height="5" rx="2.5" fill="#F4F1EA"/>
</svg>`;
  }

  // Kubok (rekord)
  const trophy = () => `<svg viewBox="0 0 120 130" aria-hidden="true">
  <path d="M30 18 Q8 18 12 40 Q16 58 38 58" stroke="#E0B04A" stroke-width="8" fill="none"/>
  <path d="M90 18 Q112 18 108 40 Q104 58 82 58" stroke="#E0B04A" stroke-width="8" fill="none"/>
  <path d="M28 10 H92 V40 Q92 72 60 76 Q28 72 28 40 Z" fill="#FFC83D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M44 22 Q42 44 52 60" stroke="#FFF1B8" stroke-width="6" stroke-linecap="round" fill="none"/>
  <rect x="52" y="76" width="16" height="20" fill="#E0B04A" stroke="${INK}" stroke-width="3"/>
  <rect x="34" y="96" width="52" height="16" rx="4" fill="#8A5A2B" stroke="${INK}" stroke-width="3"/>
  <rect x="26" y="112" width="68" height="12" rx="4" fill="#6E4522" stroke="${INK}" stroke-width="3"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.art = Object.assign(root.QK.art || {}, { FINGER_COLORS, hands, runner, flag, typewriter, trophy });
})(window);
