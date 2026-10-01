// Kirish va 1-bosqich: ikki yo'l — bir masalaning ikki yechimi (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.ikkiYol(null) }));
    await ui.say("elder", "Ikki yoʻl ham bir joyga olib boradi. Lekin biri uzun, biri qisqa.");
    await ui.say("elder", "Dasturda ham shunday: ikki kod bir xil javob beradi, lekin ishi har xil.");
    await ui.say("apprentice", "Qaysi biri yaxshi ekanini qanday bilamiz?");
    await ui.say("elder", "Sanab koʻramiz. Kompyuter nechta qadam bajarganini oʻlchab beradi.");
  }

  async function ikkiYechim() {
    const juft = L.JUFTLAR[0]; // 1 dan 100 gacha yig'indi
    const a = L.olcha(juft.a.kod);
    const b = L.olcha(juft.b.kod);
    const el = common.box();
    el.append(common.note(juft.savol + " — ikki xil yoʻl bilan:"));
    const yon = ui.h("div", { class: "alg-juft" });
    for (const [kalit, olchov] of [["a", a], ["b", b]]) {
      yon.append(ui.h("div", { class: "alg-yechim" },
        ui.h("div", { class: "alg-yechim-nom", text: juft[kalit].nom }),
        U.codeBlock(juft[kalit].kod, { numbers: false })));
    }
    el.append(yon);
    await ui.say("elder", "Ikkalasini ham ishga tushiramiz. Javob bir xil chiqadimi?");
    el.append(U.qadamJadval([
      { nom: juft.a.nom, qadam: a.qadam, natija: a.chiqish[0], eng: a.qadam < b.qadam },
      { nom: juft.b.nom, qadam: b.qadam, natija: b.chiqish[0], eng: b.qadam < a.qadam },
    ]));
    await ui.say("elder", "Javob bir xil: " + a.chiqish[0] + ". Lekin biri " + a.qadam + " qadam, ikkinchisi " + b.qadam + " qadam.");
    await ui.say("elder", "Ikkalasi ham toʻgʻri. Faqat biri kamroq ish qiladi — bu samaradorlik deyiladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "Ishlaydi ≠ yaxshi" }),
      ui.h("div", { class: "formula-row", text: "Bir masalaning koʻp yechimi boʻladi" }),
      ui.h("div", { class: "formula-row", text: "Qaysi biri kamroq qadam bajarsa — oʻshasi tejamli" })));
    await ui.say("elder", "Endi oʻzing ayt: qaysi yechim tejamli?");
  }

  async function stage1() {
    await ikkiYechim();
    await definition();
    await practice.exercises({
      next: (prev) => L.juftTask(Math.random, prev),
      run: (task) => common.juftExercise(task),
      praise: () => "Tejamli yoʻlni topding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
