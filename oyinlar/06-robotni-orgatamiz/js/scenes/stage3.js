// 3-bosqich: sinov, ma'lumot sifati va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, art, learnUi, practice, common } = QK;

  const SCENES = [
    { art: "data", lines: ["Bugungi sunʼiy intellekt ham shunday oʻrganadi.", "Faqat uning misollari millionlab."] },
    { art: "cats", lines: ["Mushukni tanish uchun unga minglab mushuk rasmi koʻrsatiladi."] },
    { art: "biasCats", lines: ["Misollarda faqat oq mushuklar boʻlsa, qora mushukni tanimay qolishi mumkin.", "Maʼlumot qanday boʻlsa — javob shunday."] },
    { art: "human", lines: ["Shuning uchun muhim ishda oxirgi qarorni odam qabul qiladi.", "Mashina yordam beradi, lekin javobgarlik odamda."] },
  ];

  // Sinov nuqtalarini birma-bir tekshirish: ✓ yoki ✗
  async function runTest(f, model, testPoints) {
    const shown = [];
    let wrong = 0;
    for (const p of testPoints) {
      const ok = learn.predict(model, p) === p.full;
      if (!ok) wrong++;
      shown.push(Object.assign({}, p, { mark: ok ? "ok" : "wrong" }));
      f.set({ test: shown.slice() });
      sound.play(ok ? "tap" : "retry");
      await ui.sleep(420);
    }
    return wrong;
  }

  // 6.1–6.3: sinov, xato sababi va tuzatish
  async function testAndFix() {
    const task = learn.makeBiasTask();
    const { box, f } = common.board();
    const note = common.line(" ");
    box.append(note);
    f.set({ points: task.train, line: task.model });
    note.textContent = "Oʻqitish misollari: 6 ta";
    await ui.say("elder", "Robot oʻrgandi. Lekin u haqiqatan bilib oldimi?");
    await ui.say("elder", "Sinaymiz: u hali koʻrmagan yongʻoqlarni beramiz. Bular — sinov maʼlumoti.");
    const wrong = await runTest(f, task.model, task.test);
    note.textContent = `Sinov: ${task.test.length - wrong} toʻgʻri, ${wrong} xato`;
    await ui.say("elder", `${wrong} tasida xato qildi! Nega?`);
    f.set({ glow: learn.wrongOnes(task.test, task.model) });
    await ui.say("elder", "Qara: oʻqitish misollarining hammasi oʻng tomonda edi.");
    await ui.say("elder", "Robot chap tomondagi kichik yongʻoqlarni umuman koʻrmagan.");

    ui.bubble("elder", "Chap tomondan 2 ta yongʻoq chaqamiz va robotga koʻrsatamiz.");
    const holder = ui.h("div", { class: "nut-holder" });
    ui.control().append(holder);
    const points = task.train.slice();
    for (const p of task.extra) {
      holder.innerHTML = "";
      await ui.settle((done) => {
        const card = learnUi.nutCard(holder, p, () => {
          sound.play(p.full ? "correct" : "retry");
          card.reveal(p.full);
          done();
        });
      });
      points.push(p);
      f.set({ points: points.slice(), glow: [p] });
      await ui.sleep(550);
    }
    holder.remove();
    f.set({ glow: [] });
    await ui.say("elder", "Endi robot qaytadan oʻrganadi.");
    const model2 = await common.trainAnimation(f, points, learn.START, null);
    const wrong2 = await runTest(f, model2, task.test);
    note.textContent = `Sinov: ${task.test.length - wrong2} toʻgʻri, ${wrong2} xato`;
    await ui.say("elder", "Hammasi toʻgʻri! Yangi misollar robotni tuzatdi.");
    await ui.say("elder", "Maʼlumot qanday boʻlsa, robot shunday oʻylaydi.");
  }

  // 6.4: "Robot qaysi yong'oqda adashadi?" — chaqilgan sinov yong'oqlaridan bittasi chiziqning noto'g'ri tomonida
  function mistakeTask(task) {
    const { box, f } = common.board();
    f.set({ points: [], line: task.line, test: task.test });
    box.append(common.line("Kvadratlar — chaqilgan yongʻoqlar: yashil — toʻla, oq — boʻsh"));
    ui.bubble("elder", "Chiziqdan yuqorisini robot «toʻla» deydi. U qaysi yongʻoqda adashadi? Oʻshani bos.");
    return practice.tries({
      setup: (submit) => f.set({ onPick: (index, kind) => { if (kind === "test") { sound.play("tap"); submit(index); } } }),
      check: (index) => index === task.answer,
      hint: (index) => {
        // Asbob: bola bosgan yong'oq tekshirildi — u o'z joyida; qolganlarini o'zi tekshiradi
        f.set({ test: task.test.map((p, i) => (i === index ? Object.assign({}, p, { mark: "ok" }) : p)) });
        ui.bubble("elder", "↻ Bu yongʻoq oʻz tomonida turibdi. Yuqorida — toʻlalar, pastda — boʻshlar boʻlishi kerak.");
      },
      solution: () => {
        const wrong = task.test[task.answer];
        f.set({
          onPick: null,
          glow: [wrong],
          test: task.test.map((p, i) => Object.assign({}, p, { mark: i === task.answer ? "wrong" : "ok" })),
        });
        box.append(common.answerLine(wrong.full
          ? "Bu yongʻoq toʻla, lekin chiziqdan pastda — robot «boʻsh» deydi"
          : "Bu yongʻoq boʻsh, lekin chiziqdan yuqorida — robot «toʻla» deydi"));
      },
    });
  }

  // 6.4: "Robot qaysi yong'oqdan ko'p narsa o'rganadi?"
  function usefulTask(task) {
    const { box, f } = common.board();
    f.set({ points: task.points, options: task.options });
    ui.bubble("elder", "Robot qaysi yongʻoqdan koʻproq narsa oʻrganadi?");
    box.append(common.line("Misollar — doiralar, variantlar — shakllar"));
    return practice.tries({
      setup: (submit) => learnUi.optionButtons(task.options.length, submit),
      check: (value) => value === task.answer,
      hint: () => {
        f.set({ glow: task.points });
        ui.bubble("elder", "↻ Robot shu joylarni koʻrgan. Qaysi shakl ulardan eng uzoqda?");
      },
      solution: () => {
        f.set({ glow: [task.options[task.answer]] });
        box.append(common.answerLine("Robot shu joyda hali misol koʻrmagan"));
      },
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await testAndFix();
    await ui.say("elder", `Endi oʻzing javob ber. ${QK.practice.need()} ta toʻgʻri javob kerak!`);
    await practice.exercises({
      next: (prev, correct, tier) => learn.makeStage3Task(correct, prev, null, tier),
      run: (task) => (task.type === "mistake" ? mistakeTask(task) : usefulTask(task)),
      praise: (task) => (task.type === "mistake"
        ? "Robot aynan shu yongʻoqda adashadi."
        : "Robot u yerda misol koʻrmagan edi."),
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
