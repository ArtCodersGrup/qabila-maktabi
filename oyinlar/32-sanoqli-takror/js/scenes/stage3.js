// 3-bosqich: ichma-ich sikl va naqsh.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function nested() {
    const code = "for i in range(3):\n    for j in range(2):\n        print(i, j)";
    const el = common.box();
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: ichki sikl har safar boshidan aylanadi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "Tashqi sikl 3 marta, ichkisi 2 marta — ichki tana 3 × 2 = 6 marta bajarildi.");
    await ui.say("elder", "Umumiy qoida: bajarilishlar soni = tashqi × ichki.");
  }

  async function pattern() {
    const code = 'for i in range(1, 5):\n    print("*" * i)';
    const el = common.box();
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "Satrni songa koʻpaytirish uni takrorlaydi: \"*\" * 3 → ***");
  }

  async function stage3() {
    await nested();
    await pattern();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta topshiriq — natijani aniqlash yoki dastur yozish.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur hamma sinovdan oʻtdi." : "Aylanishlar soni toʻgʻri."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
