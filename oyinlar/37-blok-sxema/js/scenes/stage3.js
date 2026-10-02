// 3-bosqich: sxemani o'qish va yig'ish — navbat bilan.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sxemaUi: SU, logic: L, common, practice } = QK;

  async function korsat() {
    const sxema = [
      { tur: "amal", nom: "s ← 1", kod: "s = 1" },
      { tur: "sikl", nom: "3 marta takrorlash", kod: "for i in range(3)",
        tana: [{ tur: "amal", nom: "s ← s × 2", kod: "s = s * 2" }] },
      { tur: "chiqar", nom: "s ni chiqarish", kod: "print(s)" },
    ];
    const el = common.box(true);
    el.append(common.note("Takror bloki — yon tomoni qoʻshaloq. Ichidagi blok qayta-qayta bajariladi:"));
    el.append(ui.h("div", { class: "sx-namuna" }, SU.chiz(sxema)));
    await ui.say("elder", "s bir dan boshlanadi va uch marta ikkiga koʻpayadi. Nima chiqadi deb oʻylaysan?");
    await ui.say("elder", "1 → 2 → 4 → 8. Sxemani oʻqish — koʻz bilan bajarish demakdir.");
  }

  async function stage3() {
    await korsat();
    await ui.say("elder", "Endi navbat senga: goh sxemani oʻqiysan, goh oʻzing yigʻasan.");
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.tur === "qur" ? "Sxema ishladi." : "Sxemani toʻgʻri oʻqiding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
