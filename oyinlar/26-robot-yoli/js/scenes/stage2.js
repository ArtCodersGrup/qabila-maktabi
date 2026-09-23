// 2-bosqich: tartib muhim — bir xil buyruqlar, boshqa tartib (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, dastur: D, logic: L, common } = QK;

  // Tayyor dasturni bitta tugma bilan ishga tushirish (bola yozmaydi — kuzatadi)
  function runOnce(view, list, field, program) {
    return ui.settle((done) => {
      ui.clearControl();
      ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
        ui.clearControl();
        await common.execute(view, list, field, program);
        done();
      }));
    });
  }

  // 6.1: bir xil to'rt buyruq, ikki xil tartib
  async function demo() {
    const field = D.field(L.DEMO.field);
    const { view, list } = common.board(field);
    list.set(L.DEMO.bad);
    list.lock(true);
    ui.bubble("elder", "Bu dasturni men yozdim. Maydonda tosh bor — ishga tushir!");
    await runOnce(view, list, field, L.DEMO.bad);
    await ui.say("elder", "Tosh! Robot undan oʻtolmadi va shu yerda toʻxtadi.");
    common.reset(view, list, field);
    list.set(L.DEMO.good);
    list.lock(true);
    ui.bubble("elder", "Buyruqlar oʻsha: ikkita ⬆ va ikkita ➡. Faqat tartibi boshqa. Sinab koʻr!");
    await runOnce(view, list, field, L.DEMO.good);
    await ui.say("elder", "Bu safar robot toshni aylanib oʻtdi va gulxanga yetdi.");
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["➡ ➡ ⬆ ⬆ — toshga urildi", "⬆ ⬆ ➡ ➡ — gulxanga yetdi", "Bir xil buyruqlar, boshqa tartib"]);
    await ui.say("elder", "Buyruqlar bir xil edi — natija boshqa boʻldi.");
    await ui.say("elder", "Tartib ham algoritmning bir qismi.");
  }

  async function stage2() {
    await demo();
    await definition();
    await ui.say("elder", "Endi toshli maydonlar. Robotni gulxangacha olib bor!");
    await common.exercises(2);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
