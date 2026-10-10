// 3-bosqich: hisoblaydigan dastur — matn va sonni birga chiqarish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function comma() {
    const code = 'x = 17 // 5\nprint("nechtadan:", x)';
    const el = common.box();
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "Hisob natijasi x oʻzgaruvchisiga yozildi va matn bilan birga chiqarildi.");
    await ui.say("elder", "print ichida vergul qiymatlarni ajratadi va orasiga boʻshliq qoʻyadi.");
  }

  async function plusTrap() {
    const bad = 'x = 17 // 5\nprint("nechtadan: " + x)';
    const el = common.box();
    el.append(U.codeBlock(bad));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(bad), bad);
    el.append(out.el);
    await ui.say("elder", "Vergul oʻrniga + qoʻysang — xato: matn (str) va son (int) har xil tur.");
    await ui.say("elder", "Ikki yechim: vergul qoʻyish yoki sonni str(x) bilan matnga oʻgirish.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: 'print("javob:", x)' }),
      ui.h("div", { class: "formula-row kod", text: 'print("javob: " + str(x))' }),
      ui.h("div", { class: "formula-row", text: "ikkalasi ham toʻgʻri" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — kiritilgan sondan javob chiqaradigan dastur yoki xatoni tuzatish.`);
  }

  async function stage3() {
    await comma();
    await plusTrap();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur hamma sinovdan oʻtdi." : "Xatoni tuzatding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
