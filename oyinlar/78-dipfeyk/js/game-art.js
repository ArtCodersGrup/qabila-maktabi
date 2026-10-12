// «Dipfeyk» rasmlari (SVG, matnsiz — QOIDALAR §6). Yuzlar — sxematik chizma, maʼlumotdan chiziladi:
// haqiqiy odamlar yoʻq. Belgilar (xira chet, soya, koʻz, tish) yuz maʼlumotidagi maydonlardan olinadi.
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const TERI = ["#F2C9A0", "#E2A77E", "#C98B5E", "#9A6844"];
  const SOCH = ["#2B2B3A", "#5A3A22", "#8A5A2B", "#B8892E"];
  const KIYIM = ["#2F6FDE", "#1A9E77", "#8E5BD0", "#C8553D"];

  // Yuz ellipsi: markaz (60, 68), radiuslar 30 va 36. Burchak — soat strelkasi boʻyicha, 0° — oʻng chekka
  function ell(deg) {
    const a = (deg * Math.PI) / 180;
    return [(60 + 30 * Math.cos(a)).toFixed(1), (68 + 36 * Math.sin(a)).toFixed(1)];
  }
  function yoy(a1, a2) {
    const p1 = ell(a1);
    const p2 = ell(a2);
    return `M${p1[0]} ${p1[1]} A30 36 0 0 1 ${p2[0]} ${p2[1]}`;
  }
  const CHET_YOY = { ong: [-20, 40], past: [50, 130], chap: [140, 200] };
  const CHET_SILJISH = { ong: [3, 0], past: [0, 3], chap: [-3, 0] };

  function sochOld(tur, rang) {
    const qalpoq = `<path d="M30 62 Q27 27 60 27 Q93 27 90 62 Q84 44 60 42 Q36 44 30 62 Z" fill="${rang}"/>`;
    if (tur === 1) return `<path d="M30 64 Q26 26 60 27 Q94 26 90 64 Q88 46 70 40 Q48 50 34 46 Q31 54 30 64 Z" fill="${rang}"/>`;
    if (tur === 3) return `<circle cx="60" cy="21" r="9" fill="${rang}"/>` + qalpoq;
    return qalpoq;
  }
  const sochOrqa = (tur, rang) => (tur === 2
    ? `<path d="M26 70 Q22 24 60 24 Q98 24 94 70 L96 112 Q86 118 80 106 L80 60 L40 60 L40 106 Q34 118 24 112 Z" fill="${rang}"/>` : "");

  function koz(cx, i, y) {
    const katta = y.koz === "olcham" && i === 1;
    const rx = katta ? 9 : 6.5;
    const ry = katta ? 6.5 : 4.5;
    const pr = katta ? 3.7 : 2.7;
    let dx = y.qarash * 1.8;
    if (y.koz === "yonalish") dx = i === 0 ? -2.8 : 2.8;
    let ys = y.nur === "chap" ? -1 : 1; // yaltiroq nuqta — chiroq tomonda
    if (y.koz === "yaltiroq") ys = i === 0 ? -1 : 1;
    const px = cx + dx;
    return `<ellipse cx="${cx}" cy="62" rx="${rx}" ry="${ry}" fill="#FFFFFF" stroke="${INK}" stroke-width="1.4"/>`
      + `<circle cx="${px}" cy="62" r="${pr}" fill="${INK}"/>`
      + `<circle cx="${px + ys * 1.5}" cy="60.7" r="1.2" fill="#FFFFFF"/>`;
  }

  function ogiz(y) {
    const s = [`<path d="M46 85 Q60 82 74 85 Q72 99 60 99 Q48 99 46 85 Z" fill="#7A2E2E" stroke="` + INK + `" stroke-width="1.4" stroke-linejoin="round"/>`];
    if (y.tish === "yaxlit") {
      s.push(`<path d="M47.6 85.3 Q60 83 72.4 85.3 L71.4 91.6 Q60 92.8 48.6 91.6 Z" fill="#FFFFFF"/>`);
    } else if (y.tish === "kop") {
      s.push(`<path d="M48.4 85.3 Q60 83.3 71.6 85.3 L70.8 90.6 Q60 91.6 49.2 90.6 Z" fill="#FFFFFF"/>`);
      for (let x = 50; x <= 70.2; x += 1.6) s.push(`<line x1="${x.toFixed(1)}" y1="84.4" x2="${x.toFixed(1)}" y2="91" stroke="#8A919C" stroke-width="0.5"/>`);
      s.push(`<path d="M52 96.4 Q60 98.4 68 96.4 L67.4 93.6 Q60 95.2 52.6 93.6 Z" fill="#FFFFFF"/>`);
      for (let x = 54; x <= 66.2; x += 1.6) s.push(`<line x1="${x.toFixed(1)}" y1="94" x2="${x.toFixed(1)}" y2="97.6" stroke="#8A919C" stroke-width="0.5"/>`);
    } else {
      s.push(`<path d="M49 85.3 Q60 83.4 71 85.3 L70.4 90 Q60 91 49.6 90 Z" fill="#FFFFFF"/>`);
      for (const x of [52.7, 56.3, 60, 63.7, 67.3]) s.push(`<line x1="${x}" y1="84.6" x2="${x}" y2="90.4" stroke="#8A919C" stroke-width="0.7"/>`);
    }
    return s.join("");
  }

  // Topilgan belgi atrofidagi punktir halqa
  function halqa(y, b) {
    const st = `fill="none" stroke="#8E5BD0" stroke-width="2" stroke-dasharray="4 3"`;
    if (b === "koz") return `<ellipse cx="60" cy="62" rx="27" ry="10.5" ${st}/>`;
    if (b === "tish") return `<ellipse cx="60" cy="90" rx="18" ry="11.5" ${st}/>`;
    if (b === "chet") {
      const o = { ong: [88, 74], past: [60, 103], chap: [32, 74] }[y.chet || "ong"];
      return `<circle cx="${o[0]}" cy="${o[1]}" r="12" ${st}/>`;
    }
    const lx = y.nur === "chap" ? 16 : 104;
    return `<circle cx="${lx}" cy="16" r="12" ${st}/><path d="${y.nur === "chap" ? "M38 44 L24 26" : "M82 44 L96 26"}" ${st}/>`;
  }

  // y — yuz maʼlumoti (logic.js yuzYasa). o.belgila — halqa bilan koʻrsatiladigan belgilar, o.nom — aria-label
  function yuz(y, o) {
    const q = o || {};
    const teri = TERI[y.teri % 4];
    const soch = SOCH[y.sochRang % 4];
    const lx = y.nur === "chap" ? 16 : 104;
    const soyaTomon = y.soya ? y.nur : (y.nur === "chap" ? "ong" : "chap"); // tabiiy: soya chiroqqa teskari tomonda
    const yelkaSoya = y.nur === "chap" ? "M60 110 L76 110 Q104 114 106 140 L60 140 Z" : "M60 110 L44 110 Q16 114 14 140 L60 140 Z";
    const s = [];
    s.push(`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${q.nom || "Sxematik chizma yuz"}">`);
    s.push(`<defs><filter id="df-xira" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.7"/></filter></defs>`);
    s.push(`<rect x="1" y="1" width="118" height="138" rx="10" fill="#EEF2F7" stroke="#D3DCE8" stroke-width="1.5"/>`);
    // Chiroq
    s.push(`<g stroke="#C89A1E" stroke-width="1.6" stroke-linecap="round">`);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      s.push(`<line x1="${(lx + 9 * Math.cos(a)).toFixed(1)}" y1="${(16 + 9 * Math.sin(a)).toFixed(1)}" x2="${(lx + 12.5 * Math.cos(a)).toFixed(1)}" y2="${(16 + 12.5 * Math.sin(a)).toFixed(1)}"/>`);
    }
    s.push(`</g><circle cx="${lx}" cy="16" r="6.5" fill="#F0C040" stroke="${INK}" stroke-width="1.4"/>`);
    // Yelka va boʻyin; yelkadagi soya doim chiroqqa teskari tomonda
    s.push(`<path d="M14 140 Q16 114 44 110 L76 110 Q104 114 106 140 Z" fill="${KIYIM[y.kiyim % 4]}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
    s.push(`<path d="${yelkaSoya}" fill="#000000" opacity="0.22"/>`);
    s.push(sochOrqa(y.soch, soch));
    s.push(`<rect x="51" y="96" width="18" height="17" fill="${teri}" stroke="${INK}" stroke-width="2"/>`);
    s.push(`<ellipse cx="29" cy="68" rx="4" ry="7" fill="${teri}" stroke="${INK}" stroke-width="1.8"/><ellipse cx="91" cy="68" rx="4" ry="7" fill="${teri}" stroke="${INK}" stroke-width="1.8"/>`);
    s.push(`<ellipse cx="60" cy="68" rx="30" ry="36" fill="${teri}" stroke="${INK}" stroke-width="2.2"/>`);
    s.push(`<path d="M60 32 A30 36 0 0 ${soyaTomon === "ong" ? 1 : 0} 60 104 Z" fill="#000000" opacity="0.18"/>`);
    s.push(sochOld(y.soch, soch));
    s.push(koz(48, 0, y) + koz(72, 1, y));
    s.push(`<path d="M41 53 Q48 50 55 53 M65 53 Q72 50 79 53" fill="none" stroke="${soch}" stroke-width="2" stroke-linecap="round"/>`);
    s.push(`<path d="M60 67 Q57 76 60 78 Q62 79 64 78" fill="none" stroke="#000000" stroke-opacity="0.4" stroke-width="1.5" stroke-linecap="round"/>`);
    s.push(ogiz(y));
    if (y.chet) {
      const d = yoy(CHET_YOY[y.chet][0], CHET_YOY[y.chet][1]);
      const sl = CHET_SILJISH[y.chet];
      s.push(`<g filter="url(#df-xira)"><path d="${d}" fill="none" stroke="${teri}" stroke-width="7.5"/></g>`);
      s.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-opacity="0.45" stroke-dasharray="2 2.5" transform="translate(${sl[0]} ${sl[1]})"/>`);
    }
    for (const b of q.belgila || []) s.push(halqa(y, b));
    s.push("</svg>");
    return s.join("");
  }

  // Lab-ovoz sxemasi uchun kichik belgilar
  const ovozIkon = (bor) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${bor ? "Ovoz bor" : "Jimlik"}">`
    + (bor ? `<g stroke="#2F6FDE" stroke-width="3" stroke-linecap="round"><line x1="6" y1="9" x2="6" y2="15"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="18" y1="8" x2="18" y2="16"/></g>`
      : `<line x1="5" y1="12" x2="19" y2="12" stroke="#9AA3B2" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 4"/>`)
    + "</svg>";
  const labIkon = (ochiq) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${ochiq ? "Ogʻiz ochiq" : "Ogʻiz yopiq"}">`
    + (ochiq ? `<ellipse cx="12" cy="12" rx="8" ry="6.5" fill="#7A2E2E" stroke="${INK}" stroke-width="1.8"/><rect x="7" y="7.2" width="10" height="3" rx="1" fill="#FFFFFF"/>`
      : `<path d="M4 12 Q12 15 20 12" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`)
    + "</svg>";

  const kichikYuz = (cx, cy, rang, soch) => `<circle cx="${cx}" cy="${cy}" r="9" fill="${rang}" stroke="${INK}" stroke-width="1.8"/>`
    + `<path d="M${cx - 9} ${cy - 1} Q${cx - 9} ${cy - 11} ${cx} ${cy - 10.5} Q${cx + 9} ${cy - 11} ${cx + 9} ${cy - 1} Q${cx} ${cy - 7} ${cx - 9} ${cy - 1} Z" fill="${soch}"/>`;

  // Dipfeyk qanday paydo boʻladi — eng umumiy sxema: A ning suratlari + B ning videosi → model → B videosida A ning yuzi
  const sxema = () => `
<svg viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sxema: bir odamning koʻp surati va boshqa odamning videosi modelga kiradi; chiqishda — videodagi yuz almashgan">
  <g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <rect x="14" y="8" width="38" height="34" rx="4" fill="#FFFFFF" transform="rotate(-8 33 25)"/>
    <rect x="20" y="10" width="38" height="34" rx="4" fill="#FFFFFF" transform="rotate(5 39 27)"/>
    <rect x="17" y="12" width="38" height="34" rx="4" fill="#FFFFFF"/>
    <rect x="12" y="70" width="50" height="38" rx="4" fill="#FFF4CC"/>
    <rect x="198" y="38" width="50" height="38" rx="4" fill="#FFF4CC"/>
    <rect x="104" y="34" width="52" height="52" rx="10" fill="#E8EAF6"/>
  </g>
  ${kichikYuz(36, 30, "#E2A77E", "#2F6FDE")}
  ${kichikYuz(37, 86, "#F2C9A0", "#F08A24")}
  <path d="M26 108 Q28 96 37 96 Q46 96 48 108 Z" fill="#F08A24" stroke="${INK}" stroke-width="1.6"/>
  ${kichikYuz(223, 54, "#E2A77E", "#2F6FDE")}
  <path d="M212 76 Q214 64 223 64 Q232 64 234 76 Z" fill="#F08A24" stroke="${INK}" stroke-width="1.6"/>
  <path d="M52 100 l7 4 -7 4 z M238 68 l7 4 -7 4 z" fill="${INK}"/>
  <g stroke="#33408A" stroke-width="1.4">
    <path d="M116 48 L130 44 M116 48 L130 60 M116 48 L130 76 M116 72 L130 44 M116 72 L130 60 M116 72 L130 76 M130 44 L144 60 M130 60 L144 60 M130 76 L144 60"/>
  </g>
  <g fill="#33408A"><circle cx="116" cy="48" r="3.5"/><circle cx="116" cy="72" r="3.5"/><circle cx="130" cy="44" r="3.5"/><circle cx="130" cy="60" r="3.5"/><circle cx="130" cy="76" r="3.5"/><circle cx="144" cy="60" r="3.5"/></g>
  <g fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M64 30 Q84 30 98 48 M92 46 l6 2 1 -6"/>
    <path d="M66 90 Q86 90 98 72 M92 74 l6 -2 1 6"/>
    <path d="M160 60 H190 M184 55 l6 5 -6 5"/>
  </g>
</svg>`;

  // Qalqon: tekshirilgan va tarqatilmagan
  const qalqon = () => `
<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qalqon: tekshirildi">
  <path d="M60 8 L104 24 V62 Q104 100 60 122 Q16 100 16 62 V24 Z" fill="#E8EAF6" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M40 64 l14 14 28 -32" fill="none" stroke="#1A9E77" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.gameArt = { yuz, ovozIkon, labIkon, sxema, qalqon };
})(window);
