// Kirish va 1-bosqich: n-lik tizimda qo'shish (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, sayyora, ui, sound, art, sanoqUi, practice, common } = QK;
  const S = sanoq;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.planets() }));
    await ui.say("elder", "Uzoq sayyoralardan xabar keldi!");
    await ui.say("apprentice", "Ular ham bizdek sanaydimi?");
    await ui.say("elder", "Barmoqlari boshqa — tizimi ham boshqa. Lekin qoidalar bir xil. Koʻramiz!");
  }

  // 4.1: 5-lik cho'tda 4 + 1
  async function chotiDemo() {
    const el = common.box(true);
    const abacus = sanoqUi.choti(el, { base: 5, rods: 3, value: 4, places: true });
    const line = common.line(`Son: ${S.fmt("4", 5)}`);
    el.append(line);
    ui.bubble("elder", "Besh barmoqli sayyora: har simda 4 tagacha. «+1» ni bos!");
    await ui.settle((done) => {
      let busy = false;
      ui.control().append(ui.button("+1", async () => {
        if (busy) return;
        busy = true;
        await abacus.inc();
        line.textContent = `Son: ${S.fmt("10", 5)}`;
        ui.clearControl();
        done();
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", "4 + 1 = 10₅: 5 ta boʻldi — keyingi xonaga! Bu sayyorada «10» — besh degani.");
  }

  async function rule() {
    const el = common.box(false);
    common.formula(el, ["yigʻindi < n → shuni yoz", "yigʻindi ≥ n → yigʻindi − n ni yoz, 1 koʻchir"]);
    await ui.say("elder", "Umumiy qoida — har qanday n-lik tizimda.");
    await ui.say("elder", "2-likda n = 2, 16-likda n = 16 — qoida bitta!");
  }

  // Ustunda bosqichma-bosqich (qo'shish, ayirish yoki ko'paytirish)
  async function guided(a, b, op, base, steps, first) {
    const el = common.box(true);
    const board = sanoqUi.ustun(el, { a, b, op, base });
    await ui.say("elder", first);
    await sanoqUi.guide(board, steps, base);
  }

  function showCarries(board, task) {
    S.addColumns(task.a, task.b, task.base).cols.forEach((c, i) => { if (c.carryOut) board.setCarry(i + 1, "1"); });
  }

  // 4.4: mashq — n-likda qo'shish
  function addTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "planet-tag", text: `${task.base}-lik sayyora` }));
    const board = sanoqUi.ustun(el, { a: task.a, b: task.b, op: "+", base: task.base, width: 4 });
    ui.bubble("elder", "Qoʻsh! Javobni shu sayyora tizimida yoz.");
    const x = S.fromBase(task.a, task.base);
    const y = S.fromBase(task.b, task.base);
    return sanoqUi.digitTries({
      answer: task.answer,
      base: task.base,
      maxLen: 4,
      hint: () => {
        showCarries(board, task);
        ui.bubble("elder", `↻ Koʻchishlarni yozdim: yigʻindi ${task.base} dan oshsa — ${task.base} ni ayir.`);
      },
      solution: () => {
        showCarries(board, task);
        board.setResultAll(task.answer);
        common.add(el, common.answerLine(`Tekshiramiz: ${x} + ${y} = ${x + y} ✓`));
      },
    });
  }

  async function stage1() {
    await chotiDemo();
    await rule();
    await guided("34", "13", "+", 5, S.stepsAdd("34", "13", 5), "Ustunda qoʻshamiz: 34₅ + 13₅. Oʻngdan boshlaymiz!");
    await ui.say("elder", "34₅ + 13₅ = 102₅. Tekshiramiz: 19 + 8 = 27 = 25 + 2 ✓");
    await ui.say("elder", "Endi oʻzing: turli sayyoralarda qoʻsh. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => sayyora.makeAddTask(prev),
      run: addTask,
      praise: (task) => `${S.fmt(task.a, task.base)} + ${S.fmt(task.b, task.base)} = ${S.fmt(task.answer, task.base)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
  QK.sayyoraScenes = { guided };
})(window);
