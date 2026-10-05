// 2-bosqich: o'lcha va qaytar — robot toshgacha sanaydi, keyin shuncha yuradi (ikki maydon).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, practice } = QK;

  // Avval muammo: aniq sonli takror bir maydonda ishlaydi, ikkinchisida yo'q. Keyin qadam bilan — ikkalasida.
  async function muammo() {
    const k = L.KORSATUV.olcha;
    const host = BU.box(true);
    host.append(BU.note("Ikki maydon: toshgacha masofa har xil."));
    const maydon = BU.maydonlar(host, k.maydonlar);
    const q = BU.quti(host);
    const qur = BU.quruvchi(host, { dastur: k.sonli });
    qur.qulfla();
    const yurgizTugma = () => ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      await BU.yurgiz(maydon, qur.dastur, {}, q);
      done();
    }, "big")));
    await yurgizTugma();
    await ui.say("apprentice", "Ikkinchisida yetmadi! U yerda pastga 3 marta yurish kerak edi.");
    await ui.say("elder", "Robot toshgacha yurib sanadi-ku. Oʻsha sonni ishlatamiz: «takror qadam marta».");
    qur.qoy(k.yechim);
    await yurgizTugma();
    await ui.say("elder", "Bitta dastur ikkala maydonda ishladi. Robot sonni oʻzi oʻlchab, eslab qoldi.");
  }

  async function stage2() {
    await muammo();
    await practice.exercises({
      next: (prev, correct, tier) => L.yasa("olcha", prev, undefined, tier),
      run: (level) => BU.qurExercise(level),
      praise: () => "Robot sanadi va shuncha yurdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
