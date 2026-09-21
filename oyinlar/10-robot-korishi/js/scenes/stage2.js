// 2-bosqich: shablon bilan tanish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound, visionUi, practice, common } = QK;

  // 5.1: robot xotirasidagi uchta shablon
  async function showTemplates() {
    const el = common.box(false);
    const row = ui.h("div", { class: "vrow" });
    el.append(row);
    for (const name of vision.NAMES) {
      const holder = ui.h("div", { class: "vtile" });
      const mini = visionUi.grid(holder, { size: "sm" });
      mini.set(vision.TEMPLATES[name]);
      holder.append(ui.h("div", { class: "vtile-name", text: name }));
      row.append(holder);
    }
    await ui.say("elder", "Robot xotirasida uchta shablon bor: kvadrat, uchburchak va krest.");
    await ui.say("elder", "Yangi rasm kelsa, u har shablon bilan solishtiradi.");
  }

  // 5.2: moslikni sanash
  async function matchDemo() {
    const task = vision.makeMatchTask(null);
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(task.image);
    const list = visionUi.scores(el);
    ui.bubble("elder", "Yangi rasm keldi. «Solishtir»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Solishtir", () => { ui.clearControl(); done(); }, "big"));
    });
    const best = vision.bestMatch(task.image);
    for (let i = 1; i <= best.list.length; i++) {
      list.set(best.list.slice(0, i), null);
      sound.play("tap");
      await ui.sleep(700);
    }
    list.set(best.list, best.name);
    sound.play("correct");
    await ui.say("elder", `Eng koʻp moslik — ${best.name}: 36 tadan ${best.score} ta katak mos keldi.`);
    await ui.say("elder", "Robot uchun «tanish» degani — eng oʻxshash shablonni topish.");
  }

  // 5.4: mashq — robot nima deydi?
  function matchTask(task) {
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(task.image);
    const list = visionUi.scores(el);
    ui.bubble("elder", "Robot bu rasmni nima deb oʻylaydi?");
    return practice.tries({
      setup: (submit) => visionUi.shapeButtons(submit),
      check: (name) => name === task.answer,
      hint: () => {
        list.set(vision.bestMatch(task.image).list, null);
        ui.bubble("elder", "↻ Mosliklarni ochdim: qaysi shablonda eng koʻp katak mos kelgan?");
      },
      solution: () => {
        const best = vision.bestMatch(task.image);
        list.set(best.list, best.name);
        el.append(common.answerLine(`${best.name}: ${best.score} / ${vision.CELLS}`));
      },
    });
  }

  async function stage2() {
    await showTemplates();
    await matchDemo();
    await ui.say("elder", "Endi oʻzing ayt: robot nima deydi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => vision.makeMatchTask(prev),
      run: matchTask,
      praise: (task) => `Eng oʻxshashi — ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
