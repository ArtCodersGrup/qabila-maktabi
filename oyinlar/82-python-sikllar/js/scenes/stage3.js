// 3-bosqich: siklni tuzatish (mantiqiy xato) va dasturni o'zi yozish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  // Cheksiz sikl: shartga ta'sir qiladigan qiymat o'zgarmaydi
  async function endless() {
    const bad = "xato = 0.8\ndavr = 0\nwhile xato > 0.1:\n    davr += 1\nprint(davr)";
    const el = common.box();
    el.append(U.codeBlock(bad));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(bad, null, { maxSteps: 20000 }), bad);
    el.append(out.el);
    await ui.say("elder", "Cheksiz sikl: xato oʻzgarmaydi, shart doim rost. while tanasida shartga taʼsir qiladigan qiymat albatta oʻzgarishi kerak.");
  }

  // Kirishdan o'qish: n, keyin n ta qiymat
  async function reading() {
    const code = "n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\nprint(jami / n)";
    const el = common.box();
    el.append(common.note("Maʼlumot kirishdan oʻqiladi: avval n, keyin n ta qiymat — har biri alohida satrda."));
    el.append(U.stdinPanel(["3", "8", "6", "10"]));
    common.withOutput(el, code, ["3", "8", "6", "10"]);
    await ui.say("elder", "Haqiqiy oʻqitishda xato hech qachon aniq 0 ga tushmaydi. Shuning uchun toʻxtash sharti ikki qismli: xato yetarlicha kichik yoki davrlar soni tugadi.");
  }

  async function stage3() {
    await endless();
    await reading();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta topshiriq — sikldagi mantiqiy xatoni tuzatish yoki dasturni oʻzing yozish.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur hamma sinovdan oʻtdi." : "Mantiqiy xato tuzatildi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
