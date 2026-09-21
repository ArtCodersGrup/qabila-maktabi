// 3-bosqich: bir xonali songa ko'paytirish va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, amal16, ui, art, amal16Ui, sanoqUi, practice, common } = QK;
  const S = sanoq;
  const h16 = (s) => S.fmt(s, 16);

  const SCENES = [
    { art: "web", lines: ["Veb-sahifalardagi har bir rang — 16-lik kod."] },
    { art: "memory", lines: ["Dasturchilar kompyuter xotirasini ham 16-likda koʻradi: har ikki raqam — bitta bayt."] },
    { art: "planets", lines: ["Keyingi oʻyinda — boshqa sayyoralar: 3-, 5-, 7-lik tizimlar!"] },
  ];

  // 6.1: 1A × 3 ustunda
  async function guidedMul() {
    const el = common.box(true);
    el.append(amal16Ui.multiples());
    const board = sanoqUi.ustun(el, { a: "1A", b: "3", op: "×", base: 16 });
    await ui.say("elder", "Ustunda koʻpaytiramiz: 1A₁₆ × 3. Tepada — 16 ga karralilar, koʻchishni topishga yordam beradi.");
    await sanoqUi.guide(board, S.stepsMul("1A", 3, 16), 16);
    await ui.say("elder", "1A₁₆ × 3 = 4E₁₆. Tekshiramiz: 26 × 3 = 78 = 4·16 + 14 ✓");
  }

  // 6.2: mashq — 2 xonali son × 2–9
  function mulTask(task) {
    const el = common.box(true);
    el.append(amal16Ui.multiples());
    const board = sanoqUi.ustun(el, { a: task.a, b: String(task.d), op: "×", base: 16, width: 4 });
    ui.bubble("elder", "Koʻpaytir! Javobni 16-likda yoz.");
    const x = S.fromBase(task.a, 16);
    const steps = S.stepsMul(task.a, task.d, 16).filter((st) => st.i < task.a.length);
    return sanoqUi.digitTries({
      answer: task.answer,
      base: 16,
      maxLen: 3,
      hint: () => {
        steps.forEach((st) => common.add(el, common.line(`${st.say.replace(". Qaysi raqamni yozamiz?", "")} → ${st.hint}`, "small")));
        ui.bubble("elder", "↻ Har ustunni oʻnlikda hisobladim. 16 ga boʻlib, qoldiqni yoz.");
      },
      solution: () => {
        S.mulDigit(task.a, task.d, 16).cols.forEach((c, i) => { if (c.carryOut) board.setCarry(i + 1, String(c.carryOut)); });
        board.setResultAll(task.answer);
        common.add(el, common.answerLine(`Tekshiramiz: ${x} × ${task.d} = ${x * task.d} ✓`));
      },
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await guidedMul();
    await ui.say("elder", "Endi oʻzing koʻpaytir. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => amal16.makeMulTask(prev),
      run: mulTask,
      praise: (task) => `${h16(task.a)} × ${task.d} = ${h16(task.answer)}.`,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
