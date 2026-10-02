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
    await ui.say("elder", "«Robot nimani koʻradi?» oʻyinida belgini biz tanlagan edik: boʻyalgan kataklar soni.");
    await ui.say("apprentice", "Robot belgini oʻzi topa oladimi?");
    await ui.say("elder", "Ha — neyronlar yordamida. Neyron «Qabila chiroqlari» oʻyinidagi chiroqqa oʻxshaydi.");
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

  // 4.3: mashq — ikki qadam: avval yig'indi (4 variant), keyin "yonadimi?".
  // Yig'indi va "yondi" holati ekranda yashirin — bola o'zi hisoblaydi; ikkalasi to'g'ri bo'lsagina hisoblanadi.
  function fireTask(task) {
    const el = common.box(true);
    const view = neuralUi.neuronView(el, {
      inputs: task.inputs, weights: task.weights, threshold: task.threshold,
      hideLine: true, hideSum: true, hideFired: true,
    });
    ui.bubble("elder", "Yoniq chiroqlarning ogʻirliklarini qoʻsh. Yigʻindi nechchi?");
    return common.twoStep({
      first: {
        setup: (submit) => neuralUi.choiceButtons(task.sumOptions.map(neuralUi.num), submit),
        check: (index) => index === task.sumIndex,
      },
      second: {
        setup: (submit) => {
          view.reveal("sum");
          ui.bubble("elder", `Toʻgʻri, yigʻindi ${neuralUi.num(task.sum)}. Endi ayt: neyron yonadimi?`);
          neuralUi.choiceButtons(["Yonadi", "Yonmaydi"], submit);
        },
        check: (index) => (index === 0) === task.answer,
      },
      hint: (step) => ui.bubble("elder", step === 1
        ? "↻ Faqat yoniq chiroqlarni ol: oʻchiq chiroqning ogʻirligi qoʻshilmaydi. Minusli ogʻirlik ayiriladi."
        : "↻ Yigʻindini chegara bilan solishtir: yetsa yoki oshsa — yonadi."),
      solution: () => {
        view.showLine();
        el.append(common.answerLine(task.answer ? "Yonadi: yigʻindi chegaraga yetdi" : "Yonmaydi: yigʻindi chegaraga yetmadi"));
      },
    });
  }

  async function stage1() {
    await neuronDemo();
    await explain();
    await ui.say("elder", `Endi oʻzing hisobla: yigʻindi nechchi va neyron yonadimi? ${QK.practice.need()} ta toʻgʻri javob!`);
    await practice.exercises({
      next: (prev, correct, tier) => neural.makeFireTask(prev, null, tier),
      run: fireTask,
      praise: (task) => `Yigʻindi ${neuralUi.num(task.sum)}, chegara ${task.threshold} — ${task.answer ? "yonadi" : "yonmaydi"}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
