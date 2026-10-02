// 2-bosqich: o'rinlashtirish — n tadan k tasi, tartib muhim.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sanash: S, common, practice } = QK;

  // Medallar: hamma yuguruvchi emas, faqat uchtasi o'ringa chiqadi
  async function medal() {
    const host = common.box(true);
    host.append(common.note("5 ta yuguruvchi, 3 ta medal. Oltin, kumush, bronza — kimga?"));
    const joy = ui.h("div", {});
    host.append(joy);
    const nomlar = ["Oltin", "Kumush", "Bronza"];
    for (let k = 1; k <= 3; k++) {
      joy.innerHTML = "";
      joy.append(common.qadamChiplar([5, 4, 3].slice(0, k), nomlar));
      ui.bubble("elder", k === 1
        ? "Oltinni 5 tadan har biri olishi mumkin."
        : "Oldingi medal egasi chiqib ketdi — " + (6 - k) + " ta nomzod qoldi.");
      await ui.settle((done) => ui.control().append(ui.button("Davom ▶︎", () => { ui.clearControl(); done(); })));
    }
    host.append(common.hisobQator("5 × 4 × 3 = 60"));
    await ui.say("elder", "Hammasi qatorga tursa 5! = 120 edi. Bu yerda faqat 3 ta oʻrin — 60.");
    await ui.say("apprentice", "Demak qolgan ikkitasini sanamaymiz?");
    await ui.say("elder", "Ha. Shuning uchun koʻpaytuvchilar soni — oʻrinlar soniga teng.");
  }

  async function qoida() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "A(n, k) = n × (n−1) × … (k ta koʻpaytuvchi)" }),
      ui.h("div", { class: "formula-row", text: "n tadan k tasi, tartib MUHIM" }),
      ui.h("div", { class: "formula-row", text: "k = n boʻlsa — bu oʻsha n!" })));
    await ui.say("elder", "Tartib muhim: oltin Anvarda, kumush Malikada — bu boshqa natija.");
  }

  async function stage2() {
    await medal();
    await qoida();
    await practice.exercises({
      next: (prev, correct, tier) => L.orinTask(Math.random, prev, tier),
      run: (task) => common.orinExercise(task),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
