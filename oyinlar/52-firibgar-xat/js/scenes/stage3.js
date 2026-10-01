// 3-bosqich: nima qilaman — to'g'ri harakatni tanlash.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function korsat() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "fx-art small", html: QK.gameArt.qalqon() }));
    el.append(ui.h("div", { class: "fx-qoida" },
      ui.h("div", { class: "fx-qoida-nom", text: "Himoya qoidalari" }),
      ...L.QOIDALAR.map((q) => ui.h("div", { text: q }))));
    await ui.say("elder", "Firibgar xatga javob yozmaysan, havolasini bosmaysan.");
    await ui.say("elder", "Hisobni faqat oʻzing bilgan rasmiy ilovadan tekshirasan.");
    await ui.say("apprentice", "Agar aldanib qolsam, uyaltirmaydilarmi?");
    await ui.say("elder", "Yoʻq. Kattalarga tez aytsang, zarar boʻlmaydi. Buni hamma boshidan oʻtkazadi.");
  }

  async function stage3() {
    await korsat();
    await ui.say("elder", "Endi vaziyatlarni koʻramiz. Har birida bitta harakat toʻgʻri.");
    await practice.exercises({
      next: (prev) => L.vaziyatTask(Math.random, prev),
      run: (task) => common.vaziyatExercise(task),
      praise: () => "Shunday qilsang, xavf qolmaydi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
