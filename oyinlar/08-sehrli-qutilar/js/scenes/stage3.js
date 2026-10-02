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
    await ui.say("elder", "Robot mashq qilsin: 40 marta oʻynaydi. Raqibi — oʻyinni yaxshi biladigan murabbiy.");
    await ui.say("elder", "Kuchli raqib bilan mashq qilsa, robot tezroq oʻrganadi: har xatosi darrov jazolanadi.");
    ui.bubble("elder", "«40 marta oʻyna»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("40 marta oʻyna", () => { ui.clearControl(); done(); }, "big"));
    });
    const ROUNDS = 40;
    let first = 0;
    let last = 0;
    for (let k = 0; k < ROUNDS; k++) {
      const game = boxes.playGame(state, Math.random, boxes.smartOpponent);
      boxes.reward(state, game.history, game.won);
      results.add(game.won);
      boxView.set(state, common.VISIBLE);
      note.textContent = `Oʻyinlar: ${k + 1} / ${ROUNDS}`;
      if (k < 10 && game.won) first++;
      if (k >= ROUNDS - 10 && game.won) last++;
      sound.play(game.won ? "correct" : "tap");
      await ui.sleep(150);
    }
    el.append(common.line(`Birinchi 10 ta oʻyin: ${first} ta yutuq · Oxirgi 10 ta: ${last} ta yutuq`));
    await ui.say("elder", `Boshida ${first} ta yutgan edi, oxirida ${last} ta. Munchoqlar oʻzgardi!`);
    await ui.say("elder", "Robot sirni topdi: raqibga 3 ga karrali tosh qoldiradi.");
  }

  // 7.3: bola o'rgangan robot bilan o'ynaydi
  async function playTrained(state) {
    await ui.say("elder", "Endi oʻrgangan robot bilan oʻynab koʻr!");
    const game = await common.playRound(state);
    await ui.say("elder", game.won
      ? "Robot yutdi. Endi uni yutish juda qiyin!"
      : "Sen yutding! Demak robot hali toʻliq oʻrganmagan.");
  }

  // 7.4: endi bola birinchi yuradi — sirni bilsa, yutadi
  async function playFirst(state) {
    await ui.say("elder", "Robot birinchi yursa, uni yutish deyarli imkonsiz. Lekin sir sende ham bor!");
    await ui.say("elder", "Endi sen birinchi yur. Har safar robotga 6, 3 yoki 0 ta tosh qoldir.");
    const game = await common.playRound(state, { childFirst: true });
    await ui.say("elder", game.won
      ? "Robot yutdi. Yana urinib koʻr: robotga 6, 3 yoki 0 qoldirsang — sen yutasan."
      : "Sen yutding! Sirni ishlatding: har safar 3 ga karrali qoldirding.");
  }

  const whyLabel = (task, key) => ({
    good: task.left === 0 ? "Oxirgi toshni oʻzi oladi — oʻyin tugaydi" : `Raqibga ${task.left} ta qoladi — bu 3 ga karrali`,
    bad: `Raqibga ${task.wrongLeft} ta qoladi — bu 3 ga karrali`,
    more: "Kim koʻproq tosh olsa, oʻsha yutadi",
    fast: "Toshlar tezroq tugaydi",
  }[key]);

  // 7.4: "Qaysi qutida robot 1 ta / 2 ta olishi eng ehtimoli katta?" — 4 ta quti, ulush solishtiriladi
  function ratioTask(task) {
    const el = common.box(true);
    const state = {};
    task.options.forEach((o) => { state[o.n] = { 1: o.blue, 2: o.yellow }; });
    const row = boxesUi.boxRow(el, { compact: true });
    row.set(state, task.options.map((o) => o.n));
    const name = boxesUi.COLOR_NAME[task.color];
    ui.bubble("elder", `Qaysi qutida robot ${task.move} ta olishi (${name} munchoq tortishi) eng ehtimoli katta?`);
    return practice.tries({
      setup: (submit) => boxesUi.optionButtons(task.options.map((o) => o.n), submit, (n) => `${n} li quti`),
      check: (index) => index === task.answer,
      hint: () => ui.bubble("elder", `↻ ${name} munchoqlar sonini emas, ulushini solishtir: qaysi qutida ${name} boshqa rangdan eng koʻp ustun?`),
      solution: () => {
        const best = task.options[task.answer];
        row.highlight(best.n);
        el.append(common.answerLine(`${best.n} li quti: koʻk ${best.blue} ta, sariq ${best.yellow} ta`));
      },
    });
  }

  // 7.4: strategiya — ikki qadam: "nechta olsa yutadi?" (1 / 2) va "nega?" (4 ta sabab); ikkalasi to'g'ri bo'lsagina hisoblanadi
  function strategyTask(task) {
    const el = common.box(true);
    boxesUi.stones(el, task.n);
    ui.bubble("elder", `${task.n} ta tosh qoldi va navbat robotniki. Nechta olsa yutadi?`);
    return common.twoStep({
      first: {
        setup: (submit) => boxesUi.optionButtons(task.options, submit, (m) => `${m} ta`),
        check: (index) => task.options[index] === task.answer,
      },
      second: {
        setup: (submit) => {
          el.append(common.line(`${task.answer} ta oladi. Nega?`));
          ui.bubble("elder", "Toʻgʻri! Endi sababini tanla: nega aynan shuncha?");
          boxesUi.optionButtons(task.whys, submit, (key) => whyLabel(task, key));
        },
        check: (index) => index === task.whyIndex,
      },
      hint: (step) => ui.bubble("elder", step === 1
        ? "↻ Sirni esla: raqibga 3 ga karrali tosh qoldirish kerak — 9, 6, 3 yoki 0."
        : "↻ Hisoblab koʻr: robot olgandan keyin raqibga nechta tosh qoladi?"),
      solution: () => el.append(common.answerLine(`${task.answer} ta — raqibga ${task.left} ta qoladi (3 ga karrali)`)),
    });
  }

  // 7.4: "Robotni yut!" — haqiqiy o'yin: bola birinchi yuradi, robot xatosiz o'ynaydi. Yutish — to'g'ri javob.
  // Yutqazsa: 1-marta — maslahat va qayta o'yin, 2-marta — yutuqli birinchi yurish ko'rsatiladi.
  function beatTask(task) {
    let play = null;
    return practice.tries({
      setup: (submit) => {
        play = async () => submit(await common.playPerfect(task.n));
        play();
      },
      check: (won) => won,
      hint: () => {
        ui.bubble("elder", "↻ Robot yutdi. Sir: har yurishingdan keyin robotga 3 ga karrali tosh qolsin. Yana urinib koʻr!");
        ui.control().append(ui.button("Qayta oʻynash", () => { ui.clearControl(); play(); }, "big"));
      },
      solution: () => {
        const el = common.box(true);
        boxesUi.stones(el, task.n);
        el.append(common.answerLine(`${task.n} ta toshda birinchi ${task.first} ta olinadi — robotga ${task.n - task.first} ta qoladi (3 ga karrali)`));
      },
    });
  }

  const TASKS = { ratio: ratioTask, strategy: strategyTask, beat: beatTask };
  const PRAISES = {
    ratio: () => "Son emas, ulush muhim: qaysi rang koʻproq ustun boʻlsa, oʻsha koʻproq tortiladi.",
    strategy: (task) => `${task.answer} ta olsa, raqibga ${task.left} ta qoladi.`,
    beat: () => "Sen xatosiz oʻynaydigan robotni yutding: har safar unga 3 ga karrali tosh qoldirding!",
  };

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
    await playFirst(state);
    await ui.say("elder", `Endi savollar va oʻyinlar. ${QK.practice.need()} ta toʻgʻri javob kerak!`);
    await ui.say("elder", "Oʻyinda robot endi xato qilmaydi. Uni yutsang — javob toʻgʻri hisoblanadi.");
    await practice.exercises({
      next: (prev, correct, tier) => boxes.makeStage3Task(correct, prev, null, tier),
      run: (task) => TASKS[task.type](task),
      praise: (task) => PRAISES[task.type](task),
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
