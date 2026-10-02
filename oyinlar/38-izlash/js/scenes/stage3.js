// 3-bosqich: ikkilik izlash — kod yozish va qadamlarni solishtirish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function korsat() {
    const kod = "a = [1, 3, 5, 7, 9, 11]\nx = 9\n" + L.IKKILIK_TANA;
    const el = common.box(true);
    el.append(common.note("Ikkilik izlash — oʻsha “yarmini tashlab yuborish” kodda:"));
    el.append(U.codeBlock(kod));
    await ui.say("elder", "chap va ong — oraliqning chekkalari. orta — oʻrtasi.");
    await ui.say("elder", "Oʻrtadagi son kichik boʻlsa, chap chekka surilib, yarmi tashlab yuboriladi.");
    await ui.say("elder", "Shart: roʻyxat oʻsish tartibida boʻlishi kerak. Aks holda bu usul ishlamaydi.");
  }

  async function olchov() {
    const el = common.box(false);
    el.append(common.note("Ikkala usulni oʻlchab koʻramiz — faqat izlash qadamlari:"));
    el.append(common.jadvalN(L.jadval([10, 20, 40, 80])));
    await ui.say("elder", "Roʻyxat ikki barobar uzaysa, chiziqli izlash ham ikki barobar koʻp ishlaydi.");
    await ui.say("elder", "Ikkilik izlashga esa atigi bir necha qadam qoʻshiladi.");
    await ui.say("elder", "Kichik roʻyxatda farq yoʻq. Katta roʻyxatda farq ulkan — shuning uchun usulni bilish kerak.");
  }

  async function stage3() {
    await korsat();
    await olchov();
    await ui.say("elder", "Endi oʻzing yoz: avval chiziqli, keyin ikkilik izlash.");
    await practice.exercises({
      next: (prev, correct, tier) => L.writeTask(Math.random, prev, tier),
      run: (task) => common.yozishExercise(task),
      praise: () => "Funksiya hamma sinovdan oʻtdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
