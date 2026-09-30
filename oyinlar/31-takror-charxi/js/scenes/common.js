// 31-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui } = QK;
  const M = QK.kodMashq;

  // Raqam ajratish jadvali: son → oxirgi raqam va qolgani
  function digitTable(rows) {
    const head = ui.h("tr", {},
      ui.h("th", { text: "n" }),
      ui.h("th", { text: "n % 10" }),
      ui.h("th", { text: "n // 10" }));
    const body = ui.h("tbody");
    for (const row of rows) {
      body.append(ui.h("tr", {},
        ui.h("td", { text: String(row.son) }),
        ui.h("td", { class: "oxirgi", text: String(row.oxirgi) }),
        ui.h("td", { text: String(row.qolgan) })));
    }
    return ui.h("table", { class: "raqamlar" }, ui.h("thead", {}, head), body);
  }

  const stage3Exercise = (task) => (task.type === "kod-yoz" ? M.writeExercise(task) : M.fixExercise(task));

  QK.common = Object.assign({}, M, { digitTable, stage3Exercise });
})(window);
