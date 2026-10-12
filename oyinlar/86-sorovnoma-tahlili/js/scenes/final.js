// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const KEYINGI = { 1: "hisob uchun yordamchi funksiyalar", 2: "toʻliq tahlil va xulosa" };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}.` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.bubble("elder", "Tayyor: xom maʼlumotni tozalab, funksiyalar bilan hisoblab, savolga asosli javob bera olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.pipeline(true) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Yoʻl: savol → maʼlumot → tozalash → hisob → xulosa" }),
        ui.h("div", { text: "Bitta xato qiymat ham oʻrtachani buzadi" }),
        ui.h("div", { text: "Kichik tanlanma — ehtiyotkor xulosa; bogʻliqlik sabab degani emas" }),
        ui.h("div", { text: "Qayerda uchraydi: har AI modeli oʻqitishdan oldin shunday tozalangan maʼlumot oladi" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
