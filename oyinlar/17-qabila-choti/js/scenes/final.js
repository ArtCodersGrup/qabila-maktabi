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
    const NEXT = { 1: "asos va raqamlar, tizim turlari.", 2: "xona vaznlari: 1, b, b², …" };
    await ui.say("elder", goingOn && NEXT[s] ? `${s}-bosqich tugadi. Keyingisi — ${NEXT[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: sonning asosini, raqamlarini va xona vaznlarini aniqlay olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.abacus() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Asos b — nechtada keyingi xonaga oʻtiladi" }),
        ui.h("div", { text: "b-likda raqamlar: 0 … b−1" }),
        ui.h("div", { text: "Xona vaznlari: 1, b, b², b³ …" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
