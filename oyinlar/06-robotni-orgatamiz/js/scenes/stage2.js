// 2-bosqich: chegara chizig'i — model va o'qitish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, learnUi, practice, common } = QK;

  // 5.1–5.2: bola chiziqni o'zi sozlaydi
  async function drawLine() {
    const task = learn.makeLineTask(null);
    const { box, f } = common.board();
    const badge = learnUi.errorBadge(box);
    f.set({ points: task.points, line: task.start });
    badge.set(learn.errorsOf(task.points, task.start));
    await ui.say("elder", "Har safar hamma misolni koʻrib chiqish — sekin. Yaxshisi, chegara chizamiz.");
    ui.bubble("elder", "Chiziqni sur va bur: toʻlalar tepada, boʻshlar pastda qolsin!");
    await ui.settle((done) => {
      common.lineEditor({
        f,
        points: task.points,
        start: task.start,
        badge,
        onMove: (line) => {
          if (learn.errorsOf(task.points, line) !== 0) return;
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          ui.clearControl();
          done();
        },
      });
    });
    await ui.say("elder", "Xato 0! Bu chiziq — robotning modeli.");
    await ui.say("elder", "Endi robot har bir yongʻoqni chiziq bilan taqqoslaydi — tez va oson.");
  }

  // 5.3: robot o'zi o'rganadi
  async function robotTrains() {
    const task = learn.makeLineTask(null);
    const { box, f } = common.board();
    const badge = learnUi.errorBadge(box);
    f.set({ points: task.points, line: task.start });
    badge.set(learn.errorsOf(task.points, task.start));
    await ui.say("elder", "Yangi misollar. Endi chiziqni robot oʻzi topadi.");
    ui.bubble("elder", "«Oʻrgat»ni bos va qara: u har xatodan keyin chiziqni biroz suradi.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Oʻrgat", () => { ui.clearControl(); done(); }, "big"));
    });
    await common.trainAnimation(f, task.points, task.start, badge);
    await ui.say("elder", "Xato 0! Chiziqni qadamba-qadam tuzatish — bu oʻqitish.");
  }

  // 5.4: mashq — chiziqni 0 xatoga keltirish
  function lineTask(task) {
    const { box, f } = common.board();
    const badge = learnUi.errorBadge(box);
    ui.bubble("elder", "Chiziqni sozla: xato 0 boʻlsin, keyin «Tayyor»ni bos.");
    let editor = null;
    return practice.tries({
      setup: (submit) => {
        editor = common.lineEditor({
          f,
          points: task.points,
          start: task.start,
          badge,
          extra: ui.button("Tayyor", () => submit(editor.get())),
        });
      },
      check: (line) => learn.errorsOf(task.points, line) === 0,
      hint: (line) => {
        f.set({ glow: learn.wrongOnes(task.points, line) });
        ui.bubble("elder", `↻ ${learn.errorsOf(task.points, line)} ta misol notoʻgʻri tomonda — ular belgilandi.`);
      },
      solution: () => {
        const fitted = learn.fit(task.points, task.start);
        f.set({ line: fitted, glow: [] });
        badge.set(0);
        box.append(common.answerLine("Robot shunday chizdi — xato 0"));
      },
    });
  }

  async function stage2() {
    await drawLine();
    await robotTrains();
    await ui.say("elder", "Endi oʻzing chiz! 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev) => learn.makeLineTask(prev),
      run: lineTask,
      praise: () => "Xato 0 — model tayyor.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
