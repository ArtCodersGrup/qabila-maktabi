// Uch bosqich = uch daraja. Har darajada bankdan 3 ta masala yechiladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.tower(0) }));
    await ui.say("elder", "Bu yerda oʻyin yoʻq — faqat masalalar. Xuddi olimpiadadagidek.");
    await ui.say("elder", "Har masalada kirish beriladi, sen javobni chiqarasan.");
    await ui.say("elder", "Dasturing bir nechta sinovdan oʻtadi — faqat namunadagisidan emas.");
  }

  // Bosqich = daraja: 3 ta masala yechilsa tugaydi
  function stage(number) {
    return async function () {
      const level = L.levelByIndex(number);
      const used = [];
      const el = common.box(false);
      el.append(ui.h("div", { class: "story-art small", html: QK.gameArt.tower(number - 1) }));
      await ui.say("elder", level.title + " daraja: " + level.note + ". Uchta masala yechsang, bosqich tugaydi.");
      await practice.exercises({
        next: () => {
          const task = L.pickProblem(number, used, Math.random);
          used.push(task.id);
          return task;
        },
        run: (task) => common.problemExercise(task),
        praise: (task) => "«" + task.title + "» yechildi.",
      });
    };
  }

  QK.scenes = QK.scenes || {};
  QK.scenes.intro = intro;
  // Har daraja uchun bitta sahna — darajalar soni bankdan olinadi
  L.LEVELS.forEach((level, k) => { QK.scenes["stage" + (k + 1)] = stage(k + 1); });
})(window);
