// 2-bosqich: Rimliklar usulida qo'shish, ayirish namoyishi, aylantirib hisoblash (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound, romanUi, practice, common } = QK;

  // Ayirish namoyishi: har qadamda lagan holati va nima olish kerakligi
  const MINUS_STEPS = [
    { tray: "XV", left: "VII", line: "Ayirish: XV − VII. Lagandan V, I, I ni olish kerak." },
    { tray: "X", left: "II", line: "V olindi. Endi I, I kerak, lekin laganda I yoʻq." },
    { tray: "VV", left: "II", line: "Shuning uchun X maydalanadi: X = VV." },
    { tray: "VIIIII", left: "II", line: "Bitta V ham maydalanadi: V = IIIII." },
    { tray: "VIII", left: "", line: "Ikkita I olindi. Laganda VIII qoldi." },
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
    await ui.say("elder", "Rimcha qoʻshish: ikki sonning barcha belgilari bitta laganga yigʻiladi.");
    tray.set(roman.merge("XII", "VIII"), "*");
    await ui.say("elder", "Natija: X V I I I I I. Endi uni standart yozuvga keltirish kerak.");
    ui.bubble("elder", "IIIII = V. Yonib turgan qoidani bos.");
    await ui.settle((done) => {
      const rules = romanUi.ruleButtons((rule) => {
        if (!applyOn(tray, rule)) return;
        if (roman.canTidy(tray.get())) {
          rules.highlight(tray.get());
          ui.bubble("elder", "Yana bitta qoida qoʻllanadi.");
          return;
        }
        ui.clearControl();
        done();
      });
      rules.highlight(tray.get());
    });
    sound.play("correct");
    box.replaceChild(common.expr("XII", "+", "VIII", "XX"), box.firstChild);
    await ui.say("elder", "XII + VIII = XX. Rimcha qoʻshish: belgilarni yigʻib, qoidalar bilan ixchamlash.");
  }

  // 5.2: xuddi shu misol oddiy sonlarda
  async function ordinary() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const line = ui.h("div", { class: "formula-row big", text: "12 + 8 = ?" });
    ui.work().append(ui.h("div", { class: "rbox" }, line));
    ui.bubble("elder", "Xuddi shu misol oʻnlik tizimda: 12 + 8 = ?");
    await common.askUntil(20, "12 ga 8 ni qoʻsh.");
    line.textContent = "12 + 8 = 20";
    await ui.say("elder", "Oʻnlikda bir qadam: XII = 12, VIII = 8, XX = 20.");
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
    await ui.say("elder", "XV − VII = VIII. Amalda rimliklar buni hisob taxtasida (abakda) bajargan.");
    ui.clearWork();
    const line = ui.h("div", { class: "formula-row big", text: "15 − 7 = ?" });
    ui.work().append(ui.h("div", { class: "rbox" }, line));
    ui.bubble("elder", "Oʻnlik tizimda: 15 − 7 = ?");
    await common.askUntil(8, "15 dan 7 ni ayir.");
    line.textContent = "15 − 7 = 8";
    await ui.say("elder", "Pozitsion tizimda hisob qisqa: ustun bilan, xonama-xona.");
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
    ui.bubble("elder", "Rimcha qoʻsh: belgilarni qoidalar bilan ixchamla, keyin «Tayyor»ni bos.");
    let rules = null;
    return practice.tries({
      setup: (submit) => {
        rules = romanUi.ruleButtons((rule) => applyOn(tray, rule), ui.button("Tayyor", () => submit(tray.get())));
      },
      check: (value) => !roman.canTidy(value),
      hint: () => {
        tray.shake();
        rules.highlight(tray.get());
        ui.bubble("elder", "↻ Hali qoʻllanadigan qoida bor — u yonib turibdi.");
      },
      solution: () => {
        tray.set(roman.tidy(tray.get()), "*");
        box.replaceChild(common.expr(a, "+", b, answer), box.firstChild);
        box.append(common.answerLine(`${task.a} + ${task.b} = ${task.answer}`));
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
    ui.bubble("elder", "Oʻnlikka oʻtkazib hisobla, javobni Rim raqamida yoz.");
    return common.romanAnswer({
      target: task.answer,
      // Maslahat javobni aytmaydi (QOIDALAR 4.3): sonlar aylantirib beriladi, hisobni bola o'zi qiladi
      hint: () => {
        note.textContent = `${task.a} ${task.op} ${task.b} = ?`;
        ui.bubble("elder", `↻ ${a} = ${task.a}, ${b} = ${task.b}. Endi hisobla va javobni Rim raqamida yoz.`);
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
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta misol — goh lagan bilan, goh oʻnlikka oʻtkazib.`);
    await practice.exercises({
      next: (prev, correct, tier) => roman.makeCalcTask(correct, prev, null, tier),
      run: (task) => (task.type === "tidy" ? tidyTask(task) : arithTask(task)),
      praise: (task) => `${roman.toRoman(task.a)} ${task.op} ${roman.toRoman(task.b)} = ${roman.toRoman(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
