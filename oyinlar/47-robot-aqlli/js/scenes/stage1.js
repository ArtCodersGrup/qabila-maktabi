// Kirish va 1-bosqich: takror bloki.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.robot() }));
    await ui.say("elder", "Robotimiz yana yoʻlga chiqdi. Lekin bu safar yoʻl uzun.");
    await ui.say("apprentice", "Oʻngga, oʻngga, oʻngga, oʻngga… har safar shunchami?");
    await ui.say("elder", "Yoʻq. Bir marta yozib, «takror» blokiga solib qoʻyamiz.");
  }

  async function korsat() {
    const level = L.daraja("takror", 0);
    const host = common.box(true);
    host.append(common.note("Qara: toʻrtta «oʻngga» oʻrniga bitta takror bloki."));
    const maydon = common.maydonlar(host, level);
    const qur = common.quruvchi(host, level);
    for (const b of level.yechim) qur.dastur.push(JSON.parse(JSON.stringify(b)));
    qur.chiz();
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      await common.yurgiz(maydon, qur.dastur);
      done();
    }, "big")));
    await ui.say("elder", "Takror ichidagi buyruq necha marta yozilgan boʻlsa, shuncha bajariladi.");
    await ui.say("elder", "Endi oʻzing yigʻ: blokni bosib qoʻyasan, qayta bossang — oʻchadi.");
  }

  async function stage1() {
    await korsat();
    let k = 0;
    await practice.exercises({
      next: () => L.daraja("takror", k++),
      run: (level) => common.qurExercise(level),
      praise: () => "Takror bilan qisqa chiqdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
