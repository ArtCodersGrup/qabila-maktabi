// Chiroq ekran qismlari: chiroqlar qatori, naqsh, devor, kod jadvali, ma'no tugmalari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, sound, art } = QK;

  const STATE_NAMES = { 2: ["oʻchiq", "yoniq"], 3: ["oʻchiq", "sariq", "koʻk"] };
  const describe = (pattern, states) => pattern.map((s) => STATE_NAMES[states][s]).join(", ");

  // Kichik naqsh (faqat ko'rish uchun); big — katta chiroqlar
  function patternView(pattern, states, big) {
    const row = ui.h("span", {
      class: "pattern" + (big ? " big" : ""),
      role: "img",
      "aria-label": describe(pattern, states || lamps.PLAIN),
    });
    pattern.forEach((s) => row.append(ui.h("span", { class: "plamp", html: art.lamp(s) })));
    return row;
  }

  // Bosiladigan chiroqlar qatori: har bosishda keyingi holat.
  // values — chiroq ustidagi qiymatlar (4 2 1), bits — ostida 1/0, sum — pastda jonli yig'indi.
  function lampRow(host, { count, states, values, bits, sum, onChange }) {
    let cur = Array(count).fill(0);
    let locked = false;
    const wrap = ui.h("div", { class: "lamp-row" });
    const buttons = [];
    const bitEls = [];
    for (let k = 0; k < count; k++) {
      const btn = ui.h("button", {
        class: "lamp-btn",
        type: "button",
        onClick: () => {
          if (locked) return;
          cur[k] = (cur[k] + 1) % states;
          sound.play("tap");
          render();
          if (onChange) onChange(cur.slice());
        },
      });
      buttons.push(btn);
      const col = ui.h("div", { class: "lamp-col" });
      if (values) col.append(ui.h("div", { class: "lamp-val", text: String(values[k]) }));
      col.append(btn);
      if (bits) {
        const b = ui.h("div", { class: "lamp-bit" });
        bitEls.push(b);
        col.append(b);
      }
      wrap.append(col);
    }
    host.append(wrap);
    const sumEl = sum ? ui.h("div", { class: "lamp-sum", "aria-live": "polite" }) : null;
    if (sumEl) host.append(sumEl);

    function render() {
      buttons.forEach((b, k) => {
        b.innerHTML = art.lamp(cur[k]);
        b.setAttribute("aria-label", `${k + 1}-chiroq: ${STATE_NAMES[states][cur[k]]}`);
      });
      bitEls.forEach((b, k) => { b.textContent = String(cur[k]); });
      if (sumEl) sumEl.textContent = `Hozir: ${lamps.sumText(cur)} = ${lamps.toNumber(cur)}`;
    }
    render();

    return {
      get: () => cur.slice(),
      set(next) {
        cur = next.slice();
        render();
      },
      lock() {
        locked = true;
        wrap.classList.add("locked");
      },
      shake() {
        wrap.classList.remove("shake");
        void wrap.offsetWidth; // animatsiyani qaytadan boshlash
        wrap.classList.add("shake");
      },
    };
  }

  // Topilgan naqshlar devori
  function wall(host, states) {
    const el = ui.h("div", { class: "pwall" });
    host.append(el);
    return {
      add(pattern, label) {
        el.append(ui.h("div", { class: "pitem" },
          patternView(pattern, states),
          label ? ui.h("div", { class: "plabel", text: label }) : null));
      },
    };
  }

  // Kod jadvali: 8 ta naqsh va ma'nosi (2 ustun); highlight(i) — i-qator yonadi
  function codeTable(host) {
    const el = ui.h("div", { class: "ctable4" });
    const rows = lamps.allPatterns(lamps.PLAIN, 3).map((p, i) => {
      const row = ui.h("div", { class: "crow" }, patternView(p), ui.h("span", { class: "cmean", text: lamps.MEANINGS[i] }));
      el.append(row);
      return row;
    });
    host.append(el);
    return {
      highlight(i) { rows.forEach((r, k) => r.classList.toggle("hl", k === i)); },
    };
  }

  // Ma'no tugmalari (boshqaruv zonasida, 4 × 2): onPick(indeks)
  function meaningButtons(onPick) {
    const grid = ui.h("div", { class: "mgrid" });
    lamps.MEANINGS.forEach((m, i) => {
      grid.append(ui.h("button", {
        class: "key",
        type: "button",
        text: m,
        onClick: () => { sound.play("tap"); onPick(i); },
      }));
    });
    ui.clearControl();
    ui.control().append(grid);
  }

  QK.lampsUi = { patternView, lampRow, wall, codeTable, meaningButtons };
})(window);
