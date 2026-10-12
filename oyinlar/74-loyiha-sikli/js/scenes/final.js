// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "ishni bosqichga ajratish.", 2: "muvaffaqiyatsiz loyiha tashxisi." };

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
    ui.bubble("elder", "Tayyor: AI loyihasini besh bosqichga ajrata olasan va xato qaysi bosqichda yuz berganini topa olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.sikl(true) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Muammo → maʼlumot yigʻish → oʻrganish → modellash → baholash" }),
        ui.h("div", { text: "Baho yomon chiqsa — oldingi bosqichga qaytiladi" }),
        ui.h("div", { text: "Aniqlik = toʻgʻri ÷ jami × 100 %, faqat yangi misollarda" }),
        ui.h("div", { class: "ls-haqiqat", text: "Qayerda uchraydi: tavsiya tizimi, tarjimon, tibbiy tashxis yordamchisi — hammasi shu sikl boʻyicha quriladi va qayta-qayta yaxshilanadi." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
