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
    ui.bubble("elder", "Tabriklayman! Endi xabar internetda qanday yurishini bilasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.quti() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Uzun xabar boʻlaklarga boʻlinadi — paketlarga" }),
        ui.h("div", { text: "Har paketda raqam va manzil bor" }),
        ui.h("div", { text: "Aralash kelsa — raqam boʻyicha yigʻiladi, yoʻqolsa — faqat oʻshasi qayta soʻraladi" }),
        ui.h("div", { class: "xb-haqiqat", text: "Haqiqatda bundan murakkabroq: paketga yuzlab harf sigʻadi va unda tekshiruv soni ham bor." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
