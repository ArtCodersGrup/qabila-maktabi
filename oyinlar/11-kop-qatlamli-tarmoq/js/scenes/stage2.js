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
            ui.bubble("elder", "Tik chiziq neyroni yondi! Endi oʻrta qatorni ham boʻya.");
          } else if (goal === "krest" && neural.output(cells) === "krest") {
            sound.play("win");
            done();
          }
        },
      });
      ui.bubble("elder", "Rasmning oʻrta ustunini boʻya — tik chiziq chiz.");
    });
    await ui.say("elder", "Ikkala chiziq neyroni yondi — 2-qatlam «krest» dedi!");
    return view;
  }

  async function explain() {
    const el = common.box(false);
    const view = neuralUi.layerView(el, {});
    view.set([0, 1, 0, 1, 1, 1, 0, 1, 0]);
    await ui.say("elder", "1-qatlam kichik belgilarni topadi: tik chiziq, yotiq chiziq.");
    await ui.say("elder", "2-qatlam ulardan shakl yasaydi. Qatlam koʻp boʻlsa — tarmoq chuqur boʻladi.");
  }

  // 5.4: mashq
  function stageTask(task) {
    const el = common.box(true);
    const view = neuralUi.layerView(el, { showHidden: task.type !== "hidden", showOutput: false });
    view.set(task.image);
    const labels = task.options;
    ui.bubble("elder", task.type === "hidden" ? "1-qatlamda qaysi neyronlar yonadi?" : "Tarmoq bu rasmni nima deydi?");
    return practice.tries({
      setup: (submit) => neuralUi.choiceButtons(labels, submit),
      check: (index) => labels[index] === task.answer,
      hint: () => ui.bubble("elder", task.type === "hidden"
        ? "↻ Tik neyron oʻrta ustun toʻliq boʻlsa yonadi, yotiq — oʻrta qator toʻliq boʻlsa."
        : "↻ Ikkalasi yonsa — krest, bittasi — chiziq, hech biri — boshqa."),
      solution: () => {
        view.reveal("hidden");
        view.reveal("output");
        el.append(common.answerLine(`Javob: ${task.answer}`));
      },
    });
  }

  async function stage2() {
    await layersDemo();
    await explain();
    await ui.say("elder", "Endi oʻzing ayt! 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev, correct) => neural.makeStage2Task(correct, prev),
      run: stageTask,
      praise: (task) => `Javob: ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
