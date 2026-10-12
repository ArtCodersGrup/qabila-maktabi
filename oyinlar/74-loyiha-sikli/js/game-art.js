// 74-o‘yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  const RANGLAR = ["#2F6FDE", "#F08A24", "#1A9E77", "#8E5BD0", "#F0C040"];

  // Besh bosqich aylana bo‘ylab, strelkalar bilan; tayyor — o‘rtada ✓ belgisi
  function sikl(tayyor) {
    const cx = 110;
    const cy = 100;
    const R = 70;
    const nuqta = (i, rad) => {
      const a = (-90 + i * 72) * (Math.PI / 180);
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    };
    let yoylar = "";
    let doiralar = "";
    for (let i = 0; i < 5; i++) {
      const a1 = (-90 + i * 72 + 20) * (Math.PI / 180);
      const a2 = (-90 + (i + 1) * 72 - 20) * (Math.PI / 180);
      const x1 = cx + R * Math.cos(a1);
      const y1 = cy + R * Math.sin(a1);
      const x2 = cx + R * Math.cos(a2);
      const y2 = cy + R * Math.sin(a2);
      yoylar += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" marker-end="url(#ls-uch)"/>`;
      const [x, y] = nuqta(i, R);
      doiralar += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" fill="${RANGLAR[i]}"/>`;
      // Bosqich tartibi — nuqtalar soni bilan (raqam yozilmaydi)
      for (let k = 0; k <= i; k++) {
        const dx = (k - i / 2) * 6;
        doiralar += `<circle cx="${(x + dx).toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="#FFFFFF" stroke="none"/>`;
      }
    }
    const belgi = tayyor ? `<path d="M92 100 l12 12 24 -26" fill="none" stroke="#1A9E77" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` : "";
    return `
<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Besh bosqichli sikl: oxirgi bosqichdan yana birinchisiga qaytiladi">
  <defs><marker id="ls-uch" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#2B2B3A"/></marker></defs>
  <g fill="none" stroke="#2B2B3A" stroke-width="3">${yoylar}</g>
  <g stroke="#2B2B3A" stroke-width="3">${doiralar}</g>
  ${belgi}
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { sikl };
})(window);
