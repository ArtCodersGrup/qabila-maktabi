// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "oʻquv va test toʻplami, aniqlik.", 2: "noxolis oʻquv toʻplami." };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.bubble("elder", "Tayyor: maʼlumotni belgilash, modelni testda baholash va noxolis toʻplamni tuzatishni tushuntira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.yakun() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Belgilash (labeling): har misolga yorliqni odam qoʻyadi" }),
        ui.h("div", { text: "Belgi (feature) foydali, agar sinflarni farqlasa" }),
        ui.h("div", { text: "Aniqlik = toʻgʻri ÷ jami — model koʻrmagan test toʻplamida oʻlchanadi" }),
        ui.h("div", { text: "Noxolislik (bias): oʻquv toʻplamida yoʻq holatda model adashadi; davosi — xilma-xil maʼlumot" }),
        ui.h("div", { class: "at-haqiqat", text: "AI tabiatga yordam beradi: chiqindini saralash, energiya va suv sarfini kamaytirish. Lekin katta modellarni oʻqitish va ishlatishning oʻzi koʻp elektr energiyasi talab qiladi." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
