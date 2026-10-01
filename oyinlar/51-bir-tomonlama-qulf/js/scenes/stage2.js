// 2-bosqich: barmoq izi — sayt parolni emas, izini saqlaydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function qoida() {
    const el = common.box(true);
    el.append(common.note("Parol uchun ham shunday amal bor. Unga iz deymiz."));
    el.append(common.alifboJadval());
    el.append(common.qoidaQuti(0));
    await ui.say("elder", "Har harf oʻz soniga aylanadi: a — 1, b — 2, z — 26.");
    await ui.say("elder", "Keyin uch qadamli qoida. Qoʻlda ham hisoblanadi.");

    const misol = common.box(true);
    misol.append(common.parolKarta("olma"));
    misol.append(common.izJadval(L.izQadamlar("olma", 0)));
    misol.append(common.izChip(L.iz("olma")));
    await ui.say("elder", "«olma» parolining izi — " + L.iz("olma") + ". Parolning oʻzi hech qayerda qolmadi.");
    await ui.say("apprentice", "Izdan orqaga qaytib parolni topsam boʻladimi?");
    await ui.say("elder", "Yoʻq. Yigʻindi misolidagidek — koʻp parol bir xil iz beradi.");
  }

  async function kirish() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "story-art small", html: QK.gameArt.baza() }));
    el.append(common.note("Sayt bazasida parol yoʻq — faqat izlar"));
    await ui.say("elder", "Sen kirganda sayt yozganing izini qaytadan hisoblaydi.");
    await ui.say("elder", "Saqlangan iz bilan solishtiradi: mos kelsa — kirasan.");

    const taqqos = common.box(true);
    taqqos.append(common.note("Bazadagi iz — " + L.iz("olma")));
    taqqos.append(ui.h("div", { class: "bq-juft" },
      common.parolKarta("olma", { nom: "Toʻgʻri parol", qiymat: false, iz: true, belgi: "✓" }),
      common.parolKarta("olmo", { nom: "Xato parol", qiymat: false, iz: true, belgi: "↻" })));
    await ui.say("elder", "Oxirgi harf oʻzgardi — iz butunlay boshqa chiqdi.");
    await ui.say("apprentice", "Baza oʻgʻirlansa, oʻgʻri nimani oladi?");
    await ui.say("elder", "Faqat izlarni. Paroling esa unda yoʻq.");
    await ui.say("elder", "Bizning iz qisqa — qoʻlda hisoblash uchun. Haqiqiy saytlarda u ancha uzun.");
  }

  async function stage2() {
    await qoida();
    await kirish();
    await practice.exercises({
      next: (prev, togri) => L.bosqich2Task(Math.random, prev, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
