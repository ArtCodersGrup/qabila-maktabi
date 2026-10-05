// 2-bosqich: qulflangan yo'l — tugun faqat tushunarsiz belgilarni ko'radi. Nom: HTTPS, 🔒.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function korsat() {
    const x = L.xabar(Math.random, 0);
    const qulf = L.qulfla(x.matn, Math.random);
    const host = common.box(true);
    host.append(common.yol(3), common.quti(qulf));
    await ui.say("elder", "Endi aynan oʻsha xabar qulflangan qutida yuborildi. Tugun nimani koʻrdi?");
    await ui.say("apprentice", "Faqat gʻalati belgilar… Hech narsa tushunmadim!");
    host.append(common.otkritka(x));
    await ui.say("elder", "Qutini faqat sayt ochadi — u xabarni toʻliq oʻqiydi. Yoʻldagilar esa hech narsa bilmaydi.");
    host.innerHTML = "";
    host.append(common.satr("https://kelajagim.uz/kirish"), common.satr("http://kelajagim.uz/kirish"));
    await ui.say("elder", "Qulfli yoʻl — HTTPS. Manzil «https://» bilan boshlanadi va yonida 🔒 turadi. «http://» — qulfsiz.");
    await ui.say("elder", "Qulf yana bir narsani tasdiqlaydi: sen aynan shu manzildagi saytga ulanding, soxtasiga emas.");
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
