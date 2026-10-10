// Kirish va 1-bosqich: nechta variant bor.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sanash: S, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.qulf() }));
    await ui.say("elder", "Maqsad: parol kuchini hisoblash — variantlar soni va ularni sinab chiqish vaqti.");
    await ui.say("elder", "Kalit gʻoya: hujumchi variantlarni birma-bir sinaydi. Variantlar soni — takrorli tanlash: Aⁿ (A — alifbo, n — uzunlik).");
  }

  async function korsat() {
    const el = common.box(true);
    el.append(common.note("4 xonali PIN: har xonaga 10 xil raqam, A = 10, n = 4:"));
    el.append(ui.h("div", { class: "pk-formula" },
      ui.h("span", { class: "pk-alifbo", text: "10" }), ui.h("sup", { text: "4" }),
      ui.h("span", { text: " = " + S.chiroyli(S.takrorli(10, 4)) })));
    await ui.say("elder", "10 000 koʻpga oʻxshaydi, lekin kompyuter ularni bir soniyadan tezroq sinab chiqadi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — variantlar sonini Aⁿ boʻyicha hisobla.`);
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
