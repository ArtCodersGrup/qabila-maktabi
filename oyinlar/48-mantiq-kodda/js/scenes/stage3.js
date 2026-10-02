// 3-bosqich: shartni o'zing yoz.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function kirish() {
    const host = common.box(true);
    host.append(common.note("Ikki shartni birlashtirish — eng koʻp ishlatiladigan narsa:"));
    host.append(common.kodBlok("yosh = 14\nbilet = True\nif yosh >= 12 and bilet:\n    print(\"kirishing mumkin\")"));
    await ui.say("elder", "Shart ichida and, or, not boʻlishi mumkin — xuddi gapdagidek.");
    await ui.say("elder", "Endi oʻzing yozasan. Chegaralarga eʼtibor ber: «12 dan kichik emas» — bu >= 12.");
  }

  const keyingi = (prev, togri, tier) => (togri % 2 === 0 ? L.kodTask(Math.random, prev, tier) : L.writeTask(Math.random, prev, tier));

  async function stage3() {
    await kirish();
    await practice.exercises({
      next: (prev, togri, tier) => keyingi(prev, togri, tier),
      run: (task) => (task.tur === "yoz" ? common.yozishExercise(task) : common.kodExercise(task)),
      praise: (task) => (task.tur === "yoz" ? "Shart toʻgʻri yozildi." : "Toʻgʻri oʻqildi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
