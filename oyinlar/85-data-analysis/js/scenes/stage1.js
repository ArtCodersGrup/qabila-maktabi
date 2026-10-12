// Kirish va 1-bosqich: oʻrtacha, mediana, moda, oraliq; chetga chiqqan qiymat oʻrtachani buzadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.kirish() }));
    await ui.say("elder", "Maqsad: maʼlumotni tahlil qilish — toʻplamni bir-ikki son bilan tasvirlash, diagrammani oʻqish va xulosani tekshirish.");
    await ui.say("elder", "Kalit gʻoya: har koʻrsatkich va har diagramma maʼlumotning bir tomonini koʻrsatadi — va notoʻgʻri tanlansa, aldaydi.");
  }

  async function korsat() {
    const el = common.box(true);
    const NOM = "Kichik firmadagi oyliklar (mln soʻm)";
    let blok = common.toplamBlok(NOM, [5, 4, 6, 5, 5]);
    el.append(blok);
    const almashtir = (yangi) => { blok.replaceWith(yangi); blok = yangi; };

    ui.bubble("elder", "Besh xodimning oyligi berilgan. Tahlil tartiblashdan boshlanadi.");
    await ui.choice([{ label: "Tartiblash", value: 1 }]);
    const a = L.tartib([5, 4, 6, 5, 5]);
    ui.bubble("elder", "Tartiblangan qatorning aynan oʻrtasida turgan qiymatni bos — bu mediana.");
    await ui.settle((done) => {
      almashtir(common.toplamBlok(NOM, a, {
        onBos(k, b) {
          if (k !== 2) {
            QK.sound.play("retry");
            ui.bubble("elder", "↻ Oʻrtadagi qiymatning chapida ham, oʻngida ham bir xil sonda qiymat turadi.");
            return;
          }
          b.classList.add("belgi");
          done();
        },
      }));
    });
    QK.sound.play("correct");
    almashtir(common.toplamBlok(NOM, a, { belgi: (v, k) => k === 2 }));
    const qoida = common.formula([
      "Oʻrtacha (mean) = yigʻindi ÷ soni: 25 ÷ 5 = 5",
      "Mediana — tartiblangan qator oʻrtasi: 5",
      "Moda — eng koʻp uchragan qiymat: 5",
      "Oraliq (range) = eng katta − eng kichik: 6 − 4 = 2",
    ]);
    el.append(qoida);
    await ui.say("elder", "✓ Mediana = 5. Bu yerda oʻrtacha ham, moda ham 5: qiymatlar bir-biriga yaqin boʻlsa, uch koʻrsatkich bir joyda turadi.");

    ui.bubble("elder", "Endi roʻyxatga direktor qoʻshiladi: uning oyligi — 35 mln soʻm.");
    await ui.choice([{ label: "35 ni qoʻshish", value: 1 }]);
    QK.sound.play("tap");
    almashtir(common.toplamBlok(NOM, a.concat(35), { belgi: (v) => v === 35 }));
    const yangi = common.formula(["Oʻrtacha: 60 ÷ 6 = 10 (edi: 5)", "Mediana: (5 + 5) ÷ 2 = 5 (edi: 5)"]);
    qoida.replaceWith(yangi);
    await ui.say("elder", "Oʻrtacha 5 dan 10 ga sakradi, mediana joyida qoldi. Olti kishidan beshtasi «oʻrtacha oylik»dan ancha kam oladi.");
    await ui.say("elder", `35 — chetga chiqqan qiymat (outlier): u oʻrtachani buzadi, medianani emas. Mashq: ${practice.need()} ta hisob; qogʻoz olishing mumkin.`);
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
