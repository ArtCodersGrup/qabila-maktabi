// 3-bosqich: ko'paytirish, jumboq va blok yakuni — hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, sayyora, ui, sound, art, sanoqUi, practice, common, sayyoraScenes } = QK;
  const S = sanoq;

  const SCENES = [
    { art: "babylon", lines: ["Qadimgi Bobilda 60-lik tizim boʻlgan.", "Shuning uchun soatda 60 daqiqa, daqiqada 60 soniya!"] },
    { art: "maya", lines: ["Mayyalar 20-likda sanashgan: qoʻl va oyoq barmoqlari — 20 ta."] },
    { art: "finale", lines: ["Kompyuter — 2-likda, dasturchi — 16-likda, biz — 10-likda.", "Endi sen istalgan tizimda hisoblay olasan!"] },
  ];

  // 6.2: jumboq — qaysi sayyorada 3 + 4 = 10?
  async function puzzleDemo() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: "3 + 4 = 10" }));
    ui.bubble("elder", "Qaysi sayyorada 3 + 4 = 10 boʻladi?");
    await ui.settle((done) => {
      const row = ui.h("div", { class: "choice-row" });
      [5, 7, 8].forEach((b) => row.append(ui.button(`${b}-lik`, () => {
        if (b !== 7) {
          sound.play("retry");
          ui.pose("apprentice", "think", 900);
          ui.bubble("elder", `↻ ${b}-likda «10» — ${b} degani. 3 + 4 esa nechchi?`);
          return;
        }
        sound.play("correct");
        ui.clearControl();
        done();
      })));
      ui.control().append(row);
    });
    await ui.say("elder", "10 — bu asosning oʻzi! 3 + 4 = 7 → 7-lik sayyora.");
  }

  // 6.3: mashq — ko'paytirish yoki jumboq
  function stage3Task(task) {
    const el = common.box(true);
    if (task.type === "puzzle") {
      el.append(ui.h("div", { class: "big-value", text: `${task.x} + ${task.y} = 1${task.c}` }));
      ui.bubble("elder", "Qaysi sayyorada shunday? Asosini yoz.");
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line(`1${task.c} = asos + ${task.c}. ${task.x} + ${task.y} = ${task.x + task.y}`));
          ui.bubble("elder", "↻ 10 — asos. Demak, yigʻindi = asos + oxirgi raqam.");
        },
        solution: () => common.add(el, common.answerLine(`${task.x} + ${task.y} = ${task.x + task.y} = ${task.answer} + ${task.c} → ${task.answer}-lik`)),
      });
    }
    el.append(ui.h("div", { class: "planet-tag", text: `${task.base}-lik sayyora` }));
    const board = sanoqUi.ustun(el, { a: task.a, b: String(task.d), op: "×", base: task.base, width: 4 });
    ui.bubble("elder", "Koʻpaytir! Javobni shu sayyora tizimida yoz.");
    const x = S.fromBase(task.a, task.base);
    const steps = S.stepsMul(task.a, task.d, task.base).filter((st) => st.i < task.a.length);
    return sanoqUi.digitTries({
      answer: task.answer,
      base: task.base,
      maxLen: 4,
      hint: () => {
        steps.forEach((st) => common.add(el, common.line(`${st.say.replace(". Qaysi raqamni yozamiz?", "")} → ${st.hint}`, "small")));
        ui.bubble("elder", `↻ Har ustunni oʻnlikda hisobladim. ${task.base} ga boʻlib, qoldiqni yoz.`);
      },
      solution: () => {
        S.mulDigit(task.a, task.d, task.base).cols.forEach((c, i) => { if (c.carryOut) board.setCarry(i + 1, String(c.carryOut)); });
        board.setResultAll(task.answer);
        common.add(el, common.answerLine(`Tekshiramiz: ${x} × ${task.d} = ${x * task.d} ✓`));
      },
    });
  }

  function praise(task) {
    if (task.type === "puzzle") return `${task.answer}-lik sayyorada ${task.x} + ${task.y} = 1${task.c}.`;
    return `${S.fmt(task.a, task.base)} × ${task.d} = ${S.fmt(task.answer, task.base)}.`;
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await sayyoraScenes.guided("23", "4", "×", 5, S.stepsMul("23", 4, 5), "Ustunda koʻpaytiramiz: 23₅ × 4.");
    await ui.say("elder", "23₅ × 4 = 202₅. Tekshiramiz: 13 × 4 = 52 = 2·25 + 0·5 + 2 ✓");
    await puzzleDemo();
    await ui.say("elder", "Endi oʻzing: koʻpaytirish va jumboqlar. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => sayyora.makeStage3Task(prev),
      run: stage3Task,
      praise,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
