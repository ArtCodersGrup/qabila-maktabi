// 3-bosqich: dasturni o'zi yozish — kod bir nechta qiymat bilan tekshiriladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const N = L.NAMUNALAR;

  async function report() {
    const el = common.box();
    common.withOutput(el, N.hisobot);
    await ui.say("elder", "Kichik hisobot: izoh maʼlumot manbaini aytadi, oʻzgaruvchilar qiymatni saqlaydi, print natijani chiqaradi.");
    await ui.say("elder", "Natija qoʻlda yozilmaydi — oʻzgaruvchilardan hisoblanadi: maʼlumot oʻzgarsa, hisobot oʻzi yangilanadi.");
  }

  async function stage3() {
    await report();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta dastur. Berilgan oʻzgaruvchi satrlarini oʻchirma: tekshiruv ularga boshqa qiymat qoʻyib ham ishga tushiradi.`);
    const seen = new Set();
    await practice.exercises({
      next: (prev, correct, tier) => {
        if (prev) seen.add(prev.id);
        return L.writeTask(Math.random, prev, tier, seen);
      },
      run: (task) => common.writeExercise(task),
      praise: (task) => (task.sets ? "Dastur hamma qiymatda toʻgʻri ishladi." : "Chiqish aynan mos."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
