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
    ui.bubble("elder", "Sakkizlikda vaznlar: 8² = 64, 8¹ = 8, 8⁰ = 1. Har xonadan raqami nechta boʻlsa, shuncha tanga ol.");
    const total = await bozorUi.collect(el, number, 8, (text) => ui.bubble("elder", text));
    sound.play("correct");
    await ui.say("elder", `${bozor.expandText(number, 8)} = ${total}, yaʼni ${S.fmt(number, 8)} = ${total}₁₀.`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["(aₖ … a₁a₀)ᵦ = aₖ·bᵏ + … + a₁·b + a₀", `324₅ = ${bozor.expandText("324", 5)} = 89`]);
    await ui.say("elder", "Asos b boʻlsa, vaznlar: …, b², b, 1. Har raqam oʻz vazniga koʻpaytiriladi va hammasi qoʻshiladi.");
    await ui.say("elder", "Tekshiruv: b-lik tizimda raqam b dan kichik boʻladi. 5-likda 5 yoki 7 raqami boʻlmaydi.");
  }

  // 5.3: mashq — 3–8-lik son → o'nlik
  function midTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(task.number, task.base) }));
    ui.bubble("elder", "Oʻnlikda nechaga teng?");
    return practice.numberTries({
      answer: task.answer,
      maxLen: 4,
      hint: () => {
        common.add(el, bozorUi.placed(task.number, task.base));
        ui.bubble("elder", "↻ Vaznlar ustida yozilgan: raqam × vazn, keyin yigʻindi.");
      },
      solution: () => common.add(el, common.answerLine(`${bozor.expandText(task.number, task.base)} = ${task.answer}`)),
    });
  }

  async function stage2() {
    await coins();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta son, asosi 3 dan 8 gacha.`);
    await practice.exercises({
      next: (prev, correct, tier) => bozor.makeMidTask(prev, undefined, tier),
      run: midTask,
      praise: (task) => `${S.fmt(task.number, task.base)} = ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
