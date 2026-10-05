// 63-o'yin: ko'rsatuv sahnalari uchun yordamchi (tayyor dastur, ikki maydon, ▶︎ tugmasi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, blokUi: BU } = QK;

  // Ko'rsatuv: qulflangan quruvchida tayyor dastur, maydonlar va izoh
  function namoyish(level, dastur, izoh) {
    const host = BU.box(true);
    host.append(BU.note(izoh));
    const maydon = BU.maydonlar(host, level.maydonlar);
    const qur = BU.quruvchi(host, { bloklar: level.bloklar, dastur });
    qur.qulfla();
    return { host, maydon, qur };
  }

  // ▶︎ tugmasi: bola bosgach dastur hamma maydonda yurgiziladi
  function yurgizBtn(maydon, dastur) {
    return ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", async () => {
      ui.clearControl();
      done(await BU.yurgiz(maydon, dastur));
    }, "big")));
  }

  QK.tosiq = { namoyish, yurgizBtn };
})(window);
