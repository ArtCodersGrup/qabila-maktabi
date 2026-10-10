// 2-bosqich: Sezarga javobni shifrlash (DIZAYN 6-bo'lim). 2026-10-10: 5–8 ohangi, qog'ozsiz.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, caesarUi, common } = QK;

  async function stage2() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    await ui.say("elder", "Endi teskari amal — shifrlash: ochiq matndan shifr matn hosil qilamiz.");
    const tbl = caesarUi.table(0, null);
    await ui.say("elder", "Oddiy harfni jadvalning tepa qatoridan top — ostidagisi uning shifri.");
    await common.exercises({
      mode: "encode",
      tbl,
      // Birinchi javob har doim XOʻP (kalit 3); keyin kalit o'sadi (1–6 → 7–14 → 15–28),
      // uchta shunday so'zdan keyin pastki qator yashirinadi — bola harfni o'zi oldinga suradi
      next: (prev, correct, tier) => (prev
        ? caesar.makePlanned(caesar.REPLIES, prev, Math.max(0, correct - 1), tier, 3)
        : { word: caesar.FIRST_REPLY, key: caesar.FIRST_KEY, blind: false }),
      question: (ex) => (ex.blind
        ? `Kalit — ${ex.key}. Pastki qator yashirin: «${ex.word}» ning har harfini ${ex.key} qadam oldinga siljit va shifr harfini bos.`
        : `Kalit — ${ex.key}. «${ex.word}» soʻzini shifrla.`),
      praise: (ex) => `Shifr tayyor: ${caesar.encrypt(caesar.tokenize(ex.word), ex.key).join("")}.`,
    });
    await ui.say("elder", "Shifrlash va ochish — bitta kalit bilan. Bunday shifr simmetrik deyiladi.");
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
