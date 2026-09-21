// Qoplarga joylash: tangalar qatori (kattadan boshlab) va bo'lish jadvali (qoldiqlarni pastdan yuqoriga bosish).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, ui } = QK;
  const S = sanoq;

  // Qoldiq yozuvi: 10 dan katta bo'lsa harf bilan — "C (12)"
  const remText = (r) => (r >= 10 ? `${S.digitChar(r)} (${r})` : String(r));

  // Tangalar qatori: har tanga ostida javob raqami (hozircha bo'sh)
  function coinRow(host, steps) {
    const row = ui.h("div", { class: "qcoins" });
    const cells = steps.map((s) => {
      const digit = ui.h("span", { class: "qdigit" });
      const col = ui.h("div", { class: "qcoin-col" }, ui.h("span", { class: "qcoin", text: String(s.coin) }), digit);
      row.append(col);
      return { col, digit };
    });
    host.append(row);
    return {
      focus(k) { cells.forEach((c, i) => c.col.classList.toggle("hl", i === k)); },
      set(k, ch) { cells[k].digit.textContent = ch; },
    };
  }

  // Bo'lish jadvali: qatorlar "13 : 2 = 6 | qoldiq 1". showAll — hammasi darrov ko'rinadi.
  function divTable(host, n, base, showAll) {
    const steps = S.divSteps(n, base);
    const table = ui.h("div", { class: "dtable" });
    const rems = [];
    let shown = 0;
    host.append(table);
    function addRow() {
      if (shown >= steps.length) return false;
      const s = steps[shown];
      const rem = ui.h("button", { class: "drem", type: "button", text: remText(s.r), disabled: true });
      table.append(ui.h("div", { class: "drow" },
        ui.h("span", { class: "dcalc", text: `${s.n} : ${base} = ${s.q}` }),
        ui.h("span", { class: "dlabel", text: "qoldiq" }), rem));
      rems.push(rem);
      shown++;
      return shown < steps.length;
    }
    if (showAll) while (addRow());
    return {
      steps,
      addRow,
      arrow() { table.classList.add("arrow"); },
      // Qoldiqlarni bosish: onTap(k) — k-qator (0 — yuqoridagi)
      enable(onTap) {
        rems.forEach((b, k) => {
          b.disabled = false;
          b.addEventListener("click", () => onTap(k, b));
        });
      },
      mark(k) { rems[k].classList.add("taken"); },
    };
  }

  QK.qopUi = { remText, coinRow, divTable };
})(window);
