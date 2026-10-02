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

  const USED_LABEL = { kok: "koʻk", sariq: "sariq", ikkalasi: "ikkalasi ham", hech: "hech qaysi" };

  // 6.4: mashq — hamma savolda 4 variant
  function stageTask(task) {
    const el = common.box(true);
    const row = boxesUi.boxRow(el, {});
    if (task.type === "count") {
      // "Robot shu qutidan {rang} tortdi va yutdi / yutqazdi. Endi nechta {rang} munchoq bo'ladi?"
      row.set({ [task.n]: { 1: task.blue, 2: task.yellow } }, [task.n]);
      const pulled = boxesUi.COLOR_NAME[task.color];
      const asked = boxesUi.COLOR_NAME[task.askColor];
      ui.bubble("elder", `Robot shu qutidan ${pulled} munchoq tortdi va ${task.won ? "yutdi" : "yutqazdi"}. Endi qutida nechta ${asked} munchoq boʻladi?`);
      return practice.tries({
        setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta`),
        check: (index) => index === task.answer,
        hint: () => ui.bubble("elder", "↻ Faqat tortilgan munchoq oʻzgaradi: yutsa — bitta qoʻshiladi, yutqazsa — bitta olinadi. Lekin qutida kamida 1 ta qoladi."),
        solution: () => {
          row.set({ [task.n]: task.after }, [task.n]);
          row.flash(task.n);
          el.append(common.answerLine(`Endi ${asked}: ${task.value} ta`));
        },
      });
    }
    const state = boxes.newBoxes();
    const move = task.color === "kok" ? 1 : 2;
    state[task.n][move] += 2;
    row.set(state, [task.n]);
    ui.bubble("elder", `Robot yutqazdi. ${task.n} li qutida ${boxesUi.COLOR_NAME[task.color]} munchoq tortgan edi — qaysi munchoq olinadi?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options, submit, (c) => USED_LABEL[c]),
      check: (index) => index === task.answer,
      hint: () => ui.bubble("elder", "↻ Robot shu oʻyinda qaysi munchoqni ishlatgan edi? Mukofot faqat ishlatilgan munchoqqa tegadi."),
      solution: () => el.append(common.answerLine(`Faqat ${boxesUi.COLOR_NAME[task.color]} munchoq olinadi`)),
    });
  }

  async function stage2() {
    const state = (QK.state && QK.state[7]) ? QK.state : boxes.newBoxes();
    QK.state = state;
    await gamesWithReward(state);
    await ui.say("elder", `Endi savollar. ${QK.practice.need()} ta toʻgʻri javob kerak!`);
    await practice.exercises({
      next: (prev, correct, tier) => boxes.makeStage2Task(correct, prev, null, tier),
      run: stageTask,
      praise: (task) => {
        if (task.type !== "count") return `Faqat ${boxesUi.COLOR_NAME[task.color]} munchoq olinadi.`;
        if (task.ask === "other") return "Tortilmagan rang oʻzgarmaydi.";
        if (task.won) return "Yutdi — bitta qoʻshildi.";
        return task.kept ? "Qutida kamida 1 ta munchoq qoladi." : "Yutqazdi — bitta olindi.";
      },
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
