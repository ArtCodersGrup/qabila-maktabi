// 22-o'yinga xos SVG rasmlar: sayyoralar va barmoqlar (kirish), hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Qo'l: markazdan n ta barmoq yelpig'ich shaklida
  function hand(cx, cy, n, color) {
    let out = `<circle cx="${cx}" cy="${cy}" r="9" fill="${color}" stroke="${INK}" stroke-width="2"/>`;
    for (let k = 0; k < n; k++) {
      const a = Math.PI * (1.1 + (0.8 * k) / Math.max(1, n - 1));
      const x = cx + Math.cos(a) * 17;
      const y = cy + Math.sin(a) * 17;
      out = `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="5" stroke-linecap="round"/>` + out;
    }
    return out;
  }

  // Uchta sayyora va ularning aholisi qo'llari (3, 5, 7 barmoq)
  const planets = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect width="200" height="140" rx="10" fill="${INK}"/>
  <circle cx="36" cy="92" r="24" fill="#8E5BD0"/>
  <circle cx="100" cy="100" r="28" fill="#1A9E77"/>
  <circle cx="166" cy="92" r="24" fill="#F08A24"/>
  ${hand(36, 52, 3, "#C8E06A")}${hand(100, 54, 5, "#9FC6E8")}${hand(166, 52, 7, "#F4A6B8")}
  <circle cx="70" cy="20" r="2" fill="#FFFFFF"/><circle cx="140" cy="16" r="2" fill="#FFFFFF"/><circle cx="16" cy="18" r="2" fill="#FFFFFF"/>
</svg>`;

  const STORY = {
    // Bobil: 60 ta chiziqli soat va mix yozuvli lavha
    babylon: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <circle cx="60" cy="60" r="46" fill="#F4E3C3" stroke="${INK}" stroke-width="3"/>
  ${[...Array(60).keys()].map((k) => {
    const a = (k / 60) * Math.PI * 2;
    const r1 = k % 5 ? 40 : 34;
    return `<line x1="${(60 + Math.sin(a) * r1).toFixed(1)}" y1="${(60 - Math.cos(a) * r1).toFixed(1)}" x2="${(60 + Math.sin(a) * 44).toFixed(1)}" y2="${(60 - Math.cos(a) * 44).toFixed(1)}" stroke="${INK}" stroke-width="${k % 5 ? 1 : 2.5}"/>`;
  }).join("")}
  <path d="M60 60 L60 28 M60 60 L82 70" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <rect x="124" y="24" width="60" height="72" rx="8" fill="#C9A26B" stroke="${INK}" stroke-width="3"/>
  ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<path d="M${136 + c * 16} ${38 + r * 20} l6 10 l-12 0 z" fill="${INK}"/>`).join("")).join("")}
</svg>`,
    // Mayya: pog'onali ehrom va 20 ta barmoq (4 ta qo'l-oyoq)
    maya: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M30 110 H170 L160 90 H40 Z M46 90 H154 L144 70 H56 Z M62 70 H138 L128 50 H72 Z M78 50 H122 L114 32 H86 Z" fill="#C9A26B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="92" y="18" width="16" height="14" fill="#8A5A2B" stroke="${INK}" stroke-width="2"/>
  <circle cx="176" cy="24" r="10" fill="#F0C040"/>
</svg>`,
    // Yakun: 2 ta chiroq, 10 ta barmoq, 16 ta katak
    finale: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <circle cx="22" cy="60" r="10" fill="#F0C040" stroke="${INK}" stroke-width="2"/>
  <circle cx="46" cy="60" r="10" fill="#D9D2C3" stroke="${INK}" stroke-width="2"/>
  ${hand(100, 70, 5, "#E2A77E")}
  ${[...Array(16).keys()].map((k) => `<rect x="${140 + (k % 4) * 12}" y="${36 + Math.floor(k / 4) * 12}" width="10" height="10" rx="2" fill="${["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"][k % 4]}"/>`).join("")}
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { planets, story });
})(window);
