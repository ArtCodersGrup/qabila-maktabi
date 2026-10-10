// 3-bosqich: raqamlarni ajratish — % 10 va // 10.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function digits() {
    const el = common.box();
    el.append(common.note("472 sonining raqamlarini birma-bir ajratamiz:"));
    el.append(common.digitTable(L.digitSteps(472)));
    await ui.say("elder", "n % 10 — oxirgi raqamni beradi. n // 10 — oxirgisini olib tashlaydi.");
    await ui.say("elder", "Buni n nolga aylanguncha takrorlasak, barcha raqamlar ajraladi.");

    const code = "n = 472\nwhile n > 0:\n    print(n % 10)\n    n = n // 10";
    const el2 = common.box();
    el2.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el2.append(out.el);
    await ui.say("elder", "Raqamlar teskari tartibda chiqdi — oxirgisidan boshiga qarab.");
  }

  async function stage3() {
    await digits();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta topshiriq — xatoni tuzatish yoki dastur yozish. Bunday masalalar olimpiadalarda uchraydi.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur hamma sinovdan oʻtdi." : "Xato tuzatildi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
