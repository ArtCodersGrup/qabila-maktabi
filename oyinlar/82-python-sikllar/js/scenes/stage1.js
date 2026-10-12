// Kirish va 1-bosqich: for va while — sikl necha marta aylanadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art small", html: QK.gameArt.loop() }));
    await ui.say("elder", "Maqsad: sikl (loop) — bir xil buyruqlarni takrorlash: for va while, hisoblagich va yigʻindi naqshlari.");
    await ui.say("elder", "Qayerda kerak: maʼlumot minglab qatordan iborat. Yorliqlarni sanash, oʻrtachani topish, modelni davrma-davr oʻqitish — hammasi sikl.");
  }

  // for: takrorlar soni oldindan ma'lum
  async function forLoop() {
    const code = 'yorliqlar = ["spam", "oddiy", "spam"]\nsoni = 0\nfor y in yorliqlar:\n    soni += 1\nprint(soni)';
    const el = common.box();
    await common.stepThrough(el, code, "⏭ Qadam: for roʻyxatning har elementi uchun tanani bir marta bajaradi.");
    await ui.say("elder", "Uchta element — uch aylanish. range(n) ham shunday: 0 dan n − 1 gacha n ta son beradi.");
  }

  // while: shart rost ekan — davom
  async function whileLoop() {
    const code = "xato = 0.8\ndavr = 0\nwhile xato > 0.1:\n    xato = xato / 2\n    davr += 1\nprint(davr)";
    const el = common.box();
    await common.stepThrough(el, code, "⏭ Qadam: while har aylanish oldidan shartni qayta tekshiradi.");
    await ui.say("elder", "Xato 0.8 → 0.4 → 0.2 → 0.1. Oxirida 0.1 > 0.1 yolgʻon, sikl 3 aylanishdan keyin toʻxtadi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "for x in royxat:      for i in range(n):" }),
      ui.h("div", { class: "formula-row", text: "takrorlar soni oldindan maʼlum" }),
      ui.h("div", { class: "formula-row kod", text: "while shart:" }),
      ui.h("div", { class: "formula-row", text: "shart rost ekan davom etadi; soni oldindan maʼlum emas" }),
      ui.h("div", { class: "formula-row kod", text: "range(a, b, qadam)  —  b kirmaydi" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Belgilangan satr necha marta bajarilishini top — oʻzgaruvchi qiymatlarini ketma-ket yozib chiq.`);
  }

  async function stage1() {
    await forLoop();
    await whileLoop();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.sanoqTask(Math.random, prev, tier),
      run: (task) => common.countExercise(task),
      praise: (task) => (task.answer === 0 ? "Toʻgʻri: bir marta ham bajarilmaydi." : `Toʻgʻri: ${task.answer} marta.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
