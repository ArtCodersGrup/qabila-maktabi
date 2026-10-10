// 2-bosqich: natijani oldindan aytish — qo'shtirnoq bor-yo'qligi hammasini hal qiladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  // Ko'rsatish: uch buyruqli dastur qadam-baqadam bajariladi
  async function stepByStep() {
    const code = 'print("bir")\nprint("ikki")\nprint("uch")';
    const el = common.box();
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "«⏭ Qadam»ni bos: har bosishda bitta satr bajariladi.");
    await ui.settle((done) => {
      const next = ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big");
      ui.control().append(next);
    });
    await ui.say("elder", "Satrlar tartib bilan bajarildi: yuqoridan pastga.");
  }

  // Qo'shtirnoq: ichidagi — matn, tashqarisidagi — hisob
  async function quotesMatter() {
    const code = 'print(2 + 3)\nprint("2 + 3")';
    const el = common.box();
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "Qoʻshtirnoqsiz 2 + 3 — ifoda: Python uni hisoblaydi.");
    await ui.say("elder", "Qoʻshtirnoq ichida — matn (satr): u hisoblanmaydi, oʻzgarmay chiqadi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: 'print(2 + 3)  →  5' }),
      ui.h("div", { class: "formula-row kod", text: 'print("2 + 3")  →  2 + 3' }),
      ui.h("div", { class: "formula-row", text: "boʻsh print() — boʻsh satr" })));
    await ui.say("elder", "Kodni oʻqib natijani oldindan aytish — dasturchining asosiy koʻnikmasi.");
  }

  async function stage2() {
    await stepByStep();
    await quotesMatter();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod — ekranga nima chiqishini ayt.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.resultTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Kodni koʻzing bilan bajarding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
