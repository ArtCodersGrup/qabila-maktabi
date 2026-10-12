// 2-bosqich: hisoblagich va yig'indi naqshi — natijani aytish va naqshni to'ldirish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  // Hisoblagich: shart bajarilganda +1
  async function counter() {
    const code = 'yorliqlar = ["spam", "oddiy", "spam", "spam"]\nsoni = 0\nfor y in yorliqlar:\n    if y == "spam":\n        soni += 1\nprint(soni)';
    const el = common.box();
    await common.stepThrough(el, code, "⏭ Qadam: soni qachon oʻzgarishini kuzat.");
    await ui.say("elder", "Hisoblagich naqshi: sikldan oldin 0, mos element uchraganda += 1, natija — sikldan keyin.");
  }

  // Yig'indi → o'rtacha → aniqlik
  async function accumulator() {
    const el = common.box();
    el.append(common.note("Yigʻindi naqshi: har aylanishda joriy qiymat qoʻshiladi."));
    common.withOutput(el, "ballar = [8, 6, 7, 9]\njami = 0\nfor b in ballar:\n    jami += b\nprint(jami, jami / len(ballar))");
    await ui.say("elder", "Oʻrtacha = yigʻindi / soni. Boʻlish amali / har doim kasr son beradi: 30 / 4 = 7.5.");
    await ui.say("elder", "Aniqlik (accuracy) ham shu ikki naqshdan chiqadi: toʻgʻri bashoratlar soni / jami bashoratlar.");
  }

  // Cheklov: yuqori aniqlik aldashi mumkin
  async function imbalance() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "soni = 0      →  soni += 1" }),
      ui.h("div", { class: "formula-row kod", text: "jami = 0      →  jami += x" }),
      ui.h("div", { class: "formula-row kod", text: "aniqlik = togri / jami" })));
    await ui.say("elder", "Cheklov: 100 xatdan 95 tasi oddiy boʻlsa, hammasiga «oddiy» deydigan model 95 % aniq — lekin bitta ham spamni topmaydi.");
    await ui.say("elder", `Shuning uchun har sinf alohida sanaladi. Mashq: ${QK.practice.need()} ta topshiriq — natijani hisoblash yoki naqshni toʻldirish.`);
  }

  async function stage2() {
    await counter();
    await accumulator();
    await imbalance();
    await practice.exercises({
      next: (prev, correct, tier) => L.stage2Task(Math.random, prev, tier),
      run: (task) => common.stage2Exercise(task),
      praise: (task) => (task.type === "bosh-joy" ? "Naqsh toʻgʻri toʻldirildi." : "Natija toʻgʻri hisoblandi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
