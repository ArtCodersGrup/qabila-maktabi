// Kirish va 1-bosqich: o'z buyrug'ing — def va chaqiruv (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  const withOutput = (host, code) => {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(code), code);
    host.append(out.el);
  };

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.bench(true) }));
    await ui.say("elder", "Maqsad: funksiya — def bilan oʻz buyrugʻingni eʼlon qilish va chaqirish.");
    await ui.say("elder", "Kalit gʻoya: funksiya — dastgoh. Parametr orqali qiymat kiradi, return orqali natija chiqadi.");
  }

  async function firstDef() {
    const code = 'def salom():\n    print("Salom!")\n\nsalom()\nsalom()';
    const el = common.box();
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: def satri funksiyani yozib qoʻyadi, bajarmaydi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "Funksiya tanasi faqat chaqirilganda bajariladi: ikkita chaqiruv — ikki marta.");
  }

  async function withParam() {
    const el = common.box();
    withOutput(el, 'def salom(ism):\n    print("Salom,", ism)\n\nsalom("Anvar")\nsalom("Malika")');
    await ui.say("elder", "Qavs ichidagi nom — parametr. Chaqiruvda unga beriladigan qiymat — argument.");
    await ui.say("elder", "Bitta funksiya, har xil argument — har xil natija.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "def nom(parametr):" }),
      ui.h("div", { class: "formula-row", text: "    surilgan satrlar — funksiya tanasi" }),
      ui.h("div", { class: "formula-row kod", text: "nom(qiymat)   ← chaqiruv" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Har biri nima chiqarishini aniqla.`);
  }

  async function stage1() {
    await firstDef();
    await withParam();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.callTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Chaqiruvlar toʻgʻri kuzatildi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
