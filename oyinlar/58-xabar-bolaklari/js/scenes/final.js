// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "aralash kelgan paketlarni yigʻish.", 2: "yoʻqolgan paketni topish." };

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
    ui.bubble("elder", "Tayyor: xabar paketlarga qanday boʻlinishi, yigʻilishi va qayta soʻralishini tushuntira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.quti() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Paketlar soni = ⌈xabar uzunligi ÷ paket hajmi⌉" }),
        ui.h("div", { text: "Paket = boʻlak + raqam (n/jami) + manzil" }),
        ui.h("div", { text: "Aralash kelsa — raqam boʻyicha yigʻiladi; yoʻqolsa — faqat oʻsha qayta soʻraladi" }),
        ui.h("div", { class: "xb-haqiqat", text: "Haqiqatda bitta paketga ~1500 bayt sigʻadi va unda xatoni aniqlash uchun tekshiruv yigʻindisi ham bor." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
