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
    await ui.say("elder", "Ikkalasi ham 10 belgi atrofida, lekin biri — ism va yil.");
    await ui.say("elder", "Lugʻat hujumi: avval ismlar, mashhur soʻzlar va yillar sinaladi — bu soniyalar ishi.");
    await ui.say("elder", "«P@ss1» kabi almashtirish ham yordam bermaydi: @ → a, 1 → i ni dastur oʻzi sinab koʻradi.");
  }

  async function qoida() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "pk-qoida" },
      ui.h("div", { class: "pk-qoida-nom", text: "Yaxshi parol" }),
      ui.h("div", { text: "Uzun — kamida 12 ta belgi" }),
      ui.h("div", { text: "Ism, tugʻilgan yil, mashhur soʻz emas" }),
      ui.h("div", { text: "Har sayt uchun boshqacha" }),
      ui.h("div", { class: "pk-misol", text: "«sariq fil kitob oʻqiydi» — uzun, esda qoladi, lugʻatda yoʻq" })));
    await ui.say("elder", "Amaliy usul: 4 ta tasodifiy soʻzdan ibora — uzun, lugʻatda yoʻq va esda qoladi.");
  }

  async function stage3() {
    await lugat();
    await qoida();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — parolga baho berish va kuchli parol yasash navbatma-navbat.`);
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
