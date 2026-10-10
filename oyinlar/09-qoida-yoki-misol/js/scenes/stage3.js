// 3-bosqich: qaysi biri kerak, hayotdan misollar va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { rules, ui, art, rulesUi, practice, common } = QK;

  const SCENES = [
    { art: "calculator", lines: ["Qayerda uchraydi: kalkulyator — qoida yozilgan dastur.", "U hech narsa oʻrganmaydi, lekin adashmaydi ham."] },
    { art: "cats", lines: ["Rasmda mushukni tanish uchun aniq qoida yozib boʻlmaydi.", "Shuning uchun modelga minglab belgilangan rasm beriladi."] },
    { art: "circles", caption: true, lines: ["Sunʼiy intellekt — katta doira: mashina aql talab qiladigan ishni bajaradi.", "Uning ichidagi qism — misollardan oʻrganish, yaʼni mashinali oʻrganish."] },
    { art: "robot", lines: ["«Robotni oʻrgatamiz», «Keyingi soʻz» va «Sehrli qutilar» oʻyinlarida mashinali oʻrganishning uch usulini koʻrding.", "Belgilangan misollar, matn statistikasi va mukofot orqali oʻrganish."] },
  ];

  // 6.1: ikki ustunli qiyoslash
  async function compare() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "compare" },
      ui.h("div", { class: "col rule-col" },
        ui.h("div", { class: "col-head", text: "Qoida yozamiz" }),
        ui.h("div", { text: "Belgi aniq" }),
        ui.h("div", { text: "Chegara aniq" }),
        ui.h("div", { text: "Holatlar kam" })),
      ui.h("div", { class: "col ex-col" },
        ui.h("div", { class: "col-head", text: "Misol koʻrsatamiz" }),
        ui.h("div", { text: "Belgilar chalkash" }),
        ui.h("div", { text: "Juda koʻp holat" }),
        ui.h("div", { text: "Rasm, ovoz, matn" }))));
    await ui.say("elder", "Ikki yondashuv: qoida yozish va misollardan oʻrgatish.");
    await ui.say("elder", "Qoida — belgi va chegara aniq boʻlganda. Misol — belgilar chalkash yoki holatlar juda koʻp boʻlganda: rasm, ovoz, matn.");
  }

  // 6.3: hayotdan misol — ikki qadam: "qoidami yoki misolmi?" va "nega?" (4 sabab).
  // Ikkalasi to'g'ri bo'lsagina hisoblanadi (QOIDALAR 4.3: 2 variantli savol yolg'iz kelmaydi).
  function kindTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "case-text", text: task.text }));
    ui.bubble("elder", "Bu vazifa uchun qaysi yondashuv: qoida yoki misol?");
    const options = ["Qoida yozamiz", "Misol koʻrsatamiz"];
    return common.twoStep({
      first: {
        setup: (submit) => rulesUi.choiceButtons(options, submit),
        check: (index) => (index === 0 ? "qoida" : "misol") === task.answer,
      },
      second: {
        setup: (submit) => {
          el.append(common.line(task.answer === "qoida" ? "Qoida yozamiz. Nega?" : "Misol koʻrsatamiz. Nega?"));
          ui.bubble("elder", "Toʻgʻri. Endi sababini tanla.");
          rulesUi.choiceList(task.whyOptions, submit);
        },
        check: (index) => index === task.whyIndex,
      },
      hint: (step) => ui.bubble("elder", step === 1
        ? "↻ Oʻzing aniq qoida yoza olasanmi? Yoza olsang — qoida, yoza olmasang — misol."
        : "↻ Sabab aynan shu ish haqida boʻlishi kerak. Ishni yana bir oʻqi va sabablarni solishtir."),
      solution: () => el.append(common.answerLine(`${task.answer === "qoida" ? "Qoida" : "Misol"}: ${task.why}`)),
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const holder = ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: scene.art === "robot" ? art.robot() : art.story(scene.art) }));
    if (scene.caption) {
      holder.append(ui.h("div", { class: "legend" },
        ui.h("div", { class: "leg ai" }, ui.h("span", { class: "dot-ai" }), ui.h("span", { text: "Sunʼiy intellekt" })),
        ui.h("div", { class: "leg ml" }, ui.h("span", { class: "dot-ml" }), ui.h("span", { text: "Mashinali oʻrganish" })),
        ui.h("div", { class: "leg dl" }, ui.h("span", { class: "dot-dl" }), ui.h("span", { text: "Chuqur oʻrganish — «Koʻp qatlamli tarmoq»da" }))));
    }
    ui.work().append(holder);
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await compare();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta real vazifa — yondashuvni va sababini tanla.`);
    await practice.exercises({
      next: (prev) => rules.makeKindTask(prev),
      run: kindTask,
      praise: (task) => task.why,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
