// 2-bosqich: diagramma oʻqish — ustunli, chiziqli, nuqtali; kesilgan oʻq (aldamchi diagramma).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  const KESILGAN = { tur: "ustun", nomlar: ["1-model", "2-model"], qiymatlar: [92, 96], y0: 90, y1: 100, qadam: 2, oq: "Aniqlik (%)", ikkiRang: true };
  const TOLIQ = { ...KESILGAN, y0: 0, qadam: 20 };

  async function korsat() {
    const el = common.box(true);
    let diag = common.diagramma(KESILGAN);
    el.append(diag);
    ui.bubble("elder", "Reklama: «2-model ancha aniqroq». Rasmda 2-model ustuni 1-modelnikidan necha marta baland?");
    const javob = await ui.choice([
      { label: "2 marta", value: 2, secondary: true },
      { label: "3 marta", value: 3, secondary: true },
      { label: "Deyarli teng", value: 1, secondary: true },
    ]);
    QK.sound.play(javob === 3 ? "correct" : "retry");
    ui.bubble("elder", (javob === 3 ? "✓ " : "↻ ") + "Rasmda — 3 marta. Endi chapdagi oʻqqa qara: u 0 dan emas, 90 dan boshlangan. Oʻqni toʻliq koʻrsat.");
    await ui.choice([{ label: "Oʻqni 0 dan boshlash", value: 1 }]);
    QK.sound.play("tap");
    const yangi = common.diagramma(TOLIQ);
    diag.replaceWith(yangi);
    diag = yangi;
    await ui.say("elder", "Haqiqiy qiymatlar — 92 va 96: farq 4 ta, xolos. Kesilgan oʻq (truncated axis) kichik farqni katta qilib koʻrsatadi — bu aldamchi diagramma.");
    diag.replaceWith(common.formula([
      "Ustunli (bar chart) — toifalarni solishtirish",
      "Chiziqli (line chart) — vaqt boʻyicha oʻzgarish",
      "Nuqtali (scatter plot) — ikki sonli belgi orasidagi bogʻliqlik",
    ]));
    await ui.say("elder", `Har diagrammada avval oʻqni oʻqi: nimadan boshlanadi, chiziqlar orasi qancha. Mashq: ${practice.need()} ta diagramma.`);
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
