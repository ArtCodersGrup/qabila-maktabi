// 3-bosqich: ichma-ich — "gulxanga yetguncha" ichida "bo'sh ekan takrorla".
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, practice, tosiq } = QK;

  async function korsat() {
    const level = L.KORSATUV.birga;
    const { maydon } = tosiq.namoyish(level, level.yechim, "Har pogʻonaning eni boshqa: biri qisqa, biri uzun.");
    await ui.say("elder", "Endi ichma-ich: «gulxanga yetguncha» ichida «boʻsh ekan» bloki.");
    await tosiq.yurgizBtn(maydon, level.yechim);
    await ui.say("apprentice", "Har pogʻonani oxirigacha yurdi, keyin bir qadam tushdi!");
    await ui.say("elder", "Bitta pogʻonani yozsang, qolganini takror oʻzi qiladi.");
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      // Har safar yangi ikki zinapoya; tier bilan pog'onalar ko'payadi, balandligi ham o'zgaradi
      next: (prev, correct, tier) => L.yasa("birga", prev, undefined, tier),
      run: (level) => BU.qurExercise(level),
      praise: () => "Ichma-ich takror — kuchli juftlik.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
