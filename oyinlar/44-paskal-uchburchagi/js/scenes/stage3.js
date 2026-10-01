// 3-bosqich: uchburchakni dastur quradi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function kodKorsat() {
    const kod = L.qatorKod(5);
    const host = common.box(true);
    host.append(common.note("Dastur ham xuddi shunday quradi: har safar yangi qator yasaydi."));
    host.append(U.codeBlock(kod));
    const chiqish = U.output({ title: "Chiqish" });
    host.append(chiqish.el);
    await ui.say("elder", "Ichki sikl qoʻshni ikki sonni qoʻshadi, chekkalariga 1 qoʻyiladi.");
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", () => {
      chiqish.show(QK.kod.run(kod));
      ui.clearControl();
      done();
    }, "big")));
    await ui.say("elder", "Katta sonlar ham sigʻadi: bizning Pythonda son cheklanmagan.");
  }

  function keyingi(prev, togri) {
    return togri % 2 === 0 ? L.kodTask(Math.random, prev) : L.writeTask(Math.random, prev);
  }

  async function stage3() {
    await kodKorsat();
    await ui.say("elder", "Endi oʻzing: kodni oʻqiysan, keyin yozasan.");
    await practice.exercises({
      next: (prev, togri) => keyingi(prev, togri),
      run: (task) => (task.tur === "yoz" ? common.yozishExercise(task) : common.kodExercise(task)),
      praise: (task) => (task.tur === "yoz" ? "Qator toʻgʻri qurildi." : task.hisob),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
