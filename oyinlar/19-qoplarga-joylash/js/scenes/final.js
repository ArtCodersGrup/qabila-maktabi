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
    const NEXT = { 1: "asosga ketma-ket boʻlish usuli.", 2: "16-lik, 8-lik va teskari tekshirish." };
    await ui.say("elder", goingOn && NEXT[s] ? `${s}-bosqich tugadi. Keyingisi — ${NEXT[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: oʻnlikdan istalgan pozitsion tizimga oʻtkaza va natijani tekshira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.apples() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "1-usul: katta vazndan boshla — sigʻdi 1, sigʻmadi 0" }),
        ui.h("div", { text: "2-usul: asosga boʻl, qoldiqni yoz — boʻlinma 0 boʻlguncha" }),
        ui.h("div", { text: "Qoldiqlar pastdan yuqoriga oʻqiladi" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
