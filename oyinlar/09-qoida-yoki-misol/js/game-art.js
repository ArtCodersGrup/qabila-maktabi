// 9-o'yinga xos SVG rasmlar: narsa (meva), hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Narsa: kattaligi (1–9) radiusni, dog'lari soni nuqtalarni belgilaydi
  function thing(size, dots) {
    const r = 10 + size * 1.8;
    let spots = "";
    for (let k = 0; k < dots; k++) {
      const angle = (k * 2.399) % (Math.PI * 2); // oltin burchak — nuqtalar teng tarqaladi
      const rad = r * 0.62 * Math.sqrt((k + 0.6) / Math.max(dots, 1));
      const x = 32 + Math.cos(angle) * rad;
      const y = 34 + Math.sin(angle) * rad;
      spots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.12).toFixed(1)}" fill="#7A4E2A"/>`;
    }
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M32 ${34 - r} q3 -8 9 -10 q-4 6 -5 10" fill="#1A9E77"/>
  <circle cx="32" cy="34" r="${r}" fill="#E8A33D" stroke="${INK}" stroke-width="3"/>
  ${spots}
</svg>`;
  }

  // Kalkulyator: qoida yozilgan dastur
  function calculator() {
    let keys = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        keys += `<rect x="${72 + c * 22}" y="${52 + r * 20}" width="17" height="15" rx="3" fill="#CED6DC" stroke="${INK}" stroke-width="2"/>`;
      }
    }
    return `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="62" y="10" width="76" height="104" rx="10" fill="#8A929A" stroke="${INK}" stroke-width="3"/>
  <rect x="72" y="20" width="56" height="24" rx="4" fill="#DCEFE6" stroke="${INK}" stroke-width="2"/>
  ${keys}
</svg>`;
  }

  // Mushuk rasmlari: qoida yozib bo'lmaydi
  const catFace = (cx, cy, r, fur) => `
  <path d="M${cx - r * 0.75} ${cy - r * 0.45} L${cx - r * 0.4} ${cy - r * 1.25} L${cx + r * 0.05} ${cy - r * 0.75} Z" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <path d="M${cx + r * 0.75} ${cy - r * 0.45} L${cx + r * 0.4} ${cy - r * 1.25} L${cx - r * 0.05} ${cy - r * 0.75} Z" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fur}" stroke="${INK}" stroke-width="2"/>
  <circle cx="${cx - r * 0.35}" cy="${cy - r * 0.12}" r="${r * 0.13}" fill="${INK}"/>
  <circle cx="${cx + r * 0.35}" cy="${cy - r * 0.12}" r="${r * 0.13}" fill="${INK}"/>`;

  const cats = `<svg viewBox="0 0 200 120" aria-hidden="true">
  ${catFace(42, 46, 18, "#F4F1EA")}
  ${catFace(100, 60, 22, "#C9945A")}
  ${catFace(158, 44, 16, "#4A4A55")}
  ${catFace(70, 96, 14, "#8A929A")}
  ${catFace(132, 98, 15, "#E8DCC0")}
</svg>`;

  // Ichma-ich doiralar: AI ⊃ ML ⊃ (misollardan o'rganish); yozuvlar HTML'da
  const circles = `<svg viewBox="0 0 200 140" aria-hidden="true">
  <ellipse cx="100" cy="70" rx="94" ry="64" fill="#DCE8FA" stroke="#2F6FDE" stroke-width="3"/>
  <ellipse cx="100" cy="78" rx="62" ry="46" fill="#D6F0E4" stroke="#1A9E77" stroke-width="3"/>
  <ellipse cx="100" cy="86" rx="32" ry="26" fill="#EFE0FA" stroke="#8E5BD0" stroke-width="3"/>
</svg>`;

  const STORY = { calculator: calculator(), cats, circles };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { thing, story });
})(window);
