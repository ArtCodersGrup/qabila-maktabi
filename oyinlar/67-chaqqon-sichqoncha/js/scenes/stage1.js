// Kirish va 1-bosqich: ko'rsatkich va chap tugma — nishonni bosish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    await common.qurilma();
    const el = common.box(false);
    el.append(h("div", { class: "story-art sichqon", html: QK.gameArt.sichqoncha("") }));
    await ui.say("elder", "Qabilaga kompyuter keldi! Mana bu — uning sichqonchasi.");
    await ui.say("apprentice", "Uni birinchi marta ushlayapman. Menga oʻrgat!");
  }

  // Avval bola o'zi bosadi (bitta olma), nomlar keyin aytiladi (QOIDALAR 4.1)
  function bosdir() {
    const el = common.box(true);
    ui.bubble("elder", "Sichqonchani sur — ekranda oʻqcha yuradi. Oʻqchani olmaga olib bor va rasmda belgilangan tugmani bos.");
    return ui.settle((done) => {
      const m = common.terMaydoni(L.korsatTer(), {
        terildi() {
          m.yop();
          done();
        },
        chalgituvchi() {},
      }, "chap");
      el.append(m.el);
    });
  }

  async function korsat() {
    await bosdir();
    QK.sound.play("correct");
    await ui.sleep(350); // olma yo'qolib bo'lsin
    const el = common.box(false);
    el.append(h("div", { class: "cs-juft" },
      h("div", { class: "story-art kichik", html: QK.gameArt.korsatkich() }),
      h("div", { class: "story-art sichqon", html: QK.gameArt.sichqoncha("chap") })));
    await ui.say("elder", "✓ Sen hozir bosding! Ekrandagi oʻqcha — koʻrsatkich.");
    await ui.say("elder", "Bosgan tugmang — chap tugma. U koʻrsatkich barmogʻing ostida turadi.");
    await ui.say("elder", "Endi mashq. Faqat aytilgan narsalarni bos, boshqasiga tegma.");
  }

  async function stage1() {
    await common.qurilma();
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
