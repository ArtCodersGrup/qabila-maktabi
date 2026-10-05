// 2-bosqich: "gulxanga yetguncha takrorla" — zinapoya shakli har maydonda boshqa.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, practice, tosiq } = QK;

  // Avval muammo: har qadamda qaraydigan dastur, lekin takror soni qotirilgan — bir maydonda yetmaydi
  async function muammo() {
    const level = L.KORSATUV.gulxan;
    const { maydon, qur } = tosiq.namoyish(level, level.sodda, "Ikki zinapoya: pogʻonalari va soni har xil.");
    await ui.say("elder", "Bu dastur har qadamda qaraydi, lekin takror soni qotirilgan.");
    await tosiq.yurgizBtn(maydon, level.sodda);
    await ui.say("apprentice", "Ikkinchisida gulxanga yetmay toʻxtab qoldi!");
    qur.qoy(level.yechim);
    await ui.say("elder", "«Gulxanga yetguncha takrorla» sanamaydi: robot gulxanga yetguncha davom etadi.");
    await tosiq.yurgizBtn(maydon, level.yechim);
    await ui.say("elder", "Endi oʻzing yigʻ. Ichiga bitta qadamni yoz — qolganini takror qiladi.");
  }

  async function stage2() {
    await muammo();
    await practice.exercises({
      // Har safar yangi ikki zinapoya; tier bilan pog'onalar balandlashadi va ko'payadi
      next: (prev, correct, tier) => L.yasa("gulxan", prev, undefined, tier),
      run: (level) => BU.qurExercise(level),
      praise: () => "Robot gulxanga yetguncha oʻzi yurdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
