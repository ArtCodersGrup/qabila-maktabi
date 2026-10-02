// 3-bosqich: parolni baholash va yaxshi parol yasash.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function lugat() {
    const el = common.box(true);
    el.append(common.note("Lekin uzunlikning oʻzi yetarli emas:"));
    el.append(ui.h("div", { class: "pk-ikki" },
      common.parolKarta("Anvar2010", { hisob: false, vaqt: true }),
      common.parolKarta("tulkiquyosh", { hisob: false, vaqt: true })));
    await ui.say("elder", "Ikkalasi ham oʻn belgi atrofida. Lekin biri — ism va yil.");
    await ui.say("elder", "Hujumchi avval ismlarni, mashhur soʻzlarni va yillarni sinaydi — bu soniyalar ishi.");
    await ui.say("apprentice", "«P@ss1» kabi belgilar bilan yashirsam-chi?");
    await ui.say("elder", "Bu hiylani hamma biladi: @ — a, 1 — i. Dastur ularni oʻzi almashtirib koʻradi.");
  }

  async function qoida() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "pk-qoida" },
      ui.h("div", { class: "pk-qoida-nom", text: "Yaxshi parol" }),
      ui.h("div", { text: "Uzun — kamida 12 ta belgi" }),
      ui.h("div", { text: "Ism, tugʻilgan yil, mashhur soʻz emas" }),
      ui.h("div", { text: "Har sayt uchun boshqacha" }),
      ui.h("div", { class: "pk-misol", text: "«sariq fil kitob oʻqiydi» — uzun, esda qoladi, lugʻatda yoʻq" })));
    await ui.say("elder", "Eng qulayi — toʻrtta tasodifiy soʻzdan ibora. Uzun boʻladi, lekin esda qoladi.");
  }

  async function stage3() {
    await lugat();
    await qoida();
    await ui.say("elder", "Endi oʻzing baho ber — va oʻzing kuchli parol yasa.");
    await practice.exercises({
      // Baho (5 variant: daraja + sababi) va "oʻzing yasa" navbatlashadi
      next: (prev, togri, tier) => (togri % 2 === 1 ? L.yasaTask(Math.random, prev, tier) : L.bahoTask(Math.random, prev, tier)),
      run: (task) => (task.tur === "yasa" ? common.yasaExercise(task) : common.bahoExercise(task)),
      praise: (task) => (task.tur === "yasa" ? "«" + task.yasalgan + "» — topish vaqti: " + task.vaqt + "." : task.parol + " — " + task.javob),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
