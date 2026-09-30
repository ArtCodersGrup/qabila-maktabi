// 27-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;

  // 3-bosqichda navbat bilan ikki xil mashq keladi
  const stage3Exercise = (task) => (task.type === "xato-top" ? M.fixExercise(task) : M.writeExercise(task));

  QK.common = Object.assign({}, M, { stage3Exercise });
})(window);
