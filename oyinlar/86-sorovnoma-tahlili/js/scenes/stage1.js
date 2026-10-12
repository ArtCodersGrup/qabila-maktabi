// Kirish va 1-bosqich: ma'lumotni tozalash — for + if.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.pipeline(true) }));
    await ui.say("elder", "Maqsad: kichik maʼlumot tahlili (data analysis) loyihasi — sinf soʻrovnomasini tozalash, funksiyalar bilan hisoblash va savolga javob berish.");
    await ui.say("elder", "Soʻrovnoma anonim: roʻyxatlarda ism yoʻq, faqat javoblar. Ortiqcha shaxsiy maʼlumot yigʻmaslik — maxfiylik (privacy) qoidasi.");
  }

  async function dirty() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.iflos.code);
    await ui.say("elder", "Olti javobdan ikkitasi xato kiritilgan: −3 va 150. Oʻrtacha yosh 34.5 chiqdi — ikki qiymat butun natijani buzdi.");
  }

  async function loop() {
    const el = common.box();
    const step = U.stepper({ code: L.SAMPLES.tozalash.code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: for har javobni koʻradi, if oraliqni tekshiradi, append toʻgʻrisini yangi roʻyxatga qoʻshadi.");
    await ui.settle((done) => {
      const finish = () => { ui.clearControl(); done(); };
      ui.control().append(ui.h("div", { class: "choice-row" },
        ui.button("⏭ Qadam", () => { if (!step.step()) finish(); }, "big"),
        ui.button("Oxirigacha", () => { step.all(); finish(); }, "secondary")));
    });
    await ui.say("elder", "Bu — maʼlumotni tozalash (data cleaning). Asl roʻyxat oʻzgarmaydi: toʻgʻri qiymatlar yangi roʻyxatga yigʻiladi.");
  }

  async function cleaned() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.toza_ortacha.code);
    await ui.say("elder", "Tozalangan roʻyxatda oʻrtacha 15.0. Qaysi qiymat xato ekanini qoida belgilaydi — masalan, 9-sinfda yosh 10 dan 18 gacha.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "toza = []" }),
      ui.h("div", { class: "formula-row kod", text: "for x in javoblar:" }),
      ui.h("div", { class: "formula-row kod", text: "    if shart:  toza.append(x)" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta roʻyxat. Kod yashirin maʼlumotlarda ham sinaladi — «nom = [...]» satriga tegma va javobni qoʻlda yozma.`);
  }

  async function stage1() {
    await dirty();
    await loop();
    await cleaned();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.cleanTask(prev, Math.random, tier),
      run: (task) => common.dataExercise(task),
      praise: () => "Kod hamma maʼlumotda toʻgʻri ishladi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
