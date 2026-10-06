// 2-bosqich: qatorlar va belgilar — Enter (yangi qator), bo'sh joy, nuqta va vergul.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound, muharrir } = QK;

  // Bola o'zi qiladi: ro'yxatni Enter bilan qatorlarga ajratadi → gap oxiriga nuqta qo'yadi
  async function korsat() {
    await common.klaviatura();
    const el = common.box(true);
    const m = muharrir.yasa(el, { rejim: "oddiy", matn: "Olma Nok Uzum" });

    await common.kut(m, (mm) => {
      const matn = mm.matn();
      if (L.teng(matn, "Olma\nNok\nUzum")) return null;
      const n = L.norm(matn).split("\n").length;
      if (n >= 3) return "Qatorlar 3 ta, lekin soʻzlar joyida emas. Har qatorda bitta soʻz qolsin: Olma, Nok, Uzum.";
      if (n === 2) return "Zoʻr, yangi qator ochildi! Endi «Uzum» oldiga bos va yana Enter ni bos.";
      return "Roʻyxat bitta qatorda yozilib qolgan. «Nok» oldiga bos va Enter ni bos — yangi qator ochiladi.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Enter — yangi qator. Eng uzun tugma — boʻsh joy — soʻzlarni ajratadi.");

    m.yoz("Oyim non yopdi");
    await common.kut(m, (mm) => {
      if (L.teng(mm.matn(), "Oyim non yopdi.")) return null;
      return "Gap oxirida nuqta yoʻq. Oxiriga bos va nuqtani ter — u pastki qatorda, M harfidan keyin.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Nuqta gapni tugatadi. Vergul uning chap yonida — soʻzlarni ajratadi.");
    await ui.say("elder", "Ikkita tugma bir vaqtda — Ctrl + Enter — «Tayyor» oʻrniga ishlaydi.");
    m.toxtat();
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
