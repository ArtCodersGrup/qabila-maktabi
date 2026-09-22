// Savol kartasi qismlari: savol ichidagi bloklar (Morze, alifbo, kataklar, neyron...) va javob tugmalari.
// Musobaqa (savol-javob) va tog' o'yini ishlatadi. Uslublari: umumiy/css/savol.css
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const h = ui.h;

  function morseGroup(code) {
    const g = h("span", { class: "morse-group" });
    for (const s of code) g.append(h("span", { class: s === "." ? "m-dot" : "m-dash" }));
    return g;
  }

  function block(b) {
    switch (b.type) {
      case "big":
        return h("div", { class: "q-big", text: b.text });
      case "places":
        return h("div", { class: "q-places" }, h("span", { text: `Xona qiymatlari: ${b.items.join(" · ")}` }));
      case "strip": {
        const row = h("div", { class: "q-strip", "aria-label": "Alifbo" });
        b.letters.forEach((l) => row.append(h("span", { class: l === b.mark ? "mark" : "", text: l })));
        return row;
      }
      case "tiles": {
        const row = h("div", { class: "q-tiles" });
        b.items.forEach((t) => row.append(h("span", { class: "tile big", text: t })));
        return row;
      }
      case "chars": {
        const row = h("div", { class: "q-chars", "aria-label": b.text });
        [...b.text].forEach((ch) => row.append(h("span", { text: ch === " " ? "" : ch })));
        return row;
      }
      case "grid": {
        const g = h("div", { class: "q-grid", style: `grid-template-columns: repeat(${b.w}, 14px)`, "aria-hidden": "true" });
        for (let k = 0; k < b.w * b.h; k++) g.append(h("span", { class: Math.random() < 0.4 ? "on" : "" }));
        return g;
      }
      case "morse": {
        const row = h("div", { class: "q-morse", "aria-label": "Morze xabari" });
        b.groups.forEach((code) => row.append(morseGroup(code)));
        return row;
      }
      case "guide": {
        const row = h("div", { class: "q-guide", "aria-label": "Qoʻllanma" });
        b.items.forEach(([l, code]) => row.append(h("span", null, h("b", { text: l }), morseGroup(code))));
        return row;
      }
      case "lines": {
        const list = h("ul", { class: "q-lines" });
        b.items.forEach((line) => list.append(h("li", { text: line })));
        return list;
      }
      case "neuron": {
        const row = h("div", { class: "q-neuron" });
        b.inputs.forEach((x, k) => {
          const w = b.weights[k];
          row.append(h("span", { class: "n-in", "aria-label": `${x ? "yoniq" : "oʻchiq"}, ogʻirlik ${w}` },
            h("span", { class: "n-lamp" + (x ? " on" : "") }),
            h("span", { text: `×(${w < 0 ? "−" + -w : "+" + w})` })));
        });
        if (b.threshold != null) row.append(h("span", { class: "n-th", text: `Chegara: ${b.threshold}` }));
        return row;
      }
      default:
        return null;
    }
  }

  // ---------- Javob tugmalari ----------
  let padCleanup = null;
  function clearPad() {
    if (padCleanup) padCleanup();
    padCleanup = null;
  }

  // onSubmit(qiymat) bir marta chaqiriladi; enabled() — hozir javob qabul qilinadimi (pauzada — yo'q)
  function answerPad(q, onSubmit, enabled) {
    clearPad();
    ui.clearControl();
    let sent = false;
    const submit = (v) => {
      if (sent || v === "" || !enabled()) return;
      sent = true;
      clearPad();
      ui.clearControl();
      onSubmit(v);
    };

    const inp = q.input;
    if (inp.type === "choice") {
      const grid = h("div", { class: "choice-grid" });
      inp.options.forEach((o, k) => {
        const b = ui.button(o, () => submit(o));
        if (inp.options.length % 2 === 1 && k === inp.options.length - 1) b.classList.add("single");
        grid.append(b);
      });
      ui.control().append(grid);
      return;
    }

    let value = "";
    const display = h("div", { class: "num-display", "aria-live": "polite" });
    const render = () => { display.textContent = value || " "; };
    render();
    const list = inp.type === "num" ? "1234567890".split("") : inp.keys;
    const all = list.concat("del", "ok");
    const rows = Math.ceil(all.length / 6);
    const cols = Math.ceil(all.length / rows);

    function press(k) {
      if (sent || !enabled()) return;
      if (k === "ok") return submit(value);
      if (k === "del") value = value.slice(0, -1);
      else if (value.length < inp.maxLen) value = (inp.type === "num" && value === "0" ? "" : value) + k;
      sound.play("tap");
      render();
    }

    const keys = h("div", { class: "keypad", style: `--cols: ${cols}` });
    all.forEach((k) => keys.append(h("button", {
      class: "key" + (k === "ok" ? " ok" : k === "del" ? " del" : ""),
      type: "button",
      text: k === "del" ? "⌫" : k === "ok" ? "✓" : k,
      "aria-label": k === "del" ? "Oʻchirish" : k === "ok" ? "Javob berish" : k,
      onClick: () => press(k),
    })));
    ui.control().append(h("div", { class: "answer-pad" }, display, keys));

    // Kompyuterda: raqam/harf tugmalari, Backspace, Enter
    function onKey(e) {
      const k = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (list.includes(k)) press(k);
      else if (k === "Backspace") press("del");
      else if (k === "Enter") {
        e.preventDefault();
        press("ok");
      }
    }
    document.addEventListener("keydown", onKey);
    padCleanup = () => document.removeEventListener("keydown", onKey);
    ui.onCleanup(clearPad);
  }

  QK.savolUi = { block, answerPad, clearPad };
})(window);
