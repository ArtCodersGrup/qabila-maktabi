// 2-bosqich: Sezarga javobni shifrlash (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, caesarUi, common } = QK;

  async function stage2() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.paper("");
    await ui.say("elder", "Endi Sezarga javob yozamiz. Javob ham shifrlanadi!");
    const tbl = caesarUi.table(0, null);
    await ui.say("elder", "Oddiy harfni tepa qatordan top — pastdagisi shifr.");
    await common.exercises({
      mode: "encode",
      tbl,
      // Birinchi javob har doim XOʻP (kalit 3); keyin kalit o'sadi (1–6 → 7–14 → 15–28),
      // uchta shunday so'zdan keyin pastki qator yashirinadi — bola harfni o'zi oldinga suradi
      next: (prev, correct, tier) => (prev
        ? caesar.makePlanned(caesar.REPLIES, prev, Math.max(0, correct - 1), tier, 3)
        : { word: caesar.FIRST_REPLY, key: caesar.FIRST_KEY, blind: false }),
      question: (ex) => (ex.blind
        ? `Kalit — ${ex.key}. Pastki qator yashirin: «${ex.word}» ning har harfini ${ex.key} ta oldinga sur va shifr harfini bos.`
        : `Kalit — ${ex.key}. «${ex.word}» soʻzini shifrla.`),
      praise: (ex) => `Shifr tayyor: ${caesar.encrypt(caesar.tokenize(ex.word), ex.key).join("")}.`,
    });
    await ui.say("apprentice", "Javob Sezarga joʻnatildi!");
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
