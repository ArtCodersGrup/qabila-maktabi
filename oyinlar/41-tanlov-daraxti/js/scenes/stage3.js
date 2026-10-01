// 3-bosqich: formula va dastur bir-birini tekshiradi (ichma-ich sikl).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, sanash: S, common, practice } = QK;

  // Dastur hamma juftlikni sanaydi; formula esa bir amalda aytadi
  async function kodKorsat() {
    const kod = L.sanaKod(3, 2);
    const host = common.box(true);
    host.append(common.note("Dastur daraxtni chizmaydi — hamma juftlikni sanab chiqadi:"));
    host.append(U.codeBlock(kod));
    const chiqish = U.output({ title: "Chiqish" });
    host.append(chiqish.el);
    await ui.say("elder", "Ichki sikl tashqi siklning har aylanishida toʻliq aylanadi.");
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", () => {
      chiqish.show(QK.kod.run(kod));
      ui.clearControl();
      done();
    }, "big")));
    host.append(common.hisobQator("3 × 2 = 6 — formula ham, dastur ham"));
    await ui.say("elder", "Ikkalasi bir xil javob berdi. Formula — shunchaki tez yoʻl.");
    await ui.say("apprentice", "Unda nega formula kerak? Dastur ham sanaydi-ku.");
    await ui.say("elder", "10 xonali kod uchun dastur 10 milliard marta aylanadi. Formula esa darhol aytadi.");
  }

  // Mashqda ikki tur aralashadi: kodni o'qish va kod yozish
  function keyingi(prev, togri) {
    return togri % 2 === 0 ? L.kodTask(Math.random, prev) : L.writeTask(Math.random, prev);
  }

  async function stage3() {
    await kodKorsat();
    await ui.say("elder", "Endi oʻzing: avval kodni oʻqiysan, keyin yozasan.");
    await practice.exercises({
      next: (prev, togri) => keyingi(prev, togri),
      run: (task) => (task.tur === "yoz" ? common.yozishExercise(task) : common.kodExercise(task)),
      praise: (task) => (task.tur === "yoz" ? "Sikl toʻgʻri sanadi." : task.qiymat.join(" × ") + " = " + task.javob),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
