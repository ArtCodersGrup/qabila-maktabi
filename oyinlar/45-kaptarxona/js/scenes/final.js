// Bosqich tugashi va tabrik ekrani (blokning oxirgi o'yini).
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
    await ui.say("elder", goingOn
      ? `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`
      : `${s}-bosqich tugadi! Barakalla!`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Kombinatorika blokini tugatding.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.kaptarxona() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "n ta narsa, k ta quti → kamida n ÷ k (yuqoriga)" }),
        ui.h("div", { text: "Kamida nechta kerak: k × (m − 1) + 1" }),
        ui.h("div", { text: "Sanab boʻlmaganini isbot aytadi" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
