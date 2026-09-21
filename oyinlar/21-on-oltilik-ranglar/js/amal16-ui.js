// O'n oltilik ranglar: tetradalar jadvali, guruh tugmalari (2 ↔ 16), rang namunasi, A–F va 16 ga karralilar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, amal16, ui, sound } = QK;
  const S = sanoq;

  // 16 qator: "B 1011"; mark — yoritiladigan raqamlar
  function tetradTable(mark) {
    const grid = ui.h("div", { class: "tetrads" });
    amal16.TETRADS.forEach((t) => grid.append(ui.h("span", { class: "tt" + (mark && mark.includes(t.hex) ? " hl" : "") },
      ui.h("b", { text: t.hex }), ui.h("span", { text: t.bits }))));
    return grid;
  }

  // Bosiladigan guruhlar: har bosilganda ko'rinish almashadi (bits → raqam yoki raqam → bits).
  // items: [{ front, back }]. Hammasi ochilganda Promise hal bo'ladi
  function flipRow(host, items) {
    const row = ui.h("div", { class: "flips" });
    host.append(row);
    return ui.settle((done) => {
      let left = items.length;
      items.forEach((it) => {
        const b = ui.h("button", { class: "flip", type: "button", text: it.front });
        b.addEventListener("click", () => {
          if (b.classList.contains("open")) return;
          b.classList.add("open");
          b.textContent = it.back;
          sound.play("tap");
          if (--left === 0) done();
        });
        row.append(b);
      });
    });
  }

  // Rang namunasi: kvadrat, kod va chiroq qiymatlari
  function swatch(code) {
    const rgb = [1, 3, 5].map((k) => code.slice(k, k + 2));
    const names = ["qizil", "yashil", "koʻk"];
    return ui.h("div", { class: "swatch" },
      ui.h("span", { class: "sw-box", style: `background:${code}` }),
      ui.h("div", { class: "sw-info" },
        ui.h("div", { class: "sw-code", text: code }),
        ...rgb.map((h, k) => ui.h("div", { class: "sw-ch", text: `${names[k]}: ${h} = ${S.fromBase(h, 16)}` }))));
  }

  function hexStrip() {
    const row = ui.h("div", { class: "hexstrip" });
    for (let v = 10; v < 16; v++) row.append(ui.h("span", { class: "hx", text: `${S.digitChar(v)}=${v}` }));
    return row;
  }

  // 16 ga karralilar: 16, 32 … 144 (ko'paytirishda ko'chishni topish uchun)
  function multiples() {
    const row = ui.h("div", { class: "hexstrip mult" });
    for (let k = 1; k <= 9; k++) row.append(ui.h("span", { class: "hx", text: `${k}·16=${k * 16}` }));
    return row;
  }

  QK.amal16Ui = { tetradTable, flipRow, swatch, hexStrip, multiples };
})(window);
