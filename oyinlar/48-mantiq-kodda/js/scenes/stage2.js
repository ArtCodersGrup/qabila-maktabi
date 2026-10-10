// 2-bosqich: and, or, not — rostlik jadvali kod bilan hisoblanadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function jadvallar() {
    for (const [ifoda, gap] of [
      ["a and b", "and: ikkala qiymat True boʻlsa — True, aks holda False."],
      ["a or b", "or: kamida bittasi True boʻlsa — True."],
      ["not a", "not: True ni False ga, False ni True ga aylantiradi."],
    ]) {
      const host = common.box(true);
      host.append(common.kodBlok("print(" + ifoda + ")"));
      host.append(common.rostlik(ifoda));
      await ui.say("elder", gap);
    }
    await ui.say("elder", `Jadvalni yodlash shart emas — Python oʻzi hisoblaydi. Mashq: ${QK.practice.need()} ta — ifoda qiymati va gapni kodga oʻgirish.`);
  }

  // Mashqda ikki tur aralashadi: ifoda qiymati va hayotiy gap
  const keyingi = (prev, togri, tier) => (togri % 2 === 0 ? L.ifodaTask(Math.random, prev, tier) : L.gapTask(Math.random, prev, tier));

  async function stage2() {
    await jadvallar();
    await practice.exercises({
      next: (prev, togri, tier) => keyingi(prev, togri, tier),
      run: (task) => (task.tur === "gap" ? common.gapExercise(task) : common.ifodaExercise(task)),
      praise: (task) => (task.tur === "gap" ? task.javob + " kerak edi" : task.ifoda + " → " + task.javoblar.join(", ")),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
