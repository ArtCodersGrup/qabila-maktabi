// Kirish va 1-bosqich: o'yin qoidasi va qutilar (DIZAYN 4, 5-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, art, boxesUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robot oʻyin oʻynamoqchi!");
    await ui.say("apprentice", "Unga qoidani oʻrgatamizmi?");
    await ui.say("elder", "Yoʻq. U oʻynab, xato qilib oʻrganadi — mukofot yordamida.");
  }

  // 5.1: o'yin qoidasi — stol ko'rsatiladi
  async function rules() {
    const { table } = common.playScreen();
    table.reset(boxes.START);
    table.turn(null);
    await ui.say("elder", "Stolda 7 ta tosh. Navbat bilan 1 yoki 2 ta tosh olinadi.");
    await ui.say("elder", "Olingan toshlar oʻz tarafingga toʻplanadi. Oxirgi toshni olgan yutadi!");
    await ui.say("elder", "Robot birinchi yuradi.");
  }

  // 5.2: robotning "miyasi" — qutilar
  async function showBoxes(state) {
    const el = common.box(true);
    const view = boxesUi.boxRow(el, { compact: true });
    view.set(state, common.VISIBLE);
    await ui.say("elder", "Robotning miyasi — mana shu qutilar. Har holat uchun bittadan.");
    await ui.say("elder", "Koʻk munchoq — «1 ta ol», sariq munchoq — «2 ta ol».");
    await ui.say("elder", "Hozir munchoqlar teng, shuning uchun robot tasodifiy tanlaydi. Oʻynab koʻramiz!");
  }

  // 5.3: bitta o'yin
  async function firstGame(state) {
    const game = await common.playRound(state);
    await ui.say("elder", game.won ? "Robot yutdi — lekin u hali hech narsa oʻrganmadi." : "Sen yutding! Robot hali oʻrganmagan.");
    return game;
  }

  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const el = ui.h("div", { class: "qbox" });
    ui.work().append(el);
    const row = boxesUi.boxRow(el, {});
    row.set(boxes.newBoxes(), [5]);
    await ui.say("elder", "Qaysi munchoq koʻp boʻlsa, robot oʻshani koʻproq tortadi.");
    await ui.say("elder", "Demak munchoqlarni oʻzgartirsak — robotning xulqi ham oʻzgaradi.");
  }

  // 5.4: mashq — hamma savolda 4 variant; toshlar soni savol matnida aytilmaydi (bola o'zi sanaydi)
  function stageTask(task) {
    const el = common.box(true);
    boxesUi.stones(el, task.n);
    if (task.type === "box") {
      ui.bubble("elder", "Stolga qara: robot qaysi qutini ochadi?");
      return practice.tries({
        setup: (submit) => boxesUi.optionButtons(task.options, submit, (n) => `${n} li quti`),
        check: (index) => index === task.answer,
        hint: () => ui.bubble("elder", "↻ Toshlarni birma-bir sana: quti nomi — stolda qolgan toshlar soni."),
        solution: () => el.append(common.answerLine(`${task.n} ta tosh — ${task.n} li quti`)),
      });
    }
    // "left": rang → nechta oladi → stolda nechta qoladi (ikki qadam bitta savolda)
    el.append(ui.h("div", { class: "bead-show" }, boxesUi.beadChip(task.move)));
    ui.bubble("elder", `Robot ${boxesUi.COLOR_NAME[task.color]} munchoq tortdi. Shundan keyin stolda nechta tosh qoladi?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta`),
      check: (index) => index === task.answer,
      hint: () => ui.bubble("elder", "↻ Koʻk — 1 ta ol, sariq — 2 ta ol. Avval toshlarni sana, keyin olinganini ayir."),
      solution: () => el.append(common.answerLine(
        `${boxesUi.COLOR_NAME[task.color]} — ${task.move} ta oladi: ${task.n} − ${task.move} = ${task.left}`)),
    });
  }

  async function stage1() {
    const state = boxes.newBoxes();
    QK.state = state;
    await rules();
    await showBoxes(state);
    await firstGame(state);
    await explain();
    await ui.say("elder", `Endi savollar. ${QK.practice.need()} ta toʻgʻri javob kerak!`);
    await practice.exercises({
      next: (prev, correct, tier) => boxes.makeStage1Task(correct, prev, null, tier),
      run: stageTask,
      praise: (task) => (task.type === "box"
        ? `${task.n} li quti.`
        : `${boxesUi.COLOR_NAME[task.color]} — ${task.move} ta: ${task.n} − ${task.move} = ${task.left}.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
