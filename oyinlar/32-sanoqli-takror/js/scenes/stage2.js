// 2-bosqich: range(boshi, oxiri, qadam) va satr bo'ylab yurish.
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

  async function fromTo() {
    const el = common.box();
    withOutput(el, "for i in range(2, 6):\n    print(i)");
    await ui.say("elder", "Ikkita son yozilsa: birinchisi — boshi, ikkinchisi — oxiri.");
    await ui.say("elder", "Oxiri baribir kirmaydi: 2, 3, 4, 5 chiqdi, 6 yoʻq.");
  }

  async function withStep() {
    const el = common.box();
    withOutput(el, "for i in range(1, 10, 3):\n    print(i)");
    withOutput(el, "for i in range(10, 0, -2):\n    print(i)");
    await ui.say("elder", "Uchinchi son — qadam. Manfiy boʻlsa, teskari sanaydi.");
  }

  async function overString() {
    const el = common.box();
    withOutput(el, 'for harf in "qabila":\n    print(harf)');
    await ui.say("elder", "for faqat sonlar ustida emas — satr harflari boʻylab ham yuradi.");
    await ui.say("elder", "Har aylanishda harf qutisiga keyingi harf tushadi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "range(boshi, oxiri, qadam)" }),
      ui.h("div", { class: "formula-row", text: "oxiri kirmaydi" }),
      ui.h("div", { class: "formula-row kod", text: "for harf in soʻz:" })));
    await ui.say("elder", "Endi oʻzing hisobla.");
  }

  async function stage2() {
    await fromTo();
    await withStep();
    await overString();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.boundTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Chegaralarni toʻgʻri hisoblading.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
