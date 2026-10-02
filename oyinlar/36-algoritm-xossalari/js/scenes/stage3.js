// 3-bosqich: kodda buzilgan xossa — topish va tuzatish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function korsat() {
    const cheksiz = L.KODLAR.find((k) => k.id === "cheksiz");
    const el = common.box();
    el.append(common.note("Bu kod 1 dan 5 gacha chiqarishi kerak edi:"));
    el.append(U.codeBlock(cheksiz.kod));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(cheksiz.kod, { maxSteps: 20000 }), cheksiz.kod);
    el.append(out.el);
    await ui.say("elder", "Toʻxtamadi. " + cheksiz.nega);
    await ui.say("elder", "Natijaviylik buzilgan: algoritm chekli qadamdan keyin javob berishi kerak.");

    const faqat = L.KODLAR.find((k) => k.id === "faqat-uch");
    const el2 = common.box();
    el2.append(common.note("Bu kod esa kvadratni chiqarishi kerak:"));
    el2.append(U.codeBlock(faqat.kod), U.stdinPanel(["7"]));
    const out2 = U.output({ title: "Chiqish" });
    out2.show(K.run(faqat.kod, { stdin: ["7"] }), faqat.kod);
    el2.append(out2.el);
    await ui.say("elder", "7 uchun hech narsa chiqmadi. " + faqat.nega);
    await ui.say("elder", "Ommaviylik buzilgan: algoritm bir turdagi hamma masalaga yarashi kerak.");
  }

  async function stage3() {
    await korsat();
    await ui.say("elder", "Endi navbat senga: goh xossani topasan, goh kodni tuzatasan.");
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.tur === "tuzat" ? "Kod endi toʻgʻri ishlaydi." : "Xossani topding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
