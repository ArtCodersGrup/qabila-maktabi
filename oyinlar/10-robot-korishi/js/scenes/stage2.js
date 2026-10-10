// 2-bosqich: shablon bilan tanish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound, visionUi, practice, common } = QK;

  // 5.1: robot xotirasidagi shablonlar
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
    await ui.say("elder", `Robot xotirasida ${vision.NAMES.length} ta shablon bor: ${vision.NAMES.join(", ")}.`);
    await ui.say("elder", "Yangi rasm har shablon bilan katakma-katak solishtiriladi: nechta katak mos — shuncha ball.");
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
    // Robot oltita shablonni ham sinaydi; ekranda eng o'xshash to'rttasi qoladi (telefonda sig'sin)
    const shown = best.list.slice(0, 4).reverse();
    for (let i = 1; i <= shown.length; i++) {
      list.set(shown.slice(0, i), null);
      sound.play("tap");
      await ui.sleep(600);
    }
    list.set(best.list.slice(0, 4), best.name);
    sound.play("correct");
    await ui.say("elder", `Eng koʻp moslik — ${best.name}: 36 tadan ${best.score} ta katak mos keldi.`);
    await ui.say("elder", "Bu — shablon bilan tanish: javob — eng koʻp ball olgan shablon.");
  }

  // 5.4: mashq — robot nima deydi?
  function matchTask(task) {
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(task.image);
    const list = visionUi.scores(el);
    ui.bubble("elder", "Robot bu rasmni nima deb oʻylaydi?");
    return practice.tries({
      setup: (submit) => visionUi.shapeButtons(submit, task.options),
      check: (name) => name === task.answer,
      hint: (name) => {
        // Asbob: faqat bola tanlagan shablonning mosligi ochiladi — qolganlarini o'zi solishtiradi
        const picked = vision.bestMatch(task.image).list.filter((item) => item.name === name);
        list.set(picked, null);
        ui.bubble("elder", `↻ ${name} bilan ${picked[0].score} ta katak mos keldi. Bundan koʻproq mos keladigan shablon bor — top.`);
      },
      solution: () => {
        const best = vision.bestMatch(task.image);
        list.set(best.list.slice(0, 4), best.name);
        el.append(common.answerLine(`${best.name}: ${best.score} / ${vision.CELLS}`));
      },
    });
  }

  async function stage2() {
    await showTemplates();
    await matchDemo();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta rasm — robot qaysi shablonni tanlaydi.`);
    await practice.exercises({
      next: (prev, correct, tier) => vision.makeMatchTask(prev, null, tier),
      run: matchTask,
      praise: (task) => `Eng oʻxshashi — ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
