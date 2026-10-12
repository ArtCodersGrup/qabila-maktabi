// Bosqich tugashi va yakuniy ekran.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const KEYINGI = { 1: "diagramma oʻqish.", 2: "bogʻliqlik va sabab." };

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
    ui.bubble("elder", "Tayyor: toʻplam koʻrsatkichlarini hisoblaysan, diagrammani oʻqiysan va asossiz xulosani ajrata olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.yakun() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Oʻrtacha = yigʻindi ÷ soni · mediana — oʻrtadagi · moda — eng koʻp uchragani" }),
        ui.h("div", { text: "Chetga chiqqan qiymat oʻrtachani buzadi, medianani emas" }),
        ui.h("div", { text: "Diagrammada avval oʻq oʻqiladi; bogʻliqlik ≠ sabab" }),
        ui.h("div", { class: "mt-etika", text: "Etika: oʻqni kesib yoki qulay maʼlumotni tanlab koʻrsatish — aldash. Guruh oʻrtachasiga qarab alohida odamga baho berish — noxolislik (bias)." }),
        ui.h("div", { class: "mt-etika", text: "Qayerda uchraydi: sunʼiy intellekt modelini oʻqitishdan oldin maʼlumot aynan shunday oʻrganiladi (data exploration)." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
