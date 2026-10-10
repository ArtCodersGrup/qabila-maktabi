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
    const next = { 1: "model gap yozadi", 2: "korpus hajmi va maʼno" }[s];
    await ui.say("elder", goingOn && next ? `${s}-bosqich tugadi. Keyingisi — ${next}.` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: til modeli keyingi soʻzni qanday tanlashini tushuntira olasan va uning javobini tekshira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.robot() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Model soʻz juftliklarini sanaydi (chastota)" }),
        ui.h("div", { text: "Keyingi soʻz ehtimol bilan tanlanadi" }),
        ui.h("div", { text: "Model maʼnoni bilmaydi — javobini tekshir" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
