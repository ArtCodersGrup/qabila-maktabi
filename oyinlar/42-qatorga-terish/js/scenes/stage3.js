// 3-bosqich: kod bilan hisoblash va n! ning o'sishi (40-o'yin davomi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, sanash: S, common, practice } = QK;

  async function kodKorsat() {
    const kod = L.faktKod(5);
    const host = common.box(true);
    host.append(common.note("Faktorialni dastur ham hisoblaydi — sikl bilan:"));
    host.append(U.codeBlock(kod));
    const chiqish = U.output({ title: "Chiqish" });
    host.append(chiqish.el);
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", () => {
      chiqish.show(QK.kod.run(kod));
      ui.clearControl();
      done();
    }, "big")));
    await ui.say("elder", "Bizning Pythonda sonning kattaligi cheklanmagan — 23! ni ham aniq hisoblaydi.");
  }

  // n! qanchalik tez o'sishini ko'rish: 40-o'yindagi o'lchov shu yerda davom etadi
  async function osish() {
    const el = common.box(false);
    el.append(common.osishJadval(L.OSISH));
    await ui.say("elder", "10 ta kitobning hamma tartibini yozsak — 3 million yarim qator.");
    await ui.say("apprentice", "20 ta boʻlsa-chi?");
    await ui.say("elder", "Sonini bilamiz, lekin yozib chiqolmaymiz. 15-oʻyindagi gap shu edi: oʻsish hammasini hal qiladi.");
    await ui.say("elder", "Shuning uchun formula kerak: dastur sanab ulgurmaydi, formula darhol aytadi.");
  }

  function keyingi(prev, togri) {
    return togri % 2 === 0 ? L.kodTask(Math.random, prev) : L.writeTask(Math.random, prev);
  }

  async function stage3() {
    await kodKorsat();
    await osish();
    await ui.say("elder", "Endi oʻzing: kodni oʻqiysan, keyin yozasan.");
    await practice.exercises({
      next: (prev, togri) => keyingi(prev, togri),
      run: (task) => (task.tur === "yoz" ? common.yozishExercise(task) : common.kodExercise(task)),
      praise: (task) => (task.tur === "yoz" ? "Funksiya toʻgʻri hisobladi." : task.hisob),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
