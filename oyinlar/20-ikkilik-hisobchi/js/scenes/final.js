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
    const NEXT = { 1: "ikkilikda ayirish va qarz.", 2: "ikkilikda koʻpaytirish: surish va qoʻshish." };
    await ui.say("elder", goingOn && NEXT[s] ? `${s}-bosqich tugadi. Keyingisi — ${NEXT[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: ikkilikda ustunda qoʻsha, ayira va koʻpaytira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.calc() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "1 + 1 = 10₂: 0 yoz, 1 koʻchir" }),
        ui.h("div", { text: "0 − 1: chapdan qarz, u 2 birlikka teng" }),
        ui.h("div", { text: "× 10₂ — chapga surish (oxiriga 0), qiymat × 2" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
