// 2-bosqich: kuzatuv jadvali — dasturni satrma-satr tekshirish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice, jadval } = QK;

  // Birga to'ldiramiz: birinchi qator tayyor, qolganini bola yozadi
  async function together() {
    const code = "a = 4\nb = 2\na = a + b\nb = a * 2";
    const task = { type: "kuzatuv", code, vars: ["a", "b"], rows: L.traceRows(code) };
    const el = common.box();
    el.append(common.note("Birinchi qator toʻldirilgan. Qolganini sen yoz."));
    const table = jadval.build(task, { prefill: 1 });
    el.append(table.el);
    const say = common.liveNote(el);
    await ui.settle((done) => {
      ui.control().append(ui.button("Tekshir", () => {
        if (!table.filled()) { say("↻ Hamma katakni toʻldir."); return; }
        const result = table.check();
        if (result.ok) { table.lock(); ui.clearControl(); done(); }
        else say("↻ " + result.badRow + "-satrdan keyingi qiymat boshqacha. Oʻsha satrni qayta hisobla.");
      }, "big"));
      setTimeout(() => table.focus(), 50);
    });
    await ui.say("elder", "Mana shu — kuzatuv jadvali. Dasturchi qogʻozda shunday tekshiradi.");
  }

  // Almashtirish: uchinchi quti orqali va Pythonning qisqa yo'li
  async function swap() {
    const el = common.box();
    const step = U.stepper({ code: L.SWAP_LONG });
    el.append(common.note("a va b qiymatlarini almashtiramiz. Uchinchi quti kerak boʻladi."));
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: c qutisi nega kerakligini koʻrasan.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "c boʻlmasa, a ning eski qiymati yoʻqolib ketardi.");

    const el2 = common.box();
    el2.append(common.note("Pythonda buni bir satrda ham yozish mumkin:"));
    el2.append(U.codeBlock(L.SWAP_SHORT + "\nprint(a, b)"));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(L.SWAP_SHORT + "\nprint(a, b)").output);
    el2.append(out.el);
    await ui.say("elder", "Natija bir xil. Avval oʻng tomondagi ikkala qiymat olinadi, keyin qoʻyiladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "Kuzatuv jadvali:" }),
      ui.h("div", { class: "formula-row", text: "har buyruqdan keyin qutilarga qarab chiqish" }),
      ui.h("div", { class: "formula-row kod", text: "a, b = b, a" })));
    await ui.say("elder", "Dastur xato ishlasa, birinchi ish — jadval tuzish. Xato qaysi satrda ekani darrov koʻrinadi.");
  }

  async function stage2() {
    await together();
    await swap();
    await definition();
    await ui.say("elder", "Endi jadvalni oʻzing toʻldirasan. 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev) => L.traceTask(Math.random, prev),
      run: (task) => common.tableExercise(task),
      praise: () => "Jadval toʻppa-toʻgʻri.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
