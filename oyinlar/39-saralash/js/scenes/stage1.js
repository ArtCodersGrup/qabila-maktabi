// Kirish va 1-bosqich: pufakcha saralash — juftlikni solishtirish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.ustunlar() }));
    await ui.say("elder", "Sonlar aralash turibdi. Ularni kichikdan kattaga tizish kerak.");
    await ui.say("apprentice", "Qaysi birini qayerga qoʻyishni qanday bilamiz?");
    await ui.say("elder", "Hammasini birdan emas — faqat qoʻshni ikkitasini solishtiramiz. Shu yetadi.");
  }

  // Bola o'zi bir o'tishni bajaradi: har juftlikda qaror qabul qiladi
  async function otish() {
    const boshlangich = [5, 2, 9, 1, 7];
    let holat = boshlangich.slice();
    const host = common.box(true);
    host.append(common.note("Chapdan oʻngga yuramiz. Har juftlikda: kattasi oʻngga."));
    const joy = ui.h("div", {});
    host.append(joy);
    for (let i = 0; i < holat.length - 1; i++) {
      joy.innerHTML = "";
      joy.append(common.ustunlar(holat, { juft: i }));
      const kerak = holat[i] > holat[i + 1];
      ui.bubble("elder", holat[i] + " va " + holat[i + 1] + " — almashtiramizmi?");
      const javob = await ui.choice([
        { label: "Ha", value: true },
        { label: "Yoʻq", value: false },
      ]);
      if (javob !== kerak) ui.toast(kerak ? "Chapdagisi katta — almashtiriladi." : "Chapdagisi kichik — joyida qoladi.");
      if (kerak) {
        const t = holat[i];
        holat[i] = holat[i + 1];
        holat[i + 1] = t;
      }
    }
    joy.innerHTML = "";
    joy.append(common.ustunlar(holat, { tayyor: holat.length - 1 }));
    await ui.say("elder", "Bir oʻtish tugadi. Eng katta son oxiriga chiqdi — u endi oʻz joyida.");
    await ui.say("elder", "Katta sonlar sekin-asta oxiriga “qalqib” chiqadi. Shuning uchun — pufakcha saralash.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "Qoʻshni ikkitasini solishtir" }),
      ui.h("div", { class: "formula-row", text: "Chapdagisi katta boʻlsa — almashtir" }),
      ui.h("div", { class: "formula-row", text: "Har oʻtishda bitta son oʻz joyiga tushadi" })));
    await ui.say("elder", "Endi oʻzing ayt: almashtirish kerakmi yoki yoʻq?");
  }

  async function stage1() {
    await otish();
    await definition();
    await practice.exercises({
      next: (prev) => L.almashTask(Math.random, prev),
      run: (task) => common.almashExercise(task),
      praise: () => "Qiyoslashni toʻgʻri qilding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
