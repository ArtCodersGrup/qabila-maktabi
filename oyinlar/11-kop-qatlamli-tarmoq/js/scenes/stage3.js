// 3-bosqich: nega chuqur, o'rganish va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { neural, ui, sound, art, neuralUi, practice, common } = QK;

  const SCENES = [
    { art: "layers", lines: ["Rasm taniydigan tarmoqlarda yuzlab qatlam va millionlab ogʻirlik bor.", "Chatbotlarda esa milliardlab!"] },
    { art: "brain", lines: ["Neyron gʻoyasi miyadan olingan.", "Lekin tarmoq miya emas — u faqat sonlarni qoʻshadi va solishtiradi."] },
    { art: "blackbox", lines: ["Tarmoq nega aynan shunday qaror qilganini tushuntirish qiyin.", "Shuning uchun uning javobini odam tekshirib turadi."] },
    { art: "robot", lines: ["Chuqur oʻrganish — mashinali oʻrganishning ichidagi qism.", "Keyingi oʻyinda hammasini bitta xaritaga joylaymiz!"] },
  ];

  const TASK = neural.TABLES.faqatBittasi;

  // 6.1: bitta neyron bu ishni uddalay olmaydi — robot barcha og'irliklarni sinaydi
  async function oneFails() {
    const el = common.box(true);
    el.append(common.line("Ish: ikki chiroqdan faqat bittasi yoniq boʻlsa — yon"));
    const table = neuralUi.truthTable(el);
    table.set(TASK, null);
    const note = common.line(" ");
    el.append(note);
    await ui.say("elder", "Yangi ish: ikki chiroqdan faqat bittasi yoniq boʻlsa, neyron yonsin.");
    ui.bubble("elder", "Bitta neyron buni uddalaydimi? Robot barcha ogʻirlik va chegaralarni sinasin.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Hammasini sina", () => { ui.clearControl(); done(); }, "big"));
    });
    let tried = 0;
    for (let w1 = -2; w1 <= 2; w1++) {
      for (let w2 = -2; w2 <= 2; w2++) {
        for (let t = -2; t <= 3; t += 2) {
          tried++;
          table.set(TASK, (x) => neural.fire(x, [w1, w2], t));
          note.textContent = `Sinaldi: ${tried} ta neyron`;
          await ui.sleep(45);
        }
      }
    }
    const best = neural.bestOneNeuron(TASK);
    table.set(TASK, (x) => neural.fire(x, best.weights, best.threshold));
    note.textContent = `Eng yaxshisi ham ${best.errors} ta xato qiladi`;
    sound.play("retry");
    await ui.say("elder", `Hech bir neyron uddalay olmadi — eng yaxshisi ham ${best.errors} ta xato qiladi.`);
  }

  // 6.2: ikki qatlam uddalaydi
  async function twoWork() {
    const el = common.box(true);
    el.append(common.line("1-qatlam: «faqat A» va «faqat B» neyronlari → 2-qatlam: «bittasi yondimi?»"));
    const table = neuralUi.truthTable(el);
    table.set(TASK, null);
    ui.bubble("elder", "Endi ikki qatlamli tarmoq sinab koʻrsin. «Sina»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Sina", () => { ui.clearControl(); done(); }, "big"));
    });
    table.set(TASK, (x) => neural.twoLayer(x).out);
    sound.play("correct");
    await ui.say("elder", "Hammasi toʻgʻri! Ikki qatlam bitta neyron uddalay olmagan ishni bajardi.");
    await ui.say("elder", "Qiyin ish — koʻp qatlam. Shuning uchun uni chuqur oʻrganish deyishadi.");
  }

  // 6.3: og'irliklarni tarmoq o'zi o'rganadi
  async function learning() {
    const el = common.box(true);
    const table = neuralUi.truthTable(el);
    const note = common.line(" ");
    el.append(note);
    const threshold = neural.THRESHOLDS.va;
    await ui.say("elder", "Ogʻirliklarni kim tanlaydi? Tarmoqning oʻzi — misollardan!");
    await ui.say("elder", "Qoida: yonishi kerak edi-yu yonmasa — ogʻirlik oshiriladi. Yonmasligi kerak edi-yu yonsa — kamaytiriladi.");
    ui.bubble("elder", "Ish: ikkala chiroq yoniq boʻlsa — yon. «Oʻrgat»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Oʻrgat", () => { ui.clearControl(); done(); }, "big"));
    });
    const steps = neural.trainNeuron(neural.TABLES.va, [0, 0], threshold);
    for (let i = 0; i < steps.length; i++) {
      const w = steps[i].weights;
      table.set(neural.TABLES.va, (x) => neural.fire(x, w, threshold));
      note.textContent = `${i}-qadam · ogʻirliklar: ${neuralUi.sign(w[0])}, ${neuralUi.sign(w[1])} · xato: ${steps[i].errors}`;
      sound.play(steps[i].errors ? "tap" : "correct");
      await ui.sleep(900);
    }
    await ui.say("elder", "Xato 0! Tarmoq ogʻirliklarni oʻzi topdi — biz faqat misol berdik.");
  }

  // 6.4: mashq — og'irlikni oshiramizmi yoki kamaytiramizmi?
  function updateTask(task) {
    const el = common.box(true);
    neuralUi.neuronView(el, { inputs: task.inputs, weights: task.weights, threshold: task.threshold });
    el.append(common.line(task.target ? "Neyron YONISHI kerak edi, lekin yonmadi" : "Neyron YONMASLIGI kerak edi, lekin yondi"));
    ui.bubble("elder", "Neyron xato qildi. Yoniq kirishlarning ogʻirligini nima qilamiz?");
    const options = ["Oshiramiz", "Kamaytiramiz"];
    return practice.tries({
      setup: (submit) => neuralUi.choiceButtons(options, submit),
      check: (index) => (index === 0 ? "oshir" : "kamaytir") === task.answer,
      hint: () => ui.bubble("elder", task.target
        ? "↻ Yonishi uchun yigʻindi kattaroq boʻlishi kerak."
        : "↻ Yonmasligi uchun yigʻindi kichikroq boʻlishi kerak."),
      solution: () => el.append(common.answerLine(task.answer === "oshir"
        ? "Oshiramiz — yigʻindi kattalashib, chegaraga yetadi"
        : "Kamaytiramiz — yigʻindi kichrayib, chegaradan tushadi")),
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: scene.art === "robot" ? art.robot() : art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await oneFails();
    await twoWork();
    await learning();
    await ui.say("elder", "Endi sen oʻrgat: ogʻirlikni oshiramizmi yoki kamaytiramizmi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => neural.makeUpdateTask(prev),
      run: updateTask,
      praise: (task) => (task.answer === "oshir" ? "Oshirdik — endi yonadi." : "Kamaytirdik — endi yonmaydi."),
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
