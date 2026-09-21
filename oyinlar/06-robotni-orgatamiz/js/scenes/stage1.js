// Kirish va 1-bosqich: misollardan o'rganish — eng yaqin misol (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, art, learnUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Qabilaga robot keldi!");
    await ui.say("apprentice", "U yongʻoqlarni saralay oladimi?");
    await ui.say("elder", "Hozircha yoʻq — u hech narsa bilmaydi. Biz oʻrgatamiz.");
    await ui.say("elder", "Morzeda jadvalni biz yozgandik. Robotga esa misollar koʻrsatamiz.");
  }

  // 4.1: 6 ta yong'oqni chaqib, o'qitish ma'lumotini yig'ish
  async function collect(points) {
    const { box, f } = common.board();
    const counter = common.line("Misollar: 0 / 6");
    box.append(counter);
    const holder = ui.h("div", { class: "nut-holder" });
    ui.control().append(holder);
    ui.bubble("elder", "Yongʻoqni bos — chaqib koʻramiz. Ichida magʻiz bormi?");
    const shown = [];
    for (const p of points) {
      holder.innerHTML = "";
      await ui.settle((done) => {
        const card = learnUi.nutCard(holder, p, () => {
          sound.play(p.full ? "correct" : "retry");
          card.reveal(p.full);
          done();
        });
      });
      shown.push(p);
      f.set({ points: shown.slice() });
      counter.textContent = `Misollar: ${shown.length} / 6`;
      await ui.sleep(550);
    }
    holder.remove();
    await ui.say("elder", "Bu — oʻqitish maʼlumoti. Toʻla yongʻoqlar tepada, boʻshlari pastda!");
  }

  // 4.2: eng yaqin misol bo'yicha qaror
  async function nearestDemo(task) {
    const { box, f } = common.board();
    f.set({ points: task.points, query: task.query });
    const holder = ui.h("div", { class: "nut-holder" });
    box.append(holder);
    const card = learnUi.nutCard(holder, task.query, null, true);
    await ui.say("elder", "Yangi yongʻoq. Robot uni chaqmasdan aytishi kerak: toʻlami yoki boʻsh?");
    ui.bubble("elder", "Robot eng oʻxshash misolni qidiradi. «Robot qaror qilsin»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Robot qaror qilsin", () => { ui.clearControl(); done(); }, "big"));
    });
    f.set({ links: learn.nearestList(task.points, task.query, 3) });
    sound.play("tap");
    await ui.sleep(700);
    f.set({ links: [task.near], glow: [task.near] });
    await ui.say("elder", `Eng yaqin misol — ${common.nutName(task.near.full)}. Robot «${common.nutName(task.answer)}» deydi.`);
    card.reveal(task.answer);
    sound.play("win");
    await ui.say("elder", "Chaqib koʻrdik — toʻgʻri!");
  }

  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robot qoidani yozmaydi — u koʻrgan misollariga qaraydi.");
    await ui.say("elder", "Eng yaqin misol qanday boʻlsa, javob ham shunday.");
  }

  // 4.4: "Robot bu yong'oqni nima deydi?"
  function nearestTask(task) {
    const { box, f } = common.board();
    f.set({ points: task.points, query: task.query });
    const holder = ui.h("div", { class: "nut-holder" });
    box.append(holder);
    const card = learnUi.nutCard(holder, task.query, null, true);
    ui.bubble("elder", "Robot bu yongʻoqni nima deydi?");
    return common.answerTask({
      answer: task.answer,
      hint: () => {
        f.set({ links: learn.nearestList(task.points, task.query, 3) });
        ui.bubble("elder", "↻ Eng yaqin uchta misolga chiziq tortdik. Eng yaqini qaysi?");
      },
      solution: () => {
        f.set({ links: [task.near], glow: [task.near] });
        card.reveal(task.answer);
        box.append(common.answerLine(`Eng yaqin misol — ${common.nutName(task.near.full)}`));
      },
    });
  }

  async function stage1() {
    const first = learn.makeNearestTask(null);
    await collect(first.points);
    await nearestDemo(first);
    await explain();
    await ui.say("elder", "Endi oʻzing ayt: robot nima deydi? 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev) => learn.makeNearestTask(prev),
      run: nearestTask,
      praise: (task) => `Eng yaqin misol — ${common.nutName(task.near.full)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
