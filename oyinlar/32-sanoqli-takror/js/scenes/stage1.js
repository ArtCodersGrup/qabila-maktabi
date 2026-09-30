// Kirish va 1-bosqich: Python sanaydi — for va range (DIZAYN 5-bo'lim).
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

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.steps(5, 5) }));
    await ui.say("elder", "Zinapoyada besh zina bor. Har biriga bir marta qadam qoʻyasan.");
    await ui.say("elder", "Nechta zina borligi maʼlum boʻlsa, sanashni Pythonning oʻziga topshirsa boʻladi.");
  }

  async function compare() {
    const el = common.box();
    el.append(common.note("Bir xil ishni bajaradigan ikki kod:"));
    withOutput(el, "i = 0\nwhile i < 3:\n    print(i)\n    i += 1");
    withOutput(el, "for i in range(3):\n    print(i)");
    await ui.say("elder", "Ikkalasi ham 0, 1, 2 chiqardi. Lekin for qisqaroq.");
    await ui.say("elder", "for da hisoblagichni oshirish esdan chiqmaydi — Python oʻzi sanaydi.");
  }

  async function bounds() {
    const el = common.box();
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.steps(5, 5) }));
    withOutput(el, "for i in range(5):\n    print(i)");
    await ui.say("elder", "Besh marta aylandi, lekin sonlar 0 dan 4 gacha.");
    await ui.say("elder", "range(5) — beshta son, boshi 0. Beshning oʻzi kirmaydi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "for i in range(n):" }),
      ui.h("div", { class: "formula-row", text: "n marta aylanadi" }),
      ui.h("div", { class: "formula-row", text: "i — 0 dan n−1 gacha" })));
    await ui.say("elder", "Endi oʻzing ayt: sikl nima chiqaradi?");
  }

  async function stage1() {
    await compare();
    await bounds();
    await definition();
    await practice.exercises({
      next: (prev) => L.rangeTask(Math.random, prev),
      run: (task) => common.resultExercise(task),
      praise: () => "Sanoqni toʻgʻri topding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
