// Kirish va 1-bosqich: shart va otstup (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.fork(null) }));
    await ui.say("elder", "Yoʻl ikkiga ayrildi. Qaysi biridan borishni nima hal qiladi?");
    await ui.say("apprentice", "Shart — masalan, yomgʻir yogʻyaptimi yoki yoʻqmi.");
    await ui.say("elder", "Toʻgʻri. Dasturda ham shunday: shart rost boʻlsa — bir yoʻl, aks holda — boshqasi.");
  }

  // Ko'rsatish: qadam-baqadam — qaysi satr bajarilgani ko'rinadi
  async function whichWay(value) {
    const code = "yosh = " + value + '\nif yosh >= 12:\n    print("katta")\nelse:\n    print("kichik")';
    const el = common.box();
    el.append(common.note(value >= 12 ? "Shart rost boʻlsa, qaysi satr bajariladi?" : "Endi shart yolgʻon. Qaysi satr bajariladi?"));
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam ni bosib bor.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
  }

  // Otstup: surilgan satr shartga tegishli, surilmagani doim bajariladi
  async function indent() {
    const inside = 'yosh = 8\nif yosh >= 12:\n    print("katta")\n    print("tamom")';
    const outside = 'yosh = 8\nif yosh >= 12:\n    print("katta")\nprint("tamom")';
    const el = common.box();
    el.append(common.note("Ikki kod deyarli bir xil. Faqat oxirgi satrning otstupi boshqa."));
    el.append(U.codeBlock(inside));
    const out1 = U.output({ title: "Chiqish" });
    out1.lines(K.run(inside).output);
    el.append(out1.el);
    el.append(U.codeBlock(outside));
    const out2 = U.output({ title: "Chiqish" });
    out2.lines(K.run(outside).output);
    el.append(out2.el);
    await ui.say("elder", "Surilgan satrlar shartga tegishli — shart yolgʻon boʻlsa, ular bajarilmaydi.");
    await ui.say("elder", "Surilmagan satr esa doim bajariladi. Otstup — blokning chegarasi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "if shart:" }),
      ui.h("div", { class: "formula-row", text: "    surilgan satrlar — shart rost boʻlsa" }),
      ui.h("div", { class: "formula-row kod", text: "else:" }),
      ui.h("div", { class: "formula-row", text: "    surilgan satrlar — aks holda" })));
    await ui.say("elder", "Solishtirish belgilari: ==  !=  <  <=  >  >=");
  }

  async function stage1() {
    await whichWay(15);
    await whichWay(8);
    await indent();
    await definition();
    await ui.say("elder", `Endi oʻzing ayt: kod nima chiqaradi? ${QK.practice.need()} ta toʻgʻri javob kerak.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.ifTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Toʻgʻri yoʻlni tanlading.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
