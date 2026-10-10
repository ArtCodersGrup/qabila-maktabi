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
    await ui.say("elder", "Maqsad: for sikli — takrorlar soni oldindan maʼlum boʻlganda.");
    await ui.say("elder", "Kalit gʻoya: range(n) 0 dan n−1 gacha sonlarni beradi, hisoblagichni Python oʻzi oshiradi. Xuddi zinalarni sanashdek.");
  }

  async function compare() {
    const el = common.box();
    el.append(common.note("Bir xil ishni bajaradigan ikki kod:"));
    withOutput(el, "i = 0\nwhile i < 3:\n    print(i)\n    i += 1");
    withOutput(el, "for i in range(3):\n    print(i)");
    await ui.say("elder", "Ikkalasi ham 0, 1, 2 chiqardi, lekin for qisqaroq.");
    await ui.say("elder", "for da i += 1 yozilmaydi — cheksiz sikl xavfi yoʻq.");
  }

  async function bounds() {
    const el = common.box();
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.steps(5, 5) }));
    withOutput(el, "for i in range(5):\n    print(i)");
    await ui.say("elder", "Sikl 5 marta aylandi, i esa 0 dan 4 gacha.");
    await ui.say("elder", "range(5) = 0, 1, 2, 3, 4 — beshta son, 5 ning oʻzi kirmaydi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "for i in range(n):" }),
      ui.h("div", { class: "formula-row", text: "n marta aylanadi" }),
      ui.h("div", { class: "formula-row", text: "i — 0 dan n−1 gacha" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Har biri nima chiqarishini aniqla.`);
  }

  async function stage1() {
    await compare();
    await bounds();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.rangeTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Toʻgʻri.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
