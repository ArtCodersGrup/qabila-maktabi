// 21-o'yinga xos SVG rasmlar: rassom ekrani (kirish) va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Kompyuter ekrani, unda rang kvadratlari va mo'yqalam
  const painter = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="24" y="10" width="140" height="96" rx="8" fill="${INK}"/>
  <rect x="34" y="20" width="120" height="76" rx="4" fill="#F4F1EA"/>
  <rect x="46" y="32" width="28" height="24" rx="4" fill="#FF8800"/>
  <rect x="80" y="32" width="28" height="24" rx="4" fill="#2F6FDE"/>
  <rect x="114" y="32" width="28" height="24" rx="4" fill="#1A9E77"/>
  <rect x="46" y="64" width="96" height="8" rx="4" fill="#C9C2B4"/>
  <rect x="46" y="78" width="60" height="8" rx="4" fill="#C9C2B4"/>
  <rect x="84" y="106" width="20" height="14" fill="#8A929A"/>
  <rect x="64" y="118" width="60" height="8" rx="4" fill="#8A929A"/>
  <path d="M172 60 L188 36" stroke="#8A5A2B" stroke-width="7" stroke-linecap="round"/>
  <path d="M166 68 Q162 80 170 82 Q178 80 174 66 Z" fill="#E0524A" stroke="${INK}" stroke-width="2"/>
</svg>`;

  const STORY = {
    // Veb-sahifa: brauzer oynasi va rangli bloklar
    web: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="20" y="10" width="160" height="100" rx="8" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  <path d="M20 30 H180" stroke="${INK}" stroke-width="3"/>
  <circle cx="32" cy="20" r="4" fill="#E0524A"/><circle cx="44" cy="20" r="4" fill="#F0C040"/><circle cx="56" cy="20" r="4" fill="#1A9E77"/>
  <rect x="32" y="40" width="136" height="20" rx="4" fill="#FF8800"/>
  <rect x="32" y="68" width="62" height="32" rx="4" fill="#2F6FDE"/>
  <rect x="104" y="68" width="64" height="32" rx="4" fill="#8E5BD0"/>
</svg>`,
    // Xotira kataklari qatori
    memory: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="16" y="30" width="168" height="60" rx="6" fill="#1A9E77" stroke="${INK}" stroke-width="3"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="${26 + k * 22}" y="42" width="16" height="36" rx="2" fill="${INK}"/>`).join("")}
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => `<rect x="${24 + k * 13}" y="90" width="6" height="10" fill="#E0B04A"/>`).join("")}
</svg>`,
    // Sayyoralar
    planets: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect width="200" height="120" rx="8" fill="${INK}"/>
  <circle cx="50" cy="60" r="24" fill="#F08A24"/>
  <ellipse cx="50" cy="60" rx="38" ry="8" fill="none" stroke="#F4E3C3" stroke-width="3"/>
  <circle cx="120" cy="40" r="14" fill="#2F6FDE"/>
  <circle cx="160" cy="84" r="18" fill="#1A9E77"/>
  <circle cx="100" cy="96" r="2" fill="#FFFFFF"/><circle cx="178" cy="24" r="2" fill="#FFFFFF"/><circle cx="20" cy="18" r="2" fill="#FFFFFF"/>
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { painter, story });
})(window);
