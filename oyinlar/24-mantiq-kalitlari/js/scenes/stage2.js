// 2-bosqich: YOKI — kamida bittasi (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logicUi, common } = QK;

  async function example() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "emoji-row", text: "🔑 YOKI 🛡️" }));
    await ui.say("elder", "Misol: «kaliting bor YOKI qoʻriqchi seni taniydi» — darvoza ochiladi.");
    await ui.say("elder", "Ikkala shart rost boʻlsa ham natija 1.");
  }

  // 6.4: ta'rif — jadval va ikki sxema yonma-yon
  async function definition() {
    const el = common.box(false);
    logicUi.opTable(el, "or", { filled: true }).mark([1, 2, 3]);
    const both = ui.h("div", { class: "both" });
    [["series", "VA — ketma-ket"], ["parallel", "YOKI — parallel"]].forEach(([kind, title]) => {
      const cell = ui.h("div", { class: "both-cell" });
      logicUi.circuitView(cell, kind, { small: true }).set({ a: 1, b: 1, lamp: "on" });
      cell.append(ui.h("div", { class: "both-title", text: title }));
      both.append(cell);
    });
    el.append(both);
    await ui.say("elder", "YOKI: kamida bitta shart rost boʻlsa — rost; ikkalasi yolgʻon boʻlsa — yolgʻon.");
    await ui.say("elder", "Ketma-ket ulangan kalitlar — VA, parallel ulangan — YOKI.");
  }

  async function stage2() {
    await common.explore({ op: "or", intro: "Bu sxemada kalitlar parallel: tok uchun ikki yoʻl bor. Chiroq qachon yonadi?" });
    await ui.say("elder", "Chiroq kamida bitta kalit ulanganda yondi, ikkalasi ulanganda ham.");
    await ui.say("elder", "Bu — YOKI amali: A YOKI B = 1, agar kamida bittasi 1 boʻlsa.");
    await ui.say("elder", "Diqqat: kundalik gapda «choy yoki kompot» — bittasi. Mantiqda YOKI ikkalasi rost boʻlganda ham rost.");
    await example();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta, VA va YOKI aralash.`);
    await common.exercises(2);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
