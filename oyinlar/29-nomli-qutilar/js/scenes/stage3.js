// 3-bosqich: input va turlar — input() doim matn qaytaradi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  // Ko'rsatish: kirish paneli va input()
  async function inputDemo() {
    const code = 'ism = input()\nprint("Salom,", ism)';
    const stdin = ["Malika"];
    const el = common.box();
    el.append(common.note("Kirish panelidagi satrni input() oladi."));
    el.append(U.codeBlock(code), U.stdinPanel(stdin));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code, { stdin }).output);
    el.append(out.el);
    await ui.say("elder", "input() — kiritilgan satrni oladi va qutiga soladi.");
    await ui.say("elder", "Bu saytda kiritiladigan satrlar oldindan yozib qoʻyilgan.");
  }

  // Tuzoq: input() matn qaytaradi, shuning uchun + qo'shmaydi
  async function typeTrap() {
    const bad = "yosh = input()\nprint(yosh + 1)";
    const stdin = ["12"];
    const el = common.box();
    el.append(U.codeBlock(bad), U.stdinPanel(stdin));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(bad, { stdin }), bad);
    el.append(out.el);
    await ui.say("elder", "Xato xabarini oʻqi: matnga son qoʻshib boʻlmaydi.");
    await ui.say("elder", "Sababi: input() har doim matn qaytaradi — hatto 12 yozsang ham.");

    const task = { type: "xato-top", code: bad, stdin, solution: "yosh = int(input())\nprint(yosh + 1)", why: "input() matn qaytaradi" };
    const el2 = common.box();
    el2.append(common.note("Tuzat: matnni songa oʻgir — int(...) bilan."));
    const say = common.liveNote(el2);
    await ui.settle((done) => {
      common.bench(el2, {
        code: bad, stdin,
        onRun: (result, code) => {
          if (K.check(task, code).ok) done();
          else say("↻ Hali boʻlmadi. input() ni int(...) ichiga ol: int(input()).");
        },
      });
    });
    await ui.say("apprentice", "13 chiqdi! Endi qoʻshildi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "input()  →  matn" }),
      ui.h("div", { class: "formula-row kod", text: "int(input())  →  son" }),
      ui.h("div", { class: "formula-row", text: "son kerak boʻlsa — int() bilan oʻgiriladi" })));
    await ui.say("elder", "Matnni qoʻshsang — yopishadi: \"5\" + \"5\" → 55. Sonni qoʻshsang — hisoblanadi.");
  }

  async function stage3() {
    await inputDemo();
    await typeTrap();
    await definition();
    await ui.say("elder", "Endi navbat senga: goh natijani aytasan, goh kodni oʻzing yozasan.");
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur ishladi." : "Turlarni ajratding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
