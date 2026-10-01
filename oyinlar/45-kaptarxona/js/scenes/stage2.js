// 2-bosqich: teskari savol — kamida nechta olish kerak (eng yomon holat).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function paypoq() {
    const host = common.box(true);
    host.append(common.note("Qorongʻi xonada 3 xil rangdagi paypoqlar aralash yotibdi."));
    const joy = ui.h("div", {});
    host.append(joy);
    joy.append(common.yomonHolat(3, 2));
    await ui.say("elder", "Eng yomon holat: har rangdan bittadan chiqdi. Juft boʻldimi?");
    const javob = await ui.choice([
      { label: "Yoʻq, hammasi har xil", value: "yoq" },
      { label: "Ha, juft bor", value: "ha" },
    ]);
    if (javob !== "yoq") ui.toast("Uchtasi uch xil rang — hali juft yoʻq.");
    await ui.say("elder", "Endi yana bittasini olamiz. U albatta shu uch rangdan biri.");
    joy.innerHTML = "";
    joy.append(common.yomonHolat(3, 2));
    joy.append(common.hisobQator("3 × 1 + 1 = 4 ta yetadi"));
    await ui.say("elder", "Toʻrtinchisi albatta juft hosil qiladi. Koʻproq olishning hojati yoʻq.");
    await ui.say("apprentice", "Demak «eng yomon holatni» oʻylash kerak ekan.");
  }

  async function qoida() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "k × (m − 1) + 1" }),
      ui.h("div", { class: "formula-row", text: "k — nechta tur bor, m — nechta bir xili kerak" }),
      ui.h("div", { class: "formula-row", text: "3 rang, 2 ta bir xil → 3 × 1 + 1 = 4" })));
    await ui.say("elder", "Avval eng yomon holatni toʻldir, keyin bitta qoʻsh.");
  }

  async function stage2() {
    await paypoq();
    await qoida();
    await practice.exercises({
      next: (prev) => L.kerakTask(Math.random, prev),
      run: (task) => common.kerakExercise(task),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
