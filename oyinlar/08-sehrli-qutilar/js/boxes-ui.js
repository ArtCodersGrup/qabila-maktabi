// Sehrli qutilar: toshlar qatori, munchoqli qutilar, natija chizig'i va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, sound, art } = QK;

  const COLOR_NAME = { kok: "koʻk", sariq: "sariq" };

  // Toshlar qatori
  function stones(host, start) {
    const el = ui.h("div", { class: "stones" });
    host.append(el);
    function set(n) {
      el.innerHTML = "";
      for (let k = 0; k < n; k++) el.append(ui.h("span", { class: "stone", html: art.stone() }));
      el.setAttribute("aria-label", `${n} ta tosh`);
    }
    set(start);
    return { el, set };
  }

  // Bitta quti: sarlavha (nechta tosh) va har yurish uchun munchoqlar
  function boxCard(n, box, opts) {
    const o = opts || {};
    const card = ui.h("div", { class: "mbox" + (o.compact ? " sm" : "") });
    card.append(ui.h("div", { class: "mbox-art", html: art.box(o.open ? "open" : "closed") }));
    card.append(ui.h("div", { class: "mbox-title", text: `${n} tosh` }));
    for (const move of Object.keys(box).map(Number)) {
      const row = ui.h("div", { class: "brow" });
      const dots = ui.h("span", { class: "beads" });
      const shown = Math.min(box[move], 8);
      for (let k = 0; k < shown; k++) dots.append(ui.h("span", { class: `bead ${boxes.COLORS[move]}` }));
      row.append(dots, ui.h("span", { class: "bn", text: String(box[move]) }));
      row.setAttribute("aria-label", `${COLOR_NAME[boxes.COLORS[move]]}: ${box[move]}`);
      card.append(row);
    }
    return card;
  }

  // Qutilar qatori: faqat kerakli holatlar ko'rsatiladi
  function boxRow(host, opts) {
    const o = opts || {};
    const el = ui.h("div", { class: "mboxes" });
    host.append(el);
    const cards = {};
    return {
      el,
      set(state, list) {
        el.innerHTML = "";
        for (const n of list) {
          if (!state[n]) continue;
          const card = boxCard(n, state[n], o);
          cards[n] = card;
          el.append(card);
        }
      },
      highlight(n) {
        Object.keys(cards).forEach((k) => cards[k].classList.toggle("hl", Number(k) === n));
      },
      flash(n) {
        const card = cards[n];
        if (!card) return;
        card.classList.remove("flash");
        void card.offsetWidth;
        card.classList.add("flash");
      },
    };
  }

  // Natija chizig'i: ✓ / ✗
  function resultLine(host) {
    const el = ui.h("div", { class: "results", "aria-live": "polite" });
    host.append(el);
    let list = [];
    const render = () => {
      el.innerHTML = "";
      list.slice(-20).forEach((won) => el.append(ui.h("span", { class: "res " + (won ? "win" : "lose"), text: won ? "✓" : "✗" })));
    };
    return {
      el,
      add(won) { list.push(won); render(); },
      set(next) { list = next.slice(); render(); },
      count: () => list.filter(Boolean).length,
    };
  }

  // "1 ta ol" / "2 ta ol" tugmalari (n ga qarab)
  function moveButtons(n, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    for (const move of boxes.legalMoves(n)) {
      row.append(ui.button(`${move} ta ol`, () => onPick(move), move === 2 ? "secondary" : ""));
    }
    ui.clearControl();
    ui.control().append(row);
  }

  // Javob tugmalari (matnli variantlar)
  function optionButtons(options, onPick, labels) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((value, i) => {
      row.append(ui.button(labels ? labels(value) : String(value), () => onPick(i), i % 2 ? "secondary" : ""));
    });
    ui.clearControl();
    ui.control().append(row);
  }

  // Munchoq belgisi (savollarda)
  const beadChip = (move) => ui.h("span", { class: `bead ${boxes.COLORS[move]} big` });

  QK.boxesUi = { COLOR_NAME, stones, boxCard, boxRow, resultLine, moveButtons, optionButtons, beadChip };
})(window);
