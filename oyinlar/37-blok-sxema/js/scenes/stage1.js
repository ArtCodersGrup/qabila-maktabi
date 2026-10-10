// Kirish va 1-bosqich: blok-sxema belgilari (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, sxemaUi: SU, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.sxema() }));
    await ui.say("elder", "Maqsad: blok-sxema — algoritmni grafik koʻrinishda yozish, oʻqish va kodga oʻgirish.");
    await ui.say("elder", "Kalit gʻoya: har shakl bitta amal turini bildiradi, oʻqlar bajarilish tartibini koʻrsatadi. Sxemani dasturlash tilini bilmagan odam ham oʻqiydi.");
  }

  async function belgilar() {
    const namuna = [
      { tur: "kirit", nom: "n ni kiritish" },
      { tur: "amal", nom: "s ← n × n" },
      { tur: "shart", nom: "s > 100 mi?", ha: [{ tur: "chiqar", nom: "“katta” deb yozish" }], yoq: [{ tur: "chiqar", nom: "s ni chiqarish" }] },
    ];
    const el = common.box(true);
    el.append(common.note("Toʻliq sxema namunasi. Shakllarga qara:"));
    el.append(ui.h("div", { class: "sx-namuna" }, SU.chiz(namuna)));
    await ui.say("elder", "Oval — boshi va oxiri. Qiyshiq toʻrtburchak — kiritish va chiqarish.");
    await ui.say("elder", "Oddiy toʻrtburchak — amal. Romb — shart: undan ikki yoʻl chiqadi, “ha” va “yoʻq”.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "Oval — boshlash va tugash" }),
      ui.h("div", { class: "formula-row", text: "Qiyshiq toʻrtburchak — kiritish va chiqarish" }),
      ui.h("div", { class: "formula-row", text: "Toʻrtburchak — amal" }),
      ui.h("div", { class: "formula-row", text: "Romb — shart (ha / yoʻq)" })));
    await ui.say("elder", "Mashq: shakl nimani bildirishini tanla.");
  }

  async function stage1() {
    await belgilar();
    await definition();
    await practice.exercises({
      // Belgilar — yod olish mashqi: 2 ta toʻgʻri javob yetadi (2026-10-02), asosiy mashq — yigʻish va oʻqish
      need: 2,
      next: (prev, correct, tier) => L.belgiTask(Math.random, prev, tier),
      run: (task) => common.belgiExercise(task),
      praise: () => "Toʻgʻri.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
