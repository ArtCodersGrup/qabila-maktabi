// 3-bosqich: ikki buyruq — ★ va ●.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, practice } = QK;

  async function korsat() {
    const level = L.KORSATUV.ikki;
    const host = BU.box(true);
    host.append(BU.note("Yoʻlda ikki xil boʻlak: biri ★ ichida, biri ● ichida."));
    const maydon = BU.maydonlar(host, level.maydonlar);
    BU.quruvchi(host, { bloklar: level.bloklar, maxBlok: level.maxBlok, fn: level.yechimFn, dastur: level.yechim }).qulfla();
    await ui.say("elder", "Bu yoʻlda ikki xil boʻlak bor. Shuning uchun ikkita buyruq yasaymiz.");
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      await BU.yurgiz(maydon, level.yechim, level.yechimFn);
      done();
    }, "big")));
    await ui.say("elder", "● — ikkinchi buyruq. Har buyruqni bir marta yozasan, keraklicha chaqirasan.");
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      // tier 2 da asosiy dasturda chaqiruvlarni takror bilan qisqartirish ham kerak
      next: (prev, correct, tier) => L.yasa("ikki", prev, undefined, tier),
      run: (level) => BU.qurExercise(level),
      praise: () => "Ikki buyruq — ikki xil boʻlak.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
