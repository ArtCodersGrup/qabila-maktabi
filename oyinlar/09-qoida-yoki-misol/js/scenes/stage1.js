// Kirish va 1-bosqich: qoida yozamiz (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { rules, ui, sound, art, rulesUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robotga ish buyuramiz: mevalarni ajratsin.");
    await ui.say("apprentice", "Unga qanday tushuntiramiz?");
    await ui.say("elder", "Ikki yoʻl bor: qoida yozamiz yoki misol koʻrsatamiz. Avval qoidani sinaymiz.");
  }

  // 4.1–4.2: qoidani qo'lda yasash (xato 0 boʻlguncha, xato hisoblanmaydi)
  async function guidedRule(task, lead) {
    const { view, badge, builder } = common.ruleScreen(task.items);
    ui.bubble("elder", lead);
    let tries = 0;
    await ui.settle((done) => {
      ui.control().append(ui.button("Ishga tushir", () => {
        const errors = view.run(builder.get());
        badge.set(errors);
        if (errors === 0) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          ui.clearControl();
          done();
          return;
        }
        sound.play("retry");
        tries++;
        ui.bubble("elder", tries === 1
          ? `↻ ${errors} ta xato. Belgilangan narsalarga qara: qoida ularni notoʻgʻri ajratdi.`
          : `↻ Belgini yoki sonni oʻzgartirib koʻr. Kerakli belgi — ${rules.FEATURE_NAMES[task.answer.feature]}.`);
      }, "big"));
    });
    await ui.say("elder", `✓ Qoida topildi: agar ${rules.FEATURE_NAMES[task.answer.feature]} ${task.answer.op} ${task.answer.value} boʻlsa — HA.`);
  }

  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Biz robotga qoida yozdik. U qoidani soʻzsiz bajaradi — bu oddiy dastur.");
    await ui.say("elder", "Qoida aniq boʻlsa, robot hech qachon adashmaydi.");
  }

  // 4.4: mashq — qoidani o'zi topadi
  function ruleTask(task) {
    const { view, badge, builder } = common.ruleScreen(task.items);
    ui.bubble("elder", "Shu narsalarni ajratadigan qoidani top. Keyin «Ishga tushir»ni bos.");
    return practice.tries({
      setup: (submit) => {
        ui.control().append(ui.button("Ishga tushir", () => {
          const errors = view.run(builder.get());
          badge.set(errors);
          submit(errors);
        }, "big"));
      },
      check: (errors) => errors === 0,
      hint: () => ui.bubble("elder", `↻ Belgilangan narsalar notoʻgʻri ajratildi. «${rules.FEATURE_NAMES[task.answer.feature]}» belgisini sinab koʻr.`),
      solution: () => {
        builder.set(task.answer);
        view.run(task.answer);
        badge.set(0);
        view.el.parentNode.append(common.answerLine(
          `Agar ${rules.FEATURE_NAMES[task.answer.feature]} ${task.answer.op} ${task.answer.value} boʻlsa — HA`));
      },
    });
  }

  async function stage1() {
    const first = rules.makeRuleTask(null);
    await guidedRule(first, "Qoidani yasa: uchta tugmani bosib oʻzgartir, keyin «Ishga tushir».");
    const second = rules.makeRuleTask(first);
    await guidedRule(second, "Yana bitta ish. Bu safar boshqa qoida kerak boʻlishi mumkin.");
    await explain();
    await ui.say("elder", "Endi oʻzing qoida yoz. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev) => rules.makeRuleTask(prev),
      run: ruleTask,
      praise: (task) => `Qoida: ${rules.FEATURE_NAMES[task.answer.feature]} ${task.answer.op} ${task.answer.value}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
