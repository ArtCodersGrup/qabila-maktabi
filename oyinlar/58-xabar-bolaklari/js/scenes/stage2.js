// 2-bosqich: konvertlar yo'lda aralashdi — bola raqam tartibida yig'adi. Nom: paket.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // Bola aralash konvertlarni 1, 2, 3… tartibida bosadi; xabar ko'z oldida tiklanadi
  function yigdir(xabar, k) {
    const asl = L.konvertlar(xabar, k);
    const keldi = L.aralashTartib(asl, Math.random);
    const el = common.box(true);
    el.append(h("div", { class: "xb-savol", text: "Konvertlar aralash keldi. Raqam tartibida bos: 1, 2, 3…" }));
    const yigilgan = h("div", { class: "xb-yigilgan", "aria-live": "polite" });
    el.append(yigilgan);
    let kutilgan = 1;
    return ui.settle((done) => {
      const tugmalar = keldi.map((x) => {
        const b = common.konvert(x, { tugma: true, kichik: true });
        b.addEventListener("click", () => {
          if (b.disabled) return;
          if (x.raqam !== kutilgan) {
            QK.sound.play("retry");
            ui.bubble("elder", `↻ Hozir ${kutilgan}-raqamli konvertni top.`);
            return;
          }
          QK.sound.play("tap");
          b.disabled = true;
          b.classList.add("olindi");
          yigilgan.append(common.xabarQator(x.matn, { kichik: true }));
          kutilgan++;
          if (kutilgan > asl.length) done();
        });
        return b;
      });
      ui.control().append(h("div", { class: "xb-javoblar konvertlar" }, ...tugmalar));
    });
  }

  async function korsat() {
    await yigdir("ERTAGA MAKTABDA", 4);
    ui.clearControl();
    QK.sound.play("correct");
    await ui.say("elder", "✓ Xat tiklandi! Konvertlar har xil yoʻldan kelgan, shuning uchun aralashgan.");
    await ui.say("elder", "Raqami va manzili bor bunday konvert — paket deyiladi. Internetda hamma narsa paketlarda yuradi.");
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
