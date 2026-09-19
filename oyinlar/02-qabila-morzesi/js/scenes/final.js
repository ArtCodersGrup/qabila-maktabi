// Bosqich tugashi va tabrik ekrani (DIZAYN 7-bo'lim, yakun). 2-o'yinda finale yo'q.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, morseUi } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    morseUi.clearGuide();
    morseUi.stopPlaying();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    const text = goingOn
      ? `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`
      : `${s}-bosqich tugadi! Barakalla!`;
    await ui.say("elder", text);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    morseUi.clearGuide();
    morseUi.stopPlaying();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi sen Morzeda gaplasha olasan!");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { class: "summary-row" },
        morseUi.codeEl(".", true), ui.h("span", { text: "va" }), morseUi.codeEl("-", true),
        ui.h("span", { text: "— Morze alifbosi" })),
      ui.h("div", { class: "summary-row", text: "Eng koʻp ishlatiladigan harf — eng qisqa kod" }),
      ui.h("div", { class: "summary-row", text: "SOS — yordam signali" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
