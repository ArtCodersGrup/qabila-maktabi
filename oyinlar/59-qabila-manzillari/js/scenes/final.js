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
    ui.bubble("elder", "Tabriklayman! Endi internetda manzil qanday topilishini bilasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.xarita() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "IP manzil — toʻrtta son, har biri 0–255 (1 bayt)" }),
        ui.h("div", { text: "DNS — nomdan manzil topadigan daftarlar" }),
        ui.h("div", { text: "Kesh — javondagi nusxa: tez, lekin eskirishi mumkin" }),
        ui.h("div", { class: "qm-haqiqat", text: "Haqiqatda bundan murakkabroq: uzunroq manzillar ham bor, qurilma manzili oʻzgarib turadi, DNS daftarlari dunyo boʻylab minglab." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
