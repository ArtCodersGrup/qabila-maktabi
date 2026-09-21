// 16-o'yinga xos SVG rasmlar: ombor (qutilar ichida qutilar), fayl ikonkalari va hikoya sahnalari.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn/son yo'q.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";

  // Ichma-ich qutilar: eng ichida bitta bit (sariq doira)
  const storehouse = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="20" y="10" width="160" height="124" rx="10" fill="#C98B5E" stroke="${INK}" stroke-width="3"/>
  <rect x="38" y="26" width="124" height="96" rx="8" fill="#D9A273" stroke="${INK}" stroke-width="3"/>
  <rect x="56" y="42" width="88" height="68" rx="7" fill="#E6B98E" stroke="${INK}" stroke-width="3"/>
  <rect x="74" y="56" width="52" height="42" rx="6" fill="#F2D2AE" stroke="${INK}" stroke-width="3"/>
  <rect x="88" y="66" width="24" height="22" rx="4" fill="#FFF6E5" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="100" cy="77" r="6" fill="#F0C040" stroke="${INK}" stroke-width="2"/>
</svg>`;

  // Fayl ikonkalari (40 × 40)
  const ICONS = {
    sms: `<path d="M5 8 H35 Q38 8 38 11 V26 Q38 29 35 29 H16 L8 36 V29 H5 Q2 29 2 26 V11 Q2 8 5 8 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
  <path d="M9 16 H31 M9 22 H24" stroke="#9FB6D8" stroke-width="3" stroke-linecap="round"/>`,
    page: `<path d="M8 3 H26 L33 10 V37 H8 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M13 15 H28 M13 21 H28 M13 27 H23" stroke="#9FB6D8" stroke-width="3" stroke-linecap="round"/>`,
    photo: `<rect x="3" y="7" width="34" height="26" rx="3" fill="#9FC6E8" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="28" cy="15" r="4" fill="#F0C040"/>
  <path d="M3 31 L15 18 L24 27 L29 22 L37 30 V33 H3 Z" fill="#1A9E77"/>`,
    song: `<path d="M15 30 V8 L33 4 V26" stroke="${INK}" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <ellipse cx="11" cy="30" rx="6" ry="5" fill="#8E5BD0" stroke="${INK}" stroke-width="2"/>
  <ellipse cx="29" cy="26" rx="6" ry="5" fill="#8E5BD0" stroke="${INK}" stroke-width="2"/>`,
    film: `<rect x="2" y="8" width="36" height="24" rx="3" fill="${INK}"/>
  <path d="M6 11 h4 M16 11 h4 M26 11 h4 M6 29 h4 M16 29 h4 M26 29 h4" stroke="#FFF6E5" stroke-width="2.5"/>
  <rect x="6" y="14" width="28" height="12" rx="2" fill="#9FC6E8"/>
  <circle cx="16" cy="20" r="3.5" fill="#E0524A"/>`,
  };
  const fileIcon = (id) => (ICONS[id] ? `<svg viewBox="0 0 40 40" aria-hidden="true">${ICONS[id]}</svg>` : "");

  const STORY = {
    // Qattiq disk va do'kon yorlig'i
    disk: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="30" y="14" width="100" height="92" rx="10" fill="#8A929A" stroke="${INK}" stroke-width="3"/>
  <circle cx="80" cy="56" r="30" fill="#CED6DC" stroke="${INK}" stroke-width="3"/>
  <circle cx="80" cy="56" r="6" fill="${INK}"/>
  <path d="M110 92 L86 60" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M140 30 L186 30 L192 48 L186 66 L140 66 Z" fill="#F0C040" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="148" cy="48" r="4" fill="${INK}"/>
</svg>`,
    // Ma'lumot markazi: server javonlari
    datacenter: `<svg viewBox="0 0 200 120" aria-hidden="true">
  ${[20, 76, 132].map((x) => `<rect x="${x}" y="10" width="48" height="100" rx="5" fill="${INK}"/>
  ${[0, 1, 2, 3, 4].map((k) => `<rect x="${x + 6}" y="${18 + k * 18}" width="36" height="12" rx="2" fill="#4A4A5E"/><circle cx="${x + 36}" cy="${24 + k * 18}" r="2.5" fill="${k % 2 ? "#1A9E77" : "#F0C040"}"/>`).join("")}`).join("")}
</svg>`,
    // Zinapoya: pastda bit, yuqoriga qutilar kattalashadi
    ladder: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M10 110 H50 V90 H80 V70 H110 V50 H140 V30 H170 V10 H192 V114 H10 Z" fill="#E9E2D3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="30" cy="100" r="6" fill="#F0C040" stroke="${INK}" stroke-width="2"/>
  <rect x="58" y="76" width="14" height="12" rx="2" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
  <rect x="86" y="54" width="18" height="14" rx="2" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
  <rect x="114" y="32" width="22" height="16" rx="2" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
  <rect x="143" y="10" width="24" height="18" rx="2" fill="#C98B5E" stroke="${INK}" stroke-width="2"/>
</svg>`,
  };

  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { storehouse, fileIcon, story });
})(window);
