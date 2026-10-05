// 2-bosqich: ikki marta bosish — ochadi, o'ng tugma — menyu chiqaradi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  // Bola o'zi qiladi: ko'k sandiqni ikki marta bosib ochadi, keyin yashil sandiqda o'ng tugma bilan
  // menyu chiqarib, «Boʻya»ni tanlaydi. Bu yerda jarima yo'q — noto'g'ri harakatga faqat eslatma.
  async function korsat() {
    const task = L.korsatSandiq();
    const [kok, yashil] = task.sandiqlar.map((s) => s.id);
    const el = common.box(true);
    let hodisa = () => {};
    const m = common.sandiqMaydoni(task, {
      amal: (id, amal) => hodisa("amal", id, amal),
      menyu: (id) => hodisa("menyu", id),
      sekin: (id) => hodisa("sekin", id),
    }, { yordam: "chap", menyusiz: true });
    el.append(m.el);

    // 1) Ikki marta bosish
    ui.bubble("elder", "Koʻk sandiqni ikki marta tez bos: tiq-tiq!");
    await ui.settle((done) => {
      hodisa = (tur, id) => {
        if (tur === "sekin") {
          ui.bubble("elder", "↻ Tezroq bos: tiq-tiq!");
        } else if (tur === "amal" && id === kok) {
          hodisa = () => {};
          done();
        } else if (tur === "amal") {
          QK.sound.play("retry");
          m.silkit(id);
          ui.bubble("elder", "↻ Bu boshqa sandiq. Koʻk sandiqni ikki marta tez bos.");
        }
      };
    });
    m.holat(kok, "ochiq");
    QK.sound.play("correct");
    await ui.say("elder", "✓ Ochildi! Ikki marta tez bosish — ochadi.");

    // 2) O'ng tugma va menyu
    m.menyuRuxsat(true);
    common.yordamQoy(m.el, "ong");
    ui.bubble("elder", "Endi yashil sandiqda oʻng tugmani bos.");
    await ui.settle((done) => {
      hodisa = (tur, id, amal) => {
        if (tur === "menyu" && id === yashil) {
          ui.bubble("elder", "Menyu chiqdi! «Boʻya»ni tanla.");
        } else if (tur === "menyu") {
          m.menyuYop();
          ui.bubble("elder", "↻ Bu boshqa sandiq. Yashil sandiqda oʻng tugmani bos.");
        } else if (tur === "amal" && id === yashil && amal === "boya") {
          hodisa = () => {};
          done();
        } else if (tur === "amal" && amal !== L.OCH) {
          QK.sound.play("retry");
          ui.bubble("elder", "↻ Oʻng tugmani yana bos va «Boʻya»ni tanla.");
        } else if (tur === "amal") {
          ui.bubble("elder", "↻ Ikki marta emas. Oʻng tugmani bir marta bos.");
        }
      };
    });
    m.yop();
    m.holat(yashil, "boya");
    QK.sound.play("correct");
    await ui.say("elder", "✓ Oʻng tugma — menyu chiqaradi. Bir marta bossang, sandiq faqat tanlanadi.");
    await ui.say("elder", "Endi mashq. Vazifani oʻqi va kerakli sandiqni top.");
  }

  async function stage2() {
    await common.qurilma();
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
