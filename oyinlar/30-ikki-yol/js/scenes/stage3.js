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
    await ui.say("elder", "Python xatoni koʻrsatibgina qolmay, maslahat ham berdi: == kerak.");
    await ui.say("elder", "Bitta teng — qutiga qoʻyish. Ikkita teng — solishtirish.");
  }

  async function stage3() {
    await pythonHelps();
    await ui.say("elder", "Endi navbat senga: goh xatoni tuzatasan, goh dasturni oʻzing yozasan.");
    await practice.exercises({
      next: (prev) => L.stage3Task(Math.random, prev),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur hamma sinovdan oʻtdi." : "Xatoni topding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
