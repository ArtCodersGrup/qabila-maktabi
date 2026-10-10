// Kirish va 1-bosqich: boshqaruv — move, left, right.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common } = QK;

  async function intro() {
    await ui.keyboardCheck("Bu oʻyinda kod yoziladi — klaviatura kerak. Uni kompyuterda och.");
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.tank() }));
    await ui.say("elder", "Maqsad: tankni Python buyruqlari bilan boshqarish. Buyruq yozib Enter bosasan — tank bajaradi.");
    await ui.say("elder", "move(50) — oldinga 50 birlik. left(90) — chapga 90° burilish, right(90) — oʻngga.");
  }

  async function stage1() {
    for (let k = 0; k < L.VAZIFALAR.boshqaruv.length; k++) {
      const v = L.vazifa("boshqaruv", k);
      ui.setProgress(L.VAZIFALAR.boshqaruv.length, k);
      await common.vazifaEkrani("boshqaruv", v);
      await ui.say("elder", k === 0 ? "Belgiga yetildi. Keyingisi — burilish."
        : k === 1 ? "Bajarildi. Keyingisi — toʻsiqni aylanib oʻtish."
        : "Toʻsiq aylanib oʻtildi: move, left, right bilan istalgan yoʻlni yasash mumkin.");
    }
    ui.setProgress(L.VAZIFALAR.boshqaruv.length, L.VAZIFALAR.boshqaruv.length);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
