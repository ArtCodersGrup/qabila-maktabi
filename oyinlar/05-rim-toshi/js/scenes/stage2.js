// 2-bosqich: Rimliklar usulida qo'shish, ayirish namoyishi, aylantirib hisoblash (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound, romanUi, practice, common } = QK;

  // Ayirish namoyishi: har qadamda lagan holati va nima olish kerakligi
  const MINUS_STEPS = [
    { tray: "XV", left: "VII", line: "Endi ayirish: XV − VII. Lagandan V, I, I ni olish kerak." },
    { tray: "X", left: "II", line: "V ni olib tashladik. Endi I, I kerak — lekin laganda I yoʻq!" },
    { tray: "VV", left: "II", line: "Rimliklar X ni ikkita V ga «sindirgan»." },
    { tray: "VIIIII", left: "II", line: "Bitta V ni esa beshta I ga sindirgan." },
    { tray: "VIII", left: "", line: "Mana, ikkita I ni ham olib tashladik. Laganda VIII qoldi." },
  ];

  // Qoida tugmasi: qo'llansa — lagan yangilanadi; qo'llanmasa — "yetarli emas"
  function applyOn(tray, rule) {
    const next = roman.applyRule(tray.get(), rule);
    if (!next) {
      sound.play("retry");
      ui.toast("Bunday belgilar yetarli emas.");
      return false;
    }
    sound.play("tap");
    tray.set(next, rule.to);
    return true;
  }

  // 5.1: XII + VIII — bola laganni o'zi tartibga soladi
  async function tidyDemo() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" }, common.expr("XII", "+", "VIII"));
    ui.work().append(box);
    const tray = romanUi.tray(box);
    await ui.say("elder", "Rimliklar qanday qoʻshgan? Ikki sonning belgilarini bitta laganga toʻplagan.");
    tray.set(roman.merge("XII", "VIII"), "*");
    await ui.say("elder", "Mana: X V I I I I I. Belgilar koʻp — ularni tartibga solish kerak.");
    ui.bubble("elder", "Beshta I — bitta V ga teng. Yonib turgan qoidani bos!");
    await ui.settle((done) => {
      const rules = romanUi.ruleButtons((rule) => {
        if (!applyOn(tray, rule)) return;
        if (roman.canTidy(tray.get())) {
          rules.highlight(tray.get());
          ui.bubble("elder", "Zoʻr! Yana tartibga solsa boʻladi.");
          return;
        }
        ui.clearControl();
        done();
      });
      rules.highlight(tray.get());
    });
    sound.play("correct");
    box.replaceChild(common.expr("XII", "+", "VIII", "XX"), box.firstChild);
    await ui.say("elder", "Tayyor: XII + VIII = XX. Rimliklar shunday qoʻshgan.");
  }

  // 5.2: xuddi shu misol oddiy sonlarda
  async function ordinary() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const line = ui.h("div", { class: "formula-row big", text: "12 + 8 = ?" });
    ui.work().append(ui.h("div", { class: "rbox" }, line));
    ui.bubble("elder", "Endi oʻzimizning sonlarda: 12 + 8 = ?");
    await common.askUntil(20, "12 ga 8 ni qoʻsh.");
    line.textContent = "12 + 8 = 20";
    await ui.say("elder", "Bir zumda! XII = 12, VIII = 8, XX = 20.");
  }

  // 5.3: XV − VII — bola kuzatadi, keyin oddiy sonlarda hisoblaydi
  async function minusDemo() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" }, common.expr("XV", "−", "VII"));
    ui.work().append(box);
    const tray = romanUi.tray(box);
    const left = ui.h("div", { class: "left-line" });
    box.append(left);
    for (const step of MINUS_STEPS) {
      tray.set(step.tray, "*");
      left.textContent = step.left ? `Olish kerak: ${[...step.left].join(" ")}` : "Hammasi olindi ✓";
      await ui.say("elder", step.line);
    }
    box.replaceChild(common.expr("XV", "−", "VII", "VIII"), box.firstChild);
    await ui.say("elder", "XV − VII = VIII, yaʼni 8. Rimliklar buni hisob taxtasida qilgan.");
    ui.clearWork();
    const line = ui.h("div", { class: "formula-row big", text: "15 − 7 = ?" });
    ui.work().append(ui.h("div", { class: "rbox" }, line));
    ui.bubble("elder", "Endi oʻzimizning sonlarda: 15 − 7 = ?");
    await common.askUntil(8, "15 dan 7 ni ayir.");
    line.textContent = "15 − 7 = 8";
    await ui.say("elder", "Oʻzimizning sonlarda hisoblash ancha oson!");
  }

  // 5.4: Rimliklar usulida qo'shish (lagan va qoidalar)
  function tidyTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const a = roman.toRoman(task.a);
    const b = roman.toRoman(task.b);
    const answer = roman.toRoman(task.answer);
    const box = ui.h("div", { class: "rbox" }, common.expr(a, "+", b));
    ui.work().append(box);
    const tray = romanUi.tray(box);
    tray.set(roman.merge(a, b), "*");
    ui.bubble("elder", "Rimliklar usulida qoʻsh: laganni tartibga sol, keyin «Tayyor»ni bos.");
    let rules = null;
    return practice.tries({
      setup: (submit) => {
        rules = romanUi.ruleButtons((rule) => applyOn(tray, rule), ui.button("Tayyor", () => submit(tray.get())));
      },
      check: (value) => !roman.canTidy(value),
      hint: () => {
        tray.shake();
        rules.highlight(tray.get());
        ui.bubble("elder", "↻ Hali tartibga solsa boʻladi. Yonib turgan qoidani bos.");
      },
      solution: () => {
        tray.set(roman.tidy(tray.get()), "*");
        box.append(common.answerLine(`${a} + ${b} = ${answer}`));
      },
    });
  }

  // 5.4: aylantirib hisoblash — javob Rim klaviaturasida
  function arithTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const a = roman.toRoman(task.a);
    const b = roman.toRoman(task.b);
    const plain = `${task.a} ${task.op} ${task.b} = ${task.answer}`;
    const box = ui.h("div", { class: "rbox" }, common.expr(a, task.op, b));
    ui.work().append(box);
    const note = ui.h("div", { class: "formula-row" });
    box.append(note);
    ui.bubble("elder", "Oddiy songa aylantirib hisobla, javobni Rim raqamida yoz.");
    return common.romanAnswer({
      target: task.answer,
      hint: () => {
        note.textContent = plain;
        ui.bubble("elder", `↻ ${a} = ${task.a}, ${b} = ${task.b}. ${plain}`);
      },
      solution: (answer) => {
        note.textContent = plain;
        const line = common.answerLine(`${task.answer} = ${answer}`);
        box.append(line);
        line.scrollIntoView({ block: "nearest" });
      },
    });
  }

  async function stage2() {
    await tidyDemo();
    await ordinary();
    await minusDemo();
    await ui.say("elder", "Endi oʻzing hisobla: goh lagan bilan, goh oddiy sonlarda. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev, correct) => roman.makeCalcTask(correct, prev),
      run: (task) => (task.type === "tidy" ? tidyTask(task) : arithTask(task)),
      praise: (task) => `${roman.toRoman(task.a)} ${task.op} ${roman.toRoman(task.b)} = ${roman.toRoman(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
