// 2-bosqich: ikkilik sonlar (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, sound, lampsUi, common } = QK;

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
    await ui.say("elder", "Chiroqlar bilan son ham yuborsa boʻladi!");
    ui.bubble("elder", "Har bir chiroqning oʻz qiymati bor. 5 ni yasa: yoniq chiroqlar qiymati 5 boʻlsin.");
    await ui.settle((done) => { five.then(done); });
    sound.play("correct");
    await ui.say("elder", "Toʻgʻri: 4 + 1 = 5!");
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
    await ui.say("elder", "Yoniq — 1, oʻchiq — 0. Kompyuter 5 ni 101 deb yozadi — bu ikkilik son.");
    await ui.say("elder", "Esingdami, «Mehmon» naqshi? U ham 101, yaʼni 5!");
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
      ui.bubble("elder", "Qoʻshni qabila son yubordi. Qaysi son?");
      const shown = lampsUi.lampRow(box, { count: task.lamps, states: lamps.PLAIN, values, bits: true });
      shown.set(pattern);
      shown.lock();
      const note = ui.h("div", { class: "lamp-sum" });
      box.append(note);
      return common.numberTries({
        answer: task.value,
        hint: () => {
          note.textContent = `${lamps.sumText(pattern)} = ?`;
          ui.bubble("elder", `↻ Yoniq chiroqlar qiymatini qoʻsh: ${lamps.sumText(pattern)} = ?`);
        },
        solution: () => {
          note.textContent = `${lamps.sumText(pattern)} = ${task.value}`;
          note.scrollIntoView({ block: "nearest" });
        },
      });
    }
    ui.bubble("elder", `${task.value} ni yubor: yoniq chiroqlar qiymati ${task.value} boʻlsin.`);
    const row = lampsUi.lampRow(box, { count: task.lamps, states: lamps.PLAIN, values, bits: true, sum: true });
    return common.tries({
      setup: (submit) => ui.control().append(ui.button("Yuborish", () => submit(row.get()))),
      check: (p) => {
        const ok = lamps.toNumber(p) === task.value;
        if (ok) row.lock();
        return ok;
      },
      hint: () => {
        row.shake();
        ui.bubble("elder", `↻ ${task.value} kerak. Eng katta qiymatli chiroqdan boshla.`);
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
    await ui.say("elder", "Endi oʻzing! Oxirgi misolda chiroqlar 4 ta boʻladi: 8, 4, 2, 1.");
    await common.exercises({
      next: (prev, correct) => lamps.makeBinaryTask(correct, prev),
      run: binaryTask,
      praise: (t) => `${lamps.patternKey(lamps.fromNumber(t.value, t.lamps))} — bu ${t.value}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
