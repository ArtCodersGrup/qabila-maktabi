// 3-bosqich: dasturni o'qish va izdan tiklash, hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, sound, dastur: D, common } = QK;

  // 7.1: ko'rsatish — robot hali yurmagan, bola oldindan aytadi
  async function guidedRead() {
    const field = D.field({ robot: { x: 0, y: 4 }, goal: { x: 4, y: 0 } });
    const program = ["up", "up", "right"];
    const { view, list } = common.board(field);
    list.set(program);
    list.lock(true);
    const r = D.run(field, program);
    ui.bubble("elder", "Bu safar robot hali yurmadi. Ishga tushirmasdan ayt: qayerda toʻxtaydi? Katakni bos.");
    await ui.settle((done) => {
      let picked = null;
      view.pickCell((c) => { picked = c; });
      ui.control().append(ui.button("Tayyor ✓", async () => {
        if (!picked) {
          ui.toast("Avval katakni bos.");
          return;
        }
        const ok = D.sameCell(picked, r.at);
        ui.clearControl();
        view.clearMarks();
        ui.bubble("elder", "Endi robotni ishga tushiramiz — tekshiramiz.");
        await common.execute(view, list, field, program);
        view.mark(r.at, ok ? "ok" : "retry");
        sound.play(ok ? "correct" : "retry");
        ui.bubble("elder", ok ? "✓ Toʻppa-toʻgʻri! Robot aynan shu yerda toʻxtadi." : "Robot mana shu katakda toʻxtadi. Endi koʻrding.");
        setTimeout(done, 1200);
      }));
    });
  }

  // 7.4: hikoya
  async function story() {
    let el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.bookPen() }));
    await ui.say("elder", "«Algoritm» soʻzi Muhammad al-Xorazmiy nomidan kelib chiqqan (32-oʻyin).");
    await ui.say("elder", "Uning kitobidan butun dunyo hisob qoidalarini oʻrgangan.");
    el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.phone() }));
    await ui.say("elder", "Kompyuterga yozilgan algoritm — dastur deyiladi.");
    await ui.say("elder", "Telefondagi har bir ilova — kimdir yozgan dastur.");
    el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.roadMap() }));
    await ui.say("elder", "Kompyuter oʻzicha toʻgʻrilamaydi. Nima aytsang — shuni bajaradi.");
    await ui.say("elder", "Shuning uchun dastur aniq yozilishi kerak.");
  }

  async function stage3() {
    await guidedRead();
    await ui.say("elder", "Sen dasturni koʻzing bilan bajarding. Buni dasturni oʻqish deyiladi.");
    await ui.say("elder", "Dasturchilar ham shunday qiladi: yozadi, keyin koʻzi bilan tekshiradi.");
    await ui.say("elder", "Endi ikki xil savol boʻladi. 3 ta toʻgʻri javob!");
    await common.exercises(3);
    await story();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
