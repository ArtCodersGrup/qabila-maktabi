// Mantiq kalitlari — ekran qismlari: sxema (harflar rasm ustida), amal jadvali, hayotiy qoida kartasi, ifoda qatori.
// Kalit tugmalari va rostlik jadvali — umumiy/js/mantiq-ui.js (25-o'yin ham ishlatadi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, art } = QK;
  const h = ui.h;

  const pct = (v, total) => `${((v / total) * 100).toFixed(2)}%`;

  // ---------- Sxema ----------
  // kind: series | parallel | single | inverse. set({ a, b, lamp, wires }) — qayta chizadi
  function circuitView(host, kind, { small } = {}) {
    const { w, h: H } = art.CIRCUIT_SIZE;
    const wrap = h("div", { class: "circuit" + (small ? " small" : "") });
    const pic = h("div", { class: "circuit-pic" });
    wrap.append(pic);
    const labels = {};
    art.circuitLabels(kind).forEach((l) => {
      labels[l.key] = h("span", { class: "sw-label", text: l.key.toUpperCase(), style: `left:${pct(l.x, w)};top:${pct(l.y, H)}` });
      wrap.append(labels[l.key]);
    });
    const q = h("span", { class: "lamp-q", text: "?", style: `left:${pct(art.LAMP_AT.x, w)};top:${pct(art.LAMP_AT.y, H)}` });
    wrap.append(q);
    host.append(wrap);

    function set(state) {
      pic.innerHTML = art.circuit(kind, state);
      q.hidden = state.lamp !== "unknown";
      if (labels.b) labels.b.textContent = state.b === null ? "B ?" : "B";
    }
    set({ a: 0, b: 0, lamp: "off" });
    return { el: wrap, set };
  }

  const { switches, letterSwitch, truthTable } = QK.mantiqUi; // umumiy/js/mantiq-ui.js

  // Hayotiy kalit: "🌧️ Yomgʻir yogʻyapti" / "= 1"
  const lifeSwitch = (key, side) => ({ key, text: (v) => [`${side.icon} ${v ? side.on : side.off}`, `= ${v}`] });

  // Amal jadvali: VA/YOKI (A, B) yoki EMAS (A)
  function opTable(host, op, { filled, result } = {}) {
    const t = L.table(op);
    const unary = L.OPS[op].unary;
    const name = unary ? "EMAS A" : `A ${L.OPS[op].name} B`;
    return truthTable(host, {
      heads: unary ? ["A", result || name] : ["A", "B", result || name],
      rows: t.map((r) => (unary ? [r.a] : [r.a, r.b])),
      outs: t.map((r) => r.out),
      filled,
    });
  }

  // ---------- Hayotiy qoida ----------
  function ruleCard(host, life) {
    const res = h("div", { class: "life-res" });
    const card = h("div", { class: "life-card" }, h("div", { class: "life-rule", text: life.rule }), res);
    host.append(card);
    return {
      el: card,
      set(v) {
        res.textContent = v == null ? "" : v ? `✓ ${life.yes}` : life.no;
        res.className = "life-res" + (v == null ? "" : v ? " yes" : " no");
      },
    };
  }

  // Holat (mashq): ikki gap va qiymatlari
  function lifeFacts(host, life, a, b) {
    const fact = (side, v) => h("div", { class: "fact" }, h("span", { text: `${side.icon} ${v ? side.on : side.off}` }), h("b", { text: `= ${v}` }));
    const el = h("div", { class: "facts" }, fact(life.a, a), fact(life.b, b));
    host.append(el);
    return el;
  }

  // ---------- Ifoda ----------
  function exprView(host, text, values) {
    const chips = h("div", { class: "vals" });
    Object.entries(values).forEach(([k, v]) => chips.append(h("span", { class: "val v" + v, text: `${k} = ${v}` })));
    const el = h("div", { class: "expr" }, chips, h("div", { class: "expr-text", text: `${text} = ?` }));
    host.append(el);
    return el;
  }

  QK.logicUi = { circuitView, switches, letterSwitch, lifeSwitch, truthTable, opTable, ruleCard, lifeFacts, exprView };
})(window);
