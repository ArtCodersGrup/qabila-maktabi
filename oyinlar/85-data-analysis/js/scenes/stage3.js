// 3-bosqich: bogʻliqlik (korrelyatsiya) — hali sabab emas; xulosa tanlash.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const NUQTALAR = [[1, 2], [2, 2], [3, 4], [4, 3], [5, 5], [6, 6], [7, 6], [8, 8], [9, 9]];

  // Uchinchi omil sxemasi: bitta sabab — ikki oqibat (HTML, rasm emas)
  const sxema = () => h("div", { class: "mt-sxema", role: "img", "aria-label": "Issiq havo ikkala hodisaga ham taʼsir qiladi" },
    h("div", { class: "mt-omil", text: "Issiq havo" }),
    h("div", { class: "mt-oqibatlar" },
      h("div", { class: "mt-oqibat", text: "↙ muzqaymoq koʻp sotiladi" }),
      h("div", { class: "mt-oqibat", text: "↘ koʻp odam choʻmiladi" })));

  async function korsat() {
    const el = common.box(true);
    el.append(common.holat("Shartli maʼlumot: har nuqta — yozning bir kuni."));
    const diag = common.diagramma(L.nuqtaDiagramma(NUQTALAR, "Muzqaymoq sotuvi", "Suvda choʻkish hodisalari"));
    el.append(diag);
    ui.bubble("elder", "Muzqaymoq koʻp sotilgan kunlarda choʻkish hodisalari ham koʻp. Bundan qaysi xulosa chiqadi?");
    const javob = await ui.choice([
      { label: "Muzqaymoq choʻkishga sabab boʻladi", value: "sabab", secondary: true },
      { label: "Ikkalasi birga oʻzgaradi, sababi nomaʼlum", value: "bogliq", secondary: true },
    ]);
    QK.sound.play(javob === "bogliq" ? "correct" : "retry");
    ui.bubble("elder", (javob === "bogliq" ? "✓ " : "↻ ") + "Diagramma faqat birga oʻzgarishni koʻrsatadi. Ikkalasini ham oʻzgartiradigan yashirin omilni och.");
    await ui.choice([{ label: "Uchinchi omilni koʻrsatish", value: 1 }]);
    QK.sound.play("tap");
    diag.replaceWith(sxema());
    await ui.say("elder", "Issiq kunda muzqaymoq ham koʻp sotiladi, odamlar ham koʻp choʻmiladi. Muzqaymoqni taqiqlash choʻkishni kamaytirmaydi.");
    el.append(common.formula([
      "Bogʻliqlik (correlation) ≠ sabab (causation)",
      "Tekshir: uchinchi omil · teskari yoʻnalish · tasodif",
      "Sababni nazoratli tajriba isbotlaydi",
    ]));
    await ui.say("elder", `Ikki hodisa birga oʻzgarsa, bu — bogʻliqlik; biri ikkinchisiga sabab ekani alohida isbot talab qiladi. Mashq: ${practice.need()} ta savol.`);
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
