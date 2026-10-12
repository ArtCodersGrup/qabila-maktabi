// 2-bosqich: o'quv va test to'plami; aniqlik = to'g'ri ÷ jami.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function korsat() {
    const d = L.demo2();
    const el = common.box(true);
    const joy = h("div", { class: "at-joy" });
    el.append(joy);
    const hammasi = d.oquv.concat(d.test);
    const chiz = (ajratilgan) => {
      joy.textContent = "";
      joy.append(common.jadval(hammasi.map((x) => ({
        buyum: x,
        holat: ajratilgan ? (d.test.includes(x) ? "test" : "oquv") : "",
        guruh: ajratilgan ? (d.test.includes(x) ? "test" : "oʻquv") : "",
      })), { nom: true, yorliq: true, guruh: ajratilgan }));
    };
    chiz(false);
    ui.bubble("elder", `${hammasi.length} ta belgilangan buyum bor. Hammasini oʻqitishga bersak, modelni tekshirishga hech narsa qolmaydi.`);
    await ui.choice([{ label: `Ajratish: ${d.oquv.length} ta oʻquv, ${d.test.length} ta test`, value: "ok" }]);
    chiz(true);
    ui.bubble("elder", "Model faqat oʻquv qatorlarini koʻradi. Test qatorlari — u koʻrmagan buyumlar. Modelni sinab koʻr.");
    await ui.choice([{ label: "Testda tekshirish", value: "ok" }]);
    QK.sound.play("tap");
    joy.textContent = "";
    joy.append(common.sarlavha("Test toʻplami"), common.natijaJadvali(d.natija.natijalar, true), common.answer(common.aniqlikYoz(d.natija)));
    const xato = d.natija.natijalar.find((n) => !n.togri);
    await ui.say("elder", `Testda ${d.natija.togri} ta toʻgʻri, jami ${d.natija.jami} ta — aniqlik ${d.natija.foiz}%.` + (xato ? ` Xato: «${xato.buyum.nom}» — model «${xato.model}» dedi.` : ""));
    ui.bubble("elder", "Agar modelni oʻzi koʻrgan oʻquv qatorlarida tekshirsak-chi?");
    await ui.choice([{ label: "Oʻquv toʻplamida tekshirish", value: "ok" }]);
    QK.sound.play("tap");
    joy.textContent = "";
    joy.append(common.sarlavha("Oʻquv toʻplami"), common.natijaJadvali(d.ozida.natijalar, true), common.answer(common.aniqlikYoz(d.ozida)));
    await ui.say("elder", `Oʻquv toʻplamida — ${d.ozida.foiz}%: model bu qatorlarni shunchaki eslab qolgan. Haqiqiy sifatni faqat u koʻrmagan test toʻplami (test set) koʻrsatadi.`);
    await ui.say("elder", `Atama: aniqlik (accuracy) = toʻgʻri javoblar ÷ jami. Oʻquv toʻplami (training set) — oʻrganish uchun, test toʻplami — tekshirish uchun. Mashq: ${QK.practice.need()} ta savol.`);
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
