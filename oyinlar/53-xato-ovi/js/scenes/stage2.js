// 2-bosqich: dasturni tuzatish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function kirish() {
    await ui.say("elder", "Endi faqat topish emas — tuzatish ham kerak.");
    await ui.say("elder", "Dastur tayyor holda beriladi. Buyruq qoʻshish va oʻchirish mumkin.");
    await ui.say("apprentice", "Butunlay oʻchirib, qaytadan yozsam boʻladimi?");
    await ui.say("elder", "Boʻladi. Lekin avval xatoni top — keyin kichik tuzatish yetarli boʻladi.");
  }

  async function stage2() {
    await kirish();
    await practice.exercises({
      next: (prev) => L.tuzatTask(Math.random, prev),
      run: (task) => common.tuzatExercise(task),
      praise: () => "Dastur tuzatildi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
