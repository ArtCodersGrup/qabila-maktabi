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
    ui.bubble("elder", "Tabriklayman! Endi paket qaysi yoʻldan yurishini va sayt qanday ochilishini bilasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.pochta() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Paket tugundan tugunga oʻtadi — bu marshrut" }),
        ui.h("div", { text: "Sim uzilsa — boshqa yoʻl topiladi" }),
        ui.h("div", { text: "Mijoz soʻraydi, server fayllarni birma-bir yuboradi" }),
        ui.h("div", { class: "py-haqiqat", text: "Haqiqatda bundan murakkabroq: tugunlar — routerlar, yoʻlni ular oʻzaro kelishib tanlaydi." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
