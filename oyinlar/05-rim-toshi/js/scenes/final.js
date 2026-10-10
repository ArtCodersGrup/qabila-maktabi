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
    const next = { 1: "Rimcha qoʻshish va ayirish", 2: "pozitsion tizim" }[s];
    const text = goingOn && next ? `${s}-bosqich tugadi. Keyingisi — ${next}.` : `${s}-bosqich tugadi.`;
    await ui.say("elder", text);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: Rim raqamlarini oʻqiy va yoza olasan, pozitsion tizimni nopozitsiondan ajrata olasan.");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { text: "I V X L C — 1 5 10 50 100" }),
      ui.h("div", { text: "Kichik belgi oldinda — ayiriladi: IV\u00A0=\u00A04" }),
      ui.h("div", { text: "Pozitsion: 352 = 3·100 + 5·10 + 2" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
