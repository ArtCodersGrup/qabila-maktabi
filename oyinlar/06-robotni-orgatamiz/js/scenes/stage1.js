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
    await ui.say("elder", "Maqsad: mashina misollardan qanday oʻrganishini koʻrish — eng yaqin misol, chegara chizigʻi, sinov.");
    await ui.say("elder", "Vazifa — klassifikatsiya: yongʻoqni chaqmasdan toʻla yoki boʻsh deb ajratish. Qoida yozilmaydi, robotga misollar beriladi.");
  }

  // 4.1: 6 ta yong'oqni chaqib, o'qitish ma'lumotini yig'ish
  async function collect(points) {
    const { box, f } = common.board();
    const counter = common.line(`Misollar: 0 / ${points.length}`);
    box.append(counter);
    const holder = ui.h("div", { class: "nut-holder" });
    ui.control().append(holder);
    ui.bubble("elder", "Yongʻoqni bosib chaq — ichida magʻiz bormi? Har chaqilgan yongʻoq — bitta misol.");
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
      counter.textContent = `Misollar: ${shown.length} / ${points.length}`;
      await ui.sleep(550);
    }
    holder.remove();
    await ui.say("elder", "Javobi maʼlum misollar — oʻqitish maʼlumoti. Toʻlalari tepada, boʻshlari pastda.");
  }

  // 4.2: eng yaqin misol bo'yicha qaror
  async function nearestDemo(task) {
    const { box, f } = common.board();
    f.set({ points: task.points, query: task.query });
    const holder = ui.h("div", { class: "nut-holder" });
    box.append(holder);
    const card = learnUi.nutCard(holder, task.query, null, true);
    await ui.say("elder", "Yangi yongʻoq. Robot uni chaqmasdan bashorat qilishi kerak: toʻla yoki boʻsh.");
    ui.bubble("elder", "Usul: maydonda eng yaqin misol qidiriladi. «Robot qaror qilsin»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Robot qaror qilsin", () => { ui.clearControl(); done(); }, "big"));
    });
    f.set({ links: learn.nearestList(task.points, task.query, 3) });
    sound.play("tap");
    await ui.sleep(700);
    f.set({ links: [task.near], glow: [task.near] });
    await ui.say("elder", `Eng yaqin misol — ${common.nutName(task.near.full)}, demak bashorat: «${common.nutName(task.answer)}».`);
    card.reveal(task.answer);
    sound.play("win");
    await ui.say("elder", "Chaqib tekshirildi — bashorat toʻgʻri.");
  }

  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Bu usul eng yaqin qoʻshni deyiladi: qoida yozilmaydi, yangi obyekt misollarga solishtiriladi.");
    await ui.say("elder", "Oʻxshashlik — maydondagi masofa: masofa qancha kichik boʻlsa, misol shuncha oʻxshash.");
  }

  // 4.4: ikki qadam — avval eng yaqin misolni maydonda bosadi, keyin "robot nima deydi?" ga javob beradi.
  // Ikkalasi to'g'ri bo'lsagina hisoblanadi (QOIDALAR 4.3: 2 variantli savol yolg'iz kelmaydi).
  function nearestTask(task) {
    const { box, f } = common.board();
    f.set({ points: task.points, query: task.query });
    const holder = ui.h("div", { class: "nut-holder" });
    box.append(holder);
    const card = learnUi.nutCard(holder, task.query, null, true);
    ui.bubble("elder", "Yangi yongʻoq — sariq halqa. Unga eng yaqin misolni maydonda bos.");
    return common.twoStep({
      first: {
        setup: (submit) => f.set({ onPick: (index, kind) => { if (kind === "train") { sound.play("tap"); submit(index); } } }),
        check: (index) => index === task.nearIndex,
      },
      second: {
        setup: (submit) => {
          f.set({ onPick: null, links: [task.near], glow: [task.near] });
          ui.bubble("elder", "Eng yaqini shu. Robotning bashorati qanday?");
          learnUi.answerButtons(submit);
        },
        check: (value) => value === task.answer,
      },
      hint: (step) => {
        if (step === 1) {
          // Asbob: uchta nomzodgacha chiziq — qaysi biri eng qisqa ekanini bola o'zi solishtiradi
          f.set({ links: learn.nearestList(task.points, task.query, 3) });
          ui.bubble("elder", "↻ Uchta misolgacha masofa chizildi. Eng qisqasi qaysi misolga boradi?");
        } else {
          ui.bubble("elder", "↻ Bashorat = eng yaqin misolning javobi.");
        }
      },
      solution: () => {
        f.set({ onPick: null, links: [task.near], glow: [task.near] });
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
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta yongʻoq — avval eng yaqin misol, keyin bashorat.`);
    await practice.exercises({
      next: (prev, correct, tier) => learn.makeNearestTask(prev, null, tier),
      run: nearestTask,
      praise: (task) => `Eng yaqin misol — ${common.nutName(task.near.full)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
