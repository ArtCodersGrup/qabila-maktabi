// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, common } = QK;

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
    ui.bubble("elder", "Tabriklayman! Endi ekran va oynalarni oʻzing boshqara olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.kompyuter(true) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Belgini ikki marta tez bossang — dastur ochiladi" }),
        common.sxema(),
        ui.h("div", { text: "Kichraytirilgan oyna panelda turadi, yopilgani — yoʻq" }),
        ui.h("div", { text: "Eng oldindagi oyna — faol oyna" }),
        ui.h("div", { text: "«Pusk» menyusida hamma dastur bor" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
