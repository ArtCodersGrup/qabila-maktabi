// 3-bosqich: tanlash saralashi, o'lchov va kod yozish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  // Tanlash saralashi qadam-baqadam ko'rsatiladi
  async function tanlash() {
    const boshlangich = [5, 2, 9, 1, 7];
    const { qadamlar, natija } = L.tanlashQadamlar(boshlangich);
    const host = common.box(true);
    host.append(common.note("Boshqa usul: har safar qolganidan eng kichigini topib, oldinga qoʻyamiz."));
    const joy = ui.h("div", {});
    host.append(joy);
    for (const q of qadamlar) {
      joy.innerHTML = "";
      joy.append(common.ustunlar(q.holat, { eng: q.engKichik, tayyor: q.boshi }));
      ui.bubble("elder", "Qolganidan eng kichigi — " + q.holat[q.engKichik] + ". Uni oldinga olamiz.");
      await ui.settle((done) => ui.control().append(ui.button("Davom ▶︎", () => { ui.clearControl(); done(); })));
    }
    joy.innerHTML = "";
    joy.append(common.ustunlar(natija, { tayyor: 0 }));
    await ui.say("elder", "Tanlash saralashi. Pufakchadan farqi: almashtirish kam, qiyoslash — oʻsha-oʻsha.");
  }

  async function olchov() {
    const el = common.box(false);
    el.append(common.note("Ikkala usulni oʻlchab koʻramiz — faqat saralash qadamlari:"));
    el.append(common.jadvalN(L.jadval([5, 10, 20, 40])));
    await ui.say("elder", "Roʻyxat ikki barobar uzaysa, qadamlar toʻrt barobar koʻpayadi.");
    await ui.say("elder", "Izlashdan farqi shu: u yerda ikki barobar edi, bu yerda toʻrt barobar. Sabab — ikki qavat sikl.");
  }

  async function stage3() {
    await tanlash();
    await olchov();
    await ui.say("elder", "Endi oʻzing yoz: avval pufakcha, keyin tanlash.");
    await practice.exercises({
      next: (prev) => L.writeTask(Math.random, prev),
      run: (task) => common.yozishExercise(task),
      praise: () => "Saralash ishladi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
