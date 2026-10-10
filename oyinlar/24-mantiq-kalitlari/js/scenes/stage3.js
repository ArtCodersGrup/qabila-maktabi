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
    await ui.say("elder", "Protsessor istalgan hisobni shu uch amaldan yigʻadi.");
  }

  // 7.5: hikoya
  async function story() {
    let el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.book() }));
    await ui.say("elder", "Qayerda uchraydi: 1854-yilda Jorj Bul rost va yolgʻon bilan hisoblash qoidalarini yozdi — bu «Bul algebrasi».");
    await ui.say("elder", "Dasturlash tillarida: VA — AND, YOKI — OR, EMAS — NOT.");
    el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.chip() }));
    await ui.say("elder", "1937-yilda Klod Shennon bu mantiqni elektr kalitlariga qoʻlladi.");
    await ui.say("elder", "Bugun protsessorda milliardlab tranzistor-kalit VA, YOKI, EMAS ni bajaradi.");
    el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.venn() }), ui.h("div", { class: "emoji-row", text: "🐱 VA 🐶" }));
    await ui.say("elder", "Qidiruvda «mushuk VA it» — ikkala soʻz bor sahifalar, «mushuk YOKI it» — kamida bittasi bor sahifalar.");
  }

  async function stage3() {
    await common.explore({ op: "not", intro: "Bu kalit teskari ishlaydi: ulansa, tok uziladi. Ikkala holatni sinab koʻr." });
    await ui.say("elder", "Bu — EMAS amali (inkor): 1 → 0, 0 → 1.");
    await ui.say("elder", "Misol: koʻcha chirogʻi «kun EMAS» boʻlganda yonadi.");
    const rain = L.LIFE.find((l) => l.id === "rain");
    await common.explore({ life: rain, intro: "Hayotiy qoida: yomgʻir va soyabon holatini almashtir. Qachon hoʻl boʻlasan?" });
    await ui.say("elder", "Hoʻl boʻlish faqat bitta holatda: yomgʻir = 1, soyabon = 0.");
    await ui.say("elder", `Ifoda: ${rain.expr}.`);
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — ifodalar va hayotiy qoidalar.`);
    await common.exercises(3);
    await story();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
