// 2-bosqich: AI ⊃ ML ⊃ DL — texnologiyani halqaga joylash; vaznlar soni va ma‘lumot hajmi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const NAMUNA = [
    { z: "oddiy", qisqa: "Kalkulyator", matn: "Kalkulyator: tayyor formula boʻyicha hisoblaydi." },
    { z: "ai", qisqa: "Shaxmat dasturi", matn: "Shaxmat dasturi: yurishlarni oldindan koʻradi; baholash qoidalarini dasturchi yozgan." },
    { z: "ml", qisqa: "Spam filtri", matn: "Spam filtri: belgilangan xatlardan oʻrgangan; neyron tarmoq emas." },
    { z: "dl", qisqa: "Yuzni tanish", matn: "Yuzni tanish: millionlab suratda oʻqitilgan koʻp qatlamli neyron tarmoq." },
  ];

  // Bola to‘rt texnologiyani birma-bir halqaga joylaydi
  async function joylat() {
    const el = common.box(true);
    const karta = common.matnKarta(NAMUNA[0].matn);
    el.append(common.savol("Har texnologiyani eng ichki mos halqaga joyla."), karta);
    ui.bubble("elder", "Halqalar ichma-ich: ichkaridagi toʻplam tashqaridagining bir qismi. Mos halqani bos.");
    let i = 0;
    await ui.settle((done) => {
      const halqa = common.halqalar((z) => {
        if (i >= NAMUNA.length) return;
        if (z !== NAMUNA[i].z) {
          QK.sound.play("retry");
          ui.bubble("elder", "↻ Uch savol: aqliy vazifami? Maʼlumotdan oʻrganganmi? Koʻp qatlamli neyron tarmoqmi?");
          return;
        }
        QK.sound.play("correct");
        halqa.qosh(z, NAMUNA[i].qisqa);
        i++;
        if (i === NAMUNA.length) {
          karta.remove();
          done();
          return;
        }
        karta.textContent = NAMUNA[i].matn;
        ui.bubble("elder", `✓ Joyida. Keyingisi — ${NAMUNA.length} tadan ${i + 1}-si.`);
      });
      el.append(halqa.el);
    });
    await ui.say("elder", "✓ Toʻplamlar ichma-ich: DL ⊂ ML ⊂ AI. Chuqur oʻrganish (deep learning, DL) — koʻp qatlamli neyron tarmoqqa asoslangan ML.");
  }

  // Tarmoq kattalashgani sari vaznlar soni o‘sadi
  async function tarmoqKorsat() {
    const el = common.box(true);
    const TARMOQLAR = [[4, 3, 2], [4, 6, 6, 2], [8, 8, 8, 8, 2]];
    const svg = h("div", { class: "ao-tarmoq" });
    const hisob = h("div", { class: "ao-hisob", "aria-live": "polite" });
    el.append(common.savol("Neyron tarmoq: doiralar — neyronlar, chiziqlar — bogʻlanishlar. Har bogʻlanishning oʻz vazni bor."), svg, hisob);
    for (let k = 0; k < TARMOQLAR.length; k++) {
      const q = TARMOQLAR[k];
      svg.innerHTML = QK.gameArt.tarmoq(q);
      hisob.textContent = `${q.join(" → ")}: ${L.boglanishYoz(q)} = ${L.boglanishlar(q)} ta vazn`;
      if (k < TARMOQLAR.length - 1) {
        ui.bubble("elder", k === 0
          ? "Qoʻshni qatlamlarda har neyron har neyronga ulangan: vaznlar soni — koʻpaytmalar yigʻindisi. Tarmoqni kattalashtir."
          : `Qatlam qoʻshildi va kengaydi: endi ${L.boglanishlar(q)} ta vazn. Yana kattalashtir.`);
        await ui.choice([{ label: "Tarmoqni kattalashtirish", value: "ok" }]);
      }
    }
    await ui.say("elder", `${L.boglanishlar(TARMOQLAR[2])} ta vazn. Har vazn — maʼlumotdan topiladigan son: vaznlar koʻpaygani sari koʻproq misol kerak.`);
    await ui.say("elder", `Haqiqiy DL modellarida vaznlar millionlab, shuning uchun ular juda koʻp maʼlumot talab qiladi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage2() {
    await joylat();
    await tarmoqKorsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
