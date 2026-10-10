// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sound } = QK;

  const KEYINGI = { 1: "xatni toʻrt joydan tekshirish va manzil qoidasi.", 2: "vaziyatda toʻgʻri harakatni tanlash." };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: firibgar xatni belgilari va manzili boʻyicha taniy olasan va nima qilishni bilasan.");
    ui.work().append(ui.h("div", { class: "fx-story" },
      ui.h("div", { class: "fx-art small", html: QK.gameArt.qalqon() }),
      ui.h("div", { class: "fx-summary" }, ...L.QOIDALAR.map((q) => ui.h("div", { text: q })))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
