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
    await ui.say("elder", "Endi oʻsha xabar qulflangan qutida — shifrlangan holda yuborildi. Tugun nimani koʻradi?");
    await ui.say("elder", "Faqat tushunarsiz belgilar: login ham, parol ham oʻqilmaydi.");
    host.append(common.otkritka(x));
    await ui.say("elder", "Qutini faqat sayt ochadi va xabarni toʻliq oʻqiydi. Yoʻldagi tugunlar mazmunni bilmaydi.");
    host.innerHTML = "";
    host.append(common.satr("https://kelajagim.uz/kirish"), common.satr("http://kelajagim.uz/kirish"));
    await ui.say("elder", "Atama: qulfli yoʻl — HTTPS: manzil «https://» bilan boshlanadi, yonida 🔒. «http://» — qulfsiz.");
    await ui.say("elder", `HTTPS yana tasdiqlaydi: sen aynan shu manzildagi saytga ulangansan. Mashq: ${QK.practice.need()} ta savol.`);
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
