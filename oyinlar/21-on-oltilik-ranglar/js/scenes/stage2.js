// 2-bosqich: 16-likda qo'shish va ayirish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, amal16, ui, amal16Ui, sanoqUi, practice, common } = QK;
  const S = sanoq;
  const h16 = (s) => S.fmt(s, 16);

  // Ustunda bosqichma-bosqich (A–F qatori tepada)
  async function guided(a, b, op, steps, first) {
    const el = common.box(true);
    el.append(amal16Ui.hexStrip());
    const board = sanoqUi.ustun(el, { a, b, op, base: 16 });
    await ui.say("elder", first);
    await sanoqUi.guide(board, steps, 16);
    return board;
  }

  function showMarks(board, task) {
    if (task.op === "+") S.addColumns(task.a, task.b, 16).cols.forEach((c, i) => { if (c.carryOut) board.setCarry(i + 1, "1"); });
    else S.subColumns(task.a, task.b, 16).cols.forEach((c, i) => {
      if (c.borrowOut) {
        board.setCarry(i, "+16");
        board.markTop(i + 1, "gave");
      }
    });
  }

  // 5.3: mashq — qo'shish yoki ayirish
  function addSubTask(task) {
    const el = common.box(true);
    el.append(amal16Ui.hexStrip());
    const board = sanoqUi.ustun(el, { a: task.a, b: task.b, op: task.op, base: 16, width: 4 });
    ui.bubble("elder", task.op === "+" ? "Qoʻsh! Javobni 16-likda yoz." : "Ayir! Javobni 16-likda yoz.");
    const x = S.fromBase(task.a, 16);
    const y = S.fromBase(task.b, 16);
    return sanoqUi.digitTries({
      answer: task.answer,
      base: 16,
      maxLen: 3,
      hint: () => {
        showMarks(board, task);
        ui.bubble("elder", task.op === "+" ? "↻ Koʻchishlarni yozdim: yigʻindi 16 dan oshsa — 1 koʻchadi." : "↻ Qarzlarni belgiladim: qarz — 16 birlik.");
      },
      solution: () => {
        showMarks(board, task);
        board.setResultAll(task.answer);
        common.add(el, common.answerLine(`Tekshiramiz: ${x} ${task.op} ${y} = ${task.op === "+" ? x + y : x - y} ✓`));
      },
    });
  }

  async function stage2() {
    await guided("2A", "3F", "+", S.stepsAdd("2A", "3F", 16), "Ustunda qoʻshamiz: 2A₁₆ + 3F₁₆. Harflarni songa aylantirib hisoblaymiz!");
    await ui.say("elder", "2A₁₆ + 3F₁₆ = 69₁₆. Tekshiramiz: 42 + 63 = 105 = 6·16 + 9 ✓");
    await guided("5C", "2F", "−", S.stepsSub("5C", "2F", 16), "Endi ayiramiz: 5C₁₆ − 2F₁₆.");
    await ui.say("elder", "5C₁₆ − 2F₁₆ = 2D₁₆. Tekshiramiz: 92 − 47 = 45 ✓. Qarz — 16 birlik!");
    await ui.say("elder", "Endi oʻzing: qoʻshish va ayirish. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => amal16.makeAddSubTask(prev),
      run: addSubTask,
      praise: (task) => `${h16(task.a)} ${task.op} ${h16(task.b)} = ${h16(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
  QK.amal16Scenes = { guided };
})(window);
