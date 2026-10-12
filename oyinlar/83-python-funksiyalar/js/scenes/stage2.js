// 2-bosqich: funksiyani sinash va xatosini tuzatish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function silent() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.buzuq.code);
    await ui.say("elder", "Xato xabari yoʻq, lekin javob None: oxirgi satr hisoblaydi, ammo return yoʻq. Bunday xato faqat sinov chaqiruvi bilan topiladi.");
  }

  async function edgeCase() {
    const el = common.box();
    common.withOutput(el, L.SAMPLES.sinov.code);
    await ui.say("elder", "[4, 9, 2] da javob toʻgʻri, manfiy sonlarda esa 0 qaytdi — roʻyxatda 0 yoʻq edi. Bitta sinov yetmaydi.");
    await ui.say("elder", "Funksiya har xil kirishda tekshiriladi: oddiy holat, chegaradagi qiymat, manfiy son, bitta elementli roʻyxat.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "1. Sinov chaqiruvini oʻqi" }),
      ui.h("div", { class: "formula-row", text: "2. Kutilgan natijani oʻzing hisobla" }),
      ui.h("div", { class: "formula-row", text: "3. Chiqish bilan solishtir — farq xato joyini koʻrsatadi" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta xatoli funksiya. Tuzat va ishga tushir; sayt uni koʻrinadigan va yashirin chaqiruvlar bilan tekshiradi.`);
  }

  async function stage2() {
    await silent();
    await edgeCase();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.fixTask(prev, Math.random, tier),
      run: (task) => common.fixExercise(task),
      praise: () => "Funksiya hamma sinovdan oʻtdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
