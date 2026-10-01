// Kirish va 1-bosqich: boshqaruv — move, left, right.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common } = QK;

  async function intro() {
    await ui.keyboardCheck("Bu oʻyinda kod yoziladi — klaviatura kerak. Uni kompyuterda och.");
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.tank() }));
    await ui.say("elder", "Bu — sening tanking. Lekin rulini aylantirib boshqarmaysan.");
    await ui.say("apprentice", "Qanday boshqaraman?");
    await ui.say("elder", "Kod bilan. Buyruq yozasan, Enter bosasan — tank bajaradi.");
    await ui.say("elder", "move(50) — oldinga 50 qadam. left(90) — chapga 90 gradus burilish.");
  }

  async function stage1() {
    for (let k = 0; k < L.VAZIFALAR.boshqaruv.length; k++) {
      const v = L.vazifa("boshqaruv", k);
      ui.setProgress(L.VAZIFALAR.boshqaruv.length, k);
      await common.vazifaEkrani("boshqaruv", v);
      await ui.say("elder", k === 0 ? "Belgiga yetding! Burilishni ham sinaymiz."
        : k === 1 ? "Barakalla. Endi toʻsiq bor."
        : "Toʻsiqni aylanib oʻtding — boshqaruv tayyor.");
    }
    ui.setProgress(L.VAZIFALAR.boshqaruv.length, L.VAZIFALAR.boshqaruv.length);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
