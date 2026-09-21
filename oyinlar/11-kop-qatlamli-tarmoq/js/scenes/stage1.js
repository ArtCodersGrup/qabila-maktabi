// Kirish va 1-bosqich: bitta neyron (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { neural, ui, sound, art, neuralUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "10-oʻyinda belgini biz tanlagan edik: boʻyalgan kataklar soni.");
    await ui.say("apprentice", "Robot belgini oʻzi topa oladimi?");
    await ui.say("elder", "Ha — neyronlar yordamida. Neyron 4-oʻyindagi chiroqqa oʻxshaydi.");
  }

  // 4.1: chiroqlarni yoqib, neyron qachon yonishini ko'rish
  async function neuronDemo() {
    const el = common.box(true);
    let sawOn = false;
    let sawOff = false;
    ui.bubble("elder", "Chapdagi chiroqlarni bosib yoq. Katta doira — neyron. U qachon yonadi?");
    await ui.settle((done) => {
      neuralUi.neuronView(el, {
        weights: neural.DEMO.weights,
        threshold: neural.DEMO.threshold,
        editable: true,
        onChange: (inputs) => {
          const fired = neural.fire(inputs, neural.DEMO.weights, neural.DEMO.threshold);
          if (fired) sawOn = true;
          else if (inputs.some((x) => x)) sawOff = true;
          if (fired) sound.play("correct");
          if (sawOn && sawOff) setTimeout(done, 700);
        },
      });
    });
    await ui.say("elder", "Koʻrdingmi? Har chiroqning ogʻirligi bor: yashil +1 yonishga yordam beradi, sariq −1 xalaqit beradi.");
  }

  async function explain() {
    const el = common.box(false);
    neuralUi.neuronView(el, { inputs: [1, 1, 0], weights: neural.DEMO.weights, threshold: neural.DEMO.threshold });
    await ui.say("elder", "Neyron yoniq kirishlarni ogʻirligi bilan qoʻshadi: +1 +1 = 2.");
    await ui.say("elder", "Yigʻindi chegaraga yetsa — neyron yonadi. Yetmasa — yonmaydi.");
  }

  // 4.3: mashq — neyron yonadimi?
  function fireTask(task) {
    const el = common.box(true);
    const view = neuralUi.neuronView(el, { inputs: task.inputs, weights: task.weights, threshold: task.threshold, hideLine: true });
    ui.bubble("elder", "Bu neyron yonadimi?");
    const options = ["Yonadi", "Yonmaydi"];
    return practice.tries({
      setup: (submit) => neuralUi.choiceButtons(options, submit),
      check: (index) => (index === 0) === task.answer,
      hint: () => {
        view.showLine();
        ui.bubble("elder", "↻ Faqat yoniq chiroqlarning ogʻirligini qoʻsh va chegara bilan solishtir.");
      },
      solution: () => {
        view.showLine();
        el.append(common.answerLine(task.answer ? "Yonadi: yigʻindi chegaraga yetdi" : "Yonmaydi: yigʻindi chegaraga yetmadi"));
      },
    });
  }

  async function stage1() {
    await neuronDemo();
    await explain();
    await ui.say("elder", "Endi oʻzing hisobla: neyron yonadimi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => neural.makeFireTask(prev),
      run: fireTask,
      praise: (task) => `Yigʻindi ${neural.weightedSum(task.inputs, task.weights)}, chegara ${task.threshold} — ${task.answer ? "yonadi" : "yonmaydi"}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
