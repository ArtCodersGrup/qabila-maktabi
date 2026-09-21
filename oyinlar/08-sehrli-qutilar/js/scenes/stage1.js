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

  // 5.1: o'yin qoidasi
  async function rules() {
    const el = common.box(false);
    const stonesView = boxesUi.stones(el, boxes.START);
    await ui.say("elder", "Stolda 7 ta tosh. Navbat bilan 1 yoki 2 ta tosh olinadi.");
    await ui.say("elder", "Oxirgi toshni olgan yutadi. Robot birinchi yuradi.");
    return stonesView;
  }

  // 5.2: bitta o'yin — munchoqlar teng, robot tasodifiy tanlaydi
  async function firstGame(state) {
    const el = common.box(true);
    const stonesView = boxesUi.stones(el, boxes.START);
    const boxView = boxesUi.boxRow(el, { compact: true });
    boxView.set(state, common.VISIBLE);
    await ui.say("elder", "Robotning miyasi — mana shu qutilar. Har holat uchun bittadan.");
    await ui.say("elder", "Koʻk munchoq — «1 ta ol», sariq munchoq — «2 ta ol». Munchoqlar teng, shuning uchun tanlov tasodifiy.");
    const game = await common.playRound(state, stonesView, boxView);
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

  // 5.4: mashq
  function stageTask(task) {
    const el = common.box(true);
    if (task.type === "box") {
      boxesUi.stones(el, task.n);
      ui.bubble("elder", `Hozir ${task.n} ta tosh qoldi. Robot qaysi qutini ochadi?`);
      return practice.tries({
        setup: (submit) => boxesUi.optionButtons(task.options, submit, (n) => `${n} tosh`),
        check: (index) => index === task.answer,
        hint: () => ui.bubble("elder", "↻ Toshlarni sana: quti nomi — qolgan toshlar soni."),
        solution: () => el.append(common.answerLine(`${task.n} li quti`)),
      });
    }
    const chip = boxesUi.beadChip(task.answer);
    el.append(ui.h("div", { class: "bead-show" }, chip));
    ui.bubble("elder", `Robot ${boxesUi.COLOR_NAME[task.color]} munchoq tortdi. Nechta tosh oladi?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta`),
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", "↻ Koʻk — 1 ta ol, sariq — 2 ta ol."),
      solution: () => el.append(common.answerLine(`${boxesUi.COLOR_NAME[task.color]} — ${task.answer} ta`)),
    });
  }

  async function stage1() {
    const state = boxes.newBoxes();
    QK.state = state;
    await rules();
    await firstGame(state);
    await explain();
    await ui.say("elder", "Endi savollar. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => boxes.makeStage1Task(correct, prev),
      run: stageTask,
      praise: (task) => (task.type === "box" ? `${task.n} li quti.` : `${boxesUi.COLOR_NAME[task.color]} — ${task.answer} ta.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
