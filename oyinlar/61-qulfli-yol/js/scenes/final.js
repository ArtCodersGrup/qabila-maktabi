// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "qulflangan yoʻl (HTTPS).", 2: "qulfli, lekin soxta saytni ajratish." };

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
    ui.bubble("elder", "Tayyor: parol yozishdan oldin manzilni ikki qadamda tekshira olasan — https:// va haqiqiy egasi.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.qulfKatta() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Qulfsiz yoʻlda xabarni yoʻldagi har tugun oʻqiydi" }),
        ui.h("div", { text: "HTTPS (🔒): yoʻlda oʻqib boʻlmaydi va manzil haqiqiy" }),
        ui.h("div", { text: "🔒 saytning halolligini bildirmaydi — birinchi «/» gacha boʻlgan qismni oxiridan oʻqi" }),
        ui.h("div", { class: "qy-haqiqat", text: "Haqiqatda bu qulf — shifrlash: kalitlar va sertifikatlar matematikasi. Gʻoyasi esa shu." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
