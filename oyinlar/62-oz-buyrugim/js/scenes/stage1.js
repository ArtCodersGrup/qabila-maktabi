// Kirish va 1-bosqich: tayyor ★ buyrug'i — asosiy dasturni ★ va o'qlar bilan yig'ish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blok: B, blokUi: BU, practice } = QK;

  async function intro() {
    const el = BU.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.yol() }));
    await ui.say("elder", "Robot yoʻlida bir xil boʻlak qayta-qayta keladi.");
    await ui.say("apprentice", "Har safar oʻsha oʻqlarni qaytadan yozamizmi?");
  }

  // Ko'rsatuv: avval faqat o'qlar — chegaraga sig'maydi; keyin ★ bilan qisqa dastur yuradi
  async function korsat() {
    const level = L.KORSATUV.tayyor;
    const oqlar = L.oqlarBilan(level);
    let host = BU.box(true);
    host.append(BU.note("Faqat oʻqlar bilan yozilgan dastur:"));
    BU.maydonlar(host, level.maydonlar);
    BU.quruvchi(host, { bloklar: level.bloklar, maxBlok: level.maxBlok, dastur: oqlar }).qulfla();
    await ui.say("elder", `Oʻqlar bilan ${B.soni(oqlar)} ta blok kerak, chegara esa ${level.maxBlok} ta. Sigʻmaydi!`);

    host = BU.box(true);
    host.append(BU.note("★ ichida bitta boʻlak. Dastur uni ikki marta chaqiradi."));
    const maydon = BU.maydonlar(host, level.maydonlar);
    BU.quruvchi(host, { bloklar: level.bloklar, maxBlok: level.maxBlok, fn: level.fn, qulf: level.qulf, dastur: level.yechim }).qulfla();
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      await BU.yurgiz(maydon, level.yechim, level.fn);
      done();
    }, "big")));
    await ui.say("elder", "★ — oʻzimiz yasagan yangi buyruq. Bir marta yozamiz, xohlagancha chaqiramiz.");
    await ui.say("elder", "★ tayyor. Endi oʻzing yigʻ: ★ va oʻqlarni bosib qoʻyasan.");
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      // Har safar yangi yo'l (generator); tier bilan ★ ko'proq marta keladi
      next: (prev, correct, tier) => L.yasa("tayyor", prev, undefined, tier),
      run: (level) => BU.qurExercise(level),
      praise: () => "★ bilan dastur qisqa chiqdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
