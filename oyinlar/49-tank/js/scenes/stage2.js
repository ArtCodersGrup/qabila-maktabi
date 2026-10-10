// 2-bosqich: nishon — scan() va fire().
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common } = QK;

  async function kirish() {
    await ui.say("elder", "fire() — oʻq uzadi, oʻqing esa uchta. scan() — qarshingdagi nishongacha masofani qaytaradi, koʻrinmasa −1.");
    await ui.say("elder", "Qoida: avval scan(), nishon koʻrinsa — fire(). Koʻrmay otish oʻqni behuda sarflaydi.");
  }

  async function stage2() {
    await kirish();
    for (let k = 0; k < L.VAZIFALAR.nishon.length; k++) {
      ui.setProgress(L.VAZIFALAR.nishon.length, k);
      await common.vazifaEkrani("nishon", L.vazifa("nishon", k));
      await ui.say("elder", k === 2 ? "Toʻsiq ortidagi nishon ham urildi."
        : "Nishon urildi. Keyingisi qiyinroq.");
    }
    ui.setProgress(L.VAZIFALAR.nishon.length, L.VAZIFALAR.nishon.length);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
