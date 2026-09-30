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
      ? `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`
      : `${s}-bosqich tugadi! Barakalla!`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi kompyuterga hisob-kitobni topshira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: QK.gameArt.share(17, 5) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "// — nechtadan tegdi, % — nechtasi ortdi" }),
        ui.h("div", { text: "/ doim kasr beradi" }),
        ui.h("div", { text: "Avval daraja, keyin koʻpaytirish, keyin qoʻshish" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
