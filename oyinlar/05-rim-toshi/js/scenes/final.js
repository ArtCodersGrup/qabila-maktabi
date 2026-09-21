// Bosqich tugashi va tabrik ekrani. 5-o'yinda finale yo'q — hikoya 3-bosqich ichida.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
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
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi sen Rim raqamlarini bilasan!");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { text: "I V X L C — 1 5 10 50 100" }),
      ui.h("div", { text: "Kichik belgi oldinda — ayiriladi: IV = 4" }),
      ui.h("div", { text: "Oddiy sonda raqam qiymati xonasiga bogʻliq" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
