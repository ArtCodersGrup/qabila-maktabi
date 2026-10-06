// Kirish va 1-bosqich: kursor va tuzatish — kursorni sichqoncha bilan qo'yish, Backspace/Delete, Shift + harf.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound, muharrir } = QK;

  async function intro() {
    await common.klaviatura();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.xat() }));
    await ui.say("elder", "Shogird menga xat yozmoqchi. Qogʻozda emas — kompyuterda!");
    await ui.say("apprentice", "Harflarni terdim, lekin bir joyi notoʻgʻri chiqdi. Qanday tuzataman?");
  }

  // Bola o'zi qiladi: ortiqcha harfni Backspace bilan o'chiradi → tushib qolgan harfni Delete yonida qo'shadi → katta harf
  async function korsat() {
    await common.klaviatura();
    const el = common.box(true);
    const m = muharrir.yasa(el, { rejim: "oddiy", matn: "Men makktabga boraman." });

    await common.kut(m, (mm) => {
      if (L.teng(mm.matn(), "Men maktabga boraman.")) return null;
      return "Bu — matn muharriri. «makktabga»da bitta «k» ortiqcha: uning oʻng tomoniga sichqoncha bilan bos, keyin Backspace ni bos.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Milt-milt chiziq — kursor. Backspace kursorning chap tomonidagi harfni oʻchiradi, Delete — oʻng tomonidagini.");

    m.yoz("men bugun xursandman.");
    await common.kut(m, (mm) => {
      if (L.teng(mm.matn(), "Men bugun xursandman.")) return null;
      return "Gap katta harf bilan boshlanadi. «m»ni oʻchir, keyin Shift ni bosib turib M ni bos.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Shift + harf — katta harf. Endi xatdagi notoʻgʻri joylarni oʻzing tuzatasan.");
    m.toxtat();
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
