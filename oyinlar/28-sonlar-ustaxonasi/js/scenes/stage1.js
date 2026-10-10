// Kirish va 1-bosqich: bo'lishning ikki natijasi — // va % (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.share(17, 5) }));
    await ui.say("elder", "Maqsad: Pythonda butun boʻlish (//), qoldiq (%), oddiy boʻlish (/) va amallar tartibi.");
    await ui.say("elder", "17 ta toshni 5 kishiga teng boʻlsak, har biriga 3 ta tegadi va 2 ta ortadi: boʻlinma va qoldiq.");
  }

  async function twoResults() {
    const code = "print(17 // 5)\nprint(17 % 5)";
    const el = common.box();
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.share(17, 5) }));
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "// — butun boʻlinma (nechtadan tegdi), % — qoldiq (nechtasi ortdi).");
  }

  async function slashIsFloat() {
    const code = "print(17 / 5)\nprint(4 / 2)";
    const el = common.box();
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "Bitta chiziq (/) doim kasr son (float) beradi — teng boʻlinganda ham.");
    await ui.say("elder", "Shuning uchun 4 / 2 natijasi 2 emas, 2.0.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "17 // 5  →  3   (butun boʻlinma)" }),
      ui.h("div", { class: "formula-row kod", text: "17 % 5   →  2   (qoldiq)" }),
      ui.h("div", { class: "formula-row kod", text: "17 / 5   →  3.4 (kasr)" })));
    await ui.say("elder", "Uchalasi ham boʻlish, natijalari esa har xil: butun boʻlinma, qoldiq, kasr.");
  }

  async function stage1() {
    await twoResults();
    await slashIsFloat();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta ifoda — natijasini hisobla.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.divisionTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Toʻgʻri boʻlding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
