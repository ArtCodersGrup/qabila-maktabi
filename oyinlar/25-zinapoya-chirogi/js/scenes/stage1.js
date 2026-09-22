// Kirish va 1-bosqich: faqat bittasi — XOR (DIZAYN 4–5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, gatesUi, common } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.stairs() }));
    await ui.say("apprentice", "Zinapoya chirogʻini pastda yoqdim, tepaga chiqib oʻchirdim!");
    await ui.say("apprentice", "Qanday qilib? Ikkita kalit bor-ku.");
    await ui.say("elder", "Bu — yangi mantiq amali. Sinab koʻramiz.");
  }

  // 5.4: ta'rif — YOKI va XOR yonma-yon, farqi 1 1 qatorida
  async function definition() {
    const el = common.box(false);
    const row = ui.h("div", { class: "three" });
    common.opTable(row, "or").mark([3]);
    common.opTable(row, "xor").mark([3]);
    el.append(row);
    common.formula(el, ["XOR — faqat bittasi", "A va B har xil → 1, bir xil → 0"]);
    await ui.say("elder", "Farqi — 1 1 qatorida: YOKI — 1, XOR — 0.");
    await ui.say("elder", "Zinapoya chirogʻi — XOR: har bosish chiroqni almashtiradi.");
  }

  async function stage1() {
    await common.explore({
      view: (host) => {
        const v = gatesUi.stairView(host);
        return { show: (a, b) => v.set({ a, b }) };
      },
      out: (a, b) => a ^ b,
      heads: ["A", "B", "Chiroq"],
      subs: true, // zinapoya kaliti uzilmaydi — faqat bosiladi
      intro: "Sen pastdasan. Pastki kalit A bilan chiroqni yoq.",
      steps: [
        { until: (s) => (s.a ^ s.b) === 1, say: "✓ Yondi! Endi tepaga chiqding. Boshqa kalit bilan chiroqni oʻchir.", retry: "Bitta kalitni bos — chiroq yonadi." },
        { until: (s) => s.a === 1 && s.b === 1, say: "✓ Oʻchdi! Ikkala kalit ham bosilgan. Qolgan holatni ham sinab koʻr.", retry: "Birinchi kalitga tegmay, ikkinchisini bos." },
      ],
    });
    await ui.say("elder", "Chiroq faqat bitta kalit bosilganda yondi. Ikkalasi ham bosilsa — oʻchdi!");
    await ui.say("elder", "Bu — XOR: «faqat bittasi». A va B har xil — 1, bir xil — 0.");
    await definition();
    await ui.say("elder", "Endi oʻzing oʻyla. 3 ta toʻgʻri javob!");
    await common.exercises(1);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
