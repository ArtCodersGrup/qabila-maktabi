// Zinapoya chirog'i — ekran qismlari: zinapoya sxemasi, amallar sxemasi (yozuvlar rasm ustida), natija raqamlari,
// ustunda qo'shish. Kalit tugmalari va rostlik jadvali — umumiy/js/mantiq-ui.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, gates: G, art } = QK;
  const h = ui.h;

  const pct = (v, total) => `${((v / total) * 100).toFixed(2)}%`;
  const OP_LABEL = { and: "VA", or: "YOKI", xor: "XOR", not: "EMAS" };

  // ---------- Zinapoya sxemasi ----------
  function stairView(host) {
    const { w, h: H } = art.STAIR;
    const wrap = h("div", { class: "scheme stair" });
    const pic = h("div", { class: "scheme-pic" });
    wrap.append(pic);
    const names = { a: "A (pastda)", b: "B (tepada)" };
    art.STAIR_LABELS.forEach((l) => wrap.append(h("span", { class: "s-label", text: names[l.key], style: `left:${pct(l.x, w)};top:${pct(l.y, H)}` })));
    const q = h("span", { class: "lamp-q", text: "?", style: `left:${pct(art.STAIR_LAMP.x, w)};top:${pct(art.STAIR_LAMP.y, H)}` });
    wrap.append(q);
    host.append(wrap);
    function set(state) {
      pic.innerHTML = art.stairCircuit(state);
      q.hidden = state.lamp !== "unknown";
    }
    set({ a: 0, b: 0 });
    return { el: wrap, set };
  }

  // ---------- Amallar sxemasi ----------
  // set(a, b, { hide, reveal, unknown }): hide — faqat kirishlar ma'lum (mashq); reveal — ko'rsatiladigan qutilar
  function gatesView(host, c, { unknown } = {}) {
    const L = art.gateLayout(c);
    // --vw — rasm kengligi (viewBox birligida): quti yozuvi rasm bilan birga kichrayadi
    const wrap = h("div", { class: "scheme gates", style: `aspect-ratio:${L.w} / ${L.h};--vw:${L.w}` });
    const pic = h("div", { class: "scheme-pic" });
    wrap.append(pic);
    const place = (el, x, y) => { el.style.left = pct(x, L.w); el.style.top = pct(y, L.h); wrap.append(el); return el; };
    // Kirish yozuvi — tugunning chap tomonida (simlarga tegmaydi)
    const inputLabels = {
      a: place(h("span", { class: "in-label" }), L.inputs.a.x - 16, L.inputs.a.y),
      b: place(h("span", { class: "in-label" }), L.inputs.b.x - 16, L.inputs.b.y),
    };
    const gateLabels = {};
    c.gates.forEach((g) => { gateLabels[g.id] = place(h("span", { class: "g-label" }), L.boxes[g.id].x, L.boxes[g.id].y); });
    const outQ = {};
    L.outs.forEach((o, k) => {
      outQ[o.id] = place(h("span", { class: "lamp-q", text: "?" }), o.x, o.y);
      const name = c.outs[k].name;
      if (name) place(h("span", { class: "out-label", text: name }), o.x, o.y + 17);
    });
    host.append(wrap);

    let hidden = unknown || null;
    // a === null — qiymatsiz sxema (faqat tuzilishi: "qaysi amal yetishmayapti?")
    function set(a, b, { hide, reveal } = {}) {
      const blank = a == null;
      const values = blank ? null : G.evaluate(c, a, b);
      const shown = hide ? (reveal || []) : null;
      pic.innerHTML = art.gatesSvg(c, values, { unknown: hidden, reveal: shown });
      inputLabels.a.textContent = blank ? "A" : `A = ${a}`;
      inputLabels.b.textContent = blank ? "B" : `B = ${b}`;
      c.gates.forEach((g) => {
        gateLabels[g.id].textContent = g.id === hidden ? "?" : OP_LABEL[g.op];
        gateLabels[g.id].classList.toggle("unknown", g.id === hidden);
      });
      L.outs.forEach((o) => { outQ[o.id].hidden = !(blank || (hide && !(reveal || []).includes(o.id))); });
    }
    return {
      el: wrap,
      set,
      // Noma'lum qutini ochish (yechimda)
      open() { hidden = null; },
    };
  }

  // ---------- A + B natijasi: ko'chirish va yig'indi raqamlari ----------
  function sumView(host) {
    const digit = (cap) => {
      const d = h("span", { class: "digit", text: "?" });
      return { d, box: h("span", { class: "digit-box" }, d, h("span", { class: "digit-cap", text: cap })) };
    };
    const c = digit("koʻchirish");
    const s = digit("yigʻindi");
    const lead = h("span", { class: "sum-lead" });
    const el = h("div", { class: "sum-view" }, lead, c.box, s.box);
    host.append(el);
    return {
      el,
      set(a, b, known = true) {
        const r = G.halfAdd(a, b);
        lead.textContent = `${a} + ${b} =`;
        c.d.textContent = known ? String(r.carry) : "?";
        s.d.textContent = known ? String(r.sum) : "?";
        c.d.className = "digit" + (known ? " v" + r.carry : "");
        s.d.className = "digit" + (known ? " v" + r.sum : "");
      },
    };
  }

  // ---------- Qo'shish jadvali: A, B, ko'chirish, yig'indi (ustunni belgilash bilan) ----------
  function addTable(host) {
    const rows = G.PAIRS.map(([a, b]) => ({ a, b, ...G.halfAdd(a, b) }));
    const cols = ["a", "b", "carry", "sum"];
    const head = h("tr", null, ...["A", "B", "Koʻchirish", "Yigʻindi"].map((t, k) => h("th", { class: "c-" + cols[k], text: t })));
    const body = h("tbody", null, ...rows.map((r) => h("tr", null, ...cols.map((k) => h("td", { class: `c-${k} v${r[k]}`, text: String(r[k]) })))));
    const table = h("table", { class: "ttable add-table" }, h("thead", null, head), body);
    host.append(table);
    return {
      el: table,
      mark(col) {
        table.querySelectorAll("th, td").forEach((c) => c.classList.toggle("col-mark", !!col && c.classList.contains("c-" + col)));
      },
    };
  }

  // ---------- Ustunda qo'shish (ikki xonali) ----------
  function columnAdd(host, x, y) {
    const row = (sign, digits) => h("div", { class: "col-row" }, h("span", { class: "col-sign", text: sign }), ...digits.map((d) => h("span", { class: "col-d", text: d })));
    const el = h("div", { class: "col-add" },
      row("", [" ", ...G.bin(x, 2)]),
      row("+", [" ", ...G.bin(y, 2)]),
      h("div", { class: "col-line" }),
      row("", ["?", "?", "?"]));
    host.append(el);
    return el;
  }

  QK.gatesUi = { OP_LABEL, stairView, gatesView, sumView, addTable, columnAdd };
})(window);
