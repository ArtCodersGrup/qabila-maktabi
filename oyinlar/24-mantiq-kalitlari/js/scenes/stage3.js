// 3-bosqich: EMAS va birgalikda, hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, logic: L, logicUi, common } = QK;

  // 7.3: uch amal jadvali yonma-yon
  async function definition() {
    const el = common.box(false);
    const three = ui.h("div", { class: "three" });
    ["and", "or", "not"].forEach((op) => logicUi.opTable(three, op, { filled: true }));
    el.append(three);
    await ui.say("elder", "Uch amal: VA — ikkalasi ham, YOKI — kamida bittasi, EMAS — teskarisi.");
    await ui.say("elder", "Kompyuter hamma narsani shu uch amal bilan hisoblaydi.");
  }

  // 7.5: hikoya
  async function story() {
    let el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.book() }));
    await ui.say("elder", "170 yildan koʻproq oldin ingliz matematigi Jorj Bul rost va yolgʻon bilan hisoblashni oʻylab topdi.");
    await ui.say("elder", "Inglizchada VA — AND, YOKI — OR, EMAS — NOT.");
    el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.chip() }));
    await ui.say("elder", "80 yildan keyin bu mantiq elektr kalitlarida ishlatildi.");
    await ui.say("elder", "Kompyuter ichida milliardlab kichik kalitlar VA, YOKI, EMAS ni bajaradi.");
    el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.venn() }), ui.h("div", { class: "emoji-row", text: "🐱 VA 🐶" }));
    await ui.say("elder", "Internetda «mushuk VA it» deb qidirsang — ikkalasi bor sahifalar chiqadi.");
  }

  async function stage3() {
    await common.explore({ op: "not", intro: "Bu kalit teskari ishlaydi: bossang — tok uziladi. Sinab koʻr!" });
    await ui.say("elder", "Bu — EMAS amali: 1 → 0, 0 → 1. Hammasini teskari qiladi.");
    await ui.say("elder", "Koʻcha chirogʻi shunday: kun EMAS boʻlsa — yonadi.");
    const rain = L.LIFE.find((l) => l.id === "rain");
    await common.explore({ life: rain, intro: "Endi hayotiy qoida. Yomgʻir va soyabonni almashtir: qachon hoʻl boʻlasan?" });
    await ui.say("elder", "Faqat yomgʻir yogʻib, soyabon boʻlmaganda hoʻl boʻlding.");
    await ui.say("elder", `Buni shunday yozamiz: ${rain.expr}.`);
    await definition();
    await ui.say("elder", "Endi ifodalar va hayotiy qoidalar. 3 ta toʻgʻri javob!");
    await common.exercises(3);
    await story();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
