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
    await ui.say("elder", "Ikkala satrda ham bir xil sonlar. Javoblar esa boshqacha.");
    await ui.say("elder", "Kompyuter avval koʻpaytiradi, keyin qoʻshadi. Qavs bu tartibni oʻzgartiradi.");
  }

  async function power() {
    const el = common.box();
    withOutput(el, "print(2 ** 10)\nprint(2 + 3 ** 2)\nprint(-2 ** 2)");
    await ui.say("elder", "Ikki yulduzcha — daraja. U hammadan avval hisoblanadi.");
    await ui.say("elder", "Shuning uchun -2 ** 2 javobi -4: avval 2 ** 2, keyin minus.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "Tartib:" }),
      ui.h("div", { class: "formula-row kod", text: "( )  →  **  →  * / // %  →  + -" }),
      ui.h("div", { class: "formula-row", text: "bir xil kuchlilari chapdan oʻngga" })));
    await ui.say("elder", "Ishonching komil boʻlmasa — qavs qoʻy. Qavs hech qachon xato boʻlmaydi.");
  }

  async function stage2() {
    await brackets();
    await power();
    await definition();
    await ui.say("elder", "Endi oʻzing hisobla: kod nima chiqaradi?");
    await practice.exercises({
      next: (prev, correct, tier) => L.orderTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: (task) => "Tartibni toʻgʻri topding: " + task.hint + ".",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
