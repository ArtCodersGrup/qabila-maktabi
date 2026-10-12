// Bosqich tugashi va yakuniy ekran.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const KEYINGI = { 1: "hisoblagich va yigʻindi naqshi: sanash, oʻrtacha, aniqlik", 2: "sikldagi xatoni tuzatish va dastur yozish" };

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
    ui.bubble("elder", "Tayyor: for va while bilan maʼlumotni sanay, yigʻa va oʻrtachasini topa olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.epochs() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "for — takrorlar soni maʼlum; while — shart rost ekan" }),
        ui.h("div", { text: "Hisoblagich: 0 dan, += 1. Yigʻindi: 0 dan, += x" }),
        ui.h("div", { text: "Qayerda uchraydi: model har davrda (epoch) butun maʼlumot boʻylab sikl bilan oʻtadi" }),
        ui.h("div", { text: "Cheklov: bitta oʻrtacha son hammasini aytmaydi — sinflarni alohida sana" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
