// 3-bosqich: qoida bilan hisoblash va katta n da usul tanlash.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  // Qoida bilan hisoblash: o'lchamasdan, faqat sinf nomi bilan
  async function hisob() {
    await ui.say("elder", "Nom bilan oʻlchamasdan ham aytish mumkin. Ikki savol beraman.");
    let oldingi = null;
    for (let k = 0; k < 2; k++) {
      const task = L.hisobTask(Math.random, oldingi);
      oldingi = task;
      QK.current = task; // tekshirish uchun (practice.exercises ham shunday qiladi)
      const host = common.box(true);
      host.append(ui.h("div", { class: "os-savol" },
        ui.h("b", { class: "s-" + task.sinf.id, text: task.sinf.nom }),
        ui.h("span", { text: " — " + task.usul.nom }),
        ui.h("div", { text: "n = " + task.n + " uchun " + task.qadam + " qadam ketdi." }),
        ui.h("div", { text: "n = " + task.yangiN + " uchun qancha boʻladi?" })));
      ui.bubble("elder", task.sinf.nom + ": " + task.sinf.izoh + ".");
      await practice.numberTries({
        answer: task.javob,
        maxLen: String(task.javob).length + 1,
        hint() { host.append(common.note("↻ " + task.sinf.izoh + ". " + task.qadam + " ni shunga koʻpaytir.")); },
        solution() { host.append(common.answer(String(task.javob) + " qadam")); },
      });
      ui.clearWork();
    }
    await ui.say("elder", "Mana shu foydasi: katta n ni oʻlchamasdan oldindan bilib olasan.");
  }

  // Nega bu kerak: n² katta n da nima bo'lishini bir ko'rib qo'yamiz
  async function katta() {
    const el = common.box(false);
    const qatorlar = [
      { n: 1000, n1: "1 000", nn: "1 000 000" },
      { n: 100000, n1: "100 000", nn: "10 000 000 000" },
    ];
    const jadval = ui.h("table", { class: "os-jadval katta" });
    jadval.append(ui.h("thead", {}, ui.h("tr", {},
      ui.h("th", { text: "n" }),
      ui.h("th", { text: "O(n)" }),
      ui.h("th", { text: "O(n²)" }))));
    const body = ui.h("tbody");
    for (const q of qatorlar) {
      body.append(ui.h("tr", {},
        ui.h("td", { class: "os-n", text: q.n1 }),
        ui.h("td", { class: "yaxshi", text: q.n1 }),
        ui.h("td", { class: "yomon", text: q.nn })));
    }
    jadval.append(body);
    el.append(jadval);
    await ui.say("elder", "100 000 ta son uchun O(n) — 100 ming qadam, O(n²) — oʻn milliard.");
    await ui.say("apprentice", "Oʻn milliard qadam qancha vaqt oladi?");
    await ui.say("elder", "Soatlar. Shuning uchun katta maʼlumotda usul tanlash — eng muhim qaror.");
  }

  async function stage3() {
    await hisob();
    await katta();
    await ui.say("elder", "Endi oʻzing tanla: qaysi usul yaraydi?");
    await practice.exercises({
      next: (prev) => L.amaliyTask(Math.random, prev),
      run: (task) => common.amaliyExercise(task),
      praise: () => "Toʻgʻri usul tanlandi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
