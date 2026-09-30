// Kirish va 1-bosqich: bo'lishning ikki natijasi — // va % (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.share(17, 5) }));
    await ui.say("elder", "17 ta toshni 5 bolaga teng boʻldik. Har biriga 3 tadan tegdi.");
    await ui.say("elder", "Ikkitasi ortdi — ularni teng boʻlib boʻlmaydi.");
    await ui.say("apprentice", "Demak boʻlishning ikkita javobi bor ekan.");
    await ui.say("elder", "Ha. Pythonda ham shunday: bittasi — nechtadan, ikkinchisi — nechtasi ortdi.");
  }

  async function twoResults() {
    const code = "print(17 // 5)\nprint(17 % 5)";
    const el = common.box();
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.share(17, 5) }));
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "Ikki chiziq (//) — nechtadan tegdi. Foiz belgisi (%) — nechtasi ortdi.");
  }

  async function slashIsFloat() {
    const code = "print(17 / 5)\nprint(4 / 2)";
    const el = common.box();
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "Bitta chiziq (/) esa doim kasr beradi — teng boʻlinganda ham.");
    await ui.say("elder", "Shuning uchun 4 / 2 javobi 2 emas, 2.0 boʻldi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "17 // 5  →  3   (nechtadan)" }),
      ui.h("div", { class: "formula-row kod", text: "17 % 5   →  2   (nechtasi ortdi)" }),
      ui.h("div", { class: "formula-row kod", text: "17 / 5   →  3.4 (kasr)" })));
    await ui.say("elder", "Uchalasi ham boʻlish, lekin javoblari boshqa-boshqa.");
  }

  async function stage1() {
    await twoResults();
    await slashIsFloat();
    await definition();
    await ui.say("elder", "Endi oʻzing hisobla. 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev) => L.divisionTask(Math.random, prev),
      run: (task) => common.resultExercise(task),
      praise: () => "Toʻgʻri boʻlding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
