// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "eng yaqin namuna usuli.", 2: "oʻzing chizasan, model topadi." };

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
    ui.bubble("elder", "Tayyor: chizma sonlarga qanday aylanishini, eng yaqin namuna usulini va aniqlikni tushuntira olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.topildi() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Rasm = sonlar jadvali: 8×8 chizma — 64 ta 0 va 1" }),
        ui.h("div", { text: "Hamming masofasi = mos kelmagan kataklar soni" }),
        ui.h("div", { text: "Eng yaqin namuna usuli: javob — eng yaqin namunaning yorligʻi" }),
        ui.h("div", { text: "Aniqlik = toʻgʻri ÷ jami; namunalar xilma-xil boʻlsa — oshadi" }),
        ui.h("div", { class: "ct-haqiqat", text: "Haqiqiy tasvir modellari — neyron tarmoqlar — juda koʻp namunadan oʻrganadi, lekin tamoyil oʻsha: maʼlumot qanday boʻlsa, model ham shunday. Namunalarda yoʻq narsani model tanimaydi." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
