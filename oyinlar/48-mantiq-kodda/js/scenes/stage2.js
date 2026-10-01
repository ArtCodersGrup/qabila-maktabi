// 2-bosqich: and, or, not — rostlik jadvali kod bilan hisoblanadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function jadvallar() {
    for (const [ifoda, gap] of [
      ["a and b", "and — ikkalasi ham rost boʻlsa, rost."],
      ["a or b", "or — kamida bittasi rost boʻlsa, rost."],
      ["not a", "not — rostni yolgʻonga, yolgʻonni rostga aylantiradi."],
    ]) {
      const host = common.box(true);
      host.append(common.kodBlok("print(" + ifoda + ")"));
      host.append(common.rostlik(ifoda));
      await ui.say("elder", gap);
    }
    await ui.say("apprentice", "Jadvalni oʻzim yodlab olishim kerakmi?");
    await ui.say("elder", "Yoʻq. Kodni ishga tushirsang, Python oʻzi hisoblab beradi.");
  }

  // Mashqda ikki tur aralashadi: ifoda qiymati va hayotiy gap
  const keyingi = (prev, togri) => (togri % 2 === 0 ? L.ifodaTask(Math.random, prev) : L.gapTask(Math.random, prev));

  async function stage2() {
    await jadvallar();
    await practice.exercises({
      next: (prev, togri) => keyingi(prev, togri),
      run: (task) => (task.tur === "gap" ? common.gapExercise(task) : common.ifodaExercise(task)),
      praise: (task) => (task.tur === "gap" ? task.javob + " kerak edi" : task.ifoda + " → " + task.javob),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
