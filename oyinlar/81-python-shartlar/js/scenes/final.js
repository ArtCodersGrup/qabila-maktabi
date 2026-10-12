// Bosqich tugashi va yakuniy ekran.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const KEYINGI = { 1: "elif zanjiri va and, or, not; shartni oʻzing yozasan", 2: "qoidali tasniflagichni tuzatish va yozish" };

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
    ui.bubble("elder", "Tayyor: model chiqishini if, elif, else va and, or, not bilan qarorga aylantira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.threshold(0.5) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Chegaraning oʻzini har doim tekshir: >= va > turli qaror beradi" }),
        ui.h("div", { text: "elif — yuqoridan pastga, birinchi rost shart" }),
        ui.h("div", { text: "Qayerda uchraydi: spam filtri, bank arizasini dastlabki saralash, tibbiy saralash" }),
        ui.h("div", { text: "Cheklov: qoidani odam yozadi — xato va noxolislik ham oʻsha qoidadan keladi" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
