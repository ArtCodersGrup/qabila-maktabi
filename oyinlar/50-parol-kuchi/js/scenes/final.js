// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "sinab chiqish vaqti va parollarni solishtirish.", 2: "lugʻat hujumi va yaxshi parol qoidalari." };

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
    ui.bubble("elder", "Tayyor: parol kuchini variantlar soni va topish vaqti boʻyicha baholay olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.qulf() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Variantlar soni = Aⁿ (A — alifbo, n — uzunlik)" }),
        ui.h("div", { text: "Vaqt = variantlar ÷ sinash tezligi; uzunlik murakkablikdan kuchliroq" }),
        ui.h("div", { text: "Ism, yil va mashhur soʻz lugʻat hujumida tez topiladi" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
