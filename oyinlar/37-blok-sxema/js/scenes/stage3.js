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
    el.append(common.note("Sikl bloki — yon tomonlari qoʻshaloq. Ichidagi bloklar belgilangan marta takrorlanadi:"));
    el.append(ui.h("div", { class: "sx-namuna" }, SU.chiz(sxema)));
    await ui.say("elder", "s = 1 dan boshlanadi va 3 marta 2 ga koʻpaytiriladi. Natijani oldindan hisobla.");
    await ui.say("elder", "1 → 2 → 4 → 8, yaʼni 1 · 2³ = 8. Sxemani oʻqish — uni qadam-baqadam qoʻlda bajarish.");
  }

  async function stage3() {
    await korsat();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta topshiriq — sxemani oʻqish yoki yigʻish.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.tur === "qur" ? "Sxema ishladi." : "Toʻgʻri."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
