// 2-bosqich: qoida ishlamaydigan ish va misollardan o'rganish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { rules, ui, sound, rulesUi, practice, common } = QK;

  // 5.1–5.2: bola qoida topmoqchi bo'ladi, keyin robot hamma qoidani sinaydi
  async function fuzzyTry(task) {
    const { el, view, badge, builder } = common.ruleScreen(task.items);
    await ui.say("elder", "Yangi ish. Bu safar narsalar chalkashroq — qoidani topa olasanmi?");
    ui.bubble("elder", "Qoidani yasab, «Ishga tushir»ni bos.");
    let tries = 0;
    await ui.settle((done) => {
      ui.control().append(ui.h("div", { class: "choice-row" },
        ui.button("Ishga tushir", () => {
          const errors = view.run(builder.get());
          badge.set(errors);
          sound.play(errors === 0 ? "correct" : "retry");
          tries++;
          ui.bubble("elder", tries < 2
            ? `↻ ${errors} ta xato. Boshqa qoidani sinab koʻr.`
            : "Qiyin, toʻgʻrimi? Robot hamma qoidani oʻzi sinab koʻrsin.");
        }, "big"),
        ui.button("Hamma qoidani sina", () => { ui.clearControl(); done(); }, "secondary")));
    });
    // Robot barcha qoidalarni sinaydi
    ui.bubble("elder", "Robot barcha qoidalarni birma-bir sinayapti…");
    const all = rules.allRules();
    let best = null;
    for (let i = 0; i < all.length; i += 2) {
      const rule = all[i];
      builder.set(rule);
      const errors = view.run(rule);
      badge.set(errors);
      if (!best || errors < best.errors) best = { rule, errors };
      sound.play("tap");
      await ui.sleep(90);
    }
    const found = rules.bestRule(task.items);
    builder.set(found.rule);
    view.run(found.rule);
    badge.set(found.errors);
    sound.play("retry");
    el.append(common.line(`Eng yaxshi qoida ham ${found.errors} ta xato qiladi`));
    await ui.say("elder", `Hamma qoida sinaldi. Eng yaxshisi ham ${found.errors} ta xato qiladi — qoida bu yerda yetmaydi.`);
    return el;
  }

  // 5.3: misollar bilan o'rgatish
  async function withExamples(task) {
    const el = common.box(true);
    el.append(common.line("Robotga koʻrsatilgan misollar:"));
    rulesUi.board(el, task.examples, { truth: true, small: true });
    el.append(common.line("Sinov narsalari:"));
    const view = rulesUi.board(el, task.items, { truth: true });
    const badge = rulesUi.errorBadge(el);
    await ui.say("elder", "Unda boshqacha qilamiz: robotga 6 ta misol koʻrsatamiz.");
    ui.bubble("elder", "«Misollarga qarab ishlasin»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Misollarga qarab ishlasin", () => { ui.clearControl(); done(); }, "big"));
    });
    const errors = view.runExamples(task.examples);
    badge.set(errors);
    sound.play("correct");
    await ui.say("elder", "Xato 0! Robot har bir narsani eng oʻxshash misolga qarab ajratdi.");
    await ui.say("elder", "Qoida yozib boʻlmasa — misol koʻrsatamiz. Buni mashinali oʻrganish deyishadi.");
  }

  // 5.5: mashq — "Qaysi qoida shu narsalarni xatosiz ajratadi?" 3 ta qoida + "hech qaysi — misol kerak" (4 variant).
  // Bola har qoidani narsalarga qo'yib tekshiradi; "qoida / misol" deb taxmin qilib o'tib bo'lmaydi.
  function setKindTask(task) {
    const el = common.box(true);
    const view = rulesUi.board(el, task.items, { truth: true });
    const badge = rulesUi.errorBadge(el);
    ui.bubble("elder", "Qaysi qoida shu narsalarni xatosiz ajratadi? Hech biri boʻlmasa — misol kerak.");
    const labels = task.options.map((o) => (o.kind === "rule" ? common.ruleText(o.rule) : "Hech qaysi qoida — misol kerak"));
    return practice.tries({
      setup: (submit) => rulesUi.choiceList(labels, submit),
      check: (index) => index === task.answerIndex,
      hint: (index) => {
        const picked = task.options[index];
        if (picked.kind === "rule") {
          // Asbob: tanlangan qoida ishga tushiriladi — qayerda adashgani ko'rinadi, to'g'ri javob aytilmaydi
          badge.set(view.run(picked.rule));
          ui.bubble("elder", "↻ Shu qoidani ishga tushirdim: belgilangan narsalarda u adashdi. Qolganlarini oʻzing tekshir.");
        } else {
          ui.bubble("elder", "↻ Shoshma: har qoidani narsalarga qoʻyib koʻr. HA lar bir tomonda, YOʻQ lar boshqa tomonda qoladimi?");
        }
      },
      solution: () => {
        const best = rules.bestRule(task.items);
        const right = task.answer === "qoida" ? task.options[task.answerIndex].rule : best.rule;
        badge.set(view.run(right));
        el.append(common.answerLine(task.answer === "qoida"
          ? `Qoida yetadi: ${common.ruleText(right)}`
          : `Qoida yetmaydi: eng yaxshisi ham ${best.errors} ta xato qiladi`));
      },
    });
  }

  async function stage2() {
    const task = rules.makeFuzzyTask();
    await fuzzyTry(task);
    await withExamples(task);
    await ui.say("elder", `Endi oʻzing tekshir: qaysi qoida yetadi yoki misol kerakmi? ${QK.practice.need()} ta toʻgʻri javob!`);
    await practice.exercises({
      next: (prev, correct, tier) => rules.makeSetKindTask(correct, prev, null, tier),
      run: setKindTask,
      praise: (task) => (task.answer === "qoida" ? "Aniq chegara bor — qoida yetadi." : "Chalkash — misol kerak."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
