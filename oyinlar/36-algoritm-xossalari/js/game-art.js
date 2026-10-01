// 36-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Ikki yo'l: biri uzun va burilishli, ikkinchisi to'g'ri. Ikkalasi ham bir joyga olib boradi.
  // qisqa — qaysi yo'l yoritilgan ("qisqa", "uzun" yoki null)
  function ikkiYol(qisqa) {
    const on = "#1A9E77";
    const off = "#D9C7A6";
    const uzun = qisqa === "uzun" ? on : qisqa ? off : "#2F6FDE";
    const togri = qisqa === "qisqa" ? on : qisqa ? off : "#2F6FDE";
    return `
<svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ikki yoʻl">
  <path d="M28 70 C 60 10, 90 130, 120 70 S 180 10, 212 70" fill="none" stroke="${uzun}" stroke-width="11" stroke-linecap="round"/>
  <path d="M28 104 H212" fill="none" stroke="${togri}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="24" cy="87" r="13" fill="#8E5BD0"/>
  <rect x="204" y="74" width="26" height="26" rx="6" fill="#F08A24"/>
  <circle cx="217" cy="87" r="6" fill="#FFFDF7"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { ikkiYol };
})(window);
