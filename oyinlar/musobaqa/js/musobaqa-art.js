// Musobaqa rasmlari: Oy va Quyosh belgilari, tanga tomonlari, yurak, bayroqcha, pauza ikonkasi.
// Hammasi SVG satr qaytaradi, ichida matn yo'q (QOIDALAR 6). DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const COLORS = { left: "#2F6FDE", right: "#8E5BD0" }; // Oy — ko'k, Quyosh — binafsha
  const GOLD = "#FFC83D";
  const PALE = "#FFE9A8";

  // Faqat belgining o'zi (fon doirasiz), 40 × 40 koordinatada
  const SUN = `<g>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
    `<rect x="18.5" y="3" width="3" height="7" rx="1.5" fill="${GOLD}" transform="rotate(${a} 20 20)"/>`).join("")}
    <circle cx="20" cy="20" r="8.5" fill="${GOLD}"/></g>`;
  const MOON = `<path d="M24 7 A13 13 0 1 0 24 33 A10.5 10.5 0 1 1 24 7 Z" fill="${PALE}"/>
    <circle cx="16" cy="17" r="1.6" fill="#E8C96A"/><circle cx="13" cy="24" r="1.1" fill="#E8C96A"/>`;
  const mark = (side) => (side === "left" ? MOON : SUN);

  // Doira ichida belgi: panel va natija ekrani uchun
  function emblem(side) {
    return `<svg class="emblem" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="19" fill="${COLORS[side]}" stroke="#fff" stroke-width="2"/>${mark(side)}</svg>`;
  }

  // Tanga tomoni: qalin gardish, o'rtada belgi (tanga CSS da aylanadi)
  function coinFace(side) {
    return `<svg class="coin-svg" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="19.5" fill="#D9A93A"/>
  <circle cx="20" cy="20" r="17" fill="${COLORS[side]}"/>
  <circle cx="20" cy="20" r="15.5" fill="none" stroke="#F4D27A" stroke-width="1" stroke-dasharray="1.5 2"/>
  <g transform="translate(4 4) scale(0.8)">${mark(side)}</g></svg>`;
  }

  // Yurak: to'la yoki bo'sh (rang — atrofdagi matn rangi, currentColor)
  function heart(full) {
    return `<svg class="heart${full ? "" : " lost"}" viewBox="0 0 24 22" aria-hidden="true">
  <path d="M12 20.5 L3.3 12 A5.3 5.3 0 0 1 12 4.6 A5.3 5.3 0 0 1 20.7 12 Z"
    fill="${full ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }

  // Muxlis bayroqchasi: dasta va o'yinchi rangidagi mato, ustida belgi
  function flag(side) {
    return `<svg class="flag-svg" viewBox="0 0 44 64" aria-hidden="true">
  <rect x="4" y="4" width="4" height="58" rx="2" fill="#8A5A2B"/>
  <g class="cloth"><path d="M8 6 Q24 2 40 8 L40 34 Q24 28 8 32 Z" fill="${COLORS[side]}"/>
  <g transform="translate(13 7) scale(0.5)">${mark(side)}</g></g></svg>`;
  }

  const PAUSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/></svg>`;
  const pause = () => PAUSE;

  root.QK = root.QK || {};
  root.QK.musobaqaArt = { COLORS, emblem, coinFace, heart, flag, pause };
})(typeof window !== "undefined" ? window : globalThis);
