// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const KEYINGI = { 1: "algoritmning beshta xossasi", 2: "koddagi buzilgan xossani topish va tuzatish" };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}.` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: algoritmni beshta xossa va qadamlar soni boʻyicha baholay olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.ikkiYol("qisqa") }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Beshta xossa: tushunarlilik, aniqlik, diskretlik, natijaviylik, ommaviylik" }),
        ui.h("div", { text: "Toʻgʻri ishlaydi ≠ samarali" }),
        ui.h("div", { text: "Samaradorlik oʻlchovi — bajarilgan qadamlar soni" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
