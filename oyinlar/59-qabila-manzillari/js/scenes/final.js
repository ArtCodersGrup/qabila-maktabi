// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "nomdan manzil topish (DNS).", 2: "kesh." };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: IP manzilni tekshira olasan, DNS va kesh qanday ishlashini tushuntira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.xarita() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "IP manzil: a.b.c.d, har son 0–255 (1 bayt = 8 bit)" }),
        ui.h("div", { text: "DNS: nom → IP manzil; topilmasa — kattaroq daftardan soʻraladi" }),
        ui.h("div", { text: "Kesh: saqlangan nusxa — 0 ta soʻrov, lekin eskirishi mumkin" }),
        ui.h("div", { class: "qm-haqiqat", text: "Haqiqatda bundan murakkabroq: uzunroq IPv6 manzillar ham bor, qurilma manzili oʻzgarib turadi, DNS serverlari dunyo boʻylab minglab." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
