// Kirish va 1-bosqich «Oʻqi»: Python matnini oʻqib, robot qayerda toʻxtashini topish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blok: B, blokUi: BU, common, practice } = QK;

  async function intro() {
    const el = BU.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.ikkiKorinish() }));
    await ui.say("elder", "Maqsad: dasturni Python matnida oʻqish, tuzatish va bloklarga oʻgirish.");
    await ui.say("elder", "Bloklar va Python — bitta dasturning ikki yozuvi: har blok — bitta qator.");
  }

  // Ko'rsatuv: bitta dastur — chapda bloklar, o'ngda Python matni; ishga tushiramiz
  async function korsat() {
    const k = L.KORSATUV.oqi;
    const host = BU.box(true);
    host.append(BU.note("Bitta dastur — ikki xil yozuv."));
    const m = common.maydon(host, k.f, false);
    const yon = common.ikki(host);
    const qur = BU.quruvchi(yon, { dastur: k.dastur });
    qur.qulfla();
    BU.pythonKod(yon).chiz(k.dastur);
    await ui.say("elder", "Chapda bloklar, oʻngda — xuddi shu dastur Python tilida.");
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      await common.yurKor(m, B.bajar(k.f, k.dastur), "ok");
      done();
    }, "big")));
    await ui.say("elder", "for i in range(3): — «3 marta takrorla». Takrorlanadigan qator 4 ta boʻsh joy bilan surilgan — bu otstup.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta dastur, faqat Python matni. Robot toʻxtaydigan katakni bos.`);
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      // Har safar yangi dastur va maydon; tier bilan agar/while, keyin ★ funksiya va qadam qo'shiladi
      next: (prev, correct, tier) => L.yasa("oqi", prev, undefined, tier),
      run: (level) => common.oqiExercise(level),
      praise: () => "Dasturni koʻzing bilan bajarding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
