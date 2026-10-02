// Kirish va 1-bosqich: charx aylanadi — while sikli (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.wheel(5) }));
    await ui.say("elder", "Suv charxi aylanaveradi. Uni nima toʻxtatadi?");
    await ui.say("apprentice", "Suv tugasa toʻxtaydi.");
    await ui.say("elder", "Dasturda ham shunday: shart yolgʻon boʻlganda takror toʻxtaydi.");
  }

  async function counter() {
    const code = "i = 1\nwhile i <= 5:\n    print(i)\n    i += 1";
    const el = common.box();
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: shart satri har aylanishda qayta yonadi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "Sikl 5 marta aylandi. Har safar i qutisi bittaga oshdi.");
  }

  // Cheksiz sikl: qadam chegarasi tutadi — bu jazo emas, dars
  async function endless() {
    const bad = "i = 1\nwhile i <= 5:\n    print(i)";
    const task = { type: "xato-top", code: bad, solution: "i = 1\nwhile i <= 5:\n    print(i)\n    i += 1" };
    const el = common.box();
    el.append(common.note("Bu koddan bitta satr tushib qolgan. Avval ishga tushirib koʻr:"));
    const say = common.liveNote(el);
    await ui.settle((done) => {
      common.bench(el, {
        code: bad, rows: 4,
        onRun: (result, code) => {
          if (K.check(task, code).ok) done();
          else if (result.error && result.error.type === "Limit") say("↻ Sikl toʻxtamadi: i hech qachon oʻzgarmayapti. i += 1 qatorini qoʻsh.");
          else say("↻ Hali boʻlmadi. 1 dan 5 gacha chiqishi kerak.");
        },
      });
    });
    await ui.say("elder", "Hisoblagich oʻzgarmasa — shart doim rost. Bu cheksiz sikl deyiladi.");
    await ui.say("elder", "Saytda 3 000 000 qadamdan keyin toʻxtatiladi, lekin haqiqiy kompyuterda dastur qotib qoladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "while shart:" }),
      ui.h("div", { class: "formula-row", text: "    shart rost boʻlgan har safar qayta bajariladi" }),
      ui.h("div", { class: "formula-row", text: "hisoblagichni oʻzgartirishni unutma" })));
    await ui.say("elder", "Uch narsa kerak: boshlangʻich qiymat, shart va oʻzgartirish.");
  }

  async function stage1() {
    await counter();
    await endless();
    await definition();
    await ui.say("elder", `Endi oʻzing ayt: sikl nima chiqaradi? ${QK.practice.need()} ta toʻgʻri javob kerak.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.countTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Aylanishlarni toʻgʻri sanading.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
