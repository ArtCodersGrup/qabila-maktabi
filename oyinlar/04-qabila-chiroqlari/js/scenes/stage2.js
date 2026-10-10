// 2-bosqich: ikkilik sonlar (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, sound, lampsUi, practice } = QK;

  // 6.1: 4-2-1 qiymatlari va "5 ni yasa"
  async function makeFive() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    let row = null;
    let reached = null;
    const five = new Promise((resolve) => { reached = resolve; });
    row = lampsUi.lampRow(box, {
      count: 3,
      states: lamps.PLAIN,
      values: lamps.placeValues(3),
      bits: true,
      sum: true,
      onChange: (p) => {
        if (lamps.toNumber(p) !== 5) return;
        row.lock();
        reached();
      },
    });
    await ui.say("elder", "Endi chiroqlar bilan son yuboramiz.");
    ui.bubble("elder", "Har chiroqning oʻz vazni bor: 4, 2, 1. Yoniq chiroqlar vazni yigʻindisi 5 boʻlsin.");
    await ui.settle((done) => { five.then(done); });
    sound.play("correct");
    await ui.say("elder", "4 + 1 = 5.");
  }

  // 6.3: ta'rif
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    const row = lampsUi.lampRow(box, { count: 3, states: lamps.PLAIN, values: lamps.placeValues(3), bits: true });
    row.set([1, 0, 1]);
    row.lock();
    await ui.say("elder", "Yoniq — 1, oʻchiq — 0. Shunda 5 = 101₂ — bu ikkilik son, har raqami bitta bit.");
    await ui.say("elder", "Vaznlar oʻngdan: 1, 2, 4, 8, … — har biri oldingisidan 2 marta katta.");
  }

  // 6.4: naqsh → son yoki son → naqsh
  function binaryTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const pattern = lamps.fromNumber(task.value, task.lamps);
    const values = lamps.placeValues(task.lamps);
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    if (task.type === "toNumber") {
      ui.bubble("elder", "Bu ikkilik son oʻnlikda nechaga teng?");
      const shown = lampsUi.lampRow(box, { count: task.lamps, states: lamps.PLAIN, values, bits: true });
      shown.set(pattern);
      shown.lock();
      const note = ui.h("div", { class: "lamp-sum" });
      box.append(note);
      return practice.numberTries({ maxLen: 2,
        answer: task.value,
        hint: () => {
          note.textContent = `${lamps.sumText(pattern)} = ?`;
          ui.bubble("elder", `↻ Yoniq chiroqlar vaznini qoʻsh: ${lamps.sumText(pattern)} = ?`);
        },
        solution: () => {
          note.textContent = `${lamps.sumText(pattern)} = ${task.value}`;
          note.scrollIntoView({ block: "nearest" });
        },
      });
    }
    ui.bubble("elder", `${task.value} ni ikkilikda yoz: yoniq chiroqlar vazni yigʻindisi ${task.value} boʻlsin.`);
    const row = lampsUi.lampRow(box, { count: task.lamps, states: lamps.PLAIN, values, bits: true, sum: true });
    return practice.tries({
      setup: (submit) => ui.control().append(ui.button("Yuborish", () => submit(row.get()))),
      check: (p) => {
        const ok = lamps.toNumber(p) === task.value;
        if (ok) row.lock();
        return ok;
      },
      hint: () => {
        row.shake();
        ui.bubble("elder", `↻ ${task.value} kerak. Eng katta vazndan boshla: sigʻsa — yoq, keyin qolganiga qara.`);
      },
      solution: () => {
        row.set(pattern);
        row.lock();
      },
    });
  }

  async function stage2() {
    await makeFive();
    await explain();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta son — ikkilikdan oʻnlikka va teskari.`);
    await ui.say("elder", "Bitlar soni oʻsadi: 3 ta, keyin 4 ta (8, 4, 2, 1), oxirida 5 ta — 16 vaznli bit qoʻshiladi.");
    await practice.exercises({
      next: (prev, correct, tier) => lamps.makeBinaryTask(correct, prev, null, tier),
      run: binaryTask,
      praise: (t) => `${lamps.patternKey(lamps.fromNumber(t.value, t.lamps))}₂ = ${t.value}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
