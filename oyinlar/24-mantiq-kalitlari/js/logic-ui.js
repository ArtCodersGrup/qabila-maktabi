// Mantiq kalitlari — ekran qismlari: sxema (harflar rasm ustida), kalit tugmalari, rostlik jadvali,
// hayotiy qoida kartasi, ifoda qatori.
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

  // ---------- Kalit tugmalari (boshqaruv zonasida) ----------
  // items: [{ key, text(v) }]; onChange({ a, b }) — har bosishda
  function switches(host, items, onChange) {
    const values = { a: 0, b: 0 };
    const buttons = {};
    let locked = false;
    const row = h("div", { class: "switches" });
    items.forEach((it) => {
      const b = h("button", { class: "sw-btn", type: "button" });
      b.addEventListener("click", () => {
        if (locked) return;
        values[it.key] = 1 - values[it.key];
        QK.sound.play("tap");
        render();
        onChange(Object.assign({}, values));
      });
      buttons[it.key] = b;
      row.append(b);
    });
    function render() {
      items.forEach((it) => {
        const v = values[it.key];
        const b = buttons[it.key];
        b.classList.toggle("on", v === 1);
        b.innerHTML = "";
        b.append(...it.text(v).map((part, k) => h("span", { class: k ? "sw-sub" : "sw-main", text: part })));
      });
    }
    render();
    host.append(row);
    return { lock() { locked = true; row.classList.add("locked"); } };
  }

  // Harfli kalit: "A = 1" / "ulangan"; teskari kalitda — "bosilgan"
  const letterSwitch = (key, inverse) => ({
    key,
    text: (v) => [`${key.toUpperCase()} = ${v}`, inverse ? (v ? "bosilgan" : "bosilmagan") : (v ? "ulangan" : "uzilgan")],
  });
  // Hayotiy kalit: "🌧️ Yomgʻir yogʻyapti" / "= 1"
  const lifeSwitch = (key, side) => ({ key, text: (v) => [`${side.icon} ${v ? side.on : side.off}`, `= ${v}`] });

  // ---------- Rostlik jadvali ----------
  // heads — ustun nomlari (oxirgisi — natija); rows — kirishlar ro'yxati ([a, b] yoki [a]); outs — natijalar
  function truthTable(host, { heads, rows, outs, filled }) {
    const cells = [];
    const trs = [];
    const done = rows.map(() => !!filled);
    const body = h("tbody");
    rows.forEach((r, i) => {
      const out = h("td", { class: "out", text: filled ? String(outs[i]) : "?" });
      const tr = h("tr", null, ...r.map((v) => h("td", { text: String(v) })), out);
      if (filled) out.classList.add("v" + outs[i]);
      cells.push(out);
      trs.push(tr);
      body.append(tr);
    });
    const table = h("table", { class: "ttable" }, h("thead", null, h("tr", null, ...heads.map((t) => h("th", { text: t })))), body);
    host.append(table);
    return {
      el: table,
      // Qator to'ldi; yangi bo'lsa — true
      fill(i) {
        if (done[i]) return false;
        done[i] = true;
        cells[i].textContent = String(outs[i]);
        cells[i].classList.add("v" + outs[i], "fresh");
        return true;
      },
      current(i) { trs.forEach((tr, k) => tr.classList.toggle("cur", k === i)); },
      mark(list) { trs.forEach((tr, k) => tr.classList.toggle("mark", list.includes(k))); },
      count: () => done.filter(Boolean).length,
    };
  }

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
