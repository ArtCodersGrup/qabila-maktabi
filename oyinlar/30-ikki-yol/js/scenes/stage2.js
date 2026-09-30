// 2-bosqich: elif zanjiri, tartib muhimligi va mantiqiy amallar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  const withOutput = (host, code) => {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    host.append(out.el);
  };

  async function chain() {
    const code = "ball = 75\nif ball >= 90:\n    print(5)\nelif ball >= 70:\n    print(4)\nelif ball >= 50:\n    print(3)\nelse:\n    print(2)";
    const el = common.box();
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: shartlar yuqoridan pastga tekshiriladi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "Birinchi rost shart topilganda toʻxtaydi — qolganlari tekshirilmaydi ham.");
  }

  async function orderMatters() {
    const bad = "ball = 95\nif ball >= 50:\n    print(3)\nelif ball >= 70:\n    print(4)\nelif ball >= 90:\n    print(5)";
    const el = common.box();
    el.append(common.note("Endi shu zanjir teskari tartibda yozilgan:"));
    withOutput(el, bad);
    await ui.say("elder", "95 ball uchun 3 chiqdi! Chunki birinchi shart (50 dan katta) allaqachon rost.");
    await ui.say("elder", "elif zanjirida tartib muhim: eng qattiq shart yuqorida turadi.");
  }

  async function logic() {
    const code = 'x = 14\nprint(x > 10 and x < 20)\nprint(x < 10 or x == 14)\nprint(not x == 14)\nprint(10 < x < 20)';
    const el = common.box();
    withOutput(el, code);
    await ui.say("elder", "30-oʻyinni esla: VA, YOKI, EMAS kalitlari. Pythonda ular and, or, not.");
    await ui.say("elder", "Oxirgi satr — qisqa yoʻl: 10 < x < 20 degani x oraliqda ekani.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "if … elif … elif … else" }),
      ui.h("div", { class: "formula-row", text: "yuqoridan pastga, birinchi rost topilganda toʻxtaydi" }),
      ui.h("div", { class: "formula-row kod", text: "and  —  ikkalasi ham rost" }),
      ui.h("div", { class: "formula-row kod", text: "or   —  bittasi rost boʻlsa yetadi" })));
    await ui.say("elder", "Endi oʻzing hisobla: kod nima chiqaradi?");
  }

  async function stage2() {
    await chain();
    await orderMatters();
    await logic();
    await definition();
    await practice.exercises({
      next: (prev) => L.stage2Task(Math.random, prev),
      run: (task) => common.resultExercise(task),
      praise: (task) => (task.kind === "bool" ? "Rost va yolgʻonni ajratding." : "Zanjirni toʻgʻri kuzatding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
