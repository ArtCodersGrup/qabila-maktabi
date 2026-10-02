// 2-bosqich: chiziqli izlash — kodni o'qish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function korsat() {
    const kod = "a = [3, 7, 9, 12]\nx = 9\n" + L.CHIZIQLI_TANA;
    const el = common.box(true);
    el.append(common.note("Kompyuter roʻyxatdan sonni shunday izlaydi:"));
    el.append(U.codeBlock(kod));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(kod).output);
    el.append(out.el);
    await ui.say("elder", "Boshidan oxirigacha bitta-bitta qaraydi. Bu — chiziqli izlash.");
    await ui.say("elder", "Javob — sonning oʻrni (indeksi). Topilmasa −1 qoladi.");
  }

  async function topilmasa() {
    const kod = "a = [3, 7, 9, 12]\nx = 5\n" + L.CHIZIQLI_TANA;
    const el = common.box(true);
    el.append(U.codeBlock(kod));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(kod).output);
    el.append(out.el);
    await ui.say("elder", "5 roʻyxatda yoʻq — shuning uchun −1 chiqdi. Hamma elementni koʻrib chiqdi.");
  }

  async function stage2() {
    await korsat();
    await topilmasa();
    await ui.say("elder", "Endi oʻzing ayt: kod nima chiqaradi?");
    await practice.exercises({
      next: (prev, correct, tier) => L.oqishTask(Math.random, prev, tier),
      run: (task) => common.oqishExercise(task),
      praise: () => "Indeksni toʻgʻri topding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
