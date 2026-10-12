// Kirish va 1-bosqich: print, izoh, matn va son, otstup — natijani aytish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;
  const N = L.NAMUNALAR;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.oyna(false) }));
    await ui.say("elder", "Maqsad: Python sintaksisi — print, izoh (#), otstup, matn va son; xato xabarini oʻqish.");
    await ui.say("elder", "Kalit gʻoya: sintaksis (syntax) — kod yozish qoidalari. Bitta belgi notoʻgʻri boʻlsa ham dastur ishlamaydi, lekin Python xato joyini aytadi.");
  }

  async function firstPrint() {
    const el = common.box();
    const step = U.stepper({ code: N.birinchi });
    el.append(step.el);
    ui.bubble("elder", "⏭ Qadam: dastur yuqoridan pastga, satrma-satr bajariladi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
    await ui.say("elder", "print qavs ichidagi qiymatlarni chiqaradi; vergul oʻrniga bitta boʻshliq qoʻyiladi. # dan keyingisi — izoh (comment): Python uni oʻtkazib yuboradi, u odam uchun.");
  }

  async function strVsNum() {
    const el = common.box();
    common.withOutput(el, N.matnSon);
    await ui.say("elder", "Qoʻshtirnoq ichidagi — matn, yaʼni satr (string): aynan yozilganidek chiqadi. Qoʻshtirnoqsiz ifoda hisoblanadi.");
    await ui.say("elder", "Matnlarda + ulaydi: \"46\" + \"4\" → 464. Fayldan oʻqilgan maʼlumot matn boʻlib keladi — bu xato tahlilda koʻp uchraydi.");
  }

  async function indent() {
    const el = common.box();
    common.withOutput(el, N.otstup);
    await ui.say("elder", "Otstup (indentation) — satr boshidagi 4 boʻshliq: surilgan satrlar if ga tegishli. Shart yolgʻon — ular bajarilmadi, surilmagan satr esa har doim bajariladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "print(\"Aniqlik:\", 0.92)" }),
      ui.h("div", { class: "formula-row", text: "\"…\" — matn; 0.92 — son; vergul — boʻshliq" }),
      ui.h("div", { class: "formula-row kod", text: "# izoh — bajarilmaydi" }),
      ui.h("div", { class: "formula-row", text: "otstup = 4 boʻshliq = blok" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Har biri nima chiqarishini aniqla — har satr alohida qatorda.`);
  }

  async function stage1() {
    await firstPrint();
    await strVsNum();
    await indent();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.printTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Chiqish toʻgʻri aniqlandi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
