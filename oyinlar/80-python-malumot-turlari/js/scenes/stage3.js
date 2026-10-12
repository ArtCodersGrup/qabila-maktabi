// 3-bosqich: ro'yxat — indeks, len, append; o'qish va o'zi yozish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const N = L.NAMUNALAR;

  async function listBasics() {
    const el = common.box();
    common.withOutput(el, N.royxat);
    await ui.say("elder", "Roʻyxat (list) — tartibli qiymatlar. Indeks 0 dan boshlanadi: birinchi element [0], oxirgisi [-1].");
    await ui.say("elder", "len() — elementlar soni, append() — oxiriga qoʻshadi, yorliqlar[1] = … — elementni almashtiradi.");
  }

  async function indexError() {
    const el = common.box();
    common.withOutput(el, N.indeksXato);
    await ui.say("elder", "Oʻrtacha = sum() / len(). 3 ta elementning indekslari 0, 1, 2 — ballar[3] yoʻq: IndexError.");
    await ui.say("elder", "Maxfiylik: maʼlumot toʻplamida ism-familiya oʻrniga raqamli ID saqlagan maʼqul — tahlil uchun shaxsning kimligi kerak emas.");
  }

  async function stage3() {
    await listBasics();
    await indexError();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta topshiriq — kod natijasini ayt yoki oʻzing yoz. Yozganing boshqa uzunlikdagi roʻyxat bilan ham tekshiriladi.`);
    const seen = new Set();
    await practice.exercises({
      next: (prev, correct, tier) => {
        if (prev && prev.type === "kod-yoz") seen.add(prev.id);
        return L.stage3Task(Math.random, prev, tier, seen);
      },
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Kod har xil roʻyxatda toʻgʻri ishladi." : "Roʻyxat toʻgʻri oʻqildi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
