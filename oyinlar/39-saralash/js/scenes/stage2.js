// 2-bosqich: bir o'tishni oldindan aytish va pufakcha saralashni yozish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function korsat() {
    const kod = L.literal([5, 2, 9, 1]) + L.PUFAK_TANA;
    const el = common.box(true);
    el.append(common.note("Pufakcha saralash kodda shunday koʻrinadi:"));
    el.append(U.codeBlock(kod));
    const out = U.output({ title: "Chiqish (eng kichik va eng katta)" });
    out.lines(K.run(kod).output);
    el.append(out.el);
    await ui.say("elder", "Ichki sikl qoʻshnilarni solishtiradi, tashqi sikl oʻtishlarni sanaydi.");
    await ui.say("elder", "Har oʻtishdan keyin oxirgi qism tayyor boʻladi — shuning uchun oxir kamayib boradi.");
  }

  async function stage2() {
    await korsat();
    await ui.say("elder", "Endi oʻzing ayt: bitta oʻtishdan keyin roʻyxat qanday boʻladi?");
    await practice.exercises({
      next: (prev, correct, tier) => L.otishTask(Math.random, prev, tier),
      run: (task) => common.otishExercise(task),
      praise: () => "Oʻtishni toʻgʻri hisoblading.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
