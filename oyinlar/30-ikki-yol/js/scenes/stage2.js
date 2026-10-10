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
    await ui.say("elder", "95 ball uchun 3 chiqdi: birinchi shart (ball >= 50) allaqachon rost.");
    await ui.say("elder", "elif zanjirida tartib muhim: eng qatʼiy shart yuqorida turadi.");
  }

  async function logic() {
    const code = 'x = 14\nprint(x > 10 and x < 20)\nprint(x < 10 or x == 14)\nprint(not x == 14)\nprint(10 < x < 20)';
    const el = common.box();
    withOutput(el, code);
    await ui.say("elder", "Mantiqiy amallar VA, YOKI, EMAS Pythonda and, or, not deb yoziladi — «Mantiq kalitlari» oʻyinidagi kalitlar.");
    await ui.say("elder", "Oxirgi satr — qoʻsh solishtirish: 10 < x < 20 xuddi x > 10 and x < 20 kabi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "if … elif … elif … else" }),
      ui.h("div", { class: "formula-row", text: "yuqoridan pastga, birinchi rost topilganda toʻxtaydi" }),
      ui.h("div", { class: "formula-row kod", text: "and  —  ikkalasi ham rost" }),
      ui.h("div", { class: "formula-row kod", text: "or   —  bittasi rost boʻlsa yetadi" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Har biri nima chiqarishini aniqla.`);
  }

  async function stage2() {
    await chain();
    await orderMatters();
    await logic();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.stage2Task(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: (task) => (task.kind === "bool" ? "Mantiqiy ifoda toʻgʻri hisoblandi." : "Zanjir toʻgʻri kuzatildi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
