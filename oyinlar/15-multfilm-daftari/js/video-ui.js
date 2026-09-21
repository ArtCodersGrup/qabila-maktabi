// Multfilm daftari: kadr to'ri, kadrlar tasmasi, o'ynatgich, kadrlar juftligi va kichik belgilar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { video, ui, art } = QK;

  // 6 × 6 kadr. onTap(i) — bosiladigan kataklar; ghosts — xira koptoklar (2- va 4-kadr joyi)
  function frameGrid(host, cells, o) {
    const opts = o || {};
    let cur = cells.slice();
    const el = ui.h("div", { class: "vframe" + (opts.size ? " " + opts.size : "") });
    const nodes = cur.map((_, i) => {
      const node = opts.onTap
        ? ui.h("button", { class: "fcell", type: "button", "aria-label": `${Math.floor(i / video.SIZE) + 1}-qator, ${(i % video.SIZE) + 1}-katak` })
        : ui.h("span", { class: "fcell" });
      if (opts.onTap) node.addEventListener("click", () => opts.onTap(i));
      el.append(node);
      return node;
    });
    const ghosts = new Set(opts.ghosts || []);
    function render() {
      nodes.forEach((node, i) => {
        node.style.background = video.COLORS[cur[i]];
        node.classList.toggle("ghost", ghosts.has(i) && cur[i] === 0);
      });
    }
    host.append(el);
    render();
    return {
      el,
      set(next) {
        cur = next.slice();
        render();
      },
      mark(i, cls) { nodes[i].classList.add(cls); },
      markRows(rows) {
        nodes.forEach((node, i) => node.classList.toggle("row-hl", rows.has(Math.floor(i / video.SIZE))));
      },
      shake(i) {
        nodes[i].classList.remove("shake");
        void nodes[i].offsetWidth;
        nodes[i].classList.add("shake");
      },
    };
  }

  // Kadrlar tasmasi: kichik kadrlar, ustida raqami; missing — bo'sh "?" kadr
  function strip(host, frames, missing) {
    const el = ui.h("div", { class: "strip" });
    const slots = frames.map((cells, k) => {
      const slot = ui.h("div", { class: "strip-item" + (k === missing ? " missing" : "") },
        ui.h("span", { class: "strip-n", text: String(k + 1) }));
      if (k === missing) slot.append(ui.h("span", { class: "strip-q", text: "?" }));
      else frameGrid(slot, cells, { size: "xs" });
      el.append(slot);
      return slot;
    });
    host.append(el);
    return {
      fill(k, cells) {
        slots[k].replaceChildren(ui.h("span", { class: "strip-n", text: String(k + 1) }));
        slots[k].classList.remove("missing");
        frameGrid(slots[k], cells, { size: "xs" });
      },
    };
  }

  // O'ynatgich: katta kadr va hisoblagich. play(frames, fps, seconds) — Promise
  function player(host, first) {
    const counter = ui.h("div", { class: "count-line" });
    const screen = frameGrid(host, first, {});
    host.append(counter);
    return {
      play(frames, fps, seconds) {
        let k = 0;
        let shown = 0;
        const total = fps * seconds;
        return ui.settle((done) => {
          const tick = () => {
            screen.set(frames[k % frames.length]);
            shown++;
            counter.textContent = `${fps} kadr/soniya · koʻrsatildi: ${shown} kadr`;
            k++;
            if (shown >= total) {
              clearInterval(timer);
              done();
            }
          };
          const timer = setInterval(tick, 1000 / fps);
          tick();
          ui.onCleanup(() => clearInterval(timer));
        });
      },
    };
  }

  // 1-kadr va 2-kadr yonma-yon; onTap — 2-kadr kataklari bosiladi
  function pair(host, a, b, o) {
    const opts = o || {};
    const el = ui.h("div", { class: "fpair" + (opts.size ? " " + opts.size : "") });
    const colA = ui.h("div", { class: "fcol" }, ui.h("span", { class: "fcol-name", text: "1-kadr" }));
    const colB = ui.h("div", { class: "fcol" }, ui.h("span", { class: "fcol-name", text: "2-kadr" }));
    el.append(colA, colB);
    host.append(el);
    const first = frameGrid(colA, a, { size: opts.size });
    const second = frameGrid(colB, b, { size: opts.size, onTap: opts.onTap });
    return { el, first, second };
  }

  // Kichik ekran (4 × 4) kartochkasi: ostida "2 bayt"
  function tinyCard(k) {
    const g = ui.h("div", { class: "tgrid" });
    video.tinyFrame(k).forEach((c) => g.append(ui.h("span", { class: "tcell" + (c ? " on" : "") })));
    return ui.h("div", { class: "tcard" }, g, ui.h("span", { class: "tcard-label", text: `${video.TINY.bytes} bayt` }));
  }

  // N ta kadr ikonkasi; label — har biri ostida yozuv
  function frameIcons(n, label) {
    const row = ui.h("div", { class: "icons" });
    for (let k = 0; k < n; k++) {
      row.append(ui.h("div", { class: "icon-item" },
        ui.h("span", { class: "icon-art", html: art.frame() }),
        label ? ui.h("span", { class: "icon-label", text: label }) : null));
    }
    return row;
  }

  // N ta "soniya" qutisi, har birida K kadr
  function secondBoxes(n, fps) {
    const row = ui.h("div", { class: "icons" });
    for (let k = 0; k < n; k++) {
      row.append(ui.h("div", { class: "sec-box" },
        ui.h("span", { class: "sec-name", text: `${k + 1}-soniya` }),
        ui.h("span", { class: "sec-n", text: `${fps} kadr` })));
    }
    return row;
  }

  // Tanlov tugmalari (sonlar yoki matnlar)
  function choiceButtons(labels, onPick, cls) {
    const row = ui.h("div", { class: "choice-row" + (cls ? " " + cls : "") });
    labels.forEach((label, i) => row.append(ui.button(String(label), () => onPick(i))));
    ui.clearControl();
    ui.control().append(row);
  }

  QK.videoUi = { frameGrid, strip, player, pair, tinyCard, frameIcons, secondBoxes, choiceButtons };
})(window);
