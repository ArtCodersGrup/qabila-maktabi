// Kirish va 1-bosqich: bir tomonlama amal (raqamlar yig'indisi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.voronka() }));
    await ui.say("elder", "Maqsad: sayt parolni qanday saqlashini tushunish — bir tomonlama amal, iz (xesh), tuz.");
    await ui.say("elder", "Kalit gʻoya: yaxshi sayt parolning oʻzini emas, undan hisoblangan izni saqlaydi. Izdan parolni qaytarib boʻlmaydi.");
  }

  async function korsat() {
    const el = common.box(true);
    el.append(common.note("Sonning raqamlarini qoʻshamiz:"));
    el.append(common.sonKarta(3791, { yigindi: true }));
    await ui.say("elder", "3 + 7 + 9 + 1 = 20. Oldinga hisoblash oson — yoddan ham boʻladi.");
    el.append(common.note("Endi teskarisi: yigʻindi 20. Asl son qaysi?"));
    el.append(ui.h("div", { class: "bq-juft" },
      common.sonKarta(3881, { yigindi: true, kichik: true }),
      common.sonKarta(4790, { yigindi: true, kichik: true }),
      common.sonKarta(9281, { yigindi: true, kichik: true })));
    await ui.say("elder", "Uchalasi ham 20 beradi — asl sonni aniqlab boʻlmaydi.");
    await ui.say("elder", "Atama: bir tomonlama amal — oldinga oson, orqaga qaytarib boʻlmaydi.");
    await ui.say("elder", `Atama: bir xil natija beradigan ikki xil kirish — toʻqnashuv. Mashq: ${QK.practice.need()} ta savol.`);
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
