// 2-bosqich: ★ ichini bola o'zi yig'adi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, practice } = QK;

  // Ko'rsatuv: ★ ichi bo'sh — bo'lak o'q-o'q bo'lib to'ladi, keyin dastur yuradi
  async function korsat() {
    const level = L.KORSATUV.tayyor;
    const naqsh = level.fn.yulduz;
    const host = BU.box(true);
    host.append(BU.note("★ ichiga yoʻldagi bitta boʻlak yigʻiladi."));
    const maydon = BU.maydonlar(host, level.maydonlar);
    const qur = BU.quruvchi(host, { bloklar: level.bloklar, maxBlok: level.maxBlok, fn: { yulduz: [] }, dastur: level.yechim });
    qur.qulfla();
    await ui.say("elder", "Endi ★ ichi boʻsh. Uni sen yasaysan.");
    for (let k = 1; k <= naqsh.length; k++) {
      qur.qoy(level.yechim, { yulduz: naqsh.slice(0, k) });
      await ui.sleep(450);
    }
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      await BU.yurgiz(maydon, level.yechim, level.fn);
      done();
    }, "big")));
    await ui.say("elder", "Avval ★ maydonini bosib, ichiga oʻqlarni qoʻy. Keyin asosiy dasturni yigʻ.");
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, correct, tier) => L.yasa("yasa", prev, undefined, tier),
      run: (level) => BU.qurExercise(level),
      praise: () => "★ ni oʻzing yasading!",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
