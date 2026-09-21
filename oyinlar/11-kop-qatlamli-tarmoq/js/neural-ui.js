// Ko'p qatlamli tarmoq: neyron ko'rinishi, 3×3 rasm, qatlamlar sxemasi, jadval va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { neural, ui, sound } = QK;

  const sign = (w) => (w > 0 ? `+${w}` : `${w}`);

  // Bitta neyron: chapda kirish chiroqlari va og'irliklar, o'ngda yig'indi va chegara
  function neuronView(host, opts) {
    const state = {
      inputs: (opts.inputs || [0, 0, 0]).slice(),
      weights: opts.weights.slice(),
      threshold: opts.threshold,
    };
    const inputsEl = ui.h("div", { class: "n-inputs" });
    const soma = ui.h("div", { class: "soma" });
    const sumEl = ui.h("span", { class: "soma-sum" });
    soma.append(sumEl);
    const thr = ui.h("div", { class: "soma-thr" });
    const line = ui.h("div", { class: "n-line", "aria-live": "polite" });
    const el = ui.h("div", { class: "neuron-box" },
      ui.h("div", { class: "neuron" }, inputsEl, ui.h("div", { class: "n-arrow", text: "→" }),
        ui.h("div", { class: "n-body" }, soma, thr)),
      line);
    host.append(el);

    function render() {
      inputsEl.innerHTML = "";
      state.inputs.forEach((x, i) => {
        const lamp = ui.h(opts.editable ? "button" : "span", {
          class: "lamp-in" + (x ? " on" : ""),
          type: opts.editable ? "button" : false,
          "aria-label": `${i + 1}-kirish: ${x ? "yoniq" : "oʻchiq"}`,
        });
        if (opts.editable) {
          lamp.addEventListener("click", () => {
            state.inputs[i] = state.inputs[i] ? 0 : 1;
            sound.play("tap");
            render();
            if (opts.onChange) opts.onChange(state.inputs.slice());
          });
        }
        inputsEl.append(ui.h("div", { class: "in-row" }, lamp,
          ui.h("span", { class: "w " + (state.weights[i] > 0 ? "plus" : "minus"), text: sign(state.weights[i]) })));
      });
      const sum = neural.weightedSum(state.inputs, state.weights);
      const fired = sum >= state.threshold;
      sumEl.textContent = `Σ ${sum}`;
      soma.classList.toggle("fired", fired);
      thr.textContent = `chegara ≥ ${state.threshold}`;
      const parts = state.inputs.map((x, i) => (x ? sign(state.weights[i]) : null)).filter(Boolean);
      line.textContent = opts.hideLine ? "" : `${parts.length ? parts.join(" ") : "0"} = ${sum} → ${fired ? "yondi ✓" : "yonmadi"}`;
    }
    render();
    return {
      el,
      get: () => ({ inputs: state.inputs.slice(), weights: state.weights.slice(), threshold: state.threshold }),
      set(next) {
        Object.assign(state, next);
        render();
      },
      showLine() {
        opts.hideLine = false;
        render();
      },
    };
  }

  // 3×3 rasm
  function smallGrid(host, opts) {
    const o = opts || {};
    let cells = new Array(9).fill(0);
    const el = ui.h("div", { class: "sgrid" });
    const nodes = [];
    for (let i = 0; i < 9; i++) {
      const node = o.editable
        ? ui.h("button", { class: "scell", type: "button", "aria-label": `${i + 1}-katak` })
        : ui.h("span", { class: "scell" });
      if (o.editable) {
        node.addEventListener("click", () => {
          cells[i] = cells[i] ? 0 : 1;
          sound.play("tap");
          render();
          if (o.onChange) o.onChange(cells.slice());
        });
      }
      nodes.push(node);
      el.append(node);
    }
    const render = () => nodes.forEach((node, i) => node.classList.toggle("on", !!cells[i]));
    host.append(el);
    render();
    return {
      el,
      get: () => cells.slice(),
      set(next) {
        cells = next.slice();
        render();
      },
    };
  }

  // Qatlamlar sxemasi: rasm → [tik, yotiq] → [krest, chiziq, boshqa]
  function layerView(host, opts) {
    const o = opts || {};
    const gridHost = ui.h("div", { class: "layer" }, ui.h("div", { class: "layer-name", text: "Rasm" }));
    const grid = smallGrid(gridHost, { editable: o.editable, onChange: (cells) => { render(cells); if (o.onChange) o.onChange(cells); } });
    const tik = ui.h("div", { class: "hnode", "aria-label": "tik chiziq neyroni" }, ui.h("span", { class: "bar-v" }));
    const yotiq = ui.h("div", { class: "hnode", "aria-label": "yotiq chiziq neyroni" }, ui.h("span", { class: "bar-h" }));
    const hiddenCol = ui.h("div", { class: "layer" }, ui.h("div", { class: "layer-name", text: "1-qatlam" }),
      ui.h("div", { class: "layer-nodes" }, tik, yotiq));
    const outs = {};
    const outNodes = ui.h("div", { class: "layer-nodes" });
    const outCol = ui.h("div", { class: "layer" }, ui.h("div", { class: "layer-name", text: "2-qatlam" }), outNodes);
    for (const name of ["krest", "chiziq", "boshqa"]) {
      outs[name] = ui.h("div", { class: "onode", text: name });
      outNodes.append(outs[name]);
    }
    const el = ui.h("div", { class: "layers" }, gridHost, ui.h("span", { class: "l-arrow", text: "→" }), hiddenCol,
      ui.h("span", { class: "l-arrow", text: "→" }), outCol);
    host.append(el);
    let showOut = o.showOutput !== false;
    let showHidden = o.showHidden !== false;
    function render(cells) {
      const h = neural.hidden(cells);
      tik.classList.toggle("fired", showHidden && h.tik);
      yotiq.classList.toggle("fired", showHidden && h.yotiq);
      const out = neural.output(cells);
      for (const name of Object.keys(outs)) outs[name].classList.toggle("fired", showOut && name === out);
    }
    render(grid.get());
    return {
      el,
      grid,
      set(cells) {
        grid.set(cells);
        render(cells);
      },
      reveal(what) {
        if (what === "hidden") showHidden = true;
        if (what === "output") showOut = true;
        render(grid.get());
      },
    };
  }

  // Ikki kirishli ish jadvali: kerakli javob va neyron javobi
  function truthTable(host) {
    const el = ui.h("div", { class: "ttable" });
    host.append(el);
    return {
      el,
      set(table, answer) {
        el.innerHTML = "";
        el.append(ui.h("div", { class: "trow head" },
          ui.h("span", { text: "A" }), ui.h("span", { text: "B" }), ui.h("span", { text: "kerak" }), ui.h("span", { text: "tarmoq" })));
        for (const [a, b, want] of table) {
          const got = answer ? answer([a, b]) : null;
          const ok = got === null ? null : got === (want === 1);
          el.append(ui.h("div", { class: "trow" + (ok === false ? " bad" : ok ? " good" : "") },
            ui.h("span", { class: "lamp-dot" + (a ? " on" : "") }),
            ui.h("span", { class: "lamp-dot" + (b ? " on" : "") }),
            ui.h("span", { text: want ? "yonsin" : "yonmasin" }),
            ui.h("span", { text: got === null ? "—" : (got ? "yondi" : "yonmadi") + (ok ? " ✓" : " ↻") })));
        }
      },
    };
  }

  // Matnli javob tugmalari
  function choiceButtons(options, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((label, i) => row.append(ui.button(label, () => onPick(i), i % 2 ? "secondary" : "")));
    ui.clearControl();
    ui.control().append(row);
  }

  QK.neuralUi = { sign, neuronView, smallGrid, layerView, truthTable, choiceButtons };
})(window);
