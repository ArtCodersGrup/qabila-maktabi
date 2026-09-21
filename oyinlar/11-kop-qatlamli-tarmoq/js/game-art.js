// 11-o'yinga xos SVG rasmlar: hikoya sahnalari. Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Ko'p qatlamli tarmoq: ustunlardagi doiralar va ularni bog'lovchi chiziqlar
  function layers() {
    const cols = [[30, [24, 48, 72, 96]], [80, [18, 42, 66, 90, 114]], [130, [30, 60, 90]], [175, [45, 75]]];
    let lines = "";
    for (let c = 0; c + 1 < cols.length; c++) {
      for (const y1 of cols[c][1]) {
        for (const y2 of cols[c + 1][1]) {
          lines += `<line x1="${cols[c][0]}" y1="${y1}" x2="${cols[c + 1][0]}" y2="${y2}" stroke="#C9BFA6" stroke-width="1.2"/>`;
        }
      }
    }
    const colors = ["#2F6FDE", "#1A9E77", "#8E5BD0", "#F08A24"];
    let dots = "";
    cols.forEach(([x, ys], c) => {
      for (const y of ys) dots += `<circle cx="${x}" cy="${y}" r="7" fill="${colors[c]}" stroke="${INK}" stroke-width="2"/>`;
    });
    return `<svg viewBox="0 0 200 132" aria-hidden="true">${lines}${dots}</svg>`;
  }

  // Miya — neyron g'oyasi shundan olingan
  const brain = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <path d="M100 18 C70 10 40 22 36 50 C20 58 22 88 42 96 C48 116 78 120 96 108 L100 108 L104 108 C122 120 152 116 158 96 C178 88 180 58 164 50 C160 22 130 10 100 18 Z" fill="#F4C6C6" stroke="${INK}" stroke-width="3"/>
  <path d="M100 20 V106" stroke="#D99A9A" stroke-width="3"/>
  <path d="M56 48 q14 10 0 22 M72 34 q12 12 2 24 M144 48 q-14 10 0 22 M128 34 q-12 12 -2 24 M60 84 q18 -6 30 6 M140 84 q-18 -6 -30 6" stroke="#D99A9A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="64" cy="60" r="4" fill="#F08A24"/>
  <circle cx="136" cy="60" r="4" fill="#F08A24"/>
  <circle cx="100" cy="80" r="4" fill="#F08A24"/>
</svg>`;

  // "Qora quti": ichi ko'rinmaydigan quti, yonidan tishli g'ildiraklar
  const blackbox = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <path d="M8 66 H52" stroke="#2F6FDE" stroke-width="5" stroke-linecap="round"/>
  <path d="M148 66 H192" stroke="#1A9E77" stroke-width="5" stroke-linecap="round"/>
  <path d="M42 56 L54 66 L42 76" stroke="#2F6FDE" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M182 56 L194 66 L182 76" stroke="#1A9E77" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="56" y="22" width="90" height="90" rx="10" fill="${INK}"/>
  <circle cx="86" cy="54" r="14" fill="none" stroke="#8A929A" stroke-width="6" stroke-dasharray="6 5"/>
  <circle cx="116" cy="80" r="11" fill="none" stroke="#8A929A" stroke-width="5" stroke-dasharray="5 4"/>
</svg>`;

  const STORY = { layers: layers(), brain, blackbox };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { story });
})(window);
