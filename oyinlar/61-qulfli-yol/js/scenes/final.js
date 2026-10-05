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
    ui.bubble("elder", "Tabriklayman! Endi qaysi saytga parol yozish mumkinligini bilasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.qulfKatta() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Qulfsiz yoʻlda xabarni yoʻldagi har tugun oʻqiydi" }),
        ui.h("div", { text: "Qulf (HTTPS): yoʻlda oʻqib boʻlmaydi va manzil haqiqiy" }),
        ui.h("div", { text: "Qulf saytning halolligini bildirmaydi — manzilni oxiridan oʻqi" }),
        ui.h("div", { class: "qy-haqiqat", text: "Haqiqatda bu qulf — matematika: kalitlar va sertifikatlar. Gʻoyasi esa shu." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
