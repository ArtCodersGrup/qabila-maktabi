// Kirish va 1-bosqich: 2-likdan o'nlikka (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, bozor, ui, sound, art, bozorUi, practice, common } = QK;
  const S = sanoq;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.market() }));
    await ui.say("elder", "Bugun qabilalar bozoriga boramiz!");
    await ui.say("apprentice", "Har qabilaning tangasi boshqa-ku?");
    await ui.say("elder", "Ha. Tangalar — xona qiymatlari. Qani, hisoblab koʻramiz.");
  }

  // 4.1: bola 1 turgan xonalardagi tangalarni oladi
  async function coins() {
    const number = "1011";
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(number, 2) }));
    ui.bubble("elder", "Ikkilik qabila tangalari: 8, 4, 2, 1. Raqam 1 boʻlgan xonalardagi tangalarni ol!");
    const total = await bozorUi.collect(el, number, 2, (text) => ui.bubble("elder", text));
    sound.play("correct");
    await ui.say("elder", `8 + 2 + 1 = ${total}. Demak, ${S.fmt(number, 2)} = ${total}!`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, [`1011₂ = ${bozor.expandText("1011", 2)} = 11`, "1 turgan xonalar qiymatini qoʻshamiz"]);
    await ui.say("elder", "Har raqamni oʻz xonasi qiymatiga koʻpaytirib, hammasini qoʻshamiz.");
    await ui.say("elder", "Ikkilikda oson: faqat 1 turgan xonalarni qoʻshamiz.");
  }

  // 4.3: mashq — ikkilik son → o'nlik
  function binTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(task.number, 2) }));
    ui.bubble("elder", "Bu son oʻnlikda nechaga teng?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, bozorUi.placed(task.number, 2));
        ui.bubble("elder", "↻ Har raqam ustida — uning tangasi. 1 turganlarini qoʻsh.");
      },
      solution: () => common.add(el, common.answerLine(bozor.sumText(task.number, 2))),
    });
  }

  async function stage1() {
    await coins();
    await definition();
    await ui.say("elder", "Endi oʻzing: ikkilik sonni oʻnlikka aylantir. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => bozor.makeBinTask(prev),
      run: binTask,
      praise: (task) => `${S.fmt(task.number, 2)} = ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
