// 3-bosqich: xato ovi va kod yozish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function pythonHelps() {
    const bad = 'x = 5\nif x = 5:\n    print("teng")';
    const el = common.box();
    el.append(U.codeBlock(bad));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(bad), bad);
    el.append(out.el);
    await ui.say("elder", "Python xato satrini va sababini koʻrsatdi: shartda == kerak.");
    await ui.say("elder", "= — oʻzgaruvchiga qiymat berish, == — solishtirish.");
  }

  async function stage3() {
    await pythonHelps();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta topshiriq — xatoni tuzatish yoki dasturni oʻzing yozish.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur hamma sinovdan oʻtdi." : "Xato tuzatildi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
