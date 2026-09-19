// Bosqich tugashi va tabrik ekrani. 3-o'yinda finale yo'q.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.raisePaper(false);
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
    ui.closeGuide();
    ui.raisePaper(false);
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi sen Sezar shifrini bilasan!");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { text: "Kalit — sir" }),
      ui.h("div", { text: "Shifrlash — oldinga, ochish — orqaga" }),
      ui.h("div", { text: "Kalit kam boʻlsa — shifrni sinab ochish mumkin" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
