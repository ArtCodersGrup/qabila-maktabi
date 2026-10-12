// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "AI, ML va DL toʻplamlari.", 2: "kompyuter koʻrishi vazifalari." };

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
    ui.bubble("elder", "Tayyor: tizim qoidasi qayerdan kelganini, uning AI, ML yoki DL ekanini va CV vazifasini ajrata olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.koz() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Qoidani odam yozgan → oddiy dastur; maʼlumotdan topilgan → ML" }),
        ui.h("div", { text: "DL ⊂ ML ⊂ AI; vaznlar koʻp → maʼlumot koʻp kerak" }),
        ui.h("div", { text: "CV: tasniflash — yorliq, obyektni topish — ramka, segmentatsiya — har piksel" }),
        ui.h("div", { class: "ao-haqiqat", text: "Qayerda uchraydi: telefon kamerasi, tarjimon, tavsiya tizimi, tibbiy suratlar tahlili. Model javobi — bashorat, uni tekshirish kerak." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
