// 34-o'yinga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Dastgoh: chapdan kiruvchi (parametr), o'ngdan chiquvchi (natija).
  // ready — natija chiqqanini ko'rsatadi.
  function bench(ready) {
    const out = ready ? "#1A9E77" : "#D9C7A6";
    return `
<svg viewBox="0 0 230 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Funksiya dastgohi">
  <rect x="70" y="26" width="90" height="68" rx="12" fill="#F2E6CF" stroke="#2B2B3A" stroke-width="4"/>
  <circle cx="115" cy="52" r="13" fill="#8E5BD0"/>
  <rect x="88" y="72" width="54" height="10" rx="5" fill="#2B2B3A" opacity="0.35"/>
  <path d="M10 60 H64" fill="none" stroke="#2F6FDE" stroke-width="10" stroke-linecap="round"/>
  <path d="M52 48 L66 60 L52 72 Z" fill="#2F6FDE"/>
  <circle cx="16" cy="60" r="11" fill="#2F6FDE"/>
  <path d="M166 60 H214" fill="none" stroke="${out}" stroke-width="10" stroke-linecap="round"/>
  <path d="M202 48 L216 60 L202 72 Z" fill="${out}"/>
  <circle cx="214" cy="60" r="11" fill="${out}"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { bench };
})(window);
