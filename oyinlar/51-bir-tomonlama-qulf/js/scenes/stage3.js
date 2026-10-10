// 3-bosqich: nega bu muhim — bir xil parol va "tuz".
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  const PAROL = "kitob";

  async function birParol() {
    const el = common.box(true);
    el.append(common.note("Uchta saytda bitta parol:"));
    el.append(ui.h("div", { class: "bq-juft" },
      ...L.SAYTLAR.slice(0, 3).map((s) => common.parolKarta(PAROL, { nom: s.nom, qiymat: false, kichik: true }))));
    await ui.say("elder", "Iz parolni yashiradi, lekin bitta xavf qoladi.");
    await ui.say("elder", "Bitta sayt parolni boy bersa, qolgan ikkisi ham ochiladi. Demak, har saytga boshqa parol kerak.");
  }

  async function tuz() {
    const el = common.box(true);
    el.append(common.note("Shuning uchun har saytning oʻz tuzi bor:"));
    el.append(common.parolKarta(PAROL, { qiymat: false, kichik: true }));
    el.append(common.tuzJadval(PAROL));
    await ui.say("elder", "Atama: tuz — saytga xos son. Iz 0 dan emas, tuzdan boshlab hisoblanadi.");
    await ui.say("elder", "Parol bir xil, lekin izlar har saytda boshqa — oʻgʻrining tayyor «parol → iz» roʻyxati ishlamaydi.");
    await ui.say("elder", "Lekin parolning oʻzi qoʻlga tushsa, tuz yordam bermaydi.");
    await ui.say("elder", "Shuning uchun ikkisi ham kerak: saytda tuz, senda har joyga boshqa parol.");
  }

  async function stage3() {
    await birParol();
    await tuz();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — tuzli izni hisobla va xulosa chiqar.`);
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
