// Kirish va 1-bosqich: firibgar xatning belgilarini o'rganish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "fx-art wide", html: QK.gameArt.xat() }));
    await ui.say("elder", "Telefoningga xabar keldi: «Hisobing 1 soat ichida yopiladi, parolingni kirit».");
    await ui.say("apprentice", "Qoʻrqib ketdim. Tezroq kiritaymi?");
    await ui.say("elder", "Toʻxta. Bu xat — qarmoq. Uni tanishni oʻrganamiz.");
  }

  async function korsat() {
    const el = common.box(true);
    el.append(common.note("Firibgar xatning belgilari:"));
    el.append(common.belgiTaxta(["shoshiltirish", "qorqitish", "parol", "manzil"]));
    await ui.say("elder", "Firibgar xat avval shoshiltiradi va qoʻrqitadi. Oʻylashga vaqt qolmasin, deydi.");
    await ui.say("elder", "Keyin parol yoki kod soʻraydi. Manzili esa haqiqiysiga oʻxshatib yasalgan.");

    const el2 = common.box(true);
    el2.append(common.note("Yana toʻrt belgi:"));
    el2.append(common.belgiTaxta(["yutuq", "imlo", "sir", "pul"]));
    await ui.say("elder", "Kutilmagan yutuq, imlo xatolari, «hech kimga aytma» va pul soʻrash.");
    await ui.say("apprentice", "Sakkizta belgi. Bittasi ham boʻlsa, ehtiyot boʻlaman!");
  }

  async function tarif() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "fx-qoida" },
      ui.h("div", { class: "fx-qoida-nom", text: "Qoida" }),
      ui.h("div", { text: "Bitta belgi — toʻxtab oʻyla." }),
      ui.h("div", { text: "Ikki-uchta belgi — bu firibgar xat." }),
      ui.h("div", { class: "fx-misol", text: "Belgilarni sanash bepul, xato esa qimmat turadi." })));
    await ui.say("elder", "Endi gaplarni oʻzing tanib koʻr. Qaysi belgiga ishora qilayotganini ayt.");
  }

  async function stage1() {
    await korsat();
    await tarif();
    await practice.exercises({
      next: (prev) => L.belgiTask(Math.random, prev),
      run: (task) => common.belgiExercise(task),
      praise: (task) => task.javob + " — toʻgʻri taniding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
