// 44-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Paskal uchburchagi: kataklar va ikkitadan birlashuvchi chiziqlar
  const uchburchak = () => {
    let out = "";
    const R = 9;
    for (let n = 0; n < 5; n++) {
      for (let k = 0; k <= n; k++) {
        const x = 80 + (k - n / 2) * 30;
        const y = 16 + n * 24;
        if (n > 0) {
          if (k > 0) out += `<path d="M${x} ${y} L${x - 15} ${y - 24}" stroke="#D8CDB4" stroke-width="2.5"/>`;
          if (k < n) out += `<path d="M${x} ${y} L${x + 15} ${y - 24}" stroke="#D8CDB4" stroke-width="2.5"/>`;
        }
      }
    }
    for (let n = 0; n < 5; n++) {
      for (let k = 0; k <= n; k++) {
        const x = 80 + (k - n / 2) * 30;
        const y = 16 + n * 24;
        const chekka = k === 0 || k === n;
        out += `<circle cx="${x}" cy="${y}" r="${R}" fill="${chekka ? "#F2E6CF" : "#2F6FDE"}" stroke="#2B2B3A" stroke-width="2.5"/>`;
      }
    }
    return `
<svg viewBox="0 0 160 124" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Paskal uchburchagi">
  ${out}
</svg>`;
  };

  root.QK = root.QK || {};
  root.QK.gameArt = { uchburchak };
})(window);
