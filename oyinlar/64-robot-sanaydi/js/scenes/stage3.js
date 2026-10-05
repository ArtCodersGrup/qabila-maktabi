// 3-bosqich: sanoq bilan — saqlangan son boshqa shakllarda: burchak, zinapoya, ikki barobar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, practice } = QK;

  async function kirish() {
    BU.box(false).append(ui.h("div", { class: "story-art", html: QK.gameArt.robot() }));
    await ui.say("elder", "Saqlangan sonni bir necha marta ishlatsa ham boʻladi. U qutida turaveradi.");
    await ui.say("apprentice", "Demak burchak, zinapoya, hatto ikki barobar yoʻl ham yasasa boʻladi!");
  }

  async function stage3() {
    await kirish();
    await practice.exercises({
      next: (prev, correct, tier) => L.yasa("sanoq", prev, undefined, tier),
      run: (level) => BU.qurExercise(level),
      praise: (level) => (level.shakl === "ikki" ? "Ikki barobar — takror ichida ikki qadam."
        : level.shakl === "zina" ? "Zinapoya ham sanoq bilan yasaldi."
          : "Bitta son ikki marta ishladi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
