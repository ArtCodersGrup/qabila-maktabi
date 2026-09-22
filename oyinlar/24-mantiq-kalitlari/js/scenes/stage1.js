// Kirish va 1-bosqich: VA — ikkalasi ham (DIZAYN 4–5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logicUi, common } = QK;

  async function intro() {
    const el = common.box(false);
    logicUi.circuitView(el, "series").set({ a: 0, b: 0, lamp: "off" });
    await ui.say("elder", "Qabilamizga chiroq oʻrnatdik! U kalitlar bilan yonadi.");
    await ui.say("apprentice", "Qaysi kalitni bossam yonadi?");
    await ui.say("elder", "Sinab koʻramiz. Kalitlar qoidasi — mantiq deyiladi.");
  }

  // 5.3: hayotiy misol
  async function example() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "emoji-row", text: "⚽ VA ☀️" }));
    await ui.say("elder", "Futbol oʻynaymiz, agar toʻp bor VA havo yaxshi boʻlsa.");
    await ui.say("elder", "Bittasi boʻlmasa — oʻyin yoʻq.");
  }

  // 5.4: ta'rif
  async function definition() {
    const el = common.box(false);
    logicUi.opTable(el, "and", { filled: true }).mark([3]);
    common.formula(el, ["1 — rost, 0 — yolgʻon", "A VA B = 1 — faqat A = 1 va B = 1 boʻlsa"]);
    await ui.say("elder", "VA — ikkalasi ham rost boʻlsa, rost. Bittasi yolgʻon boʻlsa — yolgʻon.");
  }

  async function stage1() {
    await common.explore({ op: "and", intro: "Kalitlarni bos. Chiroq qachon yonadi? Jadval oʻzi toʻladi." });
    await ui.say("elder", "Chiroq faqat ikkala kalit ham ulanganda yondi.");
    await ui.say("elder", "Tok bitta yoʻldan oʻtadi: A dan ham, B dan ham. Bittasi uzilsa — yoʻl yopiq.");
    await ui.say("elder", "Bu — VA amali. A VA B — ikkalasi ham 1 boʻlsa, 1.");
    await example();
    await definition();
    await ui.say("elder", "Endi oʻzing oʻyla: chiroq yonadimi? 3 ta toʻgʻri javob!");
    await common.exercises(1);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
