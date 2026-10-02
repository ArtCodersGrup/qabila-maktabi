// 2-bosqich: uchburchak aslida C(n,k) — va uning xossalari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sanash: S, common, practice } = QK;

  // O'tgan o'yindagi javob shu yerda ham chiqadi
  async function tanish() {
    const host = common.box(true);
    host.append(common.uchburchak({ belgi: { n: 5, k: 3 } }));
    await ui.say("elder", "Beshinchi qator, uchinchi son (0 dan sanaymiz). Nechaga teng?");
    const javob = await ui.choice([
      { label: "10", value: 10 },
      { label: "60", value: 60 },
      { label: "15", value: 15 },
    ]);
    if (javob !== 10) ui.toast("Uchburchakka qara: 1, 5, 10, 10, 5, 1 — uchinchisi 10.");
    await ui.say("elder", "Oʻtgan oʻyinda 5 boladan 3 kishilik jamoa nechta chiqqan edi?");
    await ui.say("apprentice", "10 ta edi! Bu — oʻsha son!");
    await ui.say("elder", "Ha. Uchburchakdagi har son — C(n, k). Boʻlishning hojati yoʻq.");
    const el = common.box(true);
    el.append(common.hisobQator("C(5, 3) = 10"));
    el.append(common.uchburchak({ belgi: { n: 5, k: 3 } }));
  }

  async function xossalar() {
    const el = common.box(false);
    el.append(common.xossaRoyxat());
    await ui.say("elder", "Uchburchak koʻp narsani oʻzi aytib turadi.");
    // Simmetriya
    const s = common.box(true);
    s.append(common.uchburchak({ chek: 6, diagonal: 2, simmetrik: true }));
    await ui.say("elder", "Chapdan ikkinchi va oʻngdan ikkinchi — bir xil. C(n, k) = C(n, n−k).");
    // Qator yig'indisi
    const y = common.box(true);
    y.append(common.uchburchak({ chek: 6, qator: 4 }));
    y.append(common.hisobQator("1 + 4 + 6 + 4 + 1 = 16 = 2⁴"));
    await ui.say("elder", "Har qatorning yigʻindisi — 2 ning darajasi: 4 ta narsadan 16 xil toʻplam.");
    // Juftliklar diagonali
    const d = common.box(true);
    d.append(common.uchburchak({ chek: 7, diagonal: 2 }));
    d.append(common.hisobQator("1, 3, 6, 10, 15, 21 — nechta juftlik"));
    await ui.say("elder", "Uchinchi qiyshiq qator — juftliklar soni: 5 kishi qoʻl berib koʻrishsa, 10 marta.");
  }

  function keyingi(prev, togri, tier) {
    return togri % 2 === 0 ? L.oqishTask(Math.random, prev, tier) : L.yigindiTask(Math.random, prev, tier);
  }

  async function stage2() {
    await tanish();
    await xossalar();
    await ui.say("elder", "Endi oʻzing uchburchakdan oʻqi.");
    await practice.exercises({
      next: (prev, togri, tier) => keyingi(prev, togri, tier),
      run: (task) => (task.tur === "yigindi" ? common.yigindiExercise(task) : common.oqishExercise(task)),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
