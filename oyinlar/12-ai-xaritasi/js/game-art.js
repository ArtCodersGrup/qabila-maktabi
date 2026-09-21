// 12-o'yinga xos SVG rasm: buklangan xarita (kirish uchun). Robot — umumiy/js/art.js da.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  const map = `<svg viewBox="0 0 200 130" aria-hidden="true">
  <path d="M20 22 L70 10 L130 22 L180 10 L180 108 L130 120 L70 108 L20 120 Z" fill="#FDEFD4" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M70 10 V108 M130 22 V120" stroke="#D9C9A6" stroke-width="3"/>
  <ellipse cx="100" cy="66" rx="62" ry="40" fill="#DCE8FA" stroke="#2F6FDE" stroke-width="3"/>
  <ellipse cx="104" cy="72" rx="40" ry="28" fill="#D6F0E4" stroke="#1A9E77" stroke-width="3"/>
  <ellipse cx="108" cy="78" rx="20" ry="15" fill="#EFE0FA" stroke="#8E5BD0" stroke-width="3"/>
  <path d="M40 34 l6 6 M46 34 l-6 6" stroke="#F08A24" stroke-width="3" stroke-linecap="round"/>
</svg>`;

  const STORY = { map };
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { story });
})(window);
