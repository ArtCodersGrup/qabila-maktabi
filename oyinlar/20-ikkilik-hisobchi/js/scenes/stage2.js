// 2-bosqich: ikkilikda ayirish, qarz olish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, amal2, ui, sanoqUi, practice, common, amal2Scenes } = QK;
  const S = sanoq;
  const b2 = (s) => S.fmt(s, 2);

  async function subtractionTable() {
    const el = common.box(false);
    common.formula(el, ["0 − 0 = 0", "1 − 0 = 1", "1 − 1 = 0", "10 − 1 = 1 (qarz)"]);
    await ui.say("elder", "0 dan 1 ni ayirib boʻlmaydi — chapdagi xonadan qarz olamiz.");
    await ui.say("elder", "Qarz — 2 ta birlik (bitta munchoq 2 taga maydalanadi). Qarz bergan xona 1 ga kamayadi.");
  }

  // Maslahat: qarz belgilari taxtada
  function showBorrows(board, a, b) {
    S.subColumns(a, b, 2).cols.forEach((c, i) => {
      if (c.borrowOut) {
        board.setCarry(i, "+2");
        board.markTop(i + 1, "gave");
      }
    });
  }

  // 5.4: mashq — ikkilikda ayirish
  function subTask(task) {
    const el = common.box(true);
    const board = sanoqUi.ustun(el, { a: task.a, b: task.b, op: "−", base: 2 });
    ui.bubble("elder", "Ayir! Javobni tugmalar bilan yoz.");
    const x = S.fromBase(task.a, 2);
    const y = S.fromBase(task.b, 2);
    return sanoqUi.digitTries({
      answer: task.answer,
      base: 2,
      maxLen: 8,
      hint: () => {
        showBorrows(board, task.a, task.b);
        ui.bubble("elder", "↻ Qarzlarni belgiladim: +2 — olingan qarz, chizilgan raqam — qarz bergan.");
      },
      solution: () => {
        showBorrows(board, task.a, task.b);
        board.setResultAll(task.answer);
        common.add(el, common.answerLine(`Tekshiramiz: ${x} − ${y} = ${x - y} ✓`));
      },
    });
  }

  async function stage2() {
    await amal2Scenes.chotiDemo({
      start: 2, op: -1, clicks: 1,
      first: "Choʻtda 10₂ — ikki. «−1» ni bos: birlar simi boʻsh-ku?",
      after: ["Chapdagi simdan 1 munchoq olindi, u 2 taga maydalandi, bittasi ketdi: 10₂ − 1 = 1."],
    });
    await subtractionTable();
    await amal2Scenes.guided({
      a: "1101", b: "110", op: "−", steps: S.stepsSub("1101", "110", 2),
      intro: "Ustunda ayiramiz: 1101₂ − 110₂. Oʻngdan boshlaymiz!",
    });
    await ui.say("elder", "1101₂ − 110₂ = 111₂. Chapdagi 1 qarz berib, 0 boʻldi — boshidagi nol yozilmaydi.");
    await ui.say("elder", "Tekshiramiz: 13 − 6 = 7 ✓. Endi oʻzing ayir. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => amal2.makeSubTask(prev),
      run: subTask,
      praise: (task) => `${b2(task.a)} − ${b2(task.b)} = ${b2(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
