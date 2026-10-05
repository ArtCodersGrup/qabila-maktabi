// 3-bosqich: sudrab olib borish — bos, qo'yib yubormay sur, qo'yib yubor.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  // Bola o'zi sudraydi: bitta olma — bitta savat. Savatdan tashqariga tushsa — olma qaytadi, eslatma chiqadi.
  function sudrat() {
    const el = common.box(true);
    ui.bubble("elder", "Olmani savatga olib bor: ustida bos va qoʻyib yubormay sur.");
    return ui.settle((done) => {
      const m = common.sudraMaydoni(L.korsatSudra(), {
        joylandi() {
          m.yop();
          done();
        },
        notogri() {},
        tashqari() { ui.bubble("elder", "↻ Olmani savat ustiga olib bor, keyin qoʻyib yubor."); },
      }, "chap");
      el.append(m.el);
    });
  }

  async function korsat() {
    await sudrat();
    QK.sound.play("correct");
    await ui.say("elder", "✓ Sen hozir sudrab olib bording! Bos — qoʻyib yubormay sur — qoʻyib yubor.");
    await ui.say("apprentice", "Xuddi qoʻlim bilan koʻtarib olib borgandek!");
    await ui.say("elder", "Endi mashq. Har mevani oʻz savatiga olib bor.");
  }

  async function stage3() {
    await common.qurilma();
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
