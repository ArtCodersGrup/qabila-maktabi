// Kirish va 1-bosqich: bir tomonlama amal (raqamlar yig'indisi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.voronka() }));
    await ui.say("elder", "Saytga parol yozasan. Sayt uni qayerga saqlaydi deb oʻylaysan?");
    await ui.say("apprentice", "Roʻyxatiga yozib qoʻyadi-da. Boshqa yoʻli bormi?");
    await ui.say("elder", "Bor. Yaxshi sayt parolni emas, uning izini saqlaydi.");
    await ui.say("elder", "Iz nima ekanini avval eng oddiy misolda koʻramiz.");
  }

  async function korsat() {
    const el = common.box(true);
    el.append(common.note("Sonning raqamlarini qoʻshamiz:"));
    el.append(common.sonKarta(3791, { yigindi: true }));
    await ui.say("elder", "3791 dan 20 chiqdi. Bu amal oson — yoddan ham boʻladi.");
    el.append(common.note("Endi teskarisi: yigʻindi 20. Asl son qaysi?"));
    el.append(ui.h("div", { class: "bq-juft" },
      common.sonKarta(3881, { yigindi: true, kichik: true }),
      common.sonKarta(4790, { yigindi: true, kichik: true }),
      common.sonKarta(9281, { yigindi: true, kichik: true })));
    await ui.say("apprentice", "Hammasi 20 beradi! Qaysi biri asl son — bilib boʻlmaydi.");
    await ui.say("elder", "Mana shu bir tomonlama amal: oldinga oson, orqaga yoʻl yoʻq.");
    await ui.say("elder", "Bir xil natija beradigan ikki son — toʻqnashuv deyiladi.");
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
