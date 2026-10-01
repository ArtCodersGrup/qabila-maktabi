// Kirish va 1-bosqich: solishtirish True yoki False beradi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.mantiq() }));
    await ui.say("elder", "«Mantiq kalitlari» oʻyinida rost va yolgʻon bilan ishlagan eding.");
    await ui.say("apprentice", "Ha — VA, YOKI, EMAS. Kodda ham shundaymi?");
    await ui.say("elder", "Xuddi oʻsha. Faqat nomi boshqa: and, or, not. Rost esa — True.");
  }

  async function solishtir() {
    const host = common.box(true);
    host.append(common.note("Solishtirish natijasi — son emas, javob: True yoki False."));
    host.append(common.kodBlok("print(7 > 3)\nprint(7 < 3)\nprint(7 == 7)\nprint(7 != 7)"));
    const chiqish = QK.kodUI.output({ title: "Chiqish" });
    host.append(chiqish.el);
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", () => {
      chiqish.show(QK.kod.run("print(7 > 3)\nprint(7 < 3)\nprint(7 == 7)\nprint(7 != 7)"));
      ui.clearControl();
      done();
    }, "big")));
    await ui.say("elder", "Diqqat: bitta = qiymat beradi, ikkita == esa «tengmi?» deb soʻraydi.");
    await ui.say("elder", "Endi oʻzing ayt: bu nima chiqaradi?");
  }

  async function stage1() {
    await solishtir();
    await practice.exercises({
      next: (prev) => L.solishtirTask(Math.random, prev),
      run: (task) => common.solishtirExercise(task),
      praise: (task) => task.ifoda + " → " + task.javob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
