// 17-o'yinga xos SVG rasmlar: cho't (kirish) va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const COLORS = ["#8E5BD0", "#1A9E77", "#F08A24"];

  // Yog'och cho't: 3 sim, munchoqlar
  function abacus() {
    const counts = [2, 5, 3];
    let rods = "";
    counts.forEach((n, i) => {
      const x = 60 + i * 40;
      rods += `<rect x="${x - 2}" y="22" width="4" height="96" fill="#5A3A1E"/>`;
      for (let k = 0; k < n; k++) rods += `<rect x="${x - 15}" y="${104 - k * 14}" width="30" height="12" rx="6" fill="${COLORS[i]}" stroke="${INK}" stroke-width="1.5"/>`;
    });
    return `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="30" y="10" width="140" height="120" rx="10" fill="none" stroke="#8A5A2B" stroke-width="10"/>
  ${rods}
</svg>`;
  }

  const STORY = {
    // Kompyuter chipi: oyoqchalar va chiroqchalar
    chip: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="60" y="20" width="80" height="80" rx="8" fill="${INK}"/>
  ${[0, 1, 2, 3, 4].map((k) => `<rect x="${66 + k * 15}" y="8" width="6" height="12" fill="#8A929A"/><rect x="${66 + k * 15}" y="100" width="6" height="12" fill="#8A929A"/><rect x="48" y="${26 + k * 15}" width="12" height="6" fill="#8A929A"/><rect x="140" y="${26 + k * 15}" width="12" height="6" fill="#8A929A"/>`).join("")}
  ${[1, 0, 1, 1].map((b, k) => `<circle cx="${77 + k * 15}" cy="60" r="5" fill="${b ? "#F0C040" : "#4A4A5E"}"/>`).join("")}
</svg>`,
    // Tangalar uyumi: turli kattalikdagi tangalar
    coins: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <ellipse cx="60" cy="86" rx="34" ry="12" fill="#C98B2E" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="60" cy="78" rx="34" ry="12" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="118" cy="90" rx="24" ry="9" fill="#C98B2E" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="118" cy="84" rx="24" ry="9" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="160" cy="94" rx="15" ry="6" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="100" cy="40" r="20" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="100" cy="40" r="12" fill="none" stroke="#C98B2E" stroke-width="3"/>
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { abacus, story });
})(window);
