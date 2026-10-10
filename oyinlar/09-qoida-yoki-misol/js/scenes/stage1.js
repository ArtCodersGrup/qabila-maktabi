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
    await ui.say("elder", "Maqsad: qachon dasturga qoida yoziladi va qachon mashina misollardan oʻrganishi kerakligini ajratish.");
    await ui.say("elder", "Vazifa — mevalarni HA va YOʻQ ga ajratish. Avval qoida yozamiz: agar belgi > son boʻlsa — HA.");
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
          ? `↻ ${errors} ta xato. Belgilangan narsalar notoʻgʻri ajratildi.`
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
    await ui.say("elder", "Bu — qoidaga asoslangan dastur: shart aniq yozilgan, kompyuter uni aynan bajaradi.");
    await ui.say("elder", "Qoida maʼlumotga toʻgʻri kelsa, dastur adashmaydi.");
  }

  // 4.4: mashq — qoidani o'zi topadi
  function ruleTask(task) {
    const { view, badge, builder } = common.ruleScreen(task.items);
    ui.bubble("elder", "Narsalarni xatosiz ajratadigan qoidani yasa va «Ishga tushir»ni bos.");
    return practice.tries({
      setup: (submit) => {
        ui.control().append(ui.button("Ishga tushir", () => {
          const errors = view.run(builder.get());
          badge.set(errors);
          submit(errors);
        }, "big"));
      },
      check: (errors) => errors === 0,
      // Maslahat javobni (kerakli belgini) aytmaydi — asbobni ko'rsatadi: belgilangan narsalar va ularning sonlari
      hint: () => ui.bubble("elder", "↻ Belgilangan narsalar notoʻgʻri ajratildi. HA larning sonlariga qara: qaysi belgi boʻyicha ular bir tomonda turadi?"),
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
    await guidedRule(first, "Qoida uch qismdan iborat: belgi, taqqoslash, son. Tugmalar bilan sozla va «Ishga tushir»ni bos.");
    const second = rules.makeRuleTask(first);
    await guidedRule(second, "Yangi toʻplam — boshqa belgi kerak boʻlishi mumkin.");
    await explain();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta toʻplam — har biriga xatosiz qoida.`);
    await practice.exercises({
      next: (prev, correct, tier) => rules.makeRuleTask(prev, null, tier),
      run: ruleTask,
      praise: (task) => `Qoida: ${rules.FEATURE_NAMES[task.answer.feature]} ${task.answer.op} ${task.answer.value}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
