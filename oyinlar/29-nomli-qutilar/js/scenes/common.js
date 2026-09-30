// 29-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, practice, jadval } = QK;

  // Kuzatuv jadvali mashqi: har katak to'ldiriladi, keyin tekshiriladi
  function tableExercise(task) {
    let host = null;
    let table = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note("Har buyruqdan keyin qutilarda nima borligini yoz."));
        table = jadval.build(task, { prefill: 1, onSubmit: () => submit(table) });
        host.append(table.el);
        ui.control().append(ui.button("Tekshir", () => submit(table), "big"));
        setTimeout(() => table.focus(), 50);
      },
      check(t) {
        if (!t.filled()) return false;
        return t.check().ok;
      },
      hint(t) {
        const bad = t.filled() ? t.check().badRow : null;
        host.append(M.note(bad
          ? "↻ " + bad + "-satrdan keyingi qiymat boshqacha. Oʻsha satrni qayta hisobla."
          : "↻ Hamma katakni toʻldir."));
      },
      solution(t) {
        t.showAnswer();
        host.append(M.answer("Toʻgʻri jadval:"));
      },
    });
  }

  // 3-bosqichda navbat bilan ikki xil mashq keladi
  const stage3Exercise = (task) => (task.type === "kod-yoz" ? M.writeExercise(task) : M.resultExercise(task));

  QK.common = Object.assign({}, M, { tableExercise, stage3Exercise });
})(window);
