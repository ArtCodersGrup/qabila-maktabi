// 33-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Raqamlangan qutilar qatori: har quti tagida indeks nuqtalari (0 ta, 1 ta, 2 ta …).
  // mark — bo'yaladigan qutining indeksi (bo'lmasa, hammasi oddiy rangda).
  function boxes(count, mark) {
    const n = Math.max(1, count || 4);
    const w = 44;
    const h = 40;
    let out = "";
    for (let k = 0; k < n; k++) {
      const x = 8 + k * (w + 8);
      const on = k === mark;
      out += `<rect x="${x}" y="10" width="${w}" height="${h}" rx="8" fill="${on ? "#2F6FDE" : "#F2E6CF"}" stroke="#2B2B3A" stroke-width="3"/>`;
      out += `<circle cx="${x + w / 2}" cy="30" r="8" fill="${on ? "#FFFDF7" : "#8E5BD0"}"/>`;
      // indeks — nuqtalar bilan (matn yozilmaydi)
      for (let d = 0; d < k; d++) {
        out += `<circle cx="${x + 8 + d * 9}" cy="62" r="3.5" fill="#8A8577"/>`;
      }
      if (k === 0) out += `<rect x="${x + 6}" y="60" width="10" height="4" rx="2" fill="#8A8577"/>`;
    }
    return `
<svg viewBox="0 0 ${16 + n * (w + 8)} 74" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Raqamlangan qutilar qatori">${out}</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { boxes };
})(window);
