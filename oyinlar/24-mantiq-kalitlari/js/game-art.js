// 24-o'yinga xos SVG rasmlar: elektr sxemasi (ketma-ket, parallel, bitta va teskari kalit), kitob, protsessor,
// ikki doira. QK.art ga qo'shiladi. DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn yo'q
// (kalit harflari — HTML, circuitLabels koordinatalari bo'yicha rasm ustiga qo'yiladi).
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const WIRE = "#8A929A";
  const LIT = "#F0C040";
  const W = 260;
  const H = 170;

  const line = (x1, y1, x2, y2, on) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${on ? LIT : WIRE}" stroke-width="${on ? 6 : 5}" stroke-linecap="round"/>`;
  const path = (d, on) => `<path d="${d}" stroke="${on ? LIT : WIRE}" stroke-width="${on ? 6 : 5}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

  // Kalit: ikki qisqich va dastak; ulangan — to'g'ri, ulanmagan — ko'tarilgan, closed === null — noma'lum (dastak yo'q).
  // inverse — to'q sariq (teskari kalit)
  function switchAt(x1, x2, y, closed, on, inverse) {
    if (closed === null) {
      return `<g class="switch unknown">
    <circle cx="${x1}" cy="${y}" r="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
    <circle cx="${x2}" cy="${y}" r="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
  </g>`;
    }
    const lever = closed ? `M${x1} ${y} L${x2} ${y}` : `M${x1} ${y} L${x2 - 8} ${y - 24}`;
    const color = inverse ? "#F08A24" : INK;
    return `<g class="switch${closed ? " closed" : ""}">
    <path d="${lever}" stroke="${on && closed ? LIT : color}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="${x1}" cy="${y}" r="6" fill="#FFFFFF" stroke="${color}" stroke-width="3"/>
    <circle cx="${x2}" cy="${y}" r="6" fill="#FFFFFF" stroke="${color}" stroke-width="3"/>
  </g>`;
  }

  // Chiroq: on — sariq nur bilan, off — kulrang, unknown — oq (ustida HTML "?")
  function lamp(state) {
    const fill = state === "on" ? "#FFD54A" : state === "off" ? "#D9D2C3" : "#FFFFFF";
    const rays = state === "on"
      ? [0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
        `<rect x="234" y="70" width="4" height="9" rx="2" fill="#FFC83D" transform="rotate(${a} 236 102)"/>`).join("")
      : "";
    return `<g class="lamp lamp-${state}">${rays}
    <circle cx="236" cy="102" r="15" fill="${fill}" stroke="${INK}" stroke-width="3"${state === "unknown" ? ' stroke-dasharray="5 4"' : ""}/>
    ${state === "unknown" ? "" : `<path d="M230 106 Q236 96 242 106" stroke="${state === "on" ? "#C98A00" : "#9A9186"}" stroke-width="2.5" fill="none"/>`}
  </g>`;
  }

  // Batareya (chapda, tik)
  const battery = `<g class="battery">
    <rect x="11" y="84" width="26" height="36" rx="5" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
    <rect x="18" y="78" width="12" height="7" rx="2" fill="#8A929A" stroke="${INK}" stroke-width="2"/>
    <rect x="11" y="106" width="26" height="14" rx="4" fill="#1F4FA8"/>
  </g>`;

  // Sxema. kind: series | parallel | single | inverse; a, b — 0/1 (b === null — noma'lum kalit);
  // lamp — on | off | unknown; wires — tok yo'li sariq bo'lsinmi (odatda chiroq yoniq bo'lsa)
  function circuit(kind, { a = 0, b = 0, lamp: state = "off", wires } = {}) {
    const on = wires == null ? state === "on" : !!wires;
    const ca = kind === "inverse" ? a === 0 : a === 1; // teskari kalit: bosilsa (1) — uziladi
    const cb = b === null ? null : b === 1;
    // Yuqori sim — y = 54, pastki — y = 150; parallelda ikki yo'l: y = 30 va y = 78
    let top = "";
    if (kind === "series") {
      top = line(24, 54, 76, 54, on) + switchAt(76, 116, 54, ca, on) + line(116, 54, 150, 54, on)
        + switchAt(150, 190, 54, cb, on) + line(190, 54, 236, 54, on);
    } else if (kind === "parallel") {
      const upOn = on && ca;
      const lowOn = on && cb === true;
      top = line(24, 54, 60, 54, on) + line(204, 54, 236, 54, on)
        + path("M60 54 L60 30 L112 30", upOn) + path("M152 30 L204 30 L204 54", upOn)
        + path("M60 54 L60 78 L112 78", lowOn) + path("M152 78 L204 78 L204 54", lowOn)
        + switchAt(112, 152, 30, ca, upOn) + switchAt(112, 152, 78, cb, lowOn);
    } else {
      top = line(24, 54, 112, 54, on) + switchAt(112, 152, 54, ca, on, kind === "inverse") + line(152, 54, 236, 54, on);
    }
    const loop = path("M24 84 L24 54", on) + path("M236 54 L236 87", on)
      + path("M236 117 L236 150 L24 150 L24 120", on);
    return `<svg class="circuit-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${loop}${top}${battery}${lamp(state)}</svg>`;
  }

  // Kalit harflari qayerga yoziladi (viewBox birliklarida): rasm ustidagi HTML uchun
  // Harflar simning ostida (ochiq kalit dastagi tepaga ko'tariladi — to'sib qo'ymasin)
  function circuitLabels(kind) {
    if (kind === "series") return [{ key: "a", x: 96, y: 62 }, { key: "b", x: 170, y: 62 }];
    if (kind === "parallel") return [{ key: "a", x: 86, y: 36 }, { key: "b", x: 86, y: 84 }];
    return [{ key: "a", x: 132, y: 62 }];
  }
  const LAMP_AT = { x: 236, y: 102 };

  // Hikoya: kitob (Jorj Bul), protsessor, ikki doira (qidiruv: VA — kesishgan joy)
  const book = () => `<svg viewBox="0 0 200 140" aria-hidden="true">
  <path d="M100 30 Q60 14 18 22 V120 Q60 112 100 128 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M100 30 Q140 14 182 22 V120 Q140 112 100 128 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M34 44 H84 M34 60 H80 M34 76 H84 M34 92 H72" stroke="#9FB6D8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="130" cy="56" r="11" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="160" cy="56" r="11" fill="#D9D2C3" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="130" cy="90" r="11" fill="#D9D2C3" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="160" cy="90" r="11" fill="#F0C040" stroke="${INK}" stroke-width="2.5"/>
</svg>`;

  function chip() {
    let pins = "";
    for (let k = 0; k < 6; k++) {
      const p = 38 + k * 25;
      pins += `<rect x="${p}" y="8" width="8" height="18" rx="2" fill="#B8BEC6"/><rect x="${p}" y="134" width="8" height="18" rx="2" fill="#B8BEC6"/>`;
      pins += `<rect x="8" y="${p - 18}" width="18" height="8" rx="2" fill="#B8BEC6"/><rect x="174" y="${p - 18}" width="18" height="8" rx="2" fill="#B8BEC6"/>`;
    }
    let cells = "";
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const lit = (r * 5 + c) % 3 === 0;
        cells += `<rect x="${52 + c * 20}" y="${36 + r * 18}" width="14" height="12" rx="3" fill="${lit ? LIT : "#4A5A6A"}"/>`;
      }
    }
    return `<svg viewBox="0 0 200 160" aria-hidden="true">${pins}
  <rect x="24" y="24" width="152" height="112" rx="12" fill="#2F4858" stroke="${INK}" stroke-width="3"/>
  ${cells}
</svg>`;
  }

  // Ikki doira: kesishgan joy yoniq (VA)
  const venn = () => `<svg viewBox="0 0 200 130" aria-hidden="true">
  <defs><clipPath id="venn-a"><circle cx="80" cy="65" r="50"/></clipPath></defs>
  <circle cx="80" cy="65" r="50" fill="#D5E3FA" stroke="${INK}" stroke-width="3"/>
  <circle cx="120" cy="65" r="50" fill="#E6DAF5" stroke="${INK}" stroke-width="3"/>
  <circle cx="120" cy="65" r="50" fill="#F0C040" clip-path="url(#venn-a)"/>
  <circle cx="80" cy="65" r="50" fill="none" stroke="${INK}" stroke-width="3"/>
  <circle cx="120" cy="65" r="50" fill="none" stroke="${INK}" stroke-width="3"/>
</svg>`;

  root.QK = root.QK || {};
  root.QK.art = Object.assign(root.QK.art || {}, { circuit, circuitLabels, CIRCUIT_SIZE: { w: W, h: H }, LAMP_AT, book, chip, venn });
})(window);
