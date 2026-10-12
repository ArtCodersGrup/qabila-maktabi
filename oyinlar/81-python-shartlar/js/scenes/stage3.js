// 3-bosqich: qoidali tasniflagich (rule-based classifier) — mantiqiy xatoni tuzatish va o'zi yozish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  // Qaror daraxti: qoidalar ketma-ket savollar bo'lib yoziladi
  async function classifier() {
    const code = 'uzunlik = 4.7\nkenglik = 1.4\nif uzunlik < 2.5:\n    print("setosa")\nelif kenglik < 1.8:\n    print("versicolor")\nelse:\n    print("virginica")';
    const el = common.box();
    el.append(ui.h("div", { class: "story-art small", html: QK.gameArt.tree() }));
    await common.stepThrough(el, code, "⏭ Qadam: gul turi ikki oʻlchov boʻyicha aniqlanadi.");
    await ui.say("elder", "Bu — qoidali tasniflagich (rule-based classifier): qoidalarni odam yozadi. Mashinali oʻrganish (machine learning, ML) esa chegaralarni maʼlumotdan topadi.");
  }

  // Xato turlari va chegara tanlash mas'uliyati
  async function ethics() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.threshold(0.3) }));
    el.append(ui.h("div", { class: "summary" },
      ui.h("div", { text: "Ortiqcha signal (false positive, FP): model «bor» dedi, aslida yoʻq" }),
      ui.h("div", { text: "Payqalmagan holat (false negative, FN): model «yoʻq» dedi, aslida bor" })));
    await ui.say("elder", "Chegarani tanlash — masʼuliyat. Tibbiyotda kasallikni payqamaslik ortiqcha signaldan xavfliroq, shuning uchun chegara pastroq olinadi.");
    await ui.say("elder", "Qoidaga jins yoki yashash joyi kabi belgi kirsa, tasniflagich odamlarga noxolis (bias) qaror chiqaradi. Belgini tanlashda buni tekshir.");
  }

  async function stage3() {
    await classifier();
    await ethics();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta topshiriq — tasniflagichdagi mantiqiy xatoni tuzatish yoki uni oʻzing yozish.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Tasniflagich hamma sinovdan oʻtdi." : "Mantiqiy xato tuzatildi."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
