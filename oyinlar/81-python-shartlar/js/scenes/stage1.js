// Kirish va 1-bosqich: chegara bo'yicha qaror — if / else, solishtirish amallari; natijani aytish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.threshold(0.5) }));
    await ui.say("elder", "Maqsad: tarmoqlanish (branching) — dastur shartga qarab turli satrlarni bajaradi: if, elif, else.");
    await ui.say("elder", "Qayerda kerak: model faqat son beradi (masalan, spam ehtimoli 0.62). Qarorni chegara (threshold) bilan shart chiqaradi.");
  }

  // Ko'rsatish: qaysi tarmoq bajarilgani satrma-satr ko'rinadi
  async function decision() {
    const code = 'ehtimol = 0.62\nif ehtimol >= 0.5:\n    print("spam")\nelse:\n    print("oddiy")\nprint("tekshirildi")';
    const el = common.box();
    await common.stepThrough(el, code, "⏭ Qadam: shart rost boʻlsa qaysi satrlar bajarilishini kuzat.");
    await ui.say("elder", "Shart rost — if tarmogʻi bajarildi, else tashlab ketildi. Surilmagan oxirgi satr har doim bajariladi.");
  }

  // Chegaraning o'zi: >= va > farqi
  async function boundary() {
    const el = common.box();
    el.append(common.note("Ehtimol aynan chegarada: 0.5. Ikki kod bitta belgi bilan farq qiladi."));
    common.withOutput(el, 'ehtimol = 0.5\nif ehtimol >= 0.5:\n    print("spam")\nelse:\n    print("oddiy")');
    common.withOutput(el, 'ehtimol = 0.5\nif ehtimol > 0.5:\n    print("spam")\nelse:\n    print("oddiy")');
    await ui.say("elder", ">= chegaraning oʻzini ham oladi, > esa olmaydi. Tasniflagichlarda xato koʻpincha aynan chegarada yashirinadi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "if shart:" }),
      ui.h("div", { class: "formula-row", text: "surilgan satrlar — shart rost (True) boʻlsa" }),
      ui.h("div", { class: "formula-row kod", text: "else:" }),
      ui.h("div", { class: "formula-row", text: "surilgan satrlar — shart yolgʻon (False) boʻlsa" }),
      ui.h("div", { class: "formula-row kod", text: "==  !=  <  <=  >  >=" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Har biri nima chiqarishini aniqla — avval shartni hisobla.`);
  }

  async function stage1() {
    await decision();
    await boundary();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.natijaTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Tarmoq toʻgʻri aniqlandi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
