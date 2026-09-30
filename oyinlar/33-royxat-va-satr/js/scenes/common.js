// 33-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;

  const stage3Exercise = (task) => (task.type === "kod-yoz" ? M.writeExercise(task) : M.resultExercise(task));

  QK.common = Object.assign({}, M, { stage3Exercise });
})(window);
