// Tangalar bozori: tangali son (tanga olish, hamyon), xona qiymatlari son ustida, A–F qatori.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, ui, sound } = QK;
  const S = sanoq;

  // Son: har raqam ustida xona qiymati; values — harflar ostida qiymati (C → 12)
  function placed(number, base, opts) {
    const o = opts || {};
    const grid = ui.h("div", { class: "placed", style: `grid-template-columns: repeat(${number.length}, auto)` });
    const parts = S.expand(number, base);
    parts.forEach((d) => grid.append(ui.h("span", { class: "pl-place", text: String(d.place) })));
    parts.forEach((d) => grid.append(ui.h("span", { class: "pl-digit", text: d.digit })));
    if (o.values) parts.forEach((d) => grid.append(ui.h("span", { class: "pl-value", text: d.value >= 10 ? `= ${d.value}` : "" })));
    return grid;
  }

  // Tanga olish: har xonadan raqamcha tanga (0 turgan xonadan — hech narsa). Natija — jami qiymat.
  // say(text) — xato bosishda izoh
  function collect(host, number, base, say) {
    const parts = S.expand(number, base);
    const took = parts.map(() => 0);
    const cols = ui.h("div", { class: "coin-cols" });
    const purse = ui.h("div", { class: "purse" });
    const sum = ui.h("div", { class: "count-line" });
    host.append(cols, ui.h("div", { class: "purse-wrap" }, ui.h("span", { class: "purse-label", text: "Hamyon:" }), purse), sum);
    const badges = [];

    function update() {
      const terms = [];
      parts.forEach((d, i) => { for (let k = 0; k < took[i]; k++) terms.push(d.place); });
      const total = terms.reduce((a, b) => a + b, 0);
      sum.textContent = terms.length ? `${terms.join(" + ")} = ${total}` : "Hali tanga yoʻq";
      badges.forEach((b, i) => { b.textContent = `${took[i]} / ${parts[i].value}`; });
      return total;
    }

    return ui.settle((done) => {
      parts.forEach((d, i) => {
        const coin = ui.h("button", { class: "coin", type: "button", text: String(d.place), "aria-label": `${d.place} lik tanga` });
        const badge = ui.h("span", { class: "coin-badge" });
        badges.push(badge);
        coin.addEventListener("click", () => {
          if (took[i] >= d.value) {
            sound.play("retry");
            say(d.value === 0 ? "↻ Bu xonada 0 — tanga olinmaydi." : `↻ Bu xonada faqat ${d.value} ta.`);
            return;
          }
          took[i]++;
          sound.play("tap");
          purse.append(ui.h("span", { class: "coin small", text: String(d.place) }));
          const total = update();
          if (took.every((t, k) => t === parts[k].value)) done(total);
        });
        cols.append(ui.h("div", { class: "coin-col" }, coin, ui.h("span", { class: "pl-digit", text: d.digit }), badge));
      });
      update();
    });
  }

  // A–F qatori (16-lik yordamchi)
  function hexStrip() {
    const row = ui.h("div", { class: "hexstrip" });
    for (let v = 10; v < 16; v++) row.append(ui.h("span", { class: "hx", text: `${S.digitChar(v)} = ${v}` }));
    return row;
  }

  QK.bozorUi = { placed, collect, hexStrip };
})(window);
