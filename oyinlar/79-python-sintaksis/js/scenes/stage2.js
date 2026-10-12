// 2-bosqich: xato xabarini o'qish va xatoni tuzatish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const N = L.NAMUNALAR;

  async function readError() {
    const el = common.box();
    common.withOutput(el, N.xatoXabar);
    await ui.say("elder", "Xato xabari uch narsani aytadi: turi (SyntaxError), satr raqami va sababi. Avval satr raqamiga qara.");
    await ui.say("elder", "Bu yerda 2-satrda qoʻshtirnoq yopilmagan. Sintaksis xatosi boʻlsa, dastur umuman boshlanmaydi — 1-satr ham chiqmadi.");
  }

  async function kinds() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "SyntaxError" }),
      ui.h("div", { class: "formula-row", text: "yozuv qoidasi buzilgan: qavs, qoʻshtirnoq, vergul, ikki nuqta" }),
      ui.h("div", { class: "formula-row kod", text: "IndentationError" }),
      ui.h("div", { class: "formula-row", text: "otstup notoʻgʻri" }),
      ui.h("div", { class: "formula-row kod", text: "NameError" }),
      ui.h("div", { class: "formula-row", text: "nom tanilmadi: Print, eʼlon qilinmagan oʻzgaruvchi" })));
    await ui.say("elder", "Uch xato turi eng koʻp uchraydi. Turi qayerdan qidirishni aytadi.");
  }

  async function silent() {
    const el = common.box();
    common.withOutput(el, N.jimXato);
    await ui.say("elder", "Bu kod xatosiz ishladi, lekin natija notoʻgʻri: 0,92 — ikkita son (0 va 92). Oʻnlik kasr nuqta bilan yoziladi.");
    await ui.say("elder", "Xulosa: xato xabari yoʻqligi natija toʻgʻri degani emas. Tibbiyot yoki bank qaroriga ketadigan hisobotda chiqishni doim kutilgani bilan solishtir.");
  }

  async function stage2() {
    await readError();
    await kinds();
    await silent();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta dastur, har birida bitta xato. Kutilgan chiqish berilgan — kodni tuzat.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.fixTask(Math.random, prev, tier),
      run: (task) => common.fixExercise(task),
      praise: () => "Xato tuzatildi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
