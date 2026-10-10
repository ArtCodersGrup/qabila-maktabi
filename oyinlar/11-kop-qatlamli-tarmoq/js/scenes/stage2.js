// 2-bosqich: qatlamlar — chiziqdan shaklga (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { neural, ui, sound, neuralUi, practice, common } = QK;

  // 5.1–5.2: bola 3×3 rasm chizadi, qatlamlar yonadi
  async function layersDemo() {
    const el = common.box(true);
    let goal = "tik";
    let view = null;
    await ui.settle((done) => {
      view = neuralUi.layerView(el, {
        editable: true,
        onChange: (cells) => {
          const h = neural.hidden(cells);
          if (goal === "tik" && h.tik) {
            goal = "krest";
            sound.play("correct");
            ui.bubble("elder", "Tik chiziq neyroni yondi. Endi oʻrta qatorni ham boʻya.");
          } else if (goal === "krest" && neural.output(cells) === "krest") {
            sound.play("win");
            done();
          }
        },
      });
      ui.bubble("elder", "Rasmning oʻrta ustunini boʻya — tik chiziq chiz.");
    });
    await ui.say("elder", "Ikkala chiziq neyroni yondi — 2-qatlam «krest» dedi.");
    return view;
  }

  async function explain() {
    const el = common.box(false);
    const view = neuralUi.layerView(el, {});
    view.set([0, 1, 0, 1, 1, 1, 0, 1, 0]);
    await ui.say("elder", "1-qatlam (yashirin qatlam) oddiy belgilarni topadi: tik va yotiq chiziq.");
    await ui.say("elder", "2-qatlam 1-qatlam chiqishlaridan shaklni aniqlaydi. Qatlamlar koʻp boʻlsa, tarmoq chuqur deyiladi.");
  }

  const HIDDEN_HINT = "↻ Tik neyron oʻrta ustun toʻliq boʻlsa yonadi, yotiq — oʻrta qator toʻliq boʻlsa.";
  const OUTPUT_HINT = "↻ Ikkalasi yonsa — krest, bittasi — chiziq, hech biri — boshqa.";

  // 5.4: mashq — 1-qatlam (4 variant)
  function hiddenTask(task) {
    const el = common.box(true);
    const view = neuralUi.layerView(el, { showHidden: false, showOutput: false });
    view.set(task.image);
    ui.bubble("elder", "1-qatlamda qaysi neyronlar yonadi?");
    return practice.tries({
      setup: (submit) => neuralUi.choiceButtons(task.options, submit),
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", HIDDEN_HINT),
      solution: () => {
        view.reveal("hidden");
        el.append(common.answerLine(`Javob: ${task.answer}`));
      },
    });
  }

  // 5.4: mashq — ikki qadam: 1-qatlam (4 variant), keyin tarmoqning javobi (3 variant).
  // Chiqish qatlamida faqat 3 ta neyron bor, shuning uchun bu savol yolg'iz kelmaydi (QOIDALAR 4.3).
  function bothTask(task) {
    const el = common.box(true);
    const view = neuralUi.layerView(el, { showHidden: false, showOutput: false });
    view.set(task.image);
    ui.bubble("elder", "Avval 1-qatlam: qaysi neyronlar yonadi?");
    return common.twoStep({
      first: {
        setup: (submit) => neuralUi.choiceButtons(task.hiddenOptions, submit),
        check: (index) => task.hiddenOptions[index] === task.hidden,
      },
      second: {
        setup: (submit) => {
          view.reveal("hidden");
          ui.bubble("elder", "Toʻgʻri. Endi 2-qatlam: tarmoq bu rasmni nima deydi?");
          neuralUi.choiceButtons(task.options, submit);
        },
        check: (index) => task.options[index] === task.answer,
      },
      hint: (step) => ui.bubble("elder", step === 1 ? HIDDEN_HINT : OUTPUT_HINT),
      solution: () => {
        view.reveal("hidden");
        view.reveal("output");
        el.append(common.answerLine(`1-qatlam: ${task.hidden} → javob: ${task.answer}`));
      },
    });
  }

  async function stage2() {
    await layersDemo();
    await explain();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta rasm — qatlamlar chiqishini ayt.`);
    await practice.exercises({
      next: (prev, correct, tier) => neural.makeStage2Task(correct, prev, null, tier),
      run: (task) => (task.type === "hidden" ? hiddenTask(task) : bothTask(task)),
      praise: (task) => (task.type === "hidden" ? `Javob: ${task.answer}.` : `1-qatlam: ${task.hidden} → ${task.answer}.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
