// 40-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Uch xil o'sish: o'zgarmas (yashil), chiziqli (sariq), kvadratik (binafsha)
  const osish = () => {
    const nuqta = (d, rang) => `<path d="${d}" fill="none" stroke="${rang}" stroke-width="5" stroke-linecap="round"/>`;
    // Kvadratik: y = 90 - (x/120)^2 * 80
    let kv = "M20 94";
    for (let x = 20; x <= 200; x += 10) {
      const t = (x - 20) / 180;
      kv += ` L${x} ${94 - t * t * 78}`;
    }
    return `
<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Uch xil oʻsish chizigʻi">
  <path d="M20 10 V98 H206" fill="none" stroke="#8A8577" stroke-width="4" stroke-linecap="round"/>
  <path d="M20 98 H206" stroke="#E8DEC8" stroke-width="2"/>
  ${nuqta("M20 90 H200", "#1A9E77")}
  ${nuqta("M20 94 L200 46", "#F08A24")}
  ${nuqta(kv, "#8E5BD0")}
  <circle cx="200" cy="90" r="6" fill="#1A9E77" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="200" cy="46" r="6" fill="#F08A24" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="200" cy="16" r="6" fill="#8E5BD0" stroke="#2B2B3A" stroke-width="3"/>
</svg>`;
  };

  root.QK = root.QK || {};
  root.QK.gameArt = { osish };
})(window);
