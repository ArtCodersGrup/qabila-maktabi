// Kirish va 1-bosqich: o'zgaruvchi va besh tur — turni aniqlash.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;
  const N = L.NAMUNALAR;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.qutilar(false) }));
    await ui.say("elder", "Maqsad: oʻzgaruvchi va maʼlumot turlari — int, float, str, bool, list; turni oʻgirish; roʻyxat indeksi va len().");
    await ui.say("elder", "Kalit gʻoya: har qiymatning turi (type) bor va amal natijasi turga bogʻliq: 4 + 6 = 10, lekin \"4\" + \"6\" = \"46\".");
  }

  async function variables() {
    const el = common.box();
    const step = U.stepper({ code: N.ozgaruvchilar });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: = belgisi qiymatni oʻzgaruvchiga (variable) — nomli qutiga — yozadi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
  }

  async function fiveTypes() {
    const el = common.box(false);
    const qator = (turi, misol, nima) => ui.h("div", { class: "tur-qator" },
      ui.h("span", { class: "tur-nom", text: turi }),
      ui.h("span", { class: "tur-misol", text: misol }),
      ui.h("span", { class: "tur-nima", text: nima }));
    el.append(ui.h("div", { class: "tur-jadval" },
      qator("int", "15", "butun son: sanoq, yosh"),
      qator("float", "0.87", "kasr son: oʻlchov, ehtimol"),
      qator("str", "\"spam\"", "matn (string): yorliq, ism"),
      qator("bool", "True", "ha yoki yoʻq: True / False"),
      qator("list", "[4, 5, 3]", "roʻyxat: bir nechta qiymat")));
    await ui.say("elder", "Besh tur. Maʼlumot toʻplamida har belgi (feature) qiymati shu turlardan birida saqlanadi.");
    await ui.say("elder", "Tur yozilishdan bilinadi: \"36.6\" qoʻshtirnoqda — str, 50.0 nuqtali — float, True qoʻshtirnoqsiz — bool.");
  }

  async function typeFn() {
    const el = common.box();
    common.withOutput(el, N.turlar);
    await ui.say("elder", "type(x) qiymatning turini aytadi. Chiqishda class soʻzidan keyin, qoʻshtirnoq ichida turgan nom — tur.");
  }

  async function operations() {
    const el = common.box();
    common.withOutput(el, N.amallar);
    await ui.say("elder", "Amal ham tur beradi: / har doim float (10 / 2 = 5.0), // butun boʻlinma — int, solishtirish — bool, matnlarda + ulaydi.");
  }

  async function stage1() {
    await variables();
    await fiveTypes();
    await typeFn();
    await operations();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — oʻzgaruvchining turini tanla yoki type() chiqishini yoz.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage1Task(Math.random, prev, tier),
      run: (task) => common.stage1Exercise(task),
      praise: (task) => (task.type === "tur" ? `type(${task.name}) → ${task.chiqish}` : "type() chiqishi toʻgʻri."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
