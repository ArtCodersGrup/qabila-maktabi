// 2-bosqich: mukofot — munchoqlar o'zgaradi (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, boxesUi, practice, common } = QK;

  // 6.1–6.2: ikkita o'yin, har biridan keyin mukofot
  async function gamesWithReward(state) {
    await ui.say("elder", "Endi har oʻyindan keyin robotga mukofot beramiz.");
    for (let k = 0; k < 2; k++) {
      const game = await common.playRound(state);
      await common.rewardStep(state, game.history, game.won);
      await ui.say("elder", game.won
        ? "Yutgan yurishlarining munchogʻi koʻpaydi — endi ularni koʻproq tanlaydi."
        : "Yutqazgan yurishlarining munchogʻi kamaydi — endi ularni kamroq tanlaydi.");
    }
    await ui.say("elder", "Mana shu — mukofot bilan oʻrganish. Robotga qoida aytmadik!");
  }

  // 6.4: mashq
  function stageTask(task) {
    const el = common.box(true);
    if (task.type === "reward") {
      ui.bubble("elder", `Robot ${task.won ? "yutdi" : "yutqazdi"}. Ishlatgan munchoqlariga nima boʻladi?`);
      return practice.tries({
        setup: (submit) => boxesUi.optionButtons(task.options, submit),
        check: (index) => index === task.answer,
        hint: () => ui.bubble("elder", "↻ Yutsa — koʻpayadi, yutqazsa — kamayadi."),
        solution: () => el.append(common.answerLine(task.options[task.answer])),
      });
    }
    const state = boxes.newBoxes();
    const move = task.color === "kok" ? 1 : 2;
    state[task.n][move] += 2;
    const row = boxesUi.boxRow(el, {});
    row.set(state, [task.n]);
    ui.bubble("elder", `Robot yutqazdi. ${task.n} li qutida ${boxesUi.COLOR_NAME[task.color]} munchoq tortgan edi — qaysi munchoq olinadi?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options, submit, (c) => boxesUi.COLOR_NAME[c] || c),
      check: (index) => index === task.answer,
      hint: () => ui.bubble("elder", "↻ Faqat robot tortgan munchoq olinadi, boshqasi tegilmaydi."),
      solution: () => el.append(common.answerLine(boxesUi.COLOR_NAME[task.color])),
    });
  }

  async function stage2() {
    const state = (QK.state && QK.state[7]) ? QK.state : boxes.newBoxes();
    QK.state = state;
    await gamesWithReward(state);
    await ui.say("elder", "Endi savollar. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => boxes.makeStage2Task(correct, prev),
      run: stageTask,
      praise: (task) => (task.type === "reward"
        ? `Yutsa qoʻshiladi, yutqazsa olinadi.`
        : `Faqat ${boxesUi.COLOR_NAME[task.color]} munchoq olinadi.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
