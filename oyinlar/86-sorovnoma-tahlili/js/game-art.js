// «Amaliy: soʻrovnoma tahlili» o'yiniga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Tozalash sxemasi: yuqorida xom javoblar qatori (xato kataklar to'q sariq, ustida chiziq),
  // pastda — faqat to'g'ri kataklar. clean — pastki qator to'lganini ko'rsatadi.
  function pipeline(clean) {
    const bad = [2, 4];
    let top = "";
    let bottom = "";
    let at = 0;
    for (let k = 0; k < 6; k++) {
      const x = 14 + k * 36;
      const isBad = bad.includes(k);
      top += `<rect x="${x}" y="14" width="30" height="30" rx="6" fill="${isBad ? "#FCE3C7" : "#DCE8FB"}" stroke="${isBad ? "#F08A24" : "#2F6FDE"}" stroke-width="3"/>`;
      if (isBad) top += `<path d="M${x + 8} 22 L${x + 22} 36 M${x + 22} 22 L${x + 8} 36" stroke="#F08A24" stroke-width="3" stroke-linecap="round"/>`;
      else {
        const bx = 50 + at * 36;
        bottom += `<rect x="${bx}" y="82" width="30" height="30" rx="6" fill="${clean ? "#D5F0E6" : "#EEF0F3"}" stroke="${clean ? "#1A9E77" : "#C9CED6"}" stroke-width="3"/>`;
        at++;
      }
    }
    return `
<svg viewBox="0 0 240 126" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tozalash: xato javoblar olib tashlanadi">
  ${top}
  <path d="M120 50 V70" fill="none" stroke="#2B2B3A" stroke-width="4" stroke-linecap="round"/>
  <path d="M110 64 L120 76 L130 64 Z" fill="#2B2B3A"/>
  ${bottom}
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { pipeline };
})(window);
