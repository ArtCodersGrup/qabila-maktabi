// Xotira ombori: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "obox" });
    ui.work().append(el);
    return el;
  }

  const line = (text, cls) => ui.h("div", { class: "count-line" + (cls ? " " + cls : ""), text });
  const answerLine = (text) => ui.h("div", { class: "answer", text });

  // Maslahat/yechim qo'shish: yotiq ekranda ish maydoni sig'masa, yangi qator ko'rinadigan joyga suriladi
  function add(host, ...nodes) {
    host.append(...nodes);
    const last = nodes[nodes.length - 1];
    if (last && last.scrollIntoView) last.scrollIntoView({ block: "nearest" });
  }

  // Formula qatorlari (ta'rif ekrani)
  function formula(host, rows) {
    const el = ui.h("div", { class: "formula-box" });
    rows.forEach((text) => el.append(ui.h("div", { class: "formula-row", text })));
    host.append(el);
    return el;
  }

  // "Tayyor" kabi bitta tugmani kutish
  const waitButton = (label, cls) => ui.settle((done) => {
    ui.control().append(ui.button(label, () => { ui.clearControl(); done(); }, cls || "big"));
  });

  QK.common = { box, line, answerLine, formula, waitButton, add };
})(window);
