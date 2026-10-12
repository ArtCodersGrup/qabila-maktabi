// 2-bosqich: manbani tekshirish — kim tarqatdi, boshqa manbada bormi, sana mosmi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const NAMUNA = {
    davo: "Maktab direktori taʼtil bir oyga uzaytirilganini eʼlon qildi",
    qatorlar: [
      { sarlavha: L.SARLAVHA.kim, tugma: "Kim tarqatdi?", matn: "Akkaunt 2 kun oldin ochilgan, boshqa posti yoʻq", yomon: true },
      { sarlavha: L.SARLAVHA.boshqa, tugma: "Boshqa manbada bormi?", matn: "Maktabning rasmiy sahifasida bunday eʼlon yoʻq", yomon: true },
      { sarlavha: L.SARLAVHA.sana, tugma: "Sana mosmi?", matn: "Post «bugun» deydi, lekin shu video 2 oydan beri internetda bor", yomon: true },
    ],
  };

  // Oʻquvchi ulashishdan oldin uch savolni oʻzi beradi — har savol bitta satrni ochadi
  async function korsat() {
    const el = common.box(true);
    const joy = h("div", { class: "df-joy" });
    el.append(joy);
    const chiz = (n) => {
      joy.innerHTML = "";
      joy.append(common.postKarta({ davo: NAMUNA.davo, qatorlar: NAMUNA.qatorlar.slice(0, n) }, true));
    };
    chiz(0);
    ui.bubble("elder", "Sinf guruhiga shunday video keldi. Ulashishdan oldin uch savol ber — birinchisini bos.");
    for (let n = 0; n < NAMUNA.qatorlar.length; n++) {
      await ui.choice([{ label: NAMUNA.qatorlar[n].tugma, value: n }]);
      chiz(n + 1);
    }
    await ui.say("elder", "✓ Uch tekshiruvdan ham oʻtmadi: yangi akkaunt, rasmiy manbada yoʻq, sana mos emas. Bunday xabar ulashilmaydi.");

    const el2 = common.box(true);
    el2.append(common.qoidaKarta("Manbani tekshirish (fact-checking)", [
      "1. Kim tarqatdi? Akkaunt yoshi, tasdiq belgisi, aloqa manzili.",
      "2. Boshqa mustaqil manbada bormi? Rasmiy sahifa nima deydi?",
      "3. Sana va joy mosmi? Videoning eng eski nusxasi qachon paydo boʻlgan?",
    ]));
    await ui.say("elder", "Bu uch savol dipfeyk belgilari koʻrinmaganda ham ishlaydi: soxta videoning yuzi mukammal boʻlishi mumkin, lekin manbasi baribir shubhali.");
    await ui.say("elder", "Koʻp ulashilgani — dalil emas: ming marta koʻchirilgan post baribir bitta manba. Zanjirning boshini izla.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — postni baholash, asl manbani topish va sanani hisoblash.`);
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
