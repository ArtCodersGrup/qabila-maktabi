// 20-o'yinga xos SVG rasmlar: ikkilik kalkulyator (kirish) va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const lamp = (x, y, on) => `<circle cx="${x}" cy="${y}" r="7" fill="${on ? "#F0C040" : "#4A4A5E"}"/>`;

  // Kalkulyator: ekranda chiroqchalar (ikkilik son), ikki tugma (0 va 1 rangida)
  const calc = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="50" y="8" width="100" height="126" rx="12" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>
  <rect x="60" y="18" width="80" height="34" rx="5" fill="${INK}"/>
  ${[1, 0, 1, 1, 0].map((b, k) => lamp(72 + k * 14, 35, b)).join("")}
  <rect x="62" y="64" width="34" height="28" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="79" cy="78" r="8" fill="none" stroke="${INK}" stroke-width="3"/>
  <rect x="104" y="64" width="34" height="28" rx="6" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
  <path d="M121 70 V86" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="62" y="100" width="76" height="24" rx="6" fill="#1A9E77" stroke="${INK}" stroke-width="2.5"/>
</svg>`;

  const STORY = {
    // Protsessor va tez harakat chiziqlari
    cpu: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="64" y="24" width="72" height="72" rx="8" fill="${INK}"/>
  <rect x="80" y="40" width="40" height="40" rx="4" fill="#8E5BD0"/>
  ${[0, 1, 2, 3].map((k) => `<rect x="${70 + k * 18}" y="12" width="6" height="12" fill="#8A929A"/><rect x="${70 + k * 18}" y="96" width="6" height="12" fill="#8A929A"/>`).join("")}
  <path d="M10 44 H50 M20 60 H56 M10 76 H50 M150 44 H190 M144 60 H180 M150 76 H190" stroke="#F0C040" stroke-width="5" stroke-linecap="round"/>
</svg>`,
    // 16-lik: 4 × 4 = 16 ta rangli katak (bitta 16-lik raqam — 16 xil holat)
    hex: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="52" y="4" width="96" height="112" rx="10" fill="${INK}"/>
  ${[...Array(16).keys()].map((k) => `<rect x="${60 + (k % 4) * 21}" y="${14 + Math.floor(k / 4) * 25}" width="17" height="21" rx="4" fill="${["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0"][(k + Math.floor(k / 4)) % 4]}"/>`).join("")}
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { calc, story });
})(window);
