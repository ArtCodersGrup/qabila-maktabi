// 3-bosqich: bo'lak yo'qoldi — qaysi raqam yo'q, faqat o'shani qayta so'raymiz.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function korsat() {
    const el = common.box(true);
    const jami = 5;
    const qator = common.qator(
      common.konvert({ raqam: 1, jami }, { kichik: true }), common.konvert({ raqam: 2, jami }, { kichik: true }),
      common.boshJoy(),
      common.konvert({ raqam: 4, jami }, { kichik: true }), common.konvert({ raqam: 5, jami }, { kichik: true }));
    el.append(qator);
    ui.bubble("elder", "Beshta konvert yuborilgan edi, toʻrttasi keldi. Qaysi raqam yoʻq?");
    const javob = await ui.choice([2, 3, 4].map((n) => ({ label: String(n), value: n })));
    QK.sound.play(javob === 3 ? "correct" : "retry");
    if (javob !== 3) await ui.say("elder", "↻ 1, 2, keyin… 4. Oʻrtada 3 yoʻq.");
    qator.replaceChild(common.konvert({ raqam: 3, jami }, { kichik: true, holat: "yangi" }), qator.children[2]);
    await ui.say("elder", "✓ Qabul qiluvchi faqat 3-konvertni qayta soʻradi — hammasini emas. Mana u keldi.");
    await ui.say("apprentice", "Raqamlar boʻlmaganda qaysi biri yoʻqolganini bilib boʻlmasdi!");
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
