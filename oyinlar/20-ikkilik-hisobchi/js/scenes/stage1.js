// Kirish va 1-bosqich: ikkilikda qo'shish (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, amal2, ui, sound, art, sanoqUi, common } = QK;
  const S = sanoq;
  const b2 = (s) => S.fmt(s, 2);

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.calc() }));
    await ui.say("elder", "Kompyuter faqat 0 va 1 bilan hisoblaydi.");
    await ui.say("apprentice", "Unda 1 + 1 nima boʻladi? 2 degan raqam yoʻq-ku!");
    await ui.say("elder", "Ana shuni oʻrganamiz!");
  }

  // Cho'tda "+1" yoki "−1": natija satri yangilanadi. clicks — nechta bosish kerak
  async function chotiDemo({ start, op, clicks, first, after }) {
    const el = common.box(true);
    const abacus = sanoqUi.choti(el, { base: 2, rods: 3, value: start, places: true });
    const line = common.line(`Son: ${b2(S.toBase(start, 2))}`);
    el.append(line);
    ui.bubble("elder", first);
    await ui.settle((done) => {
      let n = start;
      let k = 0;
      let busy = false;
      ui.control().append(ui.button(op > 0 ? "+1" : "−1", async () => {
        if (busy || k >= clicks) return;
        busy = true;
        if (op > 0) await abacus.inc();
        else await abacus.dec();
        n += op;
        k++;
        line.textContent = `Son: ${b2(S.toBase(n, 2))}`;
        if (after[k - 1]) ui.bubble("elder", after[k - 1]);
        busy = false;
        if (k === clicks) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", after[clicks - 1]);
  }

  // Ustunda bosqichma-bosqich (qo'shish yoki ayirish)
  async function guided({ a, b, op, steps, intro: first }) {
    const el = common.box(true);
    const board = sanoqUi.ustun(el, { a, b, op, base: 2 });
    await ui.say("elder", first);
    await sanoqUi.guide(board, steps, 2);
    return el;
  }

  async function additionTable() {
    const el = common.box(false);
    common.formula(el, ["0 + 0 = 0", "0 + 1 = 1", "1 + 1 = 10", "1 + 1 + 1 = 11"]);
    await ui.say("elder", "Ikkilikda qoʻshish jadvali — atigi 4 qator!");
    await ui.say("elder", "Yigʻindi 2 boʻlsa — 0 yozamiz, 1 ni koʻchiramiz. 3 boʻlsa — 1 yozamiz, 1 ni koʻchiramiz.");
  }

  // Maslahat: ko'chishlar taxtada
  function showCarries(board, a, b) {
    S.addColumns(a, b, 2).cols.forEach((c, i) => { if (c.carryOut) board.setCarry(i + 1, "1"); });
  }

  // 4.4: mashq — ikkilikda qo'shish
  function addTask(task) {
    const el = common.box(true);
    const board = sanoqUi.ustun(el, { a: task.a, b: task.b, op: "+", base: 2, width: task.answer.length + 1 });
    ui.bubble("elder", "Qoʻsh! Javobni pastdagi tugmalar bilan yoz.");
    const x = S.fromBase(task.a, 2);
    const y = S.fromBase(task.b, 2);
    return sanoqUi.digitTries({
      answer: task.answer,
      base: 2,
      maxLen: 8,
      hint: () => {
        showCarries(board, task.a, task.b);
        ui.bubble("elder", "↻ Koʻchishlarni tepaga yozdim. Oʻngdan boshlab qoʻsh.");
      },
      solution: () => {
        showCarries(board, task.a, task.b);
        board.setResultAll(task.answer);
        common.add(el, common.answerLine(`Tekshiramiz: ${x} + ${y} = ${x + y} ✓`));
      },
    });
  }

  async function stage1() {
    await chotiDemo({
      start: 1, op: 1, clicks: 2,
      first: "Choʻtda 1 bor. «+1» ni bos — 1 + 1 nima boʻladi?",
      after: ["1 + 1 = 10₂! Ikkita munchoq — keyingi simga oʻtdi. Yana bos!", "10₂ + 1 = 11₂. Endi bu — uch."],
    });
    await additionTable();
    await guided({
      a: "1011", b: "110", op: "+", steps: S.stepsAdd("1011", "110", 2),
      intro: "Endi ustunda qoʻshamiz: 1011₂ + 110₂. Oʻngdan boshlaymiz!",
    });
    await ui.say("elder", "1011₂ + 110₂ = 10001₂. Tekshiramiz: 11 + 6 = 17 ✓");
    await ui.say("elder", "Endi oʻzing qoʻsh. 3 ta toʻgʻri javob!");
    await QK.practice.exercises({
      next: (prev) => amal2.makeAddTask(prev),
      run: addTask,
      praise: (task) => `${b2(task.a)} + ${b2(task.b)} = ${b2(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
  QK.amal2Scenes = { chotiDemo, guided };
})(window);
