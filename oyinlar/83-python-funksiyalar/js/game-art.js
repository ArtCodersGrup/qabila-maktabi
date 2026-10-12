// «Funksiyalar» o'yiniga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Funksiya sxemasi: chapdan ikki kirish (parametrlar), o'rtada hisob bloki, o'ngdan bitta chiqish (return).
  // ready — natija qaytganini ko'rsatadi.
  function machine(ready) {
    const out = ready ? "#1A9E77" : "#C9CED6";
    return `
<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Funksiya: kirish, hisob, chiqish">
  <rect x="82" y="22" width="84" height="76" rx="10" fill="#EEF2F8" stroke="#2B2B3A" stroke-width="4"/>
  <path d="M100 48 H148 M100 60 H136 M100 72 H148" fill="none" stroke="#2B2B3A" stroke-width="5" stroke-linecap="round" opacity="0.35"/>
  <path d="M14 42 H70" fill="none" stroke="#2F6FDE" stroke-width="8" stroke-linecap="round"/>
  <path d="M62 32 L76 42 L62 52 Z" fill="#2F6FDE"/>
  <circle cx="16" cy="42" r="9" fill="#2F6FDE"/>
  <path d="M14 78 H70" fill="none" stroke="#F08A24" stroke-width="8" stroke-linecap="round"/>
  <path d="M62 68 L76 78 L62 88 Z" fill="#F08A24"/>
  <circle cx="16" cy="78" r="9" fill="#F08A24"/>
  <path d="M172 60 H222" fill="none" stroke="${out}" stroke-width="8" stroke-linecap="round"/>
  <path d="M212 50 L226 60 L212 70 Z" fill="${out}"/>
  <circle cx="224" cy="60" r="9" fill="${out}"/>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { machine };
})(window);
