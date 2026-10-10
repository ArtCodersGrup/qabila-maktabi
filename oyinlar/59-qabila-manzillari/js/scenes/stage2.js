// 2-bosqich: daftar (DNS) — nom → manzil; kichik daftarda yo'q bo'lsa kattarog'idan so'raladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function korsat() {
    const el = common.box(true);
    const mahalla = [{ nom: "qabila.uz", manzil: "10.0.3.7" }, { nom: "ovchi.uz", manzil: "10.1.4.20" }];
    const shahar = [{ nom: "kitob.uz", manzil: "10.0.9.41" }, { nom: "maktab.uz", manzil: "192.168.2.15" }, { nom: "daryo.uz", manzil: "10.1.0.8" }];
    await ui.say("elder", "Odam «maktab.uz» nomini eslaydi, paketga esa IP manzil kerak. Nomdan manzil qanday topiladi?");
    el.append(common.daftar(mahalla, "Mahalla daftari"));
    await ui.say("elder", "Avval yaqin daftarga qaraymiz: «maktab.uz» unda yoʻq.");
    el.append(common.daftar(shahar, "Shahar daftari", { belgi: "maktab.uz" }));
    await ui.say("elder", "Keyingi, kattaroq daftardan soʻraymiz: 192.168.2.15. Jami 2 ta soʻrov.");
    await ui.say("elder", "Atama: DNS — nomni IP manzilga aylantiradigan daftarlar tizimi. Kichigida boʻlmasa, kattarogʻidan soʻraladi.");
    await ui.say("elder", `Telefon kontaktlari ham shunday ishlaydi: ism → raqam. Mashq: ${QK.practice.need()} ta savol.`);
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
