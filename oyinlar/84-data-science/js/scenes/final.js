// Bosqich tugashi va yakuniy ekran.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "maʼlumot turlari va jadval tuzilishi.", 2: "jadvalni tozalash." };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.bubble("elder", "Tayyor: oʻlchanadigan savol qoʻya olasan, jadval tuzilishini oʻqiysan va undagi xatolarni topasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.jadval() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Savol → yigʻish → tozalash → tahlil → xulosa" }),
        ui.h("div", { text: "Qator = obyekt, ustun = belgi; belgi sonli yoki toifali" }),
        ui.h("div", { text: "Tozalash: boʻsh, takror, imkonsiz qiymat, har xil yozuv" }),
        ui.h("div", { class: "ds-etika", text: "Etika: tahlilga kerak boʻlmagan shaxsiy maʼlumot (telefon, manzil) yigʻilmaydi; natijaga yoqmagan qator oʻchirilmaydi." }),
        ui.h("div", { class: "ds-etika", text: "Tahlilning oʻzi — oʻrtacha, mediana, diagramma — «Maʼlumot tahlili» oʻyinida." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
