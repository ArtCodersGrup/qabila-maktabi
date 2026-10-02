// 3-bosqich: aralash — topish va tuzatish birga.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function kirish() {
    await ui.say("elder", "Oxirgi bosqichda ikkisi aralash keladi: baʼzida xatoni koʻrsatasan, baʼzida tuzatasan.");
    await ui.say("elder", "Dasturchi shunday ishlaydi: yurgizadi, kuzatadi, tuzatadi va yana yurgizadi.");
  }

  const keyingi = (prev, togri, tier) => (togri % 2 === 0 ? L.tuzatTask(Math.random, prev, tier) : L.topTask(Math.random, prev, tier));

  async function stage3() {
    await kirish();
    await practice.exercises({
      next: (prev, togri, tier) => keyingi(prev, togri, tier),
      run: (task) => (task.tur === "tuzat" ? common.tuzatExercise(task) : common.topExercise(task)),
      praise: (task) => (task.tur === "tuzat" ? "Tuzatildi." : "Xato topildi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
