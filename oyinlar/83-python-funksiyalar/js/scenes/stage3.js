// 3-bosqich: funksiyani o'zing yozish va qayta ishlatish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function reuse() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.qayta.code);
    await ui.say("elder", "farq funksiyasi ortacha ni ikki marta chaqiradi: tayyor funksiya yangisining gʻishti boʻladi.");
    await ui.say("elder", "Har funksiya bitta ish qiladi va nomi shu ishni aytadi — shunda uni alohida sinash va qayta ishlatish oson.");
  }

  async function caution() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "aniqlik(90, 100) → 0.9" }),
      ui.h("div", { class: "formula-row", text: "0.9 — har 10 javobdan bittasi xato" })));
    await ui.say("elder", "Funksiya sonni toʻgʻri hisoblaydi, lekin uni baholash — odamning ishi. Tibbiyot yoki bankda 10 tadan 1 xato juda koʻp boʻlishi mumkin.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta funksiya. Nom va parametrlar soʻralganidek boʻlsin; natija print bilan emas, return bilan qaytsin.`);
  }

  async function stage3() {
    await reuse();
    await caution();
    await practice.exercises({
      next: (prev, correct, tier) => L.writeTask(prev, Math.random, tier),
      run: (task) => common.writeExercise(task),
      praise: () => "Funksiya hamma sinovdan oʻtdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
