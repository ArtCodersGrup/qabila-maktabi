// Kirish va 1-bosqich: xabarni bo'laklash (konvertlarga bo'lish).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.yol() }));
    await ui.say("elder", "Maqsad: internetda xabar qanday uzatilishini tushunish — boʻlak, raqam, manzil, paket.");
    await ui.say("elder", "Kalit gʻoya: uzun xabar bir butun emas, boʻlaklarga boʻlinib, har boʻlak alohida yuboriladi.");
  }

  async function korsat() {
    const el = common.box(true);
    el.append(common.xabarQator("SALOM"));
    ui.bubble("elder", "Bitta konvertga 2 ta belgi sigʻadi. Xabarni boʻlakla.");
    await ui.choice([{ label: "✂️ Qirqish", value: "ok" }]);
    QK.sound.play("tap");
    const list = L.konvertlar("SALOM", 2);
    el.append(common.qator(...list.map((x) => common.konvert(x, { manzil: "Ali" }))));
    await ui.say("elder", "5 belgi ÷ 2 = 2,5 → yuqoriga yaxlitlab 3 ta konvert. Oxirgisida bitta harf qoladi.");
    await ui.say("elder", "Har konvertga raqam («1/3» — 3 tadan 1-si) va manzil (kimga) yoziladi.");
    await ui.say("elder", `Raqamsiz boʻlaklarni toʻgʻri tartibda yigʻib boʻlmaydi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
