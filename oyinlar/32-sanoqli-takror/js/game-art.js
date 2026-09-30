// 32-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Zinapoya: n ta zina, bosib o'tilgani (on) bo'yalgan — range(n) ni ko'rsatadi.
  function steps(n, on) {
    const count = Math.max(1, n || 5);
    const done = Math.max(0, Math.min(count, on === undefined ? count : on));
    const w = 30;
    const h = 16;
    let out = "";
    for (let k = 0; k < count; k++) {
      const x = 10 + k * w;
      const y = 120 - (k + 1) * h;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${k < done ? "#2F6FDE" : "#D9C7A6"}" stroke="#FFF6E5" stroke-width="2"/>`;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${(count - k) * h}" fill="${k < done ? "#2F6FDE" : "#D9C7A6"}" opacity="0.28"/>`;
    }
    return `
<svg viewBox="0 0 ${20 + count * w} 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zinapoya">
  ${out}
  <rect x="6" y="120" width="${8 + count * w}" height="6" rx="3" fill="#8A8577"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { steps };
})(window);
