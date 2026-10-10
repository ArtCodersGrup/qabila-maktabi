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
    const NEXT = { 1: "rangli piksellar: N = 2ⁱ.", 2: "RGB, megabayt va siqish." };
    await ui.say("elder", goingOn && NEXT[s] ? `${s}-bosqich tugadi. Keyingisi — ${NEXT[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: rasm hajmini bit, bayt va Mbaytda hisoblay olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.easel() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Oq-qora: 1 piksel = 1 bit" }),
        ui.h("div", { text: "N = 2ⁱ: i bit — N xil rang" }),
        ui.h("div", { text: "V = kenglik × balandlik × i (bit)" }),
        ui.h("div", { text: "RGB piksel = 3 bayt; 1 Mbayt = 1024 Kbayt" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
