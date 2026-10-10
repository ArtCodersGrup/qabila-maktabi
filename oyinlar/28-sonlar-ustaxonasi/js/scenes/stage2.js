// 2-bosqich: amallar tartibi — avval daraja, keyin ko'paytirish, keyin qo'shish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  const withOutput = (host, code) => {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    host.append(out.el);
  };

  async function brackets() {
    const el = common.box();
    withOutput(el, "print(2 + 3 * 4)\nprint((2 + 3) * 4)");
    await ui.say("elder", "Ikkala satrda sonlar bir xil, natijalar esa har xil.");
    await ui.say("elder", "Python avval koʻpaytiradi, keyin qoʻshadi — matematikadagidek. Qavs bu tartibni oʻzgartiradi.");
  }

  async function power() {
    const el = common.box();
    withOutput(el, "print(2 ** 10)\nprint(2 + 3 ** 2)\nprint(-2 ** 2)");
    await ui.say("elder", "** — darajaga koʻtarish. U boshqa arifmetik amallardan oldin bajariladi.");
    await ui.say("elder", "Shuning uchun -2 ** 2 = -4: avval 2 ** 2, keyin minus.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "Tartib:" }),
      ui.h("div", { class: "formula-row kod", text: "( )  →  **  →  * / // %  →  + -" }),
      ui.h("div", { class: "formula-row", text: "bir xil kuchlilari chapdan oʻngga" })));
    await ui.say("elder", "Tartibga ishonching komil boʻlmasa, qavs qoʻy — ortiqcha qavs xato emas.");
  }

  async function stage2() {
    await brackets();
    await power();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod — nima chiqarishini hisobla.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.orderTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: (task) => "Tartibni toʻgʻri topding: " + task.hint + ".",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
