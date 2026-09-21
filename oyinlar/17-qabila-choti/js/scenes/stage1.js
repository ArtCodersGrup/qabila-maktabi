// Kirish va 1-bosqich: cho'tda sanash (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, tizim, ui, sound, art, sanoqUi, common } = QK;
  const S = sanoq;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.abacus() }));
    await ui.say("elder", "Qoʻshni qabilalar har xil sanaydi.");
    await ui.say("apprentice", "Qanday qilib? Sonlar hammada bir xil-ku!");
    await ui.say("elder", "Sonlar bir xil, yozilishi boshqa. Kel, choʻtda koʻramiz.");
  }

  const RUNS = [
    { base: 10, from: 7, to: 12, start: "Bu — oʻnlik choʻt: har simda 9 tagacha munchoq. «+1» ni bosib, 12 gacha sana!", carry: "10 ta boʻldi — ular chapdagi simda 1 ta munchoqqa almashdi!", end: "Oʻnlikda 12 — bir oʻnlik va 2 ta birlik." },
    { base: 5, from: 3, to: 7, start: "Besh barmoqli qabila 5 tadan sanaydi: har simda 4 tagacha. 7 gacha sana!", carry: "5 ta boʻldi — chapdagi simga 1 ta oʻtdi!", end: "Yetti bu yerda 12₅ deb yoziladi: «bir-ikki, beshlik»." },
    { base: 2, from: 0, to: 5, start: "Bu qabila faqat «bor» yoki «yoʻq» deydi: har simda 1 tagacha. 5 gacha sana!", carry: "2 ta boʻldi — darrov keyingi simga!", end: "Besh — 101₂: «bir-nol-bir, ikkilik»." },
  ];

  // 4.1–4.3: bola uch xil cho'tda +1 bilan sanaydi
  async function countOn(run) {
    const el = common.box(true);
    const abacus = sanoqUi.choti(el, { base: run.base, rods: 3, value: run.from });
    const line = common.line("");
    el.append(line);
    const show = (n) => { line.textContent = `Son: ${n} → ${S.fmt(S.toBase(n, run.base), run.base)}`; };
    show(run.from);
    ui.bubble("elder", run.start);
    let told = false;
    await ui.settle((done) => {
      let n = run.from;
      let busy = false;
      ui.control().append(ui.button("+1", async () => {
        if (busy || n >= run.to) return;
        busy = true;
        const carries = n % run.base === run.base - 1;
        await abacus.inc();
        n++;
        show(n);
        if (carries && !told) {
          told = true;
          ui.bubble("elder", run.carry);
        }
        busy = false;
        if (n === run.to) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", run.end);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["10-lik: 10 tada keyingi xonaga", "5-lik: 5 tada", "2-lik: 2 tada"]);
    await ui.say("elder", "Nechta munchoqda keyingi simga oʻtilsa — shu tizimning asosi.");
    await ui.say("elder", "Bular — sanoq tizimlari (sanoq sistemalari).");
  }

  // 4.5: mashq — cho'tdagi son / yana 1 qo'shilsa
  function chotiTask(task) {
    const el = common.box(true);
    const abacus = sanoqUi.choti(el, { base: task.base, rods: 3, value: task.value, hideDigits: true });
    el.append(common.line(`${task.base}-lik choʻt`));
    ui.bubble("elder", task.type === "read" ? "Choʻtdagi sonni yoz." : "Yana 1 qoʻshsak, qanday yoziladi?");
    return sanoqUi.digitTries({
      answer: task.answer,
      base: task.base,
      maxLen: 4,
      hint: () => {
        if (task.type === "read") abacus.showDigits();
        common.add(el, common.line(task.type === "read"
          ? "Har sim ostida — munchoqlar soni. Chapdan oʻngga oʻqi"
          : `Oxirgi simda ${task.base} ta boʻladi — u boʻshab, chapdagiga 1 oʻtadi`));
        ui.bubble("elder", task.type === "read" ? "↻ Munchoqlarni sana: har sim — bitta raqam." : "↻ Koʻchishni unutma!");
      },
      solution: () => {
        abacus.showDigits();
        if (task.type === "next") abacus.inc();
        common.add(el, common.answerLine(S.fmt(task.answer, task.base)));
      },
    });
  }

  async function stage1() {
    for (const run of RUNS) await countOn(run);
    await definition();
    await ui.say("elder", "Endi oʻzing: choʻtdagi sonni oʻqi. 3 ta toʻgʻri javob!");
    await QK.practice.exercises({
      next: (prev) => tizim.makeChotiTask(prev),
      run: chotiTask,
      praise: (task) => `${S.fmt(task.answer, task.base)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
