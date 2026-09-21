// 2-bosqich: bo'lib-bo'lib, qoldiqlar pastdan yuqoriga (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, qop, ui, sound, qopUi, sanoqUi, practice, common } = QK;
  const S = sanoq;

  // Jadval qatorlarini "Bo'l" bilan ochish, keyin qoldiqlarni pastdan yuqoriga bosish.
  // lines — har qatordan keyingi izoh. Natija — yig'ilgan javob satri
  async function divideAndRead(el, n, base, lines) {
    const table = qopUi.divTable(el, n, base, false);
    const answer = common.line("Javob: …", "ans");
    el.append(answer);
    let row = 0;
    await ui.settle((done) => {
      ui.control().append(ui.button("Boʻl ▶︎", () => {
        const more = table.addRow();
        sound.play("tap");
        ui.bubble("elder", lines[row] || "");
        row++;
        if (!more) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    await ui.say("elder", lines[row - 1]);
    table.arrow();
    ui.bubble("elder", "Endi qoldiqlarni pastdan yuqoriga bos!");
    let digits = "";
    await ui.settle((done) => {
      let expect = table.steps.length - 1;
      table.enable((k) => {
        if (k !== expect) {
          sound.play("retry");
          ui.pose("apprentice", "think", 900);
          ui.bubble("elder", "↻ Pastdan boshla: oxirgi qoldiq — birinchi raqam.");
          return;
        }
        sound.play("tap");
        table.mark(k);
        digits += S.digitChar(table.steps[k].r);
        answer.textContent = `Javob: ${digits}`;
        expect--;
        if (expect < 0) done();
      });
    });
    sound.play("correct");
    answer.textContent = `Javob: ${S.fmt(digits, base)}`;
    return digits;
  }

  async function bags() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: "13 → 2-lik" }));
    ui.bubble("elder", "13 ta olmani 2 tadan qopga joylaymiz. «Boʻl»ni bos!");
    await divideAndRead(el, 13, 2, [
      "13 ta olma → 6 qop, 1 ta ortdi.",
      "6 qop → 3 quti, hech narsa ortmadi.",
      "3 quti → 1 sandiq, 1 ta ortdi.",
      "1 sandiqni juftlab boʻlmaydi: 0, 1 ta ortdi. Tamom!",
    ]);
    await ui.say("elder", "1101₂ — tangalar usulidagi javobning xuddi oʻzi!");
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["asosga boʻl → qoldiqni yoz", "boʻlinmani yana boʻl — 0 chiqquncha", "qoldiqlar — pastdan yuqoriga"]);
    const t = qopUi.divTable(el, 38, 5, true);
    t.arrow();
    el.append(common.answerLine("38 = 123₅"));
    await ui.say("elder", "Bu usul istalgan tizimda ishlaydi. Mana 38 ni 5-likka oʻtkazdik.");
    await ui.say("elder", "Eng koʻp xato — qoldiqlarni yuqoridan oʻqish. Doim pastdan boshla!");
  }

  // Maslahat: birinchi bo'lish qatori
  function firstStep(task) {
    const s = S.divSteps(task.n, task.base)[0];
    return common.line(`${s.n} : ${task.base} = ${s.q}, qoldiq ${qopUi.remText(s.r)} → davom et`);
  }

  function solutionTable(el, task) {
    const t = qopUi.divTable(el, task.n, task.base, true);
    t.arrow();
    common.add(el, common.answerLine(`${task.n} = ${S.fmt(task.answer, task.base)}`));
  }

  // 5.4: mashq — o'nlik → 2–8-lik
  function divTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: `${task.n} → ${task.base}-lik` }));
    ui.bubble("elder", `Bu sonni ${task.base}-likda yoz.`);
    return sanoqUi.digitTries({
      answer: task.answer,
      base: task.base,
      maxLen: 7,
      hint: () => {
        common.add(el, firstStep(task));
        ui.bubble("elder", "↻ Boʻlinmani yana boʻl, qoldiqlarni pastdan oʻqi.");
      },
      solution: () => solutionTable(el, task),
    });
  }

  async function stage2() {
    await bags();
    await definition();
    await ui.say("elder", "Endi oʻzing: boʻlib-boʻlib oʻtkaz. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => qop.makeDivTask(prev),
      run: divTask,
      praise: (task) => `${task.n} = ${S.fmt(task.answer, task.base)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
  QK.qopScenes = { divideAndRead, firstStep, solutionTable };
})(window);
