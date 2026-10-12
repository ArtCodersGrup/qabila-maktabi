// Kirish va 1-bosqich: def, parametr, return — kodni o'qib, natijani aytish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.machine(true) }));
    await ui.say("elder", "Maqsad: funksiya (function) yozish — hisobni bir marta taʼriflab, koʻp marta ishlatish: def, parametr, return.");
    await ui.say("elder", "Maʼlumot tahlili va AI kodi shunday gʻishtlardan tuziladi: ortacha(royxat), aniqlik(togri, jami), masofa(a, b).");
  }

  async function first() {
    const el = common.box();
    const step = U.stepper({ code: L.SAMPLES.birinchi.code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: def satri funksiyani faqat eslab qoladi; tanasi chaqirilganda bajariladi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "Formula bir marta yozildi, ikki marta ishladi. return qiymatni chaqirilgan joyga qaytaradi — uni saqlash yoki chiqarish mumkin.");
  }

  async function params() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.parametr.code);
    await ui.say("elder", "Qavsdagi nomlar — parametr (parameter), chaqiruvda berilgan qiymatlar — argument. Birinchi argument birinchi parametrga tushadi.");
  }

  async function printOrReturn() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.print_return.code);
    await ui.say("elder", "print ekranga yozadi, lekin qaytarmaydi — a ichida None. Keyin hisobda ishlatiladigan natija return bilan qaytariladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "def nom(parametrlar):" }),
      ui.h("div", { class: "formula-row kod", text: "    return natija" }),
      ui.h("div", { class: "formula-row", text: "nom(argumentlar) — chaqiruv; oʻrniga natija keladi" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Har biri nima chiqarishini aniqla. Eslatma: / natijasi doim kasr son, 6 / 2 = 3.0.`);
  }

  async function stage1() {
    await first();
    await params();
    await printOrReturn();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.readTask(prev, Math.random, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Chaqiruvlar toʻgʻri kuzatildi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
