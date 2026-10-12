// 2-bosqich: turni o'girish — int(), float(), str() va tur xatolari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const N = L.NAMUNALAR;

  async function typeError() {
    const el = common.box();
    common.withOutput(el, N.matnBolish);
    await ui.say("elder", "Fayldan yoki klaviaturadan kelgan maʼlumot — matn (str). Matnni boʻlib boʻlmaydi: TypeError — amal bu turga mos emas.");
  }

  async function convert() {
    const el = common.box();
    common.withOutput(el, N.ogirish);
    await ui.say("elder", "Turni oʻgirish (type conversion): int(), float(), str(). Songa oʻgirilgach hisoblash mumkin; str() sonni matnga ulash uchun kerak.");
    await ui.say("elder", "int(3.99) = 3: int() yaxlitlamaydi, kasr qismini tashlab yuboradi. Yaxlitlash uchun — round(3.99) = 4.");
  }

  async function valueError() {
    const el = common.box();
    common.withOutput(el, N.intKasr);
    await ui.say("elder", "int() faqat butun son yozilgan matnni oʻgiradi; \"0.87\" uchun float() kerak. Bu — ValueError: tur toʻgʻri (str), qiymat mos emas.");
  }

  async function silent() {
    const el = common.box();
    common.withOutput(el, N.jimXato);
    await ui.say("elder", "Eng xavflisi — xatosiz notoʻgʻri natija: \"15\" * 2 = \"1515\". Model shunday maʼlumotda oʻqitilsa, uning xulosasi ham notoʻgʻri boʻladi — turlarni tahlildan oldin tekshir.");
  }

  async function stage2() {
    await typeError();
    await convert();
    await valueError();
    await silent();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta topshiriq — oʻgirish natijasini ayt yoki tur xatosini tuzat.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage2Task(Math.random, prev, tier),
      run: (task) => common.stage2Exercise(task),
      praise: (task) => (task.type === "xato-top" ? "Tur xatosi tuzatildi." : "Oʻgirish natijasi toʻgʻri."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
