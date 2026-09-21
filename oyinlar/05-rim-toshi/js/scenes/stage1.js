// Kirish va 1-bosqich: Rim raqamlarini o'qish va yozish (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound, romanUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(common.stone("XII  XXVI"));
    await ui.say("elder", "Qabila qadimgi tosh topdi!");
    await ui.say("apprentice", "Unda gʻalati belgilar bor: XII, XXVI…");
    await ui.say("elder", "Bular — Rim raqamlari. Sezar askarlari shunday yozgan.");
  }

  // 4.1: belgilar — bola har birini bosib qiymatini ochadi
  async function symbols() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const grid = ui.h("div", { class: "cards5" });
    ui.work().append(grid);
    ui.bubble("elder", "Rimliklarda 5 ta asosiy belgi bor. Har birini bos — qanday son ekan?");
    await ui.settle((done) => {
      let opened = 0;
      roman.KEYS.forEach((ch) => {
        const val = ui.h("span", { class: "sym-val", text: "?" });
        const card = ui.h("button", { class: "sym-card", type: "button", "aria-label": ch }, romanUi.symbol(ch, "lg"), val);
        card.addEventListener("click", () => {
          if (card.classList.contains("open")) return;
          card.classList.add("open");
          sound.play("tap");
          val.textContent = String(roman.VALUES[ch]);
          opened++;
          if (opened === roman.KEYS.length) setTimeout(done, 500);
        });
        grid.append(card);
      });
    });
    await ui.say("elder", "I — 1, V — 5, X — 10, L — 50, C — 100.");
    await ui.say("elder", "I — bitta barmoq, V — ochiq qoʻl, X — ikki qoʻl.");
  }

  // 4.2: qo'shish qoidasi, keyin 7, 12, 26 ni yasash
  async function additionRule() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "rbox" },
      romanUi.breakdown("VII"),
      ui.h("div", { class: "formula-row", text: "VII = 5 + 1 + 1 = 7" })));
    await ui.say("elder", "Belgilar kattadan kichikka yozilsa — qoʻshiladi: VII = 5 + 1 + 1.");
    for (const n of [7, 12, 26]) {
      await common.buildUntil(n, `${n} ni yasa. Kattasidan boshla — yozuving yonida qiymati koʻrinadi.`);
      const r = roman.toRoman(n);
      await ui.say("elder", `✓ ${r} = ${roman.symbolValues(r).join(" + ")} = ${n}.`);
    }
  }

  // 4.3: ayirish qoidasi, keyin 4 va 40 ni yasash
  async function subtractionRule() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" },
      romanUi.word("IV", "lg"),
      ui.h("div", { class: "formula-row", text: "IV = 5 − 1 = 4" }));
    ui.work().append(box);
    await ui.say("elder", "Kichik belgi kattasidan oldin tursa — ayiriladi: IV = 5 − 1 = 4.");
    box.innerHTML = "";
    const pairs = ui.h("div", { class: "pairs" });
    for (const p of ["IV", "IX", "XL", "XC"]) pairs.append(romanUi.breakdown(p, { grouped: true }));
    box.append(pairs);
    await ui.say("elder", "Bunday juftlik faqat 4 ta: IV, IX, XL, XC.");
    await ui.say("elder", "Bir belgi 3 martadan koʻp takrorlanmaydi: IIII emas — IV.");
    await common.buildUntil(4, "4 ni yasa.");
    await ui.say("elder", "✓ IV = 5 − 1 = 4.");
    await common.buildUntil(40, "Endi 40 ni yasa. Oʻnliklarda ham xuddi shunday!");
    await ui.say("elder", "✓ XL = 50 − 10 = 40.");
  }

  // 4.4: o'qish — toshdagi son raqam klaviaturasida
  function readTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" }, common.stone(task.roman));
    ui.work().append(box);
    ui.bubble("elder", `Toshda ${task.roman} yozilgan. Bu qaysi son?`);
    return practice.numberTries({
      answer: task.n,
      hint: () => {
        box.append(romanUi.breakdown(task.roman, { grouped: true }));
        ui.bubble("elder", "↻ Har guruh ostidagi qiymatlarni qoʻshib chiq.");
      },
      solution: () => {
        const parts = roman.tokens(task.roman);
        const line = common.answerLine(`${parts.map((p) => p.value).join(" + ")} = ${task.n}`);
        box.append(line);
        line.scrollIntoView({ block: "nearest" });
      },
    });
  }

  // 4.4: yozish — son Rim klaviaturasida
  function writeTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" }, ui.h("div", { class: "target", text: String(task.n) }));
    ui.work().append(box);
    ui.bubble("elder", `${task.n} ni Rim raqamida yoz.`);
    return common.romanAnswer({
      target: task.n,
      hint: () => ui.bubble("elder", common.partsHint(task.n)),
      solution: (answer) => {
        const line = common.answerLine(`${task.n} = ${answer}`);
        box.append(romanUi.word(answer, "lg"), line);
        line.scrollIntoView({ block: "nearest" });
      },
    });
  }

  async function stage1() {
    await symbols();
    await additionRule();
    await subtractionRule();
    await ui.say("elder", "Endi toshdagi sonlarni oʻqiymiz va yozamiz. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => roman.makeReadWriteTask(correct, prev),
      run: (task) => (task.type === "read" ? readTask(task) : writeTask(task)),
      praise: (task) => `${task.roman} = ${task.n}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
