// Kirish va 1-bosqich: qutilar qatori — ro'yxat (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  const withOutput = (host, code) => {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(code), code);
    host.append(out.el);
  };

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.boxes(4, 0) }));
    await ui.say("elder", "Bitta quti — bitta qiymat. Oʻnta son uchun oʻnta nom kerakmi?");
    await ui.say("apprentice", "Unda nomlar tugab qoladi.");
    await ui.say("elder", "Shuning uchun qutilarni qatorga tizamiz. Bu — roʻyxat.");
  }

  async function indexes() {
    const el = common.box();
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.boxes(3, 0) }));
    withOutput(el, "a = [5, 2, 9]\nprint(a[0], a[1], a[2])\nprint(len(a))");
    await ui.say("elder", "Har qutining raqami bor — indeks. Sanoq birdan emas, **noldan** boshlanadi.");
    await ui.say("elder", "Uchta element bor, lekin oxirgisining indeksi 2 — yaʼni len(a) − 1.");
  }

  async function change() {
    const el = common.box();
    const code = "a = [5, 2, 9]\na[1] = 7\na.append(4)\nprint(a)\nprint(a[-1])";
    const step = U.stepper({ code });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: roʻyxat qanday oʻzgarayotganini kuzat.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "a[1] = 7 — oʻrtadagi qutiga yangi qiymat qoʻydik.");
    await ui.say("elder", "append oxiriga qoʻshadi. a[-1] esa oxirgisini beradi.");
  }

  async function outOfRange() {
    const el = common.box();
    withOutput(el, "a = [5, 2, 9]\nprint(a[5])");
    await ui.say("elder", "Beshinchi quti yoʻq — Python shuni aytdi.");
    await ui.say("elder", "Uchta element boʻlsa, indekslar faqat 0, 1, 2 boʻladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "a = [5, 2, 9]" }),
      ui.h("div", { class: "formula-row", text: "indekslar: 0, 1, 2" }),
      ui.h("div", { class: "formula-row kod", text: "a[-1] — oxirgisi,  len(a) — nechta" })));
    await ui.say("elder", "Endi oʻzing ayt: kod nima chiqaradi?");
  }

  async function stage1() {
    await indexes();
    await change();
    await outOfRange();
    await definition();
    await practice.exercises({
      next: (prev) => L.listTask(Math.random, prev),
      run: (task) => common.resultExercise(task),
      praise: () => "Indekslarni toʻgʻri sanading.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
