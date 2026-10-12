// 73-o‘yinga xos rasmlar (SVG, matnsiz — QOIDALAR §6).
(function (root) {
  "use strict";

  // Ichma-ich uch halqa: AI ichida ML, uning ichida DL
  const halqalar = () => `
<svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ichma-ich uch toʻplam: sunʼiy intellekt, mashinali oʻrganish, chuqur oʻrganish">
  <ellipse cx="110" cy="65" rx="104" ry="60" fill="#E6EEFC" stroke="#2B2B3A" stroke-width="3"/>
  <ellipse cx="124" cy="72" rx="74" ry="44" fill="#DDF3EA" stroke="#2B2B3A" stroke-width="3"/>
  <ellipse cx="138" cy="78" rx="44" ry="27" fill="#FFE9CF" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="30" cy="56" r="6" fill="#2F6FDE"/>
  <circle cx="70" cy="80" r="6" fill="#1A9E77"/>
  <circle cx="138" cy="78" r="6" fill="#F08A24"/>
</svg>`;

  // Kamera va katakli rasm: kompyuter ko‘rishi
  const koz = () => `
<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kamera katakli rasmga qarayapti">
  <rect x="8" y="30" width="62" height="46" rx="8" fill="#2F6FDE" stroke="#2B2B3A" stroke-width="3"/>
  <rect x="22" y="20" width="22" height="12" rx="3" fill="#2B2B3A"/>
  <circle cx="39" cy="53" r="15" fill="#FFFFFF" stroke="#2B2B3A" stroke-width="3"/>
  <circle cx="39" cy="53" r="7" fill="#2B2B3A"/>
  <path d="M76 53 h14" stroke="#2B2B3A" stroke-width="3" stroke-dasharray="4 4"/>
  <g stroke="#2B2B3A" stroke-width="2">
    <rect x="94" y="20" width="20" height="20" fill="#FFFFFF"/><rect x="114" y="20" width="20" height="20" fill="#FFE9CF"/><rect x="134" y="20" width="20" height="20" fill="#FFFFFF"/>
    <rect x="94" y="40" width="20" height="20" fill="#FFE9CF"/><rect x="114" y="40" width="20" height="20" fill="#F08A24"/><rect x="134" y="40" width="20" height="20" fill="#FFE9CF"/>
    <rect x="94" y="60" width="20" height="20" fill="#FFFFFF"/><rect x="114" y="60" width="20" height="20" fill="#FFE9CF"/><rect x="134" y="60" width="20" height="20" fill="#FFFFFF"/>
  </g>
  <path d="M100 94 l8 8 16 -18" fill="none" stroke="#1A9E77" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  // To‘liq bog‘langan neyron tarmoq: har ustun — qatlam, chiziqlar — bog‘lanishlar (vaznlar)
  function tarmoq(qatlamlar) {
    const W = 240;
    const H = 130;
    const x = (i) => (qatlamlar.length === 1 ? W / 2 : 20 + (i * (W - 40)) / (qatlamlar.length - 1));
    const y = (n, k) => (H * (k + 1)) / (n + 1);
    let chiziq = "";
    let doira = "";
    qatlamlar.forEach((n, i) => {
      for (let k = 0; k < n; k++) {
        if (i + 1 < qatlamlar.length) {
          for (let m = 0; m < qatlamlar[i + 1]; m++) {
            chiziq += `<line x1="${x(i).toFixed(1)}" y1="${y(n, k).toFixed(1)}" x2="${x(i + 1).toFixed(1)}" y2="${y(qatlamlar[i + 1], m).toFixed(1)}"/>`;
          }
        }
        const rang = i === 0 ? "#2F6FDE" : i === qatlamlar.length - 1 ? "#1A9E77" : "#F08A24";
        doira += `<circle cx="${x(i).toFixed(1)}" cy="${y(n, k).toFixed(1)}" r="${n > 6 ? 5 : 6.5}" fill="${rang}"/>`;
      }
    });
    return `
<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Neyron tarmoq: ${qatlamlar.join(", ")} neyronli qatlamlar">
  <g stroke="#978B76" stroke-width="1">${chiziq}</g>
  <g stroke="#2B2B3A" stroke-width="2">${doira}</g>
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.gameArt = { halqalar, koz, tarmoq };
})(window);
