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
    ui.bubble("elder", "Tabriklayman! Endi sikl va qavslarni oʻzing boshqarasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.takror() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Blokni { } yasaydi — otstup emas; qavssiz if ga bitta satr kiradi" }),
        ui.h("div", { text: "== solishtiradi, = esa tayinlaydi va shart rost boʻlib qoladi" }),
        ui.h("div", { text: "for ning uch qismi: boshi, sharti va qadami" }),
        ui.h("div", { text: "Sikl toʻxtamasa — qadam unutilgan; ; qoʻyilsa — tana boʻsh" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
