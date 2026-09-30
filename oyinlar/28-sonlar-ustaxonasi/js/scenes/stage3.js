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
    await ui.say("elder", "Hisob natijasini qutiga solib, matn bilan birga chiqardik.");
    await ui.say("elder", "Vergul ikkalasini ajratadi va orasiga boʻshliq qoʻyadi.");
  }

  async function plusTrap() {
    const bad = 'x = 17 // 5\nprint("nechtadan: " + x)';
    const el = common.box();
    el.append(U.codeBlock(bad));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(bad), bad);
    el.append(out.el);
    await ui.say("elder", "Vergul oʻrniga + qoʻysang — xato. Matn va son har xil tur.");
    await ui.say("elder", "Ikki yechim bor: vergul qoʻyish yoki sonni str(x) bilan matnga oʻgirish.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: 'print("javob:", x)' }),
      ui.h("div", { class: "formula-row kod", text: 'print("javob: " + str(x))' }),
      ui.h("div", { class: "formula-row", text: "ikkalasi ham toʻgʻri" })));
    await ui.say("elder", "Endi hisoblaydigan dastur yozamiz: kiritilgan sondan javob chiqarasan.");
  }

  async function stage3() {
    await comma();
    await plusTrap();
    await definition();
    await practice.exercises({
      next: (prev) => L.stage3Task(Math.random, prev),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur hamma sinovdan oʻtdi." : "Xatoni tuzatding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
