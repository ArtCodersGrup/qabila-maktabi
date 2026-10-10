// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "parol izi (xesh) va kirish tekshiruvi.", 2: "bir xil parol xavfi va tuz." };

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
    ui.bubble("elder", "Tayyor: parol izini qoʻlda hisoblay olasan va tuz nega kerakligini tushuntira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.barmoq() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Bir tomonlama amal: oldinga oson, orqaga yoʻl yoʻq" }),
        ui.h("div", { text: "Sayt parolni emas, izini (xeshini) saqlaydi: iz = (iz · 3 + son) mod 100" }),
        ui.h("div", { text: "Tuz izni har saytda boshqa qiladi; parol ham har saytda boshqa boʻlsin" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
