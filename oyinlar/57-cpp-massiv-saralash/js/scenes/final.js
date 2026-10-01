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
    ui.bubble("elder", "Tabriklayman! Endi massiv, satr va saralash bilan ishlaysan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.massiv() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Massiv indeksi noldan boshlanadi, boʻyi eʼlonda qotiriladi" }),
        ui.h("div", { text: "Chegaradan chiqsa C++ xato bermaydi — javob jim buziladi" }),
        ui.h("div", { text: "Satr ham massivga oʻxshaydi: s[i] va s.size()" }),
        ui.h("div", { text: "vector oʻsadi (push_back), sort(v.begin(), v.end()) saralaydi" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
