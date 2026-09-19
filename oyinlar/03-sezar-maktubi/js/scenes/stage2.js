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
      count: 3,
      total: 3,
      doneBefore: 0,
      mode: "encode",
      tbl,
      // Birinchi javob har doim XOʻP (kalit 3), keyin tasodifiy
      next: (prev) => (prev ? caesar.makeExercise(caesar.REPLIES, prev) : { word: caesar.FIRST_REPLY, key: caesar.FIRST_KEY }),
      question: (ex) => `Kalit — ${ex.key}. «${ex.word}» soʻzini shifrla.`,
      praise: () => "Shifr tayyor!",
    });
    ui.hideProgress();
    await ui.say("apprentice", "Javob Sezarga joʻnatildi!");
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
