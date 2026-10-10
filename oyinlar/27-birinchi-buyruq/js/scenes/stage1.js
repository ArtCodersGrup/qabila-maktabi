// Kirish va 1-bosqich: birinchi buyruq — print (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.screen() }));
    await ui.say("elder", "Maqsad: Pythonda birinchi buyruq — print — va xato xabarini oʻqish.");
    await ui.say("elder", "Dastur (kod) — klaviaturada yoziladigan buyruqlar matni. Kompyuter uni yuqoridan pastga bajaradi.");
  }

  // Ko'rsatish: berilgan kodni terib, ishga tushirish (xato urinish sanalmaydi)
  async function firstRun() {
    const code = 'print("Salom, qabila!")';
    const el = common.box();
    el.append(common.note("Shu kodni ter va ▶︎ ni bos:"));
    el.append(U.codeBlock(code, { numbers: false }));
    const say = common.liveNote(el);
    await ui.settle((done) => {
      common.bench(el, {
        onRun: (result, typed) => {
          if (K.check({ type: "ter", code }, typed).ok) done();
          else say("↻ Hali aynan bir xil emas. Qavs, qoʻshtirnoq va nuqtani solishtir.");
        },
      });
    });
    await ui.say("elder", "Qoʻshtirnoq ichidagi matn ekranga chiqdi.");
    await ui.say("elder", "print — buyruq nomi; qavs ichida — nima chiqarilishi.");
  }

  // O'z matnini yozish: nima yozishini bola o'zi tanlaydi, faqat kod ishlashi kerak
  async function ownText() {
    const el = common.box();
    el.append(common.note("Endi oʻz matning: qoʻshtirnoq ichiga istagan matnni yoz:"));
    el.append(U.codeBlock('print("Salom, men Anvarman!")', { numbers: false }));
    const say = common.liveNote(el);
    await ui.settle((done) => {
      common.bench(el, {
        code: 'print("',
        onRun: (result) => {
          if (!result.error && K.normalize(result.output).length) done();
          else if (!result.error) say("↻ Hech narsa chiqmadi. Qoʻshtirnoq ichiga matn yoz.");
        },
      });
    });
    await ui.say("elder", "Dastur sen yozgan matnni oʻzgartirmay chiqardi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: 'print("matn")' }),
      ui.h("div", { class: "formula-row", text: "qoʻshtirnoq ichidagi matn ekranga chiqadi" })));
    await ui.say("elder", "print — chiqarish buyrugʻi: qoʻshtirnoq ichidagi matnni ekranga chiqaradi.");
    await ui.say("elder", "Har print alohida satr chiqaradi; buyruqlar yozilgan tartibda bajariladi.");
  }

  async function stage1() {
    await firstRun();
    await ownText();
    await definition();
    // Terish — koʻchirish mashqi: 2 ta toʻgʻri javob yetadi (2026-10-02); qiyin rejimda ikki satr teriladi
    await ui.say("elder", "Mashq: 2 ta kodni aynan koʻchirib ter.");
    await practice.exercises({
      need: 2,
      next: (prev, correct, tier) => L.typeTask(Math.random, prev, practice.isHard() ? 2 : 0),
      run: (task) => common.typeExercise(task),
      praise: () => "Kod aynan mos tushdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
