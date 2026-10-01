// 42-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Uch bola qatorda; tepasida o'rin raqamlari o'rniga nuqtalar
  const qator = () => {
    const ranglar = ["#2F6FDE", "#F08A24", "#1A9E77"];
    let bolalar = "";
    ranglar.forEach((rang, k) => {
      const x = 24 + k * 44;
      bolalar += `
  <circle cx="${x}" cy="40" r="11" fill="#F2D2B6" stroke="#2B2B3A" stroke-width="3"/>
  <path d="M${x - 13} 86 v-20 a13 13 0 0 1 26 0 v20 z" fill="${rang}" stroke="#2B2B3A" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="${x}" cy="16" r="4" fill="${rang}" stroke="#2B2B3A" stroke-width="2.5"/>`;
    });
    return `
<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Uch bola qatorda">
  ${bolalar}
  <path d="M8 88 H152" stroke="#8A8577" stroke-width="4" stroke-linecap="round"/>
</svg>`;
  };

  root.QK = root.QK || {};
  root.QK.gameArt = { qator };
})(window);
