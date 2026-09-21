// 3-bosqich: robot kuchayadi, strategiya va hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, sound, art, boxesUi, practice, common } = QK;

  const SCENES = [
    { art: "matchboxes", lines: ["1961-yilda bir olim 304 ta gugurt qutisi va munchoqlar bilan shunday mashina yasagan.", "U odam bilan oʻynab, yutishni oʻrgangan."] },
    { art: "board", lines: ["Kompyuterlar shaxmat va Go oʻyinini ham shunday oʻrgangan: oʻynab, mukofot olib."] },
    { art: "walker", lines: ["Robotlar yurishni ham shunday oʻrganadi.", "Har urinishdan keyin mukofot: yaqinroq yurdimi — plyus, yiqildimi — minus."] },
    { art: "star", lines: ["Mukofot notoʻgʻri qoʻyilsa, robot notoʻgʻri narsani oʻrganadi.", "Shuning uchun mukofotni odam ehtiyotkorlik bilan tanlaydi."] },
  ];

  // 7.1–7.2: 20 marta o'ynab o'rganish
  async function trainFast(state) {
    const el = common.box(true);
    const boxView = boxesUi.boxRow(el, { compact: true });
    boxView.set(state, common.VISIBLE);
    const results = boxesUi.resultLine(el);
    const note = common.line("Oʻyinlar: 0 / 20");
    el.append(note);
    await ui.say("elder", "Robot oʻzi bilan mashq qilsin — 20 marta oʻynaydi.");
    ui.bubble("elder", "«20 marta oʻyna»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("20 marta oʻyna", () => { ui.clearControl(); done(); }, "big"));
    });
    let first = 0;
    let last = 0;
    for (let k = 0; k < 20; k++) {
      const game = boxes.playGame(state, Math.random, boxes.randomOpponent);
      boxes.reward(state, game.history, game.won);
      results.add(game.won);
      boxView.set(state, common.VISIBLE);
      note.textContent = `Oʻyinlar: ${k + 1} / 20`;
      if (k < 10 && game.won) first++;
      if (k >= 10 && game.won) last++;
      sound.play(game.won ? "correct" : "tap");
      await ui.sleep(230);
    }
    el.append(common.line(`Birinchi 10 ta oʻyin: ${first} ta yutuq · Oxirgi 10 ta: ${last} ta yutuq`));
    await ui.say("elder", `Boshida ${first} ta yutdi, oxirida ${last} ta. Munchoqlar oʻzgardi!`);
    await ui.say("elder", "Robot sirni topdi: raqibga 3 ga karrali tosh qoldiradi.");
  }

  // 7.3: bola o'rgangan robot bilan o'ynaydi
  async function playTrained(state) {
    await ui.say("elder", "Endi oʻrgangan robot bilan oʻynab koʻr!");
    const game = await common.playRound(state);
    await ui.say("elder", game.won
      ? "Robot yutdi. Endi uni yutish qiyin!"
      : "Sen yutding! Demak robot hali toʻliq oʻrganmagan.");
  }

  // 7.4: mashq
  function stageTask(task) {
    const el = common.box(true);
    if (task.type === "read") {
      const state = { 5: { 1: task.blue, 2: task.yellow } };
      const row = boxesUi.boxRow(el, {});
      row.set(state, [5]);
      ui.bubble("elder", "Qutiga qara: robot koʻpincha nima qiladi?");
      return practice.tries({
        setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta ol`),
        check: (index) => task.options[index] === task.answer,
        hint: () => ui.bubble("elder", "↻ Qaysi rang koʻp boʻlsa, oʻsha koʻproq tortiladi."),
        solution: () => el.append(common.answerLine(`${task.answer} ta ol`)),
      });
    }
    boxesUi.stones(el, task.n);
    ui.bubble("elder", `${task.n} ta tosh qoldi va navbat robotniki. Nechta olsa yutadi?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta`),
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", "↻ Raqibga 3 ga karrali tosh qoldir: 6, 3 yoki 0."),
      solution: () => el.append(common.answerLine(`${task.answer} ta — raqibga ${task.n - task.answer} ta qoladi`)),
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    const state = (QK.state && QK.state[7]) ? QK.state : boxes.newBoxes();
    QK.state = state;
    await trainFast(state);
    await playTrained(state);
    await ui.say("elder", "Endi savollar. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => boxes.makeStage3Task(correct, prev),
      run: stageTask,
      praise: (task) => (task.type === "read"
        ? `Koʻp munchoq — koʻp tanlov.`
        : `${task.answer} ta olsa, raqibga ${task.n - task.answer} ta qoladi.`),
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
