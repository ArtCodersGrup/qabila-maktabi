// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "sim uzilganda yangi marshrut.", 2: "mijoz va server." };

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
    ui.bubble("elder", "Tayyor: eng qisqa marshrutni topa olasan va sayt soʻrov–javob orqali qanday ochilishini tushuntira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.pochta() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Marshrut — paket tugundan tugunga oʻtgan yoʻl" }),
        ui.h("div", { text: "Sim uzilsa — zaxira yoʻl boʻyicha yangi marshrut" }),
        ui.h("div", { text: "Mijoz soʻrov yuboradi, server har faylni alohida javob qilib qaytaradi" }),
        ui.h("div", { class: "py-haqiqat", text: "Haqiqatda bundan murakkabroq: tugunlar — routerlar, yoʻlni ular oʻzaro kelishib tanlaydi." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
