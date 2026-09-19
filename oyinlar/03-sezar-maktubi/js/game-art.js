// 3-o'yinga xos SVG rasmlar: Sezar g'ildiragi va hikoya sahnalari. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const BLUE = "#2F6FDE";
  const ORANGE = "#F08A24";
  const GOLD = "#E0B04A";

  // Sezar g'ildiragi: tashqi halqada alifbo, ichkisida kalitga surilgan harflar, markazda kalit.
  // highlight — yonadigan harflar indekslari (Set)
  function wheel(alphabet, key, highlight) {
    const n = alphabet.length;
    const hl = highlight || new Set();
    const c = 150;
    let s = `<svg class="wheel" viewBox="0 0 300 300" role="img" aria-label="Sezar gʻildiragi, kalit ${key}">`;
    s += `<circle cx="${c}" cy="${c}" r="146" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`;
    s += `<circle cx="${c}" cy="${c}" r="110" fill="#F4E3C3" stroke="${INK}" stroke-width="2"/>`;
    s += `<circle cx="${c}" cy="${c}" r="72" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`;
    for (let i = 0; i < n; i++) {
      const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
      const on = hl.has(i);
      const inner = alphabet[(((i + key) % n) + n) % n];
      const ox = (c + 128 * Math.cos(a)).toFixed(1);
      const oy = (c + 128 * Math.sin(a)).toFixed(1);
      const ix = (c + 91 * Math.cos(a)).toFixed(1);
      const iy = (c + 91 * Math.sin(a)).toFixed(1);
      s += `<text class="w-outer" x="${ox}" y="${oy}" text-anchor="middle" dominant-baseline="central" font-size="${on ? 18 : 15}" font-weight="900" fill="${on ? ORANGE : INK}">${alphabet[i]}</text>`;
      s += `<text class="w-inner" x="${ix}" y="${iy}" text-anchor="middle" dominant-baseline="central" font-size="${on ? 17 : 14}" font-weight="800" fill="${on ? ORANGE : BLUE}">${inner}</text>`;
    }
    s += `<text x="${c}" y="${c - 10}" text-anchor="middle" dominant-baseline="central" font-size="40" font-weight="900" fill="${INK}">${key}</text>`;
    s += `<text x="${c}" y="${c + 26}" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="700" fill="${INK}">kalit</text>`;
    return s + "</svg>";
  }

  const STORY = {
    // Yuliy Sezar: dafna gulchambarli bosh
    caesar: `<svg viewBox="0 0 200 140" aria-hidden="true">
  <path d="M60 140 Q60 96 100 92 Q140 96 140 140 Z" fill="#7A4E9A"/>
  <circle cx="100" cy="62" r="30" fill="#E2A77E"/>
  <path d="M70 58 Q72 30 100 30 Q128 30 130 58 Q122 44 100 44 Q78 44 70 58 Z" fill="#6B4A2E"/>
  <g fill="#1A9E77">
    <ellipse cx="72" cy="50" rx="7" ry="4" transform="rotate(-50 72 50)"/>
    <ellipse cx="80" cy="38" rx="7" ry="4" transform="rotate(-30 80 38)"/>
    <ellipse cx="92" cy="31" rx="7" ry="4" transform="rotate(-10 92 31)"/>
    <ellipse cx="108" cy="31" rx="7" ry="4" transform="rotate(10 108 31)"/>
    <ellipse cx="120" cy="38" rx="7" ry="4" transform="rotate(30 120 38)"/>
    <ellipse cx="128" cy="50" rx="7" ry="4" transform="rotate(50 128 50)"/>
  </g>
  <circle cx="90" cy="62" r="3" fill="${INK}"/>
  <circle cx="110" cy="62" r="3" fill="${INK}"/>
  <path d="M92 76 Q100 80 108 76" stroke="#7A3B2E" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`,
    // Muhrli xat (o'rama)
    scroll: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <rect x="40" y="24" width="120" height="76" rx="6" fill="#F4E3C3" stroke="#8A5A2B" stroke-width="3"/>
  <rect x="32" y="18" width="12" height="88" rx="6" fill="#C9A26B"/>
  <rect x="156" y="18" width="12" height="88" rx="6" fill="#C9A26B"/>
  <path d="M56 44 H144 M56 58 H144 M56 72 H120" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/>
  <circle cx="132" cy="84" r="12" fill="#C8553D"/>
</svg>`,
    // Kalit
    key: `<svg viewBox="0 0 200 100" aria-hidden="true">
  <circle cx="54" cy="50" r="26" fill="none" stroke="${GOLD}" stroke-width="12"/>
  <rect x="78" y="44" width="92" height="12" rx="4" fill="${GOLD}"/>
  <rect x="140" y="56" width="10" height="18" fill="${GOLD}"/>
  <rect x="158" y="56" width="10" height="24" fill="${GOLD}"/>
</svg>`,
    // Ko'p kalitlar: 1 dan 28 gacha
    keys: `<svg viewBox="0 0 200 110" aria-hidden="true">
  <g fill="none" stroke="${GOLD}" stroke-width="5">
    <circle cx="30" cy="30" r="10"/><circle cx="80" cy="30" r="10"/><circle cx="130" cy="30" r="10"/><circle cx="180" cy="30" r="10"/>
  </g>
  <g fill="${GOLD}">
    <rect x="38" y="27" width="22" height="6"/><rect x="88" y="27" width="22" height="6"/>
    <rect x="138" y="27" width="22" height="6"/><rect x="188" y="27" width="10" height="6"/>
  </g>
  <text x="100" y="88" text-anchor="middle" font-size="30" font-weight="900" fill="${INK}">1 … 28</text>
</svg>`,
    // Al-Kindiy: ochiq kitob va harflar chastotasi ustunchalari
    book: `<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M20 30 Q60 18 100 30 V104 Q60 92 20 104 Z" fill="#FFFFFF" stroke="#8A5A2B" stroke-width="3"/>
  <path d="M180 30 Q140 18 100 30 V104 Q140 92 180 104 Z" fill="#FFFFFF" stroke="#8A5A2B" stroke-width="3"/>
  <path d="M34 48 H86 M34 62 H86 M34 76 H74" stroke="#C9C2B4" stroke-width="4" stroke-linecap="round"/>
  <rect x="116" y="70" width="10" height="24" fill="${BLUE}"/>
  <rect x="132" y="50" width="10" height="44" fill="${ORANGE}"/>
  <rect x="148" y="80" width="10" height="14" fill="#1A9E77"/>
  <rect x="164" y="62" width="10" height="32" fill="#8E5BD0"/>
</svg>`,
    // Qulfli telefon
    phone: `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="66" y="10" width="68" height="120" rx="12" fill="${INK}"/>
  <rect x="72" y="22" width="56" height="92" rx="4" fill="#DDE7F7"/>
  <path d="M92 64 V54 Q100 42 108 54 V64" stroke="${GOLD}" stroke-width="5" fill="none"/>
  <rect x="86" y="62" width="28" height="24" rx="4" fill="${GOLD}"/>
</svg>`,
  };

  // Hikoya rasmi; noma'lum nom — bo'sh satr
  const story = (name) => STORY[name] || "";

  Object.assign(root.QK.art, { wheel, story });
})(window);
