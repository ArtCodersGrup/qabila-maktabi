// 2-bosqich: usul va vazifa (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { atlas, ui, sound, atlasUi, practice, common } = QK;

  // 5.1: vazifalar — ko'rish, til, harakat, hisob
  async function tasksIntro() {
    const el = common.box(false);
    const grid = ui.h("div", { class: "tasks" });
    for (const t of atlas.TASKS) grid.append(ui.h("div", { class: `task t-${t.id}`, text: t.name }));
    el.append(grid);
    await ui.say("elder", "Doiralar — usullar: ish qanday bajariladi.");
    await ui.say("elder", "Koʻrish, til, harakat, hisob — vazifalar: nima bajariladi.");
  }

  // 5.2: bitta vazifa — uch usul
  async function oneTaskThreeWays() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "acard", text: "Vazifa (koʻrish): rasmda krest bormi?" }));
    const ways = [
      { zone: "plain", text: "Qoida: oʻrta ustun va oʻrta qator toʻliqmi? («Qoida yoki misol?»)" },
      { zone: "ml", text: "Misol: eng oʻxshash rasmga qarab («Robotni oʻrgatamiz»)" },
      { zone: "dl", text: "Neyron tarmoq: chiziq → shakl («Koʻp qatlamli tarmoq»)" },
    ];
    const list = ui.h("div", { class: "ways" });
    el.append(list);
    for (const way of ways) {
      list.append(ui.h("div", { class: `way z-${way.zone}` },
        ui.h("span", { class: "way-zone", text: atlas.zoneName(way.zone) }),
        ui.h("span", { text: way.text })));
      sound.play("tap");
      await ui.sleep(500);
    }
    await ui.say("elder", "Vazifa bitta — koʻrish, usul esa uch xil boʻlishi mumkin.");
    await ui.say("elder", "Demak, «kompyuter koʻrishi» — doira (usul) emas, vazifa.");
  }

  // 5.3: mashq — bu ish qaysi vazifa?
  function jobTask(task) {
    const el = common.box(true);
    atlasUi.card(el, task.text);
    ui.bubble("elder", "Bu ish qaysi vazifa?");
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        task.options.forEach((id, i) => row.append(ui.button(atlas.taskName(id), () => submit(i), i % 2 ? "secondary" : "")));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", "↻ Mashina nima qiladi: koʻradimi, gapiradimi, harakatlanadimi yoki hisoblaydimi?"),
      solution: () => el.append(common.answerLine(`Vazifa: ${atlas.taskName(task.answer)}`)),
    });
  }

  async function stage2() {
    await tasksIntro();
    await oneTaskThreeWays();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta misol — qaysi vazifa.`);
    await practice.exercises({
      next: (prev, correct, tier) => atlas.makeJobTask(prev, null, tier),
      run: jobTask,
      praise: (task) => `Vazifa — ${atlas.taskName(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
