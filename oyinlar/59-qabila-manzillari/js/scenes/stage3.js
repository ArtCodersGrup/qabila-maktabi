// 3-bosqich: kesh — topilgan manzil javonga qo'yiladi; tez, lekin eskirishi mumkin.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function korsat() {
    const el = common.box(true);
    el.append(common.ketma(["kitob.uz"]), common.javon([]));
    await ui.say("elder", "«kitob.uz» ni birinchi marta ochyapmiz. Javon boʻsh — 3 ta daftardan soʻraymiz: 3 ta soʻrov.");
    el.innerHTML = "";
    el.append(common.ketma(["kitob.uz", "kitob.uz"]), common.javon(["kitob.uz"]));
    await ui.say("elder", "Manzil javonga qoʻyildi. Ikkinchi marta — daftar kerak emas, javondan olamiz: 0 ta soʻrov. Tez!");
    await ui.say("elder", "Bir marta olingan narsani saqlab qoʻyish — kesh deyiladi.");
    el.innerHTML = "";
    el.append(common.daftar([{ nom: "kitob.uz", manzil: "10.0.9.41" }], "Javonda"), common.daftar([{ nom: "kitob.uz", manzil: "10.1.6.30" }], "Sayt koʻchdi — aslida endi"));
    await ui.say("elder", "Lekin sayt boshqa uyga koʻchsa, javonda eski manzil qoladi va konvert eski uyga ketadi.");
    await ui.say("apprentice", "Shuning uchun baʼzan eski sahifa koʻrinadi! Javonni yangilash kerak ekan.");
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
