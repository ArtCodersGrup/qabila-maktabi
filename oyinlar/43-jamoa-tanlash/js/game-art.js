// 43-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Besh bola; uchtasi jamoaga tanlangan (doira ichida)
  const jamoa = () => {
    const bolalar = [0, 1, 2, 3, 4].map((k) => {
      const x = 22 + k * 30;
      const tanlangan = k < 3;
      return `
  <circle cx="${x}" cy="46" r="10" fill="${tanlangan ? "#1A9E77" : "#E8DEC8"}" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M${x - 11} 82 v-16 a11 11 0 0 1 22 0 v16 z" fill="${tanlangan ? "#BDE6D4" : "#F2E6CF"}" stroke="#2B2B3A" stroke-width="3" stroke-linejoin="round"/>`;
    }).join("");
    return `
<svg viewBox="0 0 170 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Besh boladan uchtasi tanlangan">
  <rect x="6" y="24" width="94" height="66" rx="16" fill="none" stroke="#1A9E77" stroke-width="3" stroke-dasharray="7 6"/>
  ${bolalar}
</svg>`;
  };

  root.QK = root.QK || {};
  root.QK.gameArt = { jamoa };
})(window);
