// 45-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // To'rtta uya, beshta kaptar: bitta uyada ikkitasi
  const kaptarxona = () => {
    const uyalar = [1, 2, 1, 1];
    let out = "";
    uyalar.forEach((soni, k) => {
      const x = 14 + k * 36;
      const tola = soni > 1;
      out += `<rect x="${x}" y="30" width="30" height="46" rx="6" fill="${tola ? "#FFE9C7" : "#F2E6CF"}" stroke="#2B2B3A" stroke-width="3"/>`;
      for (let i = 0; i < soni; i++) {
        const cy = soni === 1 ? 54 : 44 + i * 20;
        out += `<circle cx="${x + 15}" cy="${cy}" r="8" fill="${tola ? "#F08A24" : "#2F6FDE"}" stroke="#2B2B3A" stroke-width="2.5"/>`;
      }
    });
    return `
<svg viewBox="0 0 170 92" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Toʻrt uyada besh kaptar">
  <path d="M6 30 L85 8 L164 30" fill="none" stroke="#8A8577" stroke-width="4" stroke-linejoin="round"/>
  ${out}
  <path d="M6 80 H164" stroke="#8A8577" stroke-width="4" stroke-linecap="round"/>
</svg>`;
  };

  root.QK = root.QK || {};
  root.QK.gameArt = { kaptarxona };
})(window);
