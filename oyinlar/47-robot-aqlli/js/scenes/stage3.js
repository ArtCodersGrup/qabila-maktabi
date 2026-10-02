// 3-bosqich: takror va agar birga.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function kirish() {
    await ui.say("elder", "Endi ikkisini birga ishlatamiz: takror ichida agar.");
    await ui.say("elder", "Shunda robot har qadamda qaraydi: yoʻl boʻshmi — yuradi, tosh boʻlsa — aylanib oʻtadi.");
    await ui.say("apprentice", "Demak dastur maydonni oldindan bilmasa ham ishlaydi!");
    await ui.say("elder", "Toʻppa-toʻgʻri. Yaxshi dastur bitta maydonga emas, hammasiga yarashi kerak.");
  }

  async function stage3() {
    await kirish();
    await practice.exercises({
      // Har safar yangi maydon (generator); tier bilan yoʻl uzayadi va toshlar koʻpayadi
      next: (prev, correct, tier) => L.yasa("birga", prev, undefined, tier),
      run: (level) => common.qurExercise(level),
      praise: () => "Takror ichidagi agar — kuchli juftlik.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
