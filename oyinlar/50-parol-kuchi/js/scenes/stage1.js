// Kirish va 1-bosqich: nechta variant bor.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sanash: S, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.qulf() }));
    await ui.say("elder", "Telefoningda PIN kod bor. U qanchalik ishonchli, bilasanmi?");
    await ui.say("apprentice", "Toʻrtta raqam… koʻp variant boʻlsa kerak?");
    await ui.say("elder", "Sanab koʻramiz. Bu — oʻsha «nechta soʻz yasaladi» masalasining oʻzi.");
  }

  async function korsat() {
    const el = common.box(true);
    el.append(common.note("Har xonaga 10 xil raqam qoʻyish mumkin, xonalar 4 ta:"));
    el.append(ui.h("div", { class: "pk-formula" },
      ui.h("span", { class: "pk-alifbo", text: "10" }), ui.h("sup", { text: "4" }),
      ui.h("span", { text: " = " + S.chiroyli(S.takrorli(10, 4)) })));
    await ui.say("elder", "Oʻn ming — koʻpga oʻxshaydi. Lekin kompyuter uchun bu hech narsa emas.");
    await ui.say("elder", "Avval sanashni mashq qilamiz, keyin vaqtni hisoblaymiz.");
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.variantTask(Math.random, prev, tier),
      run: (task) => common.variantExercise(task),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
