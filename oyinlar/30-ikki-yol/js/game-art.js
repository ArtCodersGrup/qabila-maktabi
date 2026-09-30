// 30-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Ayrilgan yo'l: pastdan kelib, ikkiga bo'linadi. Tanlangan tomon yorqin bo'ladi.
  // side: "left" | "right" | null (ikkalasi ham bir xil)
  function fork(side) {
    const on = "#2F6FDE";
    const off = "#D9C7A6";
    const left = side === "left" ? on : side === "right" ? off : "#8E5BD0";
    const right = side === "right" ? on : side === "left" ? off : "#8E5BD0";
    return `
<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ayrilgan yoʻl">
  <path d="M110 148 V96" fill="none" stroke="#8A8577" stroke-width="16" stroke-linecap="round"/>
  <path d="M110 96 Q110 66 62 54 L34 46" fill="none" stroke="${left}" stroke-width="16" stroke-linecap="round"/>
  <path d="M110 96 Q110 66 158 54 L186 46" fill="none" stroke="${right}" stroke-width="16" stroke-linecap="round"/>
  <circle cx="110" cy="96" r="13" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="4"/>
  <circle cx="34" cy="46" r="11" fill="${left}"/>
  <circle cx="186" cy="46" r="11" fill="${right}"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { fork };
})(window);
