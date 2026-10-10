// Kirish va 1-bosqich: quti va nom — o'zgaruvchi (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.boxes() }));
    await ui.say("elder", "Maqsad: oʻzgaruvchi, qiymat berish (=), kuzatuv jadvali va input().");
    await ui.say("elder", "Oʻzgaruvchi — xotiradagi nomli quti: nomi oʻzgarmaydi, ichidagi qiymat almashib turadi.");
  }

  // Ko'rsatish: qadam-baqadam — qutilar to'ladi
  async function stepDemo() {
    const code = "a = 2\nb = 3\na = a * b";
    const el = common.box();
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "«⏭ Qadam»ni bos: har bosishda bitta buyruq bajariladi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "3-satrda a yangi qiymat oldi: 2 oʻrniga 6. Eski qiymat oʻchdi.");
  }

  // x = x + 1 — eng ko'p savol tug'diradigan satr
  async function plusOne() {
    const code = "x = 5\nx = x + 1\nx += 10\nprint(x)";
    const el = common.box();
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "x = x + 1 — tenglama emas. Avval oʻng tomon hisoblanadi: 5 + 1 = 6.");
    await ui.say("elder", "Keyin natija x ga yoziladi. x += 10 — x = x + 10 ning qisqa yozuvi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "nom = qiymat" }),
      ui.h("div", { class: "formula-row", text: "qiymat nomli qutiga qoʻyiladi" }),
      ui.h("div", { class: "formula-row", text: "= — tenglik emas, qiymat berish" })));
    await ui.say("elder", "Nomni sen tanlaysan; qiymatni kompyuter xotirada saqlaydi.");
  }

  async function stage1() {
    await stepDemo();
    await plusOne();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta dastur — nima chiqarishini ayt.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.resultTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Qutilarni toʻgʻri kuzatding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
