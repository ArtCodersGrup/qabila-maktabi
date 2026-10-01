// 2-bosqich: nishon — scan() va fire().
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common } = QK;

  async function kirish() {
    await ui.say("elder", "Endi qurol. fire() — oʻq uzadi, lekin oʻqing uchta.");
    await ui.say("elder", "scan() esa qarshingdagi nishongacha masofani aytadi. Koʻrinmasa −1 beradi.");
    await ui.say("apprentice", "Demak avval scan(), keyin fire()?");
    await ui.say("elder", "Toʻgʻri. Koʻrmay turib otish — oʻqni behuda sarflash.");
  }

  async function stage2() {
    await kirish();
    for (let k = 0; k < L.VAZIFALAR.nishon.length; k++) {
      ui.setProgress(L.VAZIFALAR.nishon.length, k);
      await common.vazifaEkrani("nishon", L.vazifa("nishon", k));
      await ui.say("elder", k === 2 ? "Toʻsiq ortidagini ham urding — endi jangga tayyorsan."
        : "Nishon yiqildi! Keyingisi qiyinroq.");
    }
    ui.setProgress(L.VAZIFALAR.nishon.length, L.VAZIFALAR.nishon.length);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
