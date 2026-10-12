// «Oʻzgaruvchi va maʼlumot turlari» ga xos rasm (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Besh quti — besh tur: butun (bitta ustun), kasr (ustun + nuqta), matn (qo'shtirnoq va chiziq),
  // mantiq (ha/yo'q kaliti), ro'yxat (kataklar qatori). royxat=true — oxirgi quti ajratib ko'rsatiladi.
  function qutilar(royxat) {
    const quti = (x, rang, ich) => `<g transform="translate(${x} 0)">
    <rect x="0" y="34" width="52" height="60" rx="10" fill="#FFFDF7" stroke="${rang}" stroke-width="4"/>
    <rect x="12" y="24" width="28" height="12" rx="6" fill="${rang}"/>${ich}</g>`;
    return `
<svg viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Besh xil maʼlumot turi">
  ${quti(6, "#2F6FDE", '<rect x="22" y="48" width="8" height="32" rx="4" fill="#2F6FDE"/>')}
  ${quti(68, "#F08A24", '<rect x="14" y="48" width="8" height="32" rx="4" fill="#F08A24"/><circle cx="29" cy="76" r="4" fill="#2B2B3A"/><rect x="36" y="56" width="6" height="24" rx="3" fill="#F08A24"/>')}
  ${quti(130, "#1A9E77", '<path d="M13 50 v8 M19 50 v8 M33 50 v8 M39 50 v8" stroke="#1A9E77" stroke-width="3" stroke-linecap="round"/><rect x="12" y="68" width="28" height="7" rx="3.5" fill="#1A9E77"/>')}
  ${quti(192, "#8E5BD0", '<rect x="10" y="54" width="32" height="18" rx="9" fill="#8E5BD0"/><circle cx="33" cy="63" r="6" fill="#FFFDF7"/>')}
  ${quti(254, "#2B2B3A", `<rect x="8" y="54" width="11" height="18" rx="3" fill="${royxat ? "#2F6FDE" : "#B9B4A6"}"/><rect x="21" y="54" width="11" height="18" rx="3" fill="${royxat ? "#F08A24" : "#B9B4A6"}"/><rect x="34" y="54" width="11" height="18" rx="3" fill="${royxat ? "#1A9E77" : "#B9B4A6"}"/>`)}
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { qutilar };
})(window);
