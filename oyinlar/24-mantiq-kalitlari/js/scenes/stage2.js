// 2-bosqich: YOKI — kamida bittasi (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logicUi, common } = QK;

  async function example() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "emoji-row", text: "🔑 YOKI 🛡️" }));
    await ui.say("elder", "Darvoza ochiladi, agar kaliting bor YOKI qoʻriqchi seni taniydi.");
    await ui.say("elder", "Ikkalasi ham boʻlsa — darvoza baribir ochiladi.");
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
    await ui.say("elder", "YOKI — kamida bittasi rost boʻlsa, rost. Ikkalasi ham yolgʻon boʻlsa — yolgʻon.");
    await ui.say("elder", "Ketma-ket ulangan kalitlar — VA, parallel ulangani — YOKI.");
  }

  async function stage2() {
    await common.explore({ op: "or", intro: "Bu sxemada tok uchun ikki yoʻl bor. Kalitlarni bos — chiroq qachon yonadi?" });
    await ui.say("elder", "Chiroq kamida bitta kalit ulanganda yondi. Ikkalasi ham ulansa — baribir yonadi.");
    await ui.say("elder", "Bu — YOKI amali. A YOKI B — kamida bittasi 1 boʻlsa, 1.");
    await ui.say("elder", "Diqqat: gapda «choy yoki kompot» — bittasi degani. Mantiqda YOKI — ikkalasi ham boʻlsa ham rost.");
    await example();
    await definition();
    await ui.say("elder", "Endi VA va YOKI aralash. 3 ta toʻgʻri javob!");
    await common.exercises(2);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
