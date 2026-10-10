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
    const next = { 1: "chegara chizigʻi va oʻqitish", 2: "sinov va maʼlumot sifati" }[s];
    const text = goingOn && next ? `${s}-bosqich tugadi. Keyingisi — ${next}.` : `${s}-bosqich tugadi.`;
    await ui.say("elder", text);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: misollardan bashorat qila olasan, modelni oʻqitib, sinov maʼlumotida tekshira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Mashinaga qoida emas — misollar beriladi" }),
        ui.h("div", { text: "Model — chegara chizigʻi, oʻqitish — xatoni kamaytirish" }),
        ui.h("div", { text: "Sinov — model koʻrmagan misollarda; maʼlumot sifati = model sifati" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
