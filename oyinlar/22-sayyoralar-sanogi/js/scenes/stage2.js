// 2-bosqich: n-lik tizimda ayirish, qarz = n (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, sayyora, ui, sanoqUi, practice, common, sayyoraScenes } = QK;
  const S = sanoq;

  function showBorrows(board, task) {
    S.subColumns(task.a, task.b, task.base).cols.forEach((c, i) => {
      if (c.borrowOut) {
        board.setCarry(i, `+${task.base}`);
        board.markTop(i + 1, "gave");
      }
    });
  }

  // 5.2: mashq — n-likda ayirish
  function subTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "planet-tag", text: `${task.base}-lik sayyora` }));
    const board = sanoqUi.ustun(el, { a: task.a, b: task.b, op: "−", base: task.base });
    ui.bubble("elder", "Ayir. Javobni shu asosda yoz.");
    const x = S.fromBase(task.a, task.base);
    const y = S.fromBase(task.b, task.base);
    return sanoqUi.digitTries({
      answer: task.answer,
      base: task.base,
      maxLen: 4,
      hint: () => {
        showBorrows(board, task);
        ui.bubble("elder", `↻ Qarzlar belgilandi: bitta qarz = ${task.base} birlik, 10 emas.`);
      },
      solution: () => {
        showBorrows(board, task);
        board.setResultAll(task.answer);
        common.add(el, common.answerLine(`Tekshiruv (oʻnlikda): ${x} − ${y} = ${x - y} ✓`));
      },
    });
  }

  async function stage2() {
    await sayyoraScenes.guided("42", "14", "−", 5, S.stepsSub("42", "14", 5), "Ustunda ayiramiz: 42₅ − 14₅.");
    await ui.say("elder", "42₅ − 14₅ = 23₅. Tekshiruv: 22 − 9 = 13 = 2·5 + 3 ✓");
    await ui.say("elder", `Qarz asosga teng: 5-likda 1 qarz = 5 birlik. Mashq: ${QK.practice.need()} ta ayirish.`);
    await practice.exercises({
      next: (prev, correct, tier) => sayyora.makeSubTask(prev, undefined, tier),
      run: subTask,
      praise: (task) => `${S.fmt(task.a, task.base)} − ${S.fmt(task.b, task.base)} = ${S.fmt(task.answer, task.base)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
