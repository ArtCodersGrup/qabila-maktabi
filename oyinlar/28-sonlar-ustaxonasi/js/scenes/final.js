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
      ? `${s}-bosqich tugadi. Keyingisi — ${s === 1 ? "amallar tartibi" : "hisoblaydigan dastur"}.`
      : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: //, %, / va amallar tartibini bilib, hisoblaydigan dastur yoza olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: QK.gameArt.share(17, 5) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "// — butun boʻlinma, % — qoldiq" }),
        ui.h("div", { text: "/ doim kasr (float) beradi" }),
        ui.h("div", { text: "Tartib: ( ) → ** → * / // % → + -" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
