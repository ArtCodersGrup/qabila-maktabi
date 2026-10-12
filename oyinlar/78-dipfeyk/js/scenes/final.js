// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "manbani tekshirish: belgilar koʻrinmasa ham ishlaydigan usul.", 2: "etika va toʻgʻri harakat." };

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
    ui.bubble("elder", "Tayyor: dipfeykni belgilari va manbasidan tekshira olasan va unga duch kelganda nima qilishni bilasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "df-art small", html: QK.gameArt.qalqon() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Belgilar: xira chet · soya · koʻz · tish · lab-ovoz" }),
        ui.h("div", { text: "Manba: kim tarqatdi? boshqa manbada bormi? sana mosmi?" }),
        ui.h("div", { text: "Uch shart: ruxsat · zarar yoʻq · ochiqlik" }),
        ui.h("div", { text: "Harakat: tarqatma → dalilni saqla → kattalarga ayt → shikoyat qil" }),
        ui.h("div", { class: "df-haqiqat", text: "Cheklov: belgi yoʻqligi haqiqiylikni isbotlamaydi; dipfeykni aniqlaydigan dasturlar ham xato qiladi. Shubha boʻlsa — ulashma." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
