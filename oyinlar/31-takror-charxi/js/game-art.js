// 31-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Suv charxi: 8 parrak. done — nechtasi bo'yalgan (aylanish sonini ko'rsatadi).
  function wheel(done) {
    const total = 8;
    const on = Math.max(0, Math.min(total, done || 0));
    let out = "";
    for (let k = 0; k < total; k++) {
      const angle = (k * 360) / total - 90;
      const rad = (angle * Math.PI) / 180;
      const x = 75 + Math.cos(rad) * 46;
      const y = 75 + Math.sin(rad) * 46;
      const fill = k < on ? "#2F6FDE" : "#D9C7A6";
      out += `<rect x="${(x - 11).toFixed(1)}" y="${(y - 8).toFixed(1)}" width="22" height="16" rx="4" fill="${fill}"
        transform="rotate(${angle.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    return `
<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Suv charxi">
  <circle cx="75" cy="75" r="46" fill="none" stroke="#8A8577" stroke-width="6"/>
  ${out}
  <circle cx="75" cy="75" r="13" fill="#FFFDF7" stroke="#2B2B3A" stroke-width="5"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { wheel };
})(window);
