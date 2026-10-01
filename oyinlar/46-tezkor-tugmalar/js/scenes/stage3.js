// 3-bosqich: haqiqiy matn maydonida ishlash — natija ham, usul ham tekshiriladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function kirish() {
    await ui.say("elder", "Endi haqiqiy matn ustida ishlaymiz. Maydon pastda — matnni oʻzgartirasan.");
    await ui.say("elder", "Shart bitta: qoʻlda qayta termaysan, tezkor tugmalar bilan qilasan.");
    await ui.say("apprentice", "Qanday bilasan — qoʻlda terdimmi yoki tugma bilanmi?");
    await ui.say("elder", "Bosgan tugmalaring ekranda koʻrinib turadi. Men ularga qarayman.");
  }

  async function stage3() {
    await kirish();
    await practice.exercises({
      next: (prev) => L.maqsadTask(Math.random, prev),
      run: (task) => common.maqsadExercise(task),
      praise: () => "Tezkor tugmalar bilan qilindi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
