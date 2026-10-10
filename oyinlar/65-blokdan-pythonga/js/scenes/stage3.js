// 3-bosqich «Tarjima qil»: Python matni berilgan — bola aynan shu dasturni bloklardan yigʻadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, common, practice } = QK;

  // Ko'rsatuv: matn va unga mos bloklar yonma-yon (qatorma-qator)
  async function korsat() {
    const k = L.KORSATUV.tarjima;
    const host = BU.box(true);
    host.append(BU.note("Python matni va unga mos bloklar."));
    const e = common.tarjimaEkran(host, k, true);
    e.qur.qoy(k.yechim);
    await ui.say("elder", "Teskari yoʻnalish: Python matnidan bloklarni yigʻasan.");
    await ui.say("elder", "Har qator — bitta blok. Otstupli qatorlar oʻzidan yuqoridagi blok ichida turadi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta dastur. Takror soni 3 dan boshlanadi — sonni bosib oʻzgartir.`);
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, correct, tier) => L.yasa("tarjima", prev, undefined, tier),
      run: (level) => common.tarjimaExercise(level),
      praise: () => "Bloklar va matn — bitta dastur.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
