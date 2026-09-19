// 2-bosqich: Morze bilan javob yozish va XAYR (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, morseUi, common } = QK;

  async function stage2() {
    const letters = morse.lettersUpTo(3);
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    await ui.say("elder", "Endi sen javob yozasan. Qabila yana yangi harflarni oʻrgandi!");
    morseUi.guide(letters, { fresh: morse.SETS[2] });
    await ui.say("elder", "Yozish uchun tugmalar: nuqta, chiziq, harf oraligʻi, oʻchirish va yuborish.");

    // 6.1: birgalikda misol — E
    ui.bubble("elder", "Sinab koʻr: E ni yoz va yubor.");
    const ok = await common.writeWord("E", letters);
    await ui.say("apprentice", ok ? "Men oʻqidim: E!" : "E — bitta nuqta. Endi bilasan!");

    await ui.say("elder", "Endi qabila savol beradi. 3 ta toʻgʻri javob yoz!");
    await common.writeExercises();

    // Yakun: qabila xayrlashadi (baholanmaydi)
    ui.bubble("apprentice", "Qabila xayrlashyapti. Oʻqib ber!");
    const read = await common.readMessage(morse.LAST_WORD, letters, "free");
    await ui.say("elder", read ? "Toʻgʻri: XAYR! Qabila senga rahmat aytadi." : "Bu — XAYR. Qabila senga rahmat aytadi.");
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
