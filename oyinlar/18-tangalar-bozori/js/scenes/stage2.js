// 2-bosqich: 8-lik va 5-likdan o'nlikka (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, bozor, ui, sound, bozorUi, practice, common } = QK;
  const S = sanoq;

  // 5.1: bola har xonadan raqamcha tanga oladi
  async function coins() {
    const number = "213";
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(number, 8) }));
    ui.bubble("elder", "Sakkizlik qabila tangalari: 64, 8, 1. Har xonadan raqamcha tanga ol!");
    const total = await bozorUi.collect(el, number, 8, (text) => ui.bubble("elder", text));
    sound.play("correct");
    await ui.say("elder", `${bozor.expandText(number, 8)} = ${total}. Demak, ${S.fmt(number, 8)} = ${total}!`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["raqam × xona qiymati — hammasini qoʻshamiz", `324₅ = ${bozor.expandText("324", 5)} = 89`]);
    await ui.say("elder", "Har qanday tizimda shunday: raqamni xona qiymatiga koʻpaytirib qoʻshamiz.");
    await ui.say("elder", "5-likda xonalar: 25, 5, 1. 3·25 + 2·5 + 4 = 89.");
  }

  // 5.3: mashq — 3–8-lik son → o'nlik
  function midTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(task.number, task.base) }));
    ui.bubble("elder", "Bu son oʻnlikda nechaga teng?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, bozorUi.placed(task.number, task.base));
        ui.bubble("elder", "↻ Har raqamni ustidagi xona qiymatiga koʻpaytir va qoʻsh.");
      },
      solution: () => common.add(el, common.answerLine(`${bozor.expandText(task.number, task.base)} = ${task.answer}`)),
    });
  }

  async function stage2() {
    await coins();
    await definition();
    await ui.say("elder", "Endi oʻzing: turli tizimlardan oʻnlikka. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => bozor.makeMidTask(prev),
      run: midTask,
      praise: (task) => `${S.fmt(task.number, task.base)} = ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
