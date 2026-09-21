// 19-o'yinga xos SVG rasmlar: olmalar va qoplar (kirish), hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const apple = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="#E0524A" stroke="${INK}" stroke-width="1.5"/><path d="M${x} ${y - 8} q2 -5 6 -6" stroke="#1A9E77" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const bag = (x, y) => `<path d="M${x - 16} ${y} Q${x - 20} ${y + 34} ${x} ${y + 36} Q${x + 20} ${y + 34} ${x + 16} ${y} Z" fill="#C98B5E" stroke="${INK}" stroke-width="2.5"/><path d="M${x - 12} ${y} Q${x} ${y - 10} ${x + 12} ${y}" stroke="#8A5A2B" stroke-width="3" fill="none"/>`;

  // Olmalar, qoplar va bitta ortgan olma
  const apples = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  ${bag(40, 60)}${bag(84, 60)}${bag(128, 60)}
  ${apple(34, 52)}${apple(46, 52)}${apple(78, 52)}${apple(90, 52)}${apple(122, 52)}${apple(134, 52)}
  ${apple(172, 110)}
  <path d="M150 118 Q160 96 168 104" stroke="#F08A24" stroke-width="3" fill="none" stroke-dasharray="4 4"/>
</svg>`;

  const STORY = {
    // Kompyuter ekranida ikki tomonga o'q
    convert: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="40" y="10" width="120" height="80" rx="8" fill="${INK}"/>
  <rect x="50" y="20" width="100" height="60" rx="4" fill="#DCE8FA"/>
  <circle cx="80" cy="50" r="12" fill="#F0C040"/>
  <circle cx="120" cy="50" r="12" fill="#2F6FDE"/>
  <path d="M94 46 H106 M102 42 L107 46 L102 50" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="90" y="90" width="20" height="12" fill="#8A929A"/>
  <rect x="70" y="100" width="60" height="6" rx="3" fill="#8A929A"/>
</svg>`,
    // Qo'shish belgisi va ikkilik tangalar
    plus: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <circle cx="50" cy="60" r="26" fill="#F0C040" stroke="${INK}" stroke-width="3"/>
  <circle cx="150" cy="60" r="26" fill="#F0C040" stroke="${INK}" stroke-width="3"/>
  <path d="M100 42 V78 M82 60 H118" stroke="#1A9E77" stroke-width="10" stroke-linecap="round"/>
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { apples, story });
})(window);
