// Kirish va 1-bosqich: xabarni bo'laklash (konvertlarga bo'lish).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.yol() }));
    await ui.say("elder", "Doʻstingga internet orqali xat yozding. Xat qanday yetib boradi deb oʻylaysan?");
    await ui.say("apprentice", "Bir boʻlib uchib boradi-da!");
    await ui.say("elder", "Yoʻq. Uni boʻlaklarga qirqib, har birini alohida yuborishadi. Hozir oʻzing koʻrasan.");
  }

  async function korsat() {
    const el = common.box(true);
    el.append(common.xabarQator("SALOM"));
    ui.bubble("elder", "Bitta konvertga 2 ta harf sigʻadi. Xatni qirq!");
    await ui.choice([{ label: "✂️ Qirqish", value: "ok" }]);
    QK.sound.play("tap");
    const list = L.konvertlar("SALOM", 2);
    el.append(common.qator(...list.map((x) => common.konvert(x, { manzil: "Ali" }))));
    await ui.say("elder", "3 ta konvert chiqdi. Oxirgisida bitta harf — u ham alohida konvert.");
    await ui.say("elder", "Har konvertga raqam yoziladi: «1/3» — uchtadan birinchisi. Va manzil: kimga.");
    await ui.say("apprentice", "Raqam boʻlmasa, qaysi boʻlak qayerda ekanini bilib boʻlmaydi-ku!");
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
