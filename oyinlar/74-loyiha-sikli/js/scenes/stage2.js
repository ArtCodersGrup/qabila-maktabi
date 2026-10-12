// 2-bosqich: ish qaysi bosqichga tegishli — bola olti ishni besh bosqichga ajratadi (barg loyihasi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const NAMUNA = [
    { b: "model", matn: "Belgilangan suratlarda tasniflash modelini oʻqitish" },
    { b: "yigish", matn: "Daladan sogʻlom va kasal barglarning suratlarini olish" },
    { b: "baho", matn: "Modelni u koʻrmagan suratlarda tekshirish" },
    { b: "muammo", matn: "Kim foydalanishini yozish: fermer, telefon, javob — «sogʻlom» yoki «kasal»" },
    { b: "yigish", matn: "Fermerlardan suratlarni ishlatishga rozilik olish" },
    { b: "organish", matn: "Har sinfdan nechta surat borligini sanash, xira suratlarni topish" },
  ];

  async function ajrat() {
    const el = common.box(true);
    const karta = common.matnKarta(NAMUNA[0].matn);
    const doska = h("div", { class: "ls-doska", "aria-live": "polite" });
    const qatorlar = {};
    L.BOSQICHLAR.forEach((b, i) => {
      const belgilar = h("span", { class: "ls-doska-belgi" });
      qatorlar[b.k] = belgilar;
      doska.append(h("div", { class: "ls-doska-qator" }, h("span", { text: `${i + 1}. ${b.nom}` }), belgilar));
    });
    el.append(common.savol("Loyiha: barg suratidan kasallikni aniqlash. Har ishni oʻz bosqichiga joyla."), karta, doska);
    ui.bubble("elder", `${NAMUNA.length} ta ish bor. Ish qaysi bosqichga tegishli — tugmasini bos.`);
    let i = 0;
    await ui.settle((done) => {
      ui.control().append(common.bosqichTugmalari((k) => {
        if (i >= NAMUNA.length) return;
        if (k !== NAMUNA[i].b) {
          QK.sound.play("retry");
          ui.bubble("elder", "↻ Ishdan nima hosil boʻladi: savolmi, yangi maʼlumotmi, xulosami, modelmi yoki model bahosimi?");
          return;
        }
        QK.sound.play("correct");
        qatorlar[k].append(h("span", { class: "ls-nuqta", text: "✓" }));
        i++;
        if (i === NAMUNA.length) {
          karta.remove();
          ui.clearControl();
          done();
          return;
        }
        karta.textContent = NAMUNA[i].matn;
        ui.bubble("elder", `✓ ${L.nom(k)}. Keyingi ish — ${NAMUNA.length} tadan ${i + 1}-si.`);
      }));
    });
    await ui.say("elder", "✓ Olti ish besh bosqichga joylashdi. Bitta bosqichda bir nechta ish boʻlishi mumkin: rozilik olish ham — maʼlumot yigʻish.");
  }

  async function nomla() {
    const el = common.box(true);
    common.formula(el, [
      "Muammoni belgilash — nimani, kim uchun, nega hal qilamiz?",
      "Maʼlumot yigʻish — qayerdan, qancha, ruxsat bormi?",
      "Maʼlumotni oʻrganish — ichida nima bor, nima yetishmaydi?",
      "Modellash — qaysi model, qanday oʻqitiladi?",
      "Baholash — yangi misollarda qanchalik toʻgʻri?",
    ]);
    await ui.say("elder", "Har bosqichning oʻz savoli bor — ekranda. Muammoni belgilashda 4W yordam beradi: kim, nima, qayerda, nega (who, what, where, why).");
    await ui.say("elder", `Etika: maʼlumot rozilik bilan va faqat kerakli hajmda yigʻiladi — maxfiylik shu bosqichda hal boʻladi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage2() {
    await ajrat();
    await nomla();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
