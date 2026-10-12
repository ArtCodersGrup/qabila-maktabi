// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const KEYINGI = { 1: "xatoli funksiyani sinov bilan tuzatish", 2: "funksiyani oʻzing yozish" };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}.` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.bubble("elder", "Tayyor: parametrli funksiya yozib, uni chaqiruvlar bilan sinay va qayta ishlata olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.machine(true) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "def nom(parametrlar): … return natija" }),
        ui.h("div", { text: "print ekranga yozadi, return qiymat qaytaradi" }),
        ui.h("div", { text: "Sinov: oddiy holat, chegara, manfiy son, bitta element" }),
        ui.h("div", { text: "Qayerda uchraydi: har qanday kutubxona — tayyor funksiyalar toʻplami" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
