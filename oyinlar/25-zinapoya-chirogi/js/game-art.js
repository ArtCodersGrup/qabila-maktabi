// 25-o'yinga xos SVG rasmlar: zinapoya sxemasi (har kalit ikki simdan birini tanlaydi), zinapoya rasmi,
// amallar sxemasi (simlar, qutilar, chiqish chiroqlari), kompyuter xonasi va protsessor. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi. Rasm ichida matn yo'q (yozuvlar — HTML, joylashuvi gateLayout dan).
(function (root) {
  "use strict";

  const INK = "#2B2B3A";
  const WIRE = "#8A929A";
  const LIT = "#F0C040";

  const wire = (d, on) => `<path d="${d}" stroke="${on ? LIT : WIRE}" stroke-width="${on ? 6 : 5}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const dot = (x, y, on) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#FFFFFF" stroke="${on ? "#C98A00" : INK}" stroke-width="3"/>`;

  function bulb(x, y, state, r = 15) {
    const fill = state === "on" ? "#FFD54A" : state === "off" ? "#D9D2C3" : "#FFFFFF";
    const rays = state === "on"
      ? [0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
        `<rect x="${x - 2}" y="${y - r - 13}" width="4" height="9" rx="2" fill="#FFC83D" transform="rotate(${a} ${x} ${y})"/>`).join("")
      : "";
    return `<g class="lamp lamp-${state}">${rays}<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="3"${state === "unknown" ? ' stroke-dasharray="5 4"' : ""}/></g>`;
  }

  const battery = (x, y) => `<g class="battery">
    <rect x="${x - 13}" y="${y - 18}" width="26" height="36" rx="5" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
    <rect x="${x - 6}" y="${y - 24}" width="12" height="7" rx="2" fill="#8A929A" stroke="${INK}" stroke-width="2"/>
    <rect x="${x - 13}" y="${y + 4}" width="26" height="14" rx="4" fill="#1F4FA8"/>
  </g>`;

  // ---------- Zinapoya sxemasi ----------
  // A (chap) 0 — yuqori sim, 1 — pastki; B (o'ng) 0 — pastki, 1 — yuqori. Chiroq: A va B har xil (XOR)
  const STAIR = { w: 260, h: 170 };
  function stairCircuit({ a = 0, b = 0, lamp: state } = {}) {
    const lampState = state || (a ^ b ? "on" : "off");
    const on = lampState === "on";
    const aTo = a ? 78 : 30; // A tanlagan sim
    const bTo = b ? 30 : 78; // B tanlagan sim
    const upOn = on && aTo === 30;
    const lowOn = on && aTo === 78;
    return `<svg class="stair-svg" viewBox="0 0 ${STAIR.w} ${STAIR.h}" aria-hidden="true">
  ${wire("M24 84 L24 54 L66 54", on)}
  ${wire("M96 30 L164 30", upOn)}
  ${wire("M96 78 L164 78", lowOn)}
  ${wire(`M66 54 L96 ${aTo}`, on)}
  ${wire(`M194 54 L164 ${bTo}`, on)}
  ${wire("M194 54 L236 54 L236 87", on)}
  ${wire("M236 117 L236 150 L24 150 L24 120", on)}
  ${dot(66, 54, on)}${dot(96, 30, upOn)}${dot(96, 78, lowOn)}${dot(164, 30, upOn)}${dot(164, 78, lowOn)}${dot(194, 54, on)}
  ${battery(24, 102)}${bulb(236, 102, lampState)}
</svg>`;
  }
  const STAIR_LABELS = [{ key: "a", x: 66, y: 2 }, { key: "b", x: 194, y: 2 }]; // simlar tepasida — batareya va chiroqqa tegmaydi
  const STAIR_LAMP = { x: 236, y: 102 };

  // Zinapoya rasmi (kirish): pastda va tepada kalit, tepada chiroq
  const stairs = () => `<svg viewBox="0 0 220 150" aria-hidden="true">
  <path d="M10 140 H60 V114 H90 V88 H120 V62 H150 V36 H210" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M10 140 H60 V114 H90 V88 H120 V62 H150 V36 H210 V140 Z" fill="#E8DCC8"/>
  <rect x="30" y="96" width="14" height="20" rx="3" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
  <rect x="34" y="100" width="6" height="8" rx="2" fill="#F08A24"/>
  <rect x="186" y="6" width="14" height="20" rx="3" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
  <rect x="190" y="14" width="6" height="8" rx="2" fill="#F08A24"/>
  ${bulb(110, 22, "on", 11)}
</svg>`;

  // ---------- Amallar sxemasi ----------
  // Joylashuv (viewBox birliklarida): kirishlar, qutilar, chiqishlar va simlar. UI yozuvlarni shu bo'yicha qo'yadi.
  const colX = (col) => 80 + col * 92; // chapda kirish yozuvlari uchun joy
  const rowY = (row) => 44 + row * 74;
  const BOX = { w: 60, h: 40 };

  function gateLayout(c) {
    const maxCol = Math.max(...c.gates.map((g) => g.col));
    const rows = Math.max(1, ...c.gates.map((g) => g.row)) + 1;
    const w = colX(maxCol + 1) + 10;
    const h = rowY(rows - 1) + 44;
    const inputs = { a: { x: colX(0) - 14, y: rowY(0) }, b: { x: colX(0) - 14, y: rowY(1) } };
    const boxes = {};
    c.gates.forEach((g) => { boxes[g.id] = { x: colX(g.col), y: rowY(g.row), unary: g.in.length === 1 }; });
    const outs = c.outs.map((o) => ({ id: o.id, x: colX(maxCol + 1) - 18, y: boxes[o.id].y }));
    // Simlar: manbadan qutining kirish qisqichiga (ikki kirishli qutida — yuqori va pastki)
    const wires = [];
    const midFor = { a: colX(0) + 2, b: colX(0) + 20 }; // kirish simlari har xil ustunda buriladi
    c.gates.forEach((g) => {
      const box = boxes[g.id];
      g.in.forEach((src, k) => {
        const ty = g.in.length === 1 ? box.y : box.y + (k ? 10 : -10);
        const tx = box.x - BOX.w / 2;
        const from = inputs[src] || { x: boxes[src].x + BOX.w / 2, y: boxes[src].y };
        const mid = inputs[src] ? midFor[src] : (from.x + tx) / 2;
        wires.push({ src, d: `M${from.x} ${from.y} H${mid} V${ty} H${tx}`, branch: inputs[src] ? { x: mid, y: from.y } : null });
      });
    });
    outs.forEach((o) => wires.push({ src: o.id, d: `M${boxes[o.id].x + BOX.w / 2} ${o.y} H${o.x - 13}` }));
    return { w, h, inputs, boxes, outs, wires };
  }

  // values — har sim qiymati (null — noma'lum: hammasi kulrang, chiroqlar "?"); unknown — noma'lum quti id si
  function gatesSvg(c, values, { unknown, reveal } = {}) {
    const L = gateLayout(c);
    const val = (id) => (values && (reveal == null || reveal.includes(id) || id === "a" || id === "b") ? values[id] : null);
    let body = "";
    for (const wr of L.wires) body += wire(wr.d, val(wr.src) === 1);
    // Tarmoqlanish nuqtalari (bitta kirish bir nechta qutiga)
    const branches = {};
    L.wires.forEach((wr) => { if (wr.branch) branches[wr.src] = (branches[wr.src] || []).concat(wr.branch); });
    Object.entries(branches).forEach(([src, list]) => {
      if (list.length > 1) body += `<circle cx="${list[0].x}" cy="${list[0].y}" r="5" fill="${val(src) === 1 ? LIT : WIRE}"/>`;
    });
    for (const [id, p] of Object.entries(L.inputs)) {
      const v = val(id);
      body += `<circle cx="${p.x}" cy="${p.y}" r="11" fill="${v === 1 ? "#FFD54A" : "#E8E3DA"}" stroke="${INK}" stroke-width="3"/>`;
    }
    for (const [id, b] of Object.entries(L.boxes)) {
      const q = id === unknown;
      body += `<rect x="${b.x - BOX.w / 2}" y="${b.y - BOX.h / 2}" width="${BOX.w}" height="${BOX.h}" rx="10" fill="${q ? "#FFF6E5" : "#FFFFFF"}" stroke="${q ? "#F08A24" : INK}" stroke-width="3"${q ? ' stroke-dasharray="6 4"' : ""}/>`;
    }
    for (const o of L.outs) {
      const v = val(o.id);
      body += bulb(o.x, o.y, v == null ? "unknown" : v ? "on" : "off", 13);
    }
    return `<svg class="gates-svg" viewBox="0 0 ${L.w} ${L.h}" aria-hidden="true">${body}</svg>`;
  }

  // ---------- Hikoya ----------
  function room() {
    let tubes = "";
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 9; k++) tubes += `<rect x="${22 + k * 18}" y="${30 + r * 30}" width="10" height="18" rx="5" fill="${(r + k) % 3 ? "#F0C040" : "#FFE9A8"}" stroke="${INK}" stroke-width="1.5"/>`;
    }
    return `<svg viewBox="0 0 200 140" aria-hidden="true">
  <rect x="8" y="16" width="184" height="108" rx="6" fill="#5C6570" stroke="${INK}" stroke-width="3"/>
  ${tubes}
  <path d="M8 124 H192" stroke="${INK}" stroke-width="4"/>
  <circle cx="176" cy="112" r="6" fill="#1A9E77"/>
</svg>`;
  }

  function chip() {
    let pins = "";
    for (let k = 0; k < 6; k++) {
      const p = 38 + k * 25;
      pins += `<rect x="${p}" y="8" width="8" height="18" rx="2" fill="#B8BEC6"/><rect x="${p}" y="134" width="8" height="18" rx="2" fill="#B8BEC6"/>`;
      pins += `<rect x="8" y="${p - 18}" width="18" height="8" rx="2" fill="#B8BEC6"/><rect x="174" y="${p - 18}" width="18" height="8" rx="2" fill="#B8BEC6"/>`;
    }
    let cells = "";
    for (let r = 0; r < 6; r++) {
      for (let k = 0; k < 7; k++) cells += `<rect x="${44 + k * 16}" y="${34 + r * 16}" width="10" height="10" rx="2" fill="${(r * 7 + k) % 4 ? "#4A5A6A" : LIT}"/>`;
    }
    return `<svg viewBox="0 0 200 160" aria-hidden="true">${pins}
  <rect x="24" y="24" width="152" height="112" rx="12" fill="#2F4858" stroke="${INK}" stroke-width="3"/>
  ${cells}
</svg>`;
  }

  root.QK = root.QK || {};
  root.QK.art = Object.assign(root.QK.art || {}, {
    STAIR, STAIR_LABELS, STAIR_LAMP, BOX, stairCircuit, stairs, gateLayout, gatesSvg, room, chip,
  });
})(window);
