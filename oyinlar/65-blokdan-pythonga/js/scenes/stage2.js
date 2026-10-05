// 2-bosqich «Tuzat»: Python matnida bitta xato (son yoki yoʻnalish) — bosib almashtirish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, blokUi: BU, common, practice } = QK;

  // Ko'rsatuv: bola birinchi xatoni o'zi tuzatadi (urinish sanalmaydi)
  async function korsat() {
    const k = L.KORSATUV.tuzat;
    const host = BU.box(true);
    host.append(BU.note("Robot gulxanga yetishi kerak edi."));
    await ui.settle((done) => {
      let birinchi = true;
      const ekran = common.tuzatEkran(host, k, (natija) => {
        if (natija.status === "goal") {
          ekran.tugat();
          ui.clearControl();
          done();
          return;
        }
        ui.bubble("elder", birinchi
          ? "↻ Yetmadi. Sariq ramkali qismni bossang, u almashadi — tuzat va yana ishga tushir."
          : "↻ Hali yetmadi. Sonni yana bir bosib koʻr.");
        birinchi = false;
      });
      ui.bubble("elder", "Bu dasturda bitta xato bor. Avval ishga tushirib koʻr.");
    });
    await ui.say("elder", "✓ Zoʻr! Xatoni topib tuzatishni dasturchilar «debug» deydi.");
    await ui.say("elder", "Endi xato har safar boshqa joyda: son yoki yoʻnalish. Bloklar ham yonida yangilanib turadi.");
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, correct, tier) => L.yasa("tuzat", prev, undefined, tier),
      run: (level) => common.tuzatExercise(level),
      praise: () => "Xato topildi va tuzatildi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
