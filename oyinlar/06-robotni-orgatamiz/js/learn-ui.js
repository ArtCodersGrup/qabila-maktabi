// Robotni o'rgatamiz: maydon (misollar, chegara chizig'i), yong'oq kartochkasi, tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, art } = QK;

  const NS = "http://www.w3.org/2000/svg";
  const FULL = "#1A9E77";   // to'la
  const EMPTY = "#FFFFFF";  // bo'sh (ichi bo'sh)
  const INK = "#2B2B3A";
  const MARK = "#F08A24";

  // Variant belgilari: shakl bilan farqlanadi (faqat rang emas)
  const SHAPES = [
    { name: "uchburchak", color: "#2F6FDE", path: (x, y, r) => `M${x} ${y - r} L${x + r} ${y + r * 0.8} L${x - r} ${y + r * 0.8} Z` },
    { name: "kvadrat", color: "#F08A24", path: (x, y, r) => `M${x - r} ${y - r} H${x + r} V${y + r} H${x - r} Z` },
    { name: "olmos", color: "#8E5BD0", path: (x, y, r) => `M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z` },
  ];

  const el = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
    return node;
  };

  // Variant belgisi (tugmalar ichida ham ishlatiladi)
  function shapeIcon(i) {
    const s = SHAPES[i];
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${s.path(12, 12, 9)}" fill="${s.color}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }

  // Maydon: gorizontal o'q — kattaligi, vertikal — og'irligi
  function field(host) {
    const svg = el("svg", { viewBox: "0 0 100 100", class: "field" });
    const wrap = ui.h("div", { class: "field-wrap" },
      ui.h("div", { class: "axis-y", text: "ogʻirligi" }),
      ui.h("div", { class: "field-box" }),
      ui.h("div", { class: "axis-x", text: "kattaligi" }));
    wrap.querySelector(".field-box").append(svg);
    host.append(wrap);

    const state = { points: [], test: [], line: null, query: null, links: [], options: [], glow: [], regions: true };
    const px = (x) => 6 + x * 8.8;
    const py = (y) => 94 - y * 8.8;

    function dot(p, kind) {
      const x = px(p.x);
      const y = py(p.y);
      const r = 3.4;
      if (kind === "test") {
        return el("rect", {
          x: x - r, y: y - r, width: r * 2, height: r * 2, rx: 0.8,
          fill: p.full ? FULL : EMPTY, stroke: INK, "stroke-width": 1.4,
        });
      }
      return el("circle", { cx: x, cy: y, r, fill: p.full ? FULL : EMPTY, stroke: INK, "stroke-width": 1.4 });
    }

    function draw() {
      svg.innerHTML = "";
      for (let g = 0; g <= 10; g++) {
        svg.append(el("line", { x1: px(g), y1: py(0), x2: px(g), y2: py(10), stroke: "#E4DCC9", "stroke-width": 0.6 }));
        svg.append(el("line", { x1: px(0), y1: py(g), x2: px(10), y2: py(g), stroke: "#E4DCC9", "stroke-width": 0.6 }));
      }
      svg.append(el("rect", { x: px(0), y: py(10), width: px(10) - px(0), height: py(0) - py(10), fill: "none", stroke: "#C9BFA6", "stroke-width": 1 }));

      if (state.line) {
        const y0 = learn.lineY(state.line, 0);
        const y10 = learn.lineY(state.line, 10);
        if (state.regions) {
          svg.append(el("polygon", {
            points: `${px(0)},${py(y0)} ${px(10)},${py(y10)} ${px(10)},${py(10)} ${px(0)},${py(10)}`,
            fill: "rgba(26,158,119,0.12)",
          }));
          svg.append(el("polygon", {
            points: `${px(0)},${py(y0)} ${px(10)},${py(y10)} ${px(10)},${py(0)} ${px(0)},${py(0)}`,
            fill: "rgba(107,78,61,0.10)",
          }));
        }
        svg.append(el("line", { x1: px(0), y1: py(y0), x2: px(10), y2: py(y10), stroke: INK, "stroke-width": 1.8, "stroke-linecap": "round" }));
      }

      for (const p of state.links) {
        if (!state.query) break;
        svg.append(el("line", {
          x1: px(state.query.x), y1: py(state.query.y), x2: px(p.x), y2: py(p.y),
          stroke: MARK, "stroke-width": 1.2, "stroke-dasharray": "3 2",
        }));
      }

      state.points.forEach((p) => svg.append(dot(p, "train")));
      state.test.forEach((p) => {
        svg.append(dot(p, "test"));
        if (!p.mark) return;
        const x = px(p.x);
        const y = py(p.y) - 6;
        if (p.mark === "wrong") {
          svg.append(el("path", { d: `M${x - 3} ${y - 3} L${x + 3} ${y + 3} M${x + 3} ${y - 3} L${x - 3} ${y + 3}`, stroke: MARK, "stroke-width": 1.6, "stroke-linecap": "round" }));
        } else {
          svg.append(el("path", { d: `M${x - 3} ${y} L${x - 1} ${y + 3} L${x + 3} ${y - 3}`, stroke: FULL, "stroke-width": 1.6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }));
        }
      });

      for (const p of state.glow) {
        svg.append(el("circle", { cx: px(p.x), cy: py(p.y), r: 6, fill: "none", stroke: MARK, "stroke-width": 1.6, class: "glow" }));
      }

      state.options.forEach((p, i) => {
        const s = SHAPES[i % SHAPES.length];
        svg.append(el("path", { d: s.path(px(p.x), py(p.y), 4), fill: s.color, stroke: INK, "stroke-width": 1.2, "stroke-linejoin": "round" }));
      });

      if (state.query) {
        svg.append(el("circle", {
          cx: px(state.query.x), cy: py(state.query.y), r: 4.6,
          fill: "#FFF6E5", stroke: MARK, "stroke-width": 1.8, "stroke-dasharray": "3 2",
        }));
      }
    }

    draw();
    return {
      set(patch) {
        Object.assign(state, patch);
        draw();
      },
      get: () => state,
      wrap,
    };
  }

  // Yong'oq kartochkasi: bosilsa chaqiladi. onCrack() — bola bosganda; small — ixcham (yonma-yon).
  function nutCard(host, point, onCrack, small) {
    const shell = ui.h("span", { class: "nut-art", html: art.nut("closed") });
    const label = ui.h("span", { class: "nut-size", text: `kattaligi ${point.x} · ogʻirligi ${point.y}` });
    const card = ui.h(onCrack ? "button" : "div", {
      class: "nut-card" + (small ? " sm" : ""), type: onCrack ? "button" : false,
      "aria-label": `Yongʻoq: kattaligi ${point.x}, ogʻirligi ${point.y}`,
    }, shell, label);
    if (onCrack) card.addEventListener("click", () => onCrack());
    host.append(card);
    return {
      reveal(full) {
        shell.innerHTML = art.nut(full ? "full" : "empty");
        shell.classList.add("cracked");
        card.disabled = true;
      },
      el: card,
    };
  }

  // "Xato: N" hisoblagichi
  function errorBadge(host) {
    const badge = ui.h("div", { class: "err-badge", "aria-live": "polite" });
    host.append(badge);
    return {
      set(n) {
        badge.textContent = n === 0 ? "Xato: 0 ✓" : `Xato: ${n}`;
        badge.classList.toggle("ok", n === 0);
      },
      el: badge,
    };
  }

  // Chiziq tugmalari: ▲ ▼ ⟲ ⟳ (+ ixtiyoriy qo'shimcha tugma)
  function lineControls(onMove, extra) {
    const pad = ui.h("div", { class: "line-pad" });
    [["up", "▲", "Koʻtarish"], ["down", "▼", "Tushirish"], ["left", "⟲", "Chapga burish"], ["right", "⟳", "Oʻngga burish"]]
      .forEach(([action, label, aria]) => {
        pad.append(ui.h("button", {
          class: "key", type: "button", text: label, "aria-label": aria,
          onClick: () => { sound.play("tap"); onMove(action); },
        }));
      });
    ui.clearControl();
    ui.control().append(pad);
    if (extra) ui.control().append(extra);
    return { pad };
  }

  // Javob tugmalari: To'la / Bo'sh
  function answerButtons(onPick) {
    ui.clearControl();
    ui.control().append(ui.h("div", { class: "choice-row" },
      ui.button("Toʻla", () => onPick(true)),
      ui.button("Boʻsh", () => onPick(false), "secondary")));
  }

  // Variant tugmalari: shakllar bilan (uchburchak, kvadrat, olmos)
  function optionButtons(count, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    for (let i = 0; i < count; i++) {
      row.append(ui.h("button", {
        class: "btn secondary opt", type: "button", "aria-label": SHAPES[i % SHAPES.length].name,
        html: shapeIcon(i), onClick: () => { sound.play("tap"); onPick(i); },
      }));
    }
    ui.clearControl();
    ui.control().append(row);
  }

  QK.learnUi = { SHAPES, shapeIcon, field, nutCard, errorBadge, lineControls, answerButtons, optionButtons };
})(window);
