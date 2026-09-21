// Qoida yoki misol?: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, rulesUi } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "rbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  // Qoida ekrani: narsalar taxtasi ish maydonida, qoida yasagich — boshqaruv zonasida (doim koʻrinadi)
  function ruleScreen(items) {
    const el = box(true);
    const view = rulesUi.board(el, items, { truth: true });
    const badge = rulesUi.errorBadge(el);
    const builder = rulesUi.ruleBuilder(ui.control(), () => {
      view.clear();
      badge.clear();
    });
    return { el, view, badge, builder };
  }

  QK.common = { box, answerLine, line, ruleScreen };
})(window);
