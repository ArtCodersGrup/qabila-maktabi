// 2-bosqich: tartib muhimmi? — A va C ni ajratish (blokning eng muhim mashqi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sanash: S, common, practice } = QK;

  // Bir xil sonlar, bitta so'z farq qiladi — javob boshqa
  async function ikkiSavol() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "jt-ikki" },
      ui.h("div", { class: "jt-karta c" },
        ui.h("div", { class: "jt-karta-nom", text: "Tartib muhim emas" }),
        ui.h("div", { text: "5 boladan 3 kishilik jamoa" }),
        ui.h("div", { class: "jt-karta-izoh", text: "Jamoada hamma teng" }),
        ui.h("div", { class: "jt-karta-hisob", text: "C(5,3) = 10" })),
      ui.h("div", { class: "jt-karta a" },
        ui.h("div", { class: "jt-karta-nom", text: "Tartib muhim" }),
        ui.h("div", { text: "5 boladan 3 tasi 1-, 2-, 3-oʻrin" }),
        ui.h("div", { class: "jt-karta-izoh", text: "Oʻrinlar har xil" }),
        ui.h("div", { class: "jt-karta-hisob", text: "A(5,3) = 60" }))));
    await ui.say("elder", "Sonlar bir xil: 5 va 3. Javob esa 10 va 60.");
    await ui.say("apprentice", "Qanday qilib ajrataman?");
    await ui.say("elder", "Bitta savol ber: ikki bolaning oʻrni almashsa, bu boshqa javobmi?");
    await ui.say("elder", "Boshqa boʻlsa — tartib muhim (A). Oʻsha boʻlsa — muhim emas (C).");
  }

  async function xossalar() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ...L.XOSSALAR.map((x) => ui.h("div", { class: "formula-row" },
        ui.h("span", { class: "formula-nom", text: x.matn }),
        ui.h("span", { class: "jt-xossa-izoh", text: " — " + x.izoh })))));
    await ui.say("elder", "Uchta foydali qoida. Birinchisi eng chiroylisi: 10 tadan 7 tani tanlash — 3 tasini qoldirish bilan bir xil.");
  }

  async function stage2() {
    await ikkiSavol();
    await xossalar();
    await ui.say("elder", "Endi savollar aralash keladi. Avval tartib muhimligini oʻyla.");
    await practice.exercises({
      next: (prev, correct, tier) => L.tartibTask(Math.random, prev, tier),
      run: (task) => common.tartibExercise(task),
      praise: (task) => (task.qoida === "c" ? "Tartib muhim emas: " : "Tartib muhim: ") + task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
