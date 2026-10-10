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
    await ui.say("elder", goingOn
      ? `${s}-bosqich tugadi. Keyingisi — ${s === 1 ? "amallar zanjiri" : "yarim qoʻshuvchi"}.`
      : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: XOR jadvalini bilasan va yarim qoʻshuvchi ikki bitni qanday qoʻshishini tushuntira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.stairs() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "A XOR B = 1 — A va B har xil" }),
        ui.h("div", { text: "Sxema — amallar zanjiri" }),
        ui.h("div", { text: "Yigʻindi = A XOR B, koʻchirish = A VA B" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
