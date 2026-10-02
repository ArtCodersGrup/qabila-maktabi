// 3-bosqich: dastur qutilarni sanaydi — va nega sinab ko'rish mumkin emasligi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function kodKorsat() {
    const kod = L.qutiKod([3, 7, 11, 2, 9, 14, 5], 5);
    const host = common.box(true);
    host.append(common.note("Dastur qoldiqlar boʻyicha qutilarga taqsimlaydi:"));
    host.append(U.codeBlock(kod));
    const chiqish = U.output({ title: "Chiqish" });
    host.append(chiqish.el);
    await ui.say("elder", "7 ta son, 5 ta quti. Dirixle nima deydi?");
    await ui.say("elder", "Kamida bitta qutida 2 ta boʻlishi kerak. Dastur tekshirsin.");
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", () => {
      chiqish.show(QK.kod.run(kod));
      ui.clearControl();
      done();
    }, "big")));
    await ui.say("elder", "Toʻgʻri chiqdi. Lekin bu bitta misol — isbot emas.");
  }

  // Blokning yopiluvchi fikri: sinab ko'rish mumkin emas, shuning uchun isbot kerak
  async function negaIsbot() {
    const el = common.box(false);
    el.append(common.sinovJadval(L.SINOV));
    await ui.say("apprentice", "Hamma joylashuvni sinab koʻrsak boʻlmaydimi?");
    await ui.say("elder", "Jadvalga qara. 20 ta narsa, 10 ta quti — joylashuvlar soni 20 xonali son.");
    await ui.say("elder", "Dunyodagi hamma kompyuter ham sinab ulgurmaydi. Isbot esa bir qatorda tugaydi.");
    await ui.say("elder", "Kombinatorika shu uchun kerak: sanab boʻlmaydigan narsani hisoblab aytish.");
  }

  function keyingi(prev, togri, tier) {
    return togri % 2 === 0 ? L.kodTask(Math.random, prev, tier) : L.writeTask(Math.random, prev, tier);
  }

  async function stage3() {
    await kodKorsat();
    await negaIsbot();
    await ui.say("elder", "Oxirgi mashq: kodni oʻqiysan, keyin yozasan.");
    await practice.exercises({
      next: (prev, togri, tier) => keyingi(prev, togri, tier),
      run: (task) => (task.tur === "yoz" ? common.yozishExercise(task) : common.kodExercise(task)),
      praise: (task) => (task.tur === "yoz" ? "Funksiya toʻgʻri ishladi." : task.hisob),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
