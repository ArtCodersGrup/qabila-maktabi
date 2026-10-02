// 2-bosqich: agar bloki — bitta dastur ikki xil maydonda.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  // Avval muammoni ko'rsatamiz: shartsiz dastur bir maydonda yiqiladi
  async function muammo() {
    const level = L.daraja("agar", 0);
    const host = common.box(true);
    host.append(common.note("Ikki maydon bir xil koʻrinadi, lekin birida tosh bor."));
    const maydon = common.maydonlar(host, level);
    const sodda = [L.yur("right"), L.yur("right")];
    const qur = common.quruvchi(host, level);
    for (const b of sodda) qur.dastur.push(b);
    qur.chiz();
    await ui.say("elder", "Shu dasturni ikkala maydonda ham ishlatib koʻraylik.");
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      await common.yurgiz(maydon, sodda);
      done();
    }, "big")));
    await ui.say("apprentice", "Ikkinchisida yetdi, birinchisida toshga urildi!");
    await ui.say("elder", "Demak robot oʻzi qarashi kerak: oldinda tosh bormi yoʻqmi.");
  }

  async function qoida() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "rb-qoida" },
      ui.h("div", { class: "rb-qoida-nom", text: "agar → boʻsh boʻlsa" }),
      ui.h("div", { text: "ha — birinchi roʻyxat bajariladi" }),
      ui.h("div", { text: "aks holda — ikkinchi roʻyxat" })));
    await ui.say("elder", "«Agar» bloki ikki yoʻlni saqlaydi, robot joyida turib qaysi birini tanlaydi.");
  }

  async function stage2() {
    await muammo();
    await qoida();
    await practice.exercises({
      // Har safar yangi maydon (generator); tier bilan yoʻl uzayadi va toshlar koʻpayadi
      next: (prev, correct, tier) => L.yasa("agar", prev, undefined, tier),
      run: (level) => common.qurExercise(level),
      praise: () => "Bitta dastur — ikkala maydonda ham ishladi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
