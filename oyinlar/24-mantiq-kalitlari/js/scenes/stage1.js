// Kirish va 1-bosqich: VA — ikkalasi ham (DIZAYN 4–5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logicUi, common } = QK;

  async function intro() {
    const el = common.box(false);
    logicUi.circuitView(el, "series").set({ a: 0, b: 0, lamp: "off" });
    await ui.say("elder", "Maqsad: mantiqiy amallar VA, YOKI, EMAS va rostlik jadvali.");
    await ui.say("elder", "1 — rost (kalit ulangan, chiroq yonadi), 0 — yolgʻon. Kalitli sxema — mantiqiy amalning modeli.");
  }

  // 5.3: hayotiy misol
  async function example() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "emoji-row", text: "⚽ VA ☀️" }));
    await ui.say("elder", "Misol: «toʻp bor VA havo yaxshi» — shunda futbol boʻladi.");
    await ui.say("elder", "Shartlardan bittasi 0 boʻlsa, butun ifoda 0.");
  }

  // 5.4: ta'rif
  async function definition() {
    const el = common.box(false);
    logicUi.opTable(el, "and", { filled: true }).mark([3]);
    common.formula(el, ["1 — rost, 0 — yolgʻon", "A VA B = 1 — faqat A = 1 va B = 1 boʻlsa"]);
    await ui.say("elder", "VA: ikkala shart rost boʻlsa — rost, aks holda yolgʻon.");
  }

  async function stage1() {
    await common.explore({ op: "and", intro: "Kalitlarni bos va chiroqni kuzat. Rostlik jadvali oʻzi toʻladi." });
    await ui.say("elder", "Chiroq faqat ikkala kalit ham ulanganda yondi.");
    await ui.say("elder", "Kalitlar ketma-ket: tok A dan ham, B dan ham oʻtadi. Bittasi uzilsa, zanjir uziladi.");
    await ui.say("elder", "Bu — VA amali: A VA B = 1 faqat A = 1 va B = 1 boʻlsa.");
    await example();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — jadvalni toʻldirish va B ni topish.`);
    await common.exercises(1);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
