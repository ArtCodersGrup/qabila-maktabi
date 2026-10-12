// 3-bosqich: to'liq mini loyiha — tozalash, hisob va savolga javob.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function project() {
    const el = common.box();
    el.append(ui.h("div", { class: "savol", text: "Savol: sinf oʻrtacha kamida 8 soat uxlaydimi?" }));
    common.withOutput(el, L.SAMPLES.loyiha.code);
    await ui.say("elder", "Toʻliq yoʻl: maʼlumot → tozalash → hisob → xulosa. Xulosa savolga javob beradi va son bilan asoslanadi.");
    await ui.say("elder", "Cheklov: bu bitta sinf — kichik tanlanma (sample). Xulosa faqat shu sinf haqida, butun maktab yoki hamma oʻsmirlar haqida emas.");
  }

  async function rules() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.pipeline(true) }));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol. Kerakli funksiyalar muharrirda tayyor; chiqish aynan namunadagi koʻrinishda boʻlsin.`);
    await ui.say("elder", "Kod yashirin maʼlumotlarda ham sinaladi: ularda xulosa boshqacha chiqishi mumkin, shuning uchun javobni qoʻlda yozib boʻlmaydi.");
  }

  async function stage3() {
    await project();
    await rules();
    await practice.exercises({
      next: (prev, correct, tier) => L.reportTask(prev, Math.random, tier),
      run: (task) => common.dataExercise(task),
      praise: () => "Xulosa hamma maʼlumotda toʻgʻri chiqdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
