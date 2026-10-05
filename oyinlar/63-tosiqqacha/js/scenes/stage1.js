// Kirish va 1-bosqich: "→ bo'sh ekan takrorla" (toki) — to'siqqacha yurish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, practice, tosiq } = QK;

  async function intro() {
    const el = BU.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.yolak() }));
    await ui.say("elder", "Robot yoʻlakdan yuradi, oxirida tosh bor. Lekin yoʻlak har safar boshqa uzunlikda.");
    await ui.say("apprentice", "Unda «oʻngga» ni necha marta yozaman?");
  }

  // Ko'rsatuv: aniq sonli takror bir maydonda yiqiladi, "bo'sh ekan" ikkalasida ishlaydi
  async function korsat() {
    const level = L.KORSATUV.tosiq;
    const { maydon, qur } = tosiq.namoyish(level, level.sodda, "Ikki yoʻlak: biri qisqa, biri uzun.");
    await ui.say("elder", "Bu dastur «oʻngga» ni uch marta takrorlaydi. Ikkala maydonda sinaymiz.");
    await tosiq.yurgizBtn(maydon, level.sodda);
    await ui.say("apprentice", "Birinchisida yetdi, ikkinchisida toshga urildi!");
    qur.qoy(level.yechim);
    await ui.say("elder", "Endi «→ boʻsh ekan takrorla» bloki bilan sinaymiz.");
    await tosiq.yurgizBtn(maydon, level.yechim);
    await ui.say("elder", "Robot sanamaydi — oldiga qaraydi. Boʻsh ekan yuradi, tosh boʻlsa toʻxtaydi.");
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      // Har safar yangi ikki maydon; tier bilan yo'lak bo'laklari ko'payadi (1 → 2 → 3)
      next: (prev, correct, tier) => L.yasa("tosiq", prev, undefined, tier),
      run: (level) => BU.qurExercise(level),
      praise: () => "Robot toshgacha oʻzi yurdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
