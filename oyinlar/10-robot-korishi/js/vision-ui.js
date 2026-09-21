// Robot nimani ko'radi?: to'r, sonlar jadvali, moslik ustunchalari va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound } = QK;

  // 6×6 to'r. editable — kataklar bosiladi; size: "" | "sm" | "xs"
  function grid(host, opts) {
    const o = opts || {};
    let cells = vision.empty();
    const el = ui.h("div", { class: "vgrid" + (o.size ? " " + o.size : "") });
    const nodes = [];
    for (let i = 0; i < vision.CELLS; i++) {
      const node = o.editable
        ? ui.h("button", { class: "vcell", type: "button", "aria-label": `${Math.floor(i / vision.SIZE) + 1}-qator, ${(i % vision.SIZE) + 1}-katak` })
        : ui.h("span", { class: "vcell" });
      if (o.editable) {
        node.addEventListener("click", () => {
          cells[i] = cells[i] ? 0 : 1;
          render();
          sound.play("tap");
          if (o.onChange) o.onChange(cells.slice());
        });
      }
      nodes.push(node);
      el.append(node);
    }
    function render() {
      nodes.forEach((node, i) => node.classList.toggle("on", !!cells[i]));
    }
    host.append(el);
    render();
    return {
      el,
      get: () => cells.slice(),
      set(next) {
        cells = next.slice();
        render();
      },
      flash() {
        el.classList.remove("flash");
        void el.offsetWidth;
        el.classList.add("flash");
      },
    };
  }

  // Robot ko'radigan sonlar: 1 va 0
  function numbers(host) {
    const el = ui.h("div", { class: "vnums" });
    host.append(el);
    return {
      el,
      set(cells) {
        el.innerHTML = "";
        cells.forEach((cell) => el.append(ui.h("span", { class: "vnum" + (cell ? " one" : ""), text: cell ? "1" : "0" })));
      },
    };
  }

  // Moslik ustunchalari: har shablon uchun 36 tadan nechtasi mos
  function scores(host) {
    const el = ui.h("div", { class: "vscores" });
    host.append(el);
    return {
      el,
      clear() { el.innerHTML = ""; },
      set(list, bestName) {
        el.innerHTML = "";
        for (const item of list) {
          el.append(ui.h("div", { class: "vscore" + (item.name === bestName ? " best" : "") },
            ui.h("span", { class: "vs-name", text: item.name }),
            ui.h("span", { class: "vs-bar", style: `width:${Math.round((item.score / vision.CELLS) * 120)}px` }),
            ui.h("span", { class: "vs-n", text: `${item.score} / ${vision.CELLS}` })));
        }
      },
    };
  }

  // Shakl tugmalari (kichik rasm bilan)
  function shapeButtons(onPick) {
    const row = ui.h("div", { class: "choice-row" });
    vision.NAMES.forEach((name) => {
      const button = ui.h("button", { class: "btn secondary shape-btn", type: "button", "aria-label": name, onClick: () => { sound.play("tap"); onPick(name); } });
      const mini = grid(button, { size: "xs" });
      mini.set(vision.TEMPLATES[name]);
      button.append(ui.h("span", { class: "shape-name", text: name }));
      row.append(button);
    });
    ui.clearControl();
    ui.control().append(row);
  }

  // Variant rasmlari (1-bosqich mashqi)
  function optionGrids(options, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((cells, i) => {
      const button = ui.h("button", { class: "btn secondary shape-btn", type: "button", "aria-label": `${i + 1}-rasm`, onClick: () => { sound.play("tap"); onPick(i); } });
      const mini = grid(button, { size: "xs" });
      mini.set(cells);
      row.append(button);
    });
    ui.clearControl();
    ui.control().append(row);
  }

  // "Bo'yalgan kataklar: N"
  function featureLine(host) {
    const el = ui.h("div", { class: "vfeature" });
    host.append(el);
    return {
      el,
      set(cells) { el.textContent = `Boʻyalgan kataklar: ${vision.filled(cells)}`; },
      clear() { el.textContent = ""; },
    };
  }

  QK.visionUi = { grid, numbers, scores, shapeButtons, optionGrids, featureLine };
})(window);
