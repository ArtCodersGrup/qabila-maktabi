// 2-bosqich: algoritmning beshta xossasi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  // Har xossa uchun bitta buzuq misol ko'rsatiladi
  async function korsat() {
    const koriladi = ["aniqlik", "tushunarlilik", "natijaviylik", "ommaviylik", "diskretlik"];
    for (const xossa of koriladi) {
      const b = L.BUZUQ.find((x) => x.xossa === xossa);
      const el = common.box();
      el.append(common.note("«" + b.nom + "» algoritmi:"));
      el.append(common.qadamlar(b.qadamlar, b.buzuq));
      await ui.say("elder", b.nega);
      await ui.say("elder", "Bu — " + L.xossaById(xossa).nom.toLowerCase() + ". " + L.xossaById(xossa).izoh);
    }
  }

  async function definition() {
    const el = common.box(false);
    const list = ui.h("div", { class: "xossa-royxat" });
    for (const x of L.XOSSALAR) {
      list.append(ui.h("div", { class: "xossa-qator" },
        ui.h("span", { class: "xossa-nom", text: x.nom }),
        ui.h("span", { class: "xossa-izoh", text: x.izoh })));
    }
    el.append(list);
    await ui.say("elder", "Algoritmning beshta xossasi. Bittasi buzilsa ham, bu endi algoritm emas.");
  }

  async function stage2() {
    await korsat();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta algoritm. Har birida qaysi xossa buzilganini top.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.xossaTask(Math.random, prev, tier),
      run: (task) => common.xossaExercise(task),
      praise: (task) => L.xossaById(task.xossa).nom + " — toʻgʻri.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
