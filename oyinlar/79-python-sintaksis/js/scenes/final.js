// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const KEYINGI = { 1: "xato xabarini oʻqish va xatoni tuzatish", 2: "dasturni oʻzing yozish" };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}.` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.bubble("elder", "Tayyor: print, izoh va otstup bilan dastur yoza olasan, xato xabaridan xato joyini topa olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.oyna(true) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "\"…\" — matn, qoʻshtirnoqsiz — son yoki oʻzgaruvchi" }),
        ui.h("div", { text: "# — izoh; otstup (4 boʻshliq) — blok" }),
        ui.h("div", { text: "Xato xabari: turi, satr raqami, sababi" }),
        ui.h("div", { text: "Qayerda uchraydi: maʼlumot tahlili va mashinali oʻrganish (machine learning, ML) dasturlari koʻpincha Pythonda yoziladi." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
