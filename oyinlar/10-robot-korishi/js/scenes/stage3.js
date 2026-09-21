// 3-bosqich: surilsa nima bo'ladi, belgi va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound, art, visionUi, practice, common } = QK;

  const SCENES = [
    { art: "camera", lines: ["Telefon kamerasi yuzni shunday topadi: kataklar, belgilar va taqqoslash."] },
    { art: "roadsign", lines: ["Mashina yoʻl belgisini oʻqiydi.", "Lekin qor yoki soya tushsa, piksellar oʻzgaradi va u adashishi mumkin."] },
    { art: "xray", lines: ["Shifokorga rasmdagi shubhali joyni koʻrsatib beradi.", "Oxirgi qarorni baribir shifokor qabul qiladi."] },
    { art: "robot", lines: ["Koʻrish — bu vazifa. Uni qoida bilan ham, misol bilan ham yechsa boʻladi.", "Bugungi dasturlar belgilarni oʻzi topadi — bu keyingi oʻyinda."] },
  ];

  // 6.1–6.2: rasm suriladi, shablon adashadi, belgi qutqaradi
  async function shiftDemo() {
    const name = vision.NAMES[1];
    const original = vision.TEMPLATES[name];
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(original);
    const feature = visionUi.featureLine(el); // belgi toʻr ostida — ekranda koʻrinib tursin
    const list = visionUi.scores(el);
    list.set(vision.bestMatch(original).list, name);
    feature.set(original);
    await ui.say("elder", `Mana toza rasm: robot uni ${name} deb tanidi — 36 tadan 36 ta mos.`);
    ui.bubble("elder", "Endi rasmni bir katak oʻngga suramiz. «Sur»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Sur ▶︎", () => { ui.clearControl(); done(); }, "big"));
    });
    const moved = vision.shift(original, 1, 0);
    board.set(moved);
    board.flash();
    const best = vision.bestMatch(moved);
    list.set(best.list, best.name);
    feature.set(moved);
    sound.play("retry");
    await ui.say("elder", `Koʻzga deyarli bir xil, lekin mosliklar tushib ketdi: eng yaxshisi ${best.score} ta.`);
    await ui.say("elder", "Robot uchun surilgan rasm — butunlay boshqa sonlar.");
    await ui.say("elder", `Endi belgiga qaraymiz: boʻyalgan kataklar ${vision.filled(original)} ta edi, endi ${vision.filled(moved)} ta — deyarli oʻzgarmadi.`);
    el.append(common.answerLine(`Belgi boʻyicha javob: ${vision.byFeature(moved)}`));
    sound.play("correct");
    await ui.say("elder", "Belgi — rasmdagi muhim xususiyat. U surilganda ham saqlanadi.");
  }

  // 6.4: mashq — qaysi usul to'g'ri javob beradi?
  function methodTask(task) {
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(task.image);
    el.append(common.line(`Haqiqiy shakl: ${task.truth} · rasm ${task.changed}`));
    ui.bubble("elder", "Qaysi usul toʻgʻri javob beradi?");
    const options = ["Shablon (piksel)", "Belgi (kataklar soni)"];
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        options.forEach((label, i) => row.append(ui.button(label, () => submit(i), i ? "secondary" : "")));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (index) => (index === 0 ? "shablon" : "belgi") === task.answer,
      hint: () => {
        const best = vision.bestMatch(task.image);
        el.append(common.line(`Shablon: ${best.name} · Belgi: ${vision.byFeature(task.image)}`));
        ui.bubble("elder", "↻ Ikkala usul natijasini ochdim. Qaysi biri haqiqiy shaklga toʻgʻri keldi?");
      },
      solution: () => {
        el.append(common.answerLine(task.answer === "belgi"
          ? "Belgi toʻgʻri: kataklar soni surilganda oʻzgarmaydi"
          : "Shablon toʻgʻri: piksellar deyarli oʻzgarmagan"));
      },
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
    await shiftDemo();
    await ui.say("elder", "Endi oʻzing ayt: qaysi usul ishlaydi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => vision.makeMethodTask(prev),
      run: methodTask,
      praise: (task) => (task.answer === "belgi" ? "Belgi surilishga chidamli." : "Piksellar saqlangan — shablon yetarli."),
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
