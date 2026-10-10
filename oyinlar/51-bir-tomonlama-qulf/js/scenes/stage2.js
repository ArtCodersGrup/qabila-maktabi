// 2-bosqich: barmoq izi — sayt parolni emas, izini saqlaydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function qoida() {
    const el = common.box(true);
    el.append(common.note("Parol uchun ham bir tomonlama amal bor — uning natijasi iz (xesh)."));
    el.append(common.alifboJadval());
    el.append(common.qoidaQuti(0));
    await ui.say("elder", "1-qadam: har harf alifbodagi oʻrniga aylanadi: a = 1, b = 2, … z = 26.");
    await ui.say("elder", "Keyin har belgi uchun: iz = (iz · 3 + son) mod 100. Qoʻlda ham hisoblanadi.");

    const misol = common.box(true);
    misol.append(common.parolKarta("olma"));
    misol.append(common.izJadval(L.izQadamlar("olma", 0)));
    misol.append(common.izChip(L.iz("olma")));
    await ui.say("elder", "«olma» parolining izi — " + L.iz("olma") + ". Parolning oʻzi hech qayerda saqlanmadi.");
    await ui.say("elder", "Izdan parolni qaytarib boʻlmaydi: yigʻindi misolidagidek, koʻp parol bir xil iz beradi.");
  }

  async function kirish() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "story-art small", html: QK.gameArt.baza() }));
    el.append(common.note("Sayt bazasida parol yoʻq — faqat izlar"));
    await ui.say("elder", "Kirishda sayt sen yozgan parolning izini qaytadan hisoblaydi.");
    await ui.say("elder", "Keyin bazadagi iz bilan solishtiradi: mos kelsa — kirish ruxsat etiladi.");

    const taqqos = common.box(true);
    taqqos.append(common.note("Bazadagi iz — " + L.iz("olma")));
    taqqos.append(ui.h("div", { class: "bq-juft" },
      common.parolKarta("olma", { nom: "Toʻgʻri parol", qiymat: false, iz: true, belgi: "✓" }),
      common.parolKarta("olmo", { nom: "Xato parol", qiymat: false, iz: true, belgi: "↻" })));
    await ui.say("elder", "Faqat oxirgi harf oʻzgardi, iz esa butunlay boshqa chiqdi.");
    await ui.say("elder", "Baza oʻgʻirlansa ham, oʻgʻri faqat izlarni oladi — parollar unda yoʻq.");
    await ui.say("elder", `Bizning iz 2 xonali — qoʻlda hisoblash uchun; haqiqiy xesh ancha uzun. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage2() {
    await qoida();
    await kirish();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
