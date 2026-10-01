// 41-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Tanlov daraxti: bitta ildiz, 3 ta shox, har shoxda 2 ta barg
  const daraxt = () => {
    const shox = [[60, 24], [60, 60], [60, 96]];
    let yollar = "";
    let nuqtalar = "";
    shox.forEach(([x, y], k) => {
      yollar += `<path d="M24 60 C 40 60, 44 ${y}, ${x} ${y}" fill="none" stroke="#8A8577" stroke-width="3"/>`;
      nuqtalar += `<circle cx="${x}" cy="${y}" r="9" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>`;
      [y - 14, y + 14].forEach((by) => {
        yollar += `<path d="M${x} ${y} C ${x + 16} ${y}, ${x + 20} ${by}, ${x + 40} ${by}" fill="none" stroke="#8A8577" stroke-width="3"/>`;
        nuqtalar += `<circle cx="${x + 40}" cy="${by}" r="7" fill="#1A9E77" stroke="#2B2B3A" stroke-width="3"/>`;
      });
    });
    return `
<svg viewBox="0 0 160 124" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tanlov daraxti">
  ${yollar}
  <circle cx="24" cy="60" r="11" fill="#F08A24" stroke="#2B2B3A" stroke-width="3"/>
  ${nuqtalar}
</svg>`;
  };

  root.QK = root.QK || {};
  root.QK.gameArt = { daraxt };
})(window);
