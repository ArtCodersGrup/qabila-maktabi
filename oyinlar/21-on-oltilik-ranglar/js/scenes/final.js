// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    const NEXT = { 1: "16-likda qoʻshish va ayirish.", 2: "16-likda bir xonali songa koʻpaytirish." };
    await ui.say("elder", goingOn && NEXT[s] ? `${s}-bosqich tugadi. Keyingisi — ${NEXT[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: 2 ↔ 16 oʻtkaza, rang kodini oʻqiy va 16-likda hisoblay olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.painter() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "16 = 2⁴: 4 bit = 1 ta 16-lik raqam" }),
        ui.h("div", { text: "Ustun yigʻindisi ≥ 16 — 1 koʻchadi" }),
        ui.h("div", { text: "Qarz = 16 birlik; #RRGGBB — 3 bayt" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
