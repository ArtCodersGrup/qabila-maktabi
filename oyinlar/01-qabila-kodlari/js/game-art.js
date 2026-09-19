// 1-o'yinga xos SVG rasmlar: so'zlar daraxti va kichik qabila odami. QK.art ga qo'shiladi.
// DOM bilan ishlamaydi — Node'da test qilinadi.
(function (root) {
  "use strict";

  const art = root.QK.art;
  const LETTER_COLORS = art.LETTER_COLORS;
  const OFF = "#D9D2C3";
  const INK = "#2B2B3A";

  const TUNICS = ["#C8553D", "#7A4E9A", "#3E7CB1", "#8A5A2B", "#1A9E77"];

  // Kichik qabila odami (3-bosqich): ismi bor — kulib turadi, yo'q — xafa
  function person(happy, index) {
    const mouth = happy ? "M16 22 Q20 26 24 22" : "M16 25 Q20 21 24 25";
    return `<svg class="person-svg" viewBox="0 0 40 50" aria-hidden="true">
  <path d="M8 50 L12 32 Q20 27 28 32 L32 50 Z" fill="${TUNICS[index % TUNICS.length]}"/>
  <circle cx="20" cy="18" r="10" fill="#D9A07A"/>
  <circle cx="16.5" cy="17" r="1.4" fill="${INK}"/>
  <circle cx="23.5" cy="17" r="1.4" fill="${INK}"/>
  <path d="${mouth}" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
</svg>`;
  }

  // Barg yozuvi: oddiy holatda harflar, ixcham holatda rangli kvadratchalar
  function leafLabel(word, letters, lx, ly, on, compact, grow) {
    let s = `<g class="leaf${grow}">`;
    [...word].forEach((ch, k) => {
      const color = on ? LETTER_COLORS[letters.indexOf(ch) % 4] : OFF;
      if (compact) s += `<rect x="${lx + k * 11}" y="${ly - 5}" width="9" height="9" rx="2" fill="${color}"/>`;
      else s += `<text x="${lx + k * 22}" y="${ly + 7}" font-size="20" font-weight="900" fill="${color}">${ch}</text>`;
    });
    return s + "</g>";
  }

  // So'zlar daraxti. Qavat L dagi j-tugun so'zi — j ning a asosli L xonali yozuvi.
  function tree(letters, depth, opts) {
    opts = opts || {};
    const lit = opts.lit || new Set();
    const a = letters.length;
    const leaves = Math.pow(a, depth);
    const compact = opts.compact != null ? opts.compact : leaves > 9;
    const rowH = compact ? 16 : 40;
    const colW = compact ? 56 : 84;
    const r = compact ? 6 : 14;
    const top = 30;
    const left = 16;
    const labelW = compact ? depth * 11 + 12 : depth * 22 + 20;
    const W = left + depth * colW + r + labelW + 8;
    const H = top + leaves * rowH + 4;

    const isOn = (word) => {
      for (const w of lit) if (w.startsWith(word)) return true;
      return false;
    };
    const x = (L) => left + L * colW;
    const y = (L, j) => top + (j + 0.5) * Math.pow(a, depth - L) * rowH;

    let edges = "";
    let nodes = "";
    let labels = "";
    let level = [""];
    for (let L = 1; L <= depth; L++) {
      const next = [];
      const grow = opts.animateLevel === L ? " grow" : "";
      level.forEach((parent, pj) => {
        letters.forEach((ch, k) => {
          const j = pj * a + k;
          const word = parent + ch;
          const on = isOn(word);
          const color = on ? LETTER_COLORS[k % 4] : OFF;
          edges += `<line class="edge${grow}" x1="${x(L - 1)}" y1="${y(L - 1, pj)}" x2="${x(L)}" y2="${y(L, j)}" stroke="${color}" stroke-width="${compact ? 1.5 : 3}"/>`;
          nodes += `<g class="node${grow}"><circle cx="${x(L)}" cy="${y(L, j)}" r="${r}" fill="${color}"/>`;
          if (!compact) nodes += `<text x="${x(L)}" y="${y(L, j) + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#FFFFFF">${ch}</text>`;
          nodes += "</g>";
          if (L === depth) labels += leafLabel(word, letters, x(L) + r + 8, y(L, j), on, compact, grow);
          next.push(word);
        });
      });
      level = next;
    }

    let heads = "";
    for (const L of opts.levelCounts || []) {
      heads += `<text x="${x(L)}" y="18" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">${Math.pow(a, L)} ta</text>`;
    }
    const rootDot = `<circle cx="${x(0)}" cy="${y(0, 0)}" r="${compact ? 4 : 7}" fill="${INK}"/>`;
    return `<svg class="tree" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Soʻzlar daraxti">${edges}${rootDot}${nodes}${labels}${heads}</svg>`;
  }

  Object.assign(art, { person, tree });
})(window);
