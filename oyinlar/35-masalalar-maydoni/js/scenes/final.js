// Bosqich tugashi va tabrik ekrani.
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
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.tower(s) })));
    await ui.say("elder", goingOn
      ? `${s}-daraja tugadi! Keyingisi qiyinroq boʻladi.`
      : `${s}-daraja tugadi! Barakalla!`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Uchala darajani ham yakunlading!");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: QK.gameArt.tower(3) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Masalani oʻqib, kirish va chiqishni aniqlash" }),
        ui.h("div", { text: "Yechimni bir nechta sinovda tekshirish" }),
        ui.h("div", { text: "Bank katta — yana oʻynasang, yangi masalalar chiqadi" }))));
    return ui.choice([
      { label: "Yana masala yechish", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
