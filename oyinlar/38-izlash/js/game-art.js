// 38-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Izlash: qator kataklar, o'rtadagisi belgilangan (ikkilik izlash) va lupа
  const izlash = () => `
<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Izlash">
  ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="${12 + k * 32}" y="40" width="26" height="30" rx="5" fill="${k === 3 ? "#2F6FDE" : "#F2E6CF"}" stroke="#2B2B3A" stroke-width="3"/>`).join("")}
  <path d="M12 86 H108" stroke="#D9C7A6" stroke-width="5" stroke-linecap="round"/>
  <path d="M140 86 H236" stroke="#D9C7A6" stroke-width="5" stroke-linecap="round"/>
  <circle cx="118" cy="22" r="15" fill="none" stroke="#1A9E77" stroke-width="5"/>
  <path d="M129 33 L142 46" stroke="#1A9E77" stroke-width="6" stroke-linecap="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { izlash };
})(window);
