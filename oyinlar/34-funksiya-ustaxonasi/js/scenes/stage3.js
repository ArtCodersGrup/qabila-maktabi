// 3-bosqich: bo'laklab yechish — funksiya ichida funksiya, keyin o'zing yozasan.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  async function together() {
    const code = "def juftmi(n):\n    return n % 2 == 0\n\ndef nechta_juft(a):\n    soni = 0\n    for x in a:\n        if juftmi(x):\n            soni += 1\n    return soni\n\nprint(nechta_juft([1, 2, 3, 4, 6]))";
    const el = common.box();
    el.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code).output);
    el.append(out.el);
    await ui.say("elder", "Katta masala ikkiga boʻlindi: juftmi va nechta_juft.");
    await ui.say("elder", "Har bir funksiya bitta ishni qiladi. Shuning uchun tekshirish ham oson.");
  }

  async function howItWorks() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.bench(true) }));
    await ui.say("elder", "Endi sen faqat funksiyani yozasan — chaqirishni sayt oʻzi bajaradi.");
    await ui.say("elder", "Funksiya nomini aynan soʻralganidek yoz, aks holda sayt uni topolmaydi.");
  }

  async function stage3() {
    await together();
    await howItWorks();
    await practice.exercises({
      next: (prev, correct, tier) => L.writeTask(Math.random, prev, tier),
      run: (task) => common.writeExercise(task),
      praise: () => "Funksiya hamma sinovdan oʻtdi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
