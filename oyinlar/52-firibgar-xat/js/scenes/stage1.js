// Kirish va 1-bosqich: firibgar xatning belgilarini o'rganish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "fx-art wide", html: QK.gameArt.xat() }));
    await ui.say("elder", "Maqsad: firibgar xatni (fishing, «qarmoq») belgilaridan tanish va toʻgʻri harakat qilish.");
    await ui.say("elder", "Misol: «Hisobing 1 soat ichida yopiladi, parolingni kirit». Bunday xat shoshiltirib, parolni olishga urinadi.");
  }

  async function korsat() {
    const el = common.box(true);
    el.append(common.note("Firibgar xatning belgilari:"));
    el.append(common.belgiTaxta(["shoshiltirish", "qorqitish", "parol", "manzil"]));
    await ui.say("elder", "Firibgar xat shoshiltiradi va qoʻrqitadi — maqsadi oʻylashga vaqt qoldirmaslik.");
    await ui.say("elder", "Keyin parol yoki kod soʻraydi. Manzili esa haqiqiysiga oʻxshatib yasaladi.");

    const el2 = common.box(true);
    el2.append(common.note("Yana toʻrt belgi:"));
    el2.append(common.belgiTaxta(["yutuq", "imlo", "sir", "pul"]));
    await ui.say("elder", "Kutilmagan yutuq, imlo xatolari, «hech kimga aytma» va pul soʻrash.");
    await ui.say("elder", "Jami 8 ta belgi. Bittasi boʻlsa ham — ehtiyot boʻl.");
  }

  async function tarif() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "fx-qoida" },
      ui.h("div", { class: "fx-qoida-nom", text: "Qoida" }),
      ui.h("div", { text: "Bitta belgi — toʻxtab oʻyla." }),
      ui.h("div", { text: "Ikki-uchta belgi — bu firibgar xat." }),
      ui.h("div", { class: "fx-misol", text: "Belgilarni sanash bepul, xato esa qimmat turadi." })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta gap — har biri qaysi belgiga mos kelishini aniqla.`);
  }

  async function stage1() {
    await korsat();
    await tarif();
    await practice.exercises({
      next: (prev) => L.belgiTask(Math.random, prev),
      run: (task) => common.belgiExercise(task),
      praise: (task) => "Belgi: " + task.javob + ".",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
