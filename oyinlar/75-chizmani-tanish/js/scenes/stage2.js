// 2-bosqich: eng yaqin namuna (nearest neighbour) — bola masofalarni o'lchatadi va eng yaqinini tanlaydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function korsat() {
    const d = L.demo2();
    const el = common.box(true);
    el.append(h("div", { class: "ct-juft" }, common.yozuvli(common.rasm(d.savol, "orta"), "yangi chizma")));
    const olchangan = new Set();
    let tanlash = false;
    ui.bubble("elder", "Model bu chizmani hali koʻrmagan. Har namunani bos — model ungacha Hamming masofasini oʻlchaydi.");
    await ui.settle((done) => {
      const tugmalar = d.namunalar.map((n) => {
        const b = common.karta(n, { tugma: true, masofa: null, olcham: "kichik" });
        b.addEventListener("click", () => {
          const masofa = L.hamming(d.savol, n.katak);
          if (!tanlash) {
            QK.sound.play("tap");
            b.masofaYoz(masofa);
            olchangan.add(n.id);
            if (olchangan.size === d.namunalar.length) {
              tanlash = true;
              ui.bubble("elder", "Uchala masofa oʻlchandi. Endi eng yaqin namunani bos.");
            }
            return;
          }
          if (n.id !== d.natija.namuna.id) {
            QK.sound.play("retry");
            ui.bubble("elder", "↻ Eng yaqin namuna — masofasi eng kichigi.");
            return;
          }
          b.classList.add("yaqin");
          done();
        });
        return b;
      });
      el.append(common.kartalar(...tugmalar));
    });
    QK.sound.play("correct");
    await ui.say("elder", `✓ Eng kichik masofa — ${d.natija.masofa}. Model javobi: ${d.natija.sinf}.`);
    await ui.say("elder", "Atama: eng yaqin namuna usuli (nearest neighbour). Yorligʻi (label) maʼlum namunalar — oʻquv toʻplami (training set); yangi chizma eng yaqin namunaning yorligʻini oladi.");
    await ui.say("elder", `Ikki sinfgacha masofa deyarli teng boʻlsa, model oson adashadi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
