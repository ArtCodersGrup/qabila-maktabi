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
    ui.bubble("elder", "Tabriklayman! Endi turni oʻzing tanlaysan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.chegara() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "int ≈ ±2 milliard; oshsa javob jim buziladi, xato chiqmaydi" }),
        ui.h("div", { text: "Javob 2 milliarddan oshsa — long long" }),
        ui.h("div", { text: "Butun / butun = butun: 7 / 2 = 3, kasr kerak boʻlsa 7 / 2.0" }),
        ui.h("div", { text: "C++ da −7 / 2 = −3 va −7 % 3 = −1 (Pythonda boshqacha)" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
