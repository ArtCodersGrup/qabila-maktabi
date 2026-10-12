// 2-bosqich: yordamchi funksiyalar — ortacha, sanash, eng_kop.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function numeric() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.funksiya.code);
    await ui.say("elder", "Tahlilda bir xil hisob koʻp marta kerak: uyqu oʻrtachasi, yosh oʻrtachasi. U bir marta funksiya qilib yoziladi va har roʻyxat bilan chaqiriladi.");
  }

  async function categorical() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.moda.code);
    await ui.say("elder", "Fan nomi — toifali maʼlumot: unda oʻrtacha yoʻq, qiymatlar sanaladi. Eng koʻp uchragan qiymat — moda (mode).");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "ortacha(royxat)" }),
      ui.h("div", { class: "formula-row", text: "sonli javoblar: yosh, uyqu, boʻy" }),
      ui.h("div", { class: "formula-row kod", text: "sanash(royxat, qiymat)   eng_kop(royxat)" }),
      ui.h("div", { class: "formula-row", text: "toifali javoblar: sevimli fan" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta funksiya. Sayt ularni har xil roʻyxatlar bilan chaqirib tekshiradi; natija print bilan emas, return bilan qaytsin.`);
  }

  async function stage2() {
    await numeric();
    await categorical();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.funcTask(prev, Math.random, tier),
      run: (task) => common.funcExercise(task),
      praise: () => "Funksiya hamma sinovdan oʻtdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
