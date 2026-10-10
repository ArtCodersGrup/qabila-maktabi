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
          ? "↻ Robot yetmadi. Sariq ramkali qismni bosib almashtir, keyin yana ishga tushir."
          : "↻ Hali yetmadi. Sonni yana bir bosib koʻr.");
        birinchi = false;
      });
      ui.bubble("elder", "Bu dasturda bitta xato bor. Avval ishga tushirib koʻr.");
    });
    await ui.say("elder", "✓ Tuzatildi. Xatoni topib tuzatish jarayoni «debug» deyiladi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta dastur, har birida bitta xato — son yoki yoʻnalish. Yonidagi bloklar ham yangilanadi.`);
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
