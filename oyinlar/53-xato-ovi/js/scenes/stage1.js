// Kirish va 1-bosqich: xatoni topish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.xato() }));
    await ui.say("elder", "Shogird robotga dastur yozdi, lekin robot gulxanga yetmadi.");
    await ui.say("apprentice", "Qayerda xato qilganimni bilmayapman…");
    await ui.say("elder", "Dasturchi ishining yarmi — xato topish. Buni oʻrganamiz.");
    await ui.say("elder", "Avval dasturni yurgizib koʻr: robot qayerda notoʻgʻri burilishini kuzat.");
  }

  async function stage1() {
    await practice.exercises({
      next: (prev, correct, tier) => L.topTask(Math.random, prev, tier),
      run: (task) => common.topExercise(task),
      praise: () => "Xato topildi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
