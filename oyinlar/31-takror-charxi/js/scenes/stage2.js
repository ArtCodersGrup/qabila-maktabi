// 2-bosqich: yig'ib borish — yig'indi, sanoq va break.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function collect() {
    const code = "s = 0\ni = 1\nwhile i <= 5:\n    s = s + i\n    i += 1\nprint(s)";
    const el = common.box();
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: s oʻzgaruvchisi har aylanishda qanday oʻsishini kuzat.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "Yigʻuvchi oʻzgaruvchi sikldan oldin nolga tenglanadi: s = 0.");
    await ui.say("elder", "Sikl ichida unga qoʻshiladi, natija sikldan keyin chiqariladi.");
  }

  async function breakDemo() {
    const code = "i = 1\nwhile True:\n    if i * i > 50:\n        break\n    i += 1\nprint(i)";
    const el = common.box();
    el.append(common.note("while True — shart doim rost. Uni break toʻxtatadi."));
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "break siklni darrov toʻxtatadi: kvadrati 50 dan oshgan birinchi son topildi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "s = 0        ← sikldan oldin" }),
      ui.h("div", { class: "formula-row kod", text: "s = s + i    ← sikl ichida" }),
      ui.h("div", { class: "formula-row kod", text: "print(s)     ← sikldan keyin" })));
    await ui.say("elder", "Sanagich ham shu naqshda: soni = 0, sikl ichida soni += 1.");
  }

  async function stage2() {
    await collect();
    await breakDemo();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta dastur. Har biri nima chiqarishini aniqla.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.sumTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Natija toʻgʻri.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
