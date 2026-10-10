// 2-bosqich: ro'yxat bo'ylab yurish va kesish.
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

  async function twoWays() {
    const el = common.box();
    el.append(common.note("Roʻyxat boʻylab ikki xil yurish mumkin:"));
    withOutput(el, "a = [5, 2, 9]\nfor x in a:\n    print(x)");
    withOutput(el, "a = [5, 2, 9]\nfor i in range(len(a)):\n    print(i, a[i])");
    await ui.say("elder", "Birinchisi faqat qiymatni beradi, ikkinchisi — indeksni ham.");
    await ui.say("elder", "Indeks kerak boʻlmasa, birinchi usul qisqaroq.");
  }

  async function collect() {
    const el = common.box();
    el.append(common.note("Yigʻindi va eng kattasini oʻzimiz ham topa olamiz:"));
    withOutput(el, "a = [5, 2, 9, 4]\ns = 0\nfor x in a:\n    s += x\nprint(s, sum(a))");
    await ui.say("elder", "Tayyor sum() funksiyasi ichida ham aynan shu sikl ishlaydi.");
    await ui.say("elder", "Olimpiada masalalarida bu siklni koʻpincha oʻzing yozasan.");
  }

  async function slices() {
    const el = common.box();
    withOutput(el, "a = [1, 2, 3, 4, 5]\nprint(a[1:3])\nprint(a[:2])\nprint(a[3:])");
    await ui.say("elder", "Kesishda ham oxirgi chegara kirmaydi — xuddi range dagidek.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "for x in a:        — qiymat" }),
      ui.h("div", { class: "formula-row kod", text: "for i in range(len(a)):  — indeks" }),
      ui.h("div", { class: "formula-row kod", text: "a[1:3] — 1 dan 3 gacha, 3 kirmaydi" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Har biri nima chiqarishini aniqla.`);
  }

  async function stage2() {
    await twoWays();
    await collect();
    await slices();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.walkTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Toʻgʻri.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
