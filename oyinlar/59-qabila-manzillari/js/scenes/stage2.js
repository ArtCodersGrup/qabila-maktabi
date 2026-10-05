// 2-bosqich: daftar (DNS) — nom → manzil; kichik daftarda yo'q bo'lsa kattarog'idan so'raladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function korsat() {
    const el = common.box(true);
    const mahalla = [{ nom: "qabila.uz", manzil: "10.0.3.7" }, { nom: "ovchi.uz", manzil: "10.1.4.20" }];
    const shahar = [{ nom: "kitob.uz", manzil: "10.0.9.41" }, { nom: "maktab.uz", manzil: "192.168.2.15" }, { nom: "daryo.uz", manzil: "10.1.0.8" }];
    await ui.say("elder", "Odam «maktab.uz» deb eslaydi, kompyuter esa faqat sonni tushunadi. Nomdan manzilni qanday topamiz?");
    el.append(common.daftar(mahalla, "Mahalla daftari"));
    await ui.say("elder", "Avval yaqin daftarga qaraymiz. «maktab.uz» bormi? Yoʻq.");
    el.append(common.daftar(shahar, "Shahar daftari", { belgi: "maktab.uz" }));
    await ui.say("elder", "Unda kattaroq daftardan soʻraymiz — mana: 192.168.2.15. Ikkita daftardan soʻradik.");
    await ui.say("elder", "Nomdan manzil topib beradigan daftarlar — DNS. Ular bitta joyda emas: kichigida boʻlmasa, kattarogʻidan soʻraladi.");
    await ui.say("apprentice", "Telefondagi kontaktlarga oʻxshar ekan: ism yozasan, raqam chiqadi!");
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
