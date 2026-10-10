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
    await ui.say("elder", "Firibgar xatga javob yozilmaydi, havolasi bosilmaydi.");
    await ui.say("elder", "Hisob faqat oʻzing bilgan rasmiy ilova yoki saytdan tekshiriladi.");
    await ui.say("elder", "Aldanib qolsang, darhol kattalarga ayt va parolni almashtir — tez harakat zararni kamaytiradi. Bu uyat emas: kattalar ham aldanadi.");
  }

  async function stage3() {
    await korsat();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta vaziyat. Har birida bitta harakat toʻgʻri.`);
    await practice.exercises({
      next: (prev) => L.vaziyatTask(Math.random, prev),
      run: (task) => common.vaziyatExercise(task),
      praise: () => "Toʻgʻri harakat.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
