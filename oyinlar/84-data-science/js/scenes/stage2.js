// 2-bosqich: jadval tuzilishi (qator = obyekt, ustun = belgi) va maʼlumot turlari (sonli / toifali).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  const USTUNLAR = [{ nom: "Ism" }, { nom: "Yosh" }, { nom: "Sevimli fan" }, { nom: "Boʻy (sm)" }];
  const QATORLAR = [
    ["Aziz", 15, "Fizika", 172],
    ["Dilnoza", 14, "Tarix", 160],
    ["Bobur", 15, "Informatika", 168],
    ["Malika", 16, "Fizika", 165],
  ];

  async function korsat() {
    const el = common.box(true);
    let qadam = "qator";
    let j = null;
    ui.bubble("elder", "Jadvalda 4 oʻquvchi. Bitta oʻquvchiga tegishli hamma maʼlumotni koʻrsat: qator raqamini bos.");
    await ui.settle((done) => {
      j = common.jadval({
        nom: "Oʻquvchilar", ustunlar: USTUNLAR, qatorlar: QATORLAR, raqam: true,
        onQator(q) {
          if (qadam !== "qator") return;
          qadam = "ustun";
          j.qator(q).classList.add("belgi");
          QK.sound.play("correct");
          ui.bubble("elder", "✓ Qator = bitta obyekt. Endi hamma oʻquvchining yoshi turgan ustunni koʻrsat: sarlavhasini bos.");
        },
        onUstun(u) {
          if (qadam !== "ustun") return;
          if (USTUNLAR[u].nom !== "Yosh") {
            QK.sound.play("retry");
            ui.bubble("elder", "↻ Bu boshqa belgi. «Yosh» sarlavhasini top.");
            return;
          }
          qadam = "tamom";
          el.querySelectorAll(".belgi").forEach((x) => x.classList.remove("belgi"));
          j.ustun(u).forEach((x) => x.classList.add("belgi"));
          done();
        },
      });
      el.append(j.el);
    });
    j.qulfla();
    QK.sound.play("correct");
    ui.bubble("elder", "✓ Ustun = bitta belgi (feature). Qaysi ustun qiymatlarini qoʻshib, oʻrtachasini topish maʼnoli?");
    const javob = await ui.choice(["Ism", "Yosh", "Sevimli fan"].map((n) => ({ label: n, value: n, secondary: true })));
    QK.sound.play(javob === "Yosh" ? "correct" : "retry");
    el.append(common.formula([
      "Sonli (numerical): yosh, boʻy — hisoblash mumkin",
      "Toifali (categorical): ism, fan — sanash va guruhlash mumkin",
    ]));
    await ui.say("elder", (javob === "Yosh" ? "✓ " : "↻ ") + "Yosh — sonli belgi: oʻrtachasi maʼnoli. Ism va sevimli fan — toifali: ularni faqat sanash mumkin.");
    await ui.say("elder", `Ehtiyot: telefon raqami raqamdan iborat, lekin toifali — uni qoʻshish maʼnosiz. Mashq: ${practice.need()} ta savol.`);
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
