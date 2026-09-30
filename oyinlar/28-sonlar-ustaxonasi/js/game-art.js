// 28-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Toshlarni teng guruhlarga bo'lish: har guruh savatda, ortgani savatdan tashqarida boshqa rangda.
  // total ta tosh, groups ta bolaga: har biriga total // groups ta tegadi, total % groups ta ortadi.
  function share(total, groups) {
    const per = Math.floor(total / groups);
    const left = total % groups;
    const R = 9;               // tosh radiusi
    const GAP = 6;             // toshlar orasi
    const COLS = Math.min(3, per) || 1;               // savat ichida bir qatorda nechta tosh
    const PER_ROW = Math.min(3, groups);              // bir qatorda nechta savat
    const boxW = COLS * (2 * R + GAP) + GAP;
    const boxRows = Math.max(1, Math.ceil(per / COLS));
    const boxH = boxRows * (2 * R + GAP) + GAP;
    const rows = Math.ceil(groups / PER_ROW);

    let out = "";
    for (let g = 0; g < groups; g++) {
      const col = g % PER_ROW;
      const row = Math.floor(g / PER_ROW);
      const x = 6 + col * (boxW + 12);
      const y = 6 + row * (boxH + 12);
      out += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="8" fill="#FFFDF7" stroke="#D9C7A6" stroke-width="3"/>`;
      for (let k = 0; k < per; k++) {
        const cx = x + GAP + R + (k % COLS) * (2 * R + GAP);
        const cy = y + GAP + R + Math.floor(k / COLS) * (2 * R + GAP);
        out += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#2F6FDE"/>`;
      }
    }
    // Ortgan toshlar — pastda, alohida qatorda
    const leftY = 6 + rows * (boxH + 12) + R;
    for (let k = 0; k < left; k++) {
      out += `<circle cx="${6 + GAP + R + k * (2 * R + GAP)}" cy="${leftY}" r="${R}" fill="#F08A24"/>`;
    }
    const width = 6 + PER_ROW * (boxW + 12);
    const height = leftY + (left ? R + 8 : 0) - (left ? 0 : R);
    return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Toshlarni teng boʻlish">${out}</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { share };
})(window);
