// 2-bosqich: elif zanjiri, and / or / not; shartni to'ldirish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function chain() {
    const code = 'aniqlik = 78\nif aniqlik >= 90:\n    print("tayyor")\nelif aniqlik >= 70:\n    print("sinov")\nelse:\n    print("qayta")';
    const el = common.box();
    await common.stepThrough(el, code, "⏭ Qadam: uch toifa — shartlar yuqoridan pastga tekshiriladi.");
    await ui.say("elder", "elif zanjiri birinchi rost shartda toʻxtaydi. Shuning uchun eng qatʼiy shart yuqorida turadi.");
  }

  async function logicOps() {
    const el = common.box();
    el.append(common.note("Ikki belgi boʻyicha qaror: ehtimol va havolalar soni."));
    common.withOutput(el, "ehtimol = 0.7\nhavolalar = 1\nprint(ehtimol >= 0.6 and havolalar > 2)\nprint(ehtimol >= 0.6 or havolalar > 2)\nprint(not ehtimol >= 0.6)");
    await ui.say("elder", "and — ikkala shart ham rost boʻlishi kerak; or — bittasi yetarli; not — qiymatni teskarisiga oʻgiradi.");
    await ui.say("elder", "Bajarilish tartibi: avval not, keyin and, oxirida or. Boshqa tartib kerak boʻlsa — qavs qoʻyiladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "if … elif … else" }),
      ui.h("div", { class: "formula-row", text: "yuqoridan pastga, birinchi rost shartda toʻxtaydi" }),
      ui.h("div", { class: "formula-row kod", text: "a and b    a or b    not a" }),
      ui.h("div", { class: "formula-row kod", text: "0.2 <= p < 0.8  —  oraliq" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta qoida. Soʻz bilan berilgan qoidani shartga aylantir; javob jadvaldagi hamma kirishda tekshiriladi.`);
  }

  async function stage2() {
    await chain();
    await logicOps();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.toldirTask(Math.random, prev, tier),
      run: (task) => common.fillExercise(task),
      praise: () => "Shart hamma sinovdan oʻtdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
