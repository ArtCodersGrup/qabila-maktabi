// Piksel ustaxonasi: to'r, palitra, rang aralashtirgich, qator va uning qisqa yozuvi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { pixels, ui, sound } = QK;

  const BW = ["#FFFFFF", "#2B2B3A"];
  const ROW_COLORS = ["#FFFFFF", "#2F6FDE"]; // qator: 0 — oq, 1 — ko'k

  // Oq fonda to'q, to'q fonda oq yozuv
  const DARK = new Set(["#2B2B3A", "#2F6FDE", "#1A9E77", "#E0524A", "#8E5BD0", "#5A3A1E", "#1E3A5F"]);

  // W × H to'r. colors — indeks → rang; editable — bosiladi; pickColor() → joriy rang indeksi
  // (bo'lmasa oq-qora: 0 ↔ 1); size: "" | "sm" | "md"
  function grid(host, o) {
    const colors = o.colors || BW;
    let cells = o.cells ? o.cells.slice() : Array(o.w * o.h).fill(0);
    let locked = false;
    let codeOf = null;
    const el = ui.h("div", { class: "pgrid" + (o.size ? " " + o.size : ""), style: `grid-template-columns: repeat(${o.w}, var(--cell)); --rows: ${o.h}` });
    const nodes = cells.map((_, i) => {
      const node = o.editable
        ? ui.h("button", { class: "pcell", type: "button", "aria-label": `${Math.floor(i / o.w) + 1}-qator, ${(i % o.w) + 1}-katak` })
        : ui.h("span", { class: "pcell" });
      if (o.editable) {
        node.addEventListener("click", () => {
          if (locked) return;
          cells[i] = o.pickColor ? o.pickColor() : 1 - cells[i];
          sound.play("tap");
          render();
          if (o.onChange) o.onChange(cells.slice());
        });
      }
      el.append(node);
      return node;
    });
    function render() {
      nodes.forEach((node, i) => {
        const color = colors[cells[i]];
        node.style.background = color;
        node.classList.toggle("dark", DARK.has(color));
        node.textContent = codeOf ? codeOf(cells[i]) : "";
      });
    }
    host.append(el);
    render();
    return {
      el,
      get: () => cells.slice(),
      lock() {
        locked = true;
        el.classList.add("locked");
      },
      // Kataklar ichida kod: fn(qiymat) → "1" / "01"
      showCodes(fn) {
        codeOf = fn;
        render();
      },
      highlightRow(r) {
        nodes.forEach((node, i) => node.classList.toggle("hl", r != null && Math.floor(i / o.w) === r));
      },
    };
  }

  // Mashqdagi rasm uchun katak o'lchami: kichik rasm — katta kataklar.
  // "fit" — yotiq ekranda rasm qatorlar soniga qarab kichrayadi (raqam klaviaturasi bilan sig'sin)
  const fit = (w, h) => (Math.max(w, h) <= 4 ? "md" : Math.max(w, h) <= 7 ? "" : "sm") + " fit";

  // Mashq rasmi va ostida o'lchami: "8 × 6 piksel" (+ ixtiyoriy qo'shimcha)
  function taskPicture(host, task, colors, extra) {
    const g = grid(host, { w: task.w, h: task.h, cells: task.cells, colors, size: fit(task.w, task.h) });
    host.append(ui.h("div", { class: "pic-size", text: `${task.w} × ${task.h} piksel${extra ? ", " + extra : ""}` }));
    return g;
  }

  // Palitra tugmalari; tanlangani belgilanadi. Natija: { get() } — joriy indeks
  function palette(host, list, start) {
    let current = start;
    const row = ui.h("div", { class: "palette" });
    const buttons = list.map((c, i) => {
      const b = ui.h("button", {
        class: "swatch-btn" + (i === current ? " on" : ""),
        type: "button",
        style: `background:${c.color}`,
        "aria-label": c.name,
        onClick: () => {
          current = i;
          sound.play("tap");
          buttons.forEach((x, k) => x.classList.toggle("on", k === i));
        },
      });
      row.append(b);
      return b;
    });
    host.append(row);
    return { get: () => current };
  }

  // Rang aralashtirgich: katta piksel va 3 ta chiroq-tugma (qizil, yashil, ko'k)
  const CHANNELS = [
    { name: "qizil", color: "#E0524A" },
    { name: "yashil", color: "#1A9E77" },
    { name: "koʻk", color: "#2F6FDE" },
  ];

  function mixer(host, target, onChange) {
    const rgb = [0, 0, 0];
    const big = ui.h("div", { class: "mix-pixel" });
    const name = ui.h("div", { class: "mix-name" });
    const want = ui.h("div", { class: "mix-want" },
      ui.h("span", { text: "Kerak:" }),
      ui.h("span", { class: "mix-target", style: `background:${pixels.mixCss(target)}` }),
      ui.h("span", { text: pixels.mixName(target) }));
    const lamps = ui.h("div", { class: "mix-lamps" });
    const buttons = CHANNELS.map((ch, k) => {
      const b = ui.h("button", {
        class: "mix-lamp",
        type: "button",
        onClick: () => {
          rgb[k] = 1 - rgb[k];
          sound.play("tap");
          render();
          onChange(rgb.slice());
        },
      });
      lamps.append(ui.h("div", { class: "mix-col" }, b, ui.h("span", { class: "mix-label", text: ch.name })));
      return b;
    });
    function render() {
      big.style.background = pixels.mixCss(rgb);
      name.textContent = `Hozir: ${pixels.mixName(rgb)}`;
      buttons.forEach((b, k) => {
        b.style.background = rgb[k] ? CHANNELS[k].color : "#D9D2C3";
        b.classList.toggle("on", !!rgb[k]);
        b.setAttribute("aria-label", `${CHANNELS[k].name}: ${rgb[k] ? "yoniq" : "oʻchiq"}`);
      });
    }
    host.append(ui.h("div", { class: "mixer" }, ui.h("div", { class: "mix-top" }, big, ui.h("div", null, name, want)), lamps));
    render();
    return { lock: () => buttons.forEach((b) => { b.disabled = true; }) };
  }

  // Piksellar qatori; split — bir xil rangli bo'laklar orasida bo'shliq
  function rowView(row, split) {
    const el = ui.h("div", { class: "prow" + (split ? " split" : "") });
    const parts = split ? pixels.runs(row) : row.map((value) => ({ value, count: 1 }));
    for (const part of parts) {
      const group = ui.h("span", { class: "prun" });
      for (let k = 0; k < part.count; k++) group.append(ui.h("span", { class: "rcell", style: `background:${ROW_COLORS[part.value]}` }));
      el.append(group);
    }
    return el;
  }

  // Qisqa yozuv: "6 ■  2 □  2 ■"
  function rleView(row) {
    const el = ui.h("div", { class: "rle" });
    for (const part of pixels.runs(row)) {
      el.append(ui.h("span", { class: "rle-item" },
        ui.h("span", { class: "rle-n", text: String(part.count) }),
        ui.h("span", { class: "rcell", style: `background:${ROW_COLORS[part.value]}` })));
    }
    return el;
  }

  QK.pixelsUi = { BW, fit, grid, taskPicture, palette, mixer, rowView, rleView };
})(window);
