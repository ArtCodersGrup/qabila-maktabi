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
    await ui.say("elder", "Maqsad: sanoq tizimi nima ekanini va uning asosini tushunish.");
    await ui.say("elder", "Kalit gʻoya: son bir xil, lekin har tizimda boshqacha yoziladi. Choʻtda koʻramiz.");
  }

  const RUNS = [
    { base: 10, from: 7, to: 12, start: "Oʻnlik choʻt: har simda 9 tagacha munchoq. «+1» bilan 12 gacha sana.", carry: "10 ta boʻldi — ular chapdagi simda 1 ta munchoqqa almashdi. Bu — xonadan koʻchish.", end: "12 = 1 ta oʻnlik + 2 ta birlik." },
    { base: 5, from: 3, to: 7, start: "Beshlik choʻt: har simda 4 tagacha munchoq. 7 gacha sana.", carry: "5 ta boʻldi — chapdagi simga 1 ta oʻtdi.", end: "7 = 1 ta beshlik + 2 ta birlik, yaʼni 12₅ («bir-ikki, beshlik»)." },
    { base: 2, from: 0, to: 5, start: "Ikkilik choʻt: har simda 0 yoki 1 ta munchoq. 5 gacha sana.", carry: "2 ta boʻldi — darhol keyingi simga koʻchadi.", end: "5 = 1 ta toʻrtlik + 0 ta ikkilik + 1 ta birlik, yaʼni 101₂." },
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
    common.formula(el, ["10-lik: 10 tada keyingi xonaga", "5-lik: 5 tada", "2-lik: 2 tada", "asos b: b tada keyingi xonaga"]);
    await ui.say("elder", "Nechta birlikda keyingi xonaga koʻchilsa — shu son tizimning asosi (b).");
    await ui.say("elder", "Asosi b boʻlgan tizim — b-lik sanoq tizimi (sanoq sistemasi).");
  }

  // 4.5: mashq — cho'tdagi son / yana 1 qo'shilsa
  function chotiTask(task) {
    const el = common.box(true);
    const abacus = sanoqUi.choti(el, { base: task.base, rods: task.rods, value: task.value, hideDigits: true });
    el.append(common.line(`${task.base}-lik choʻt`));
    ui.bubble("elder", task.type === "read" ? "Choʻtdagi sonni yoz." : "Yana 1 qoʻshsak, qanday yoziladi?");
    return sanoqUi.digitTries({
      answer: task.answer,
      base: task.base,
      maxLen: 4,
      hint: () => {
        // Maslahat javobni aytmaydi: raqamlar ochilmaydi, faqat usul eslatiladi
        common.add(el, common.line(task.type === "read"
          ? "Har sim — bitta raqam: munchoqlarini sana. Boʻsh sim — 0. Chapdan oʻngga yoz"
          : `Simda ${task.base} ta boʻlsa — u boʻshab, chapdagiga 1 oʻtadi`));
        ui.bubble("elder", task.type === "read" ? "↻ Munchoqlarni sana: har sim — bitta raqam." : "↻ Oxirgi simga qara: u toʻlsa, keyingi xonaga koʻchadi.");
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
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — choʻtdagi sonni yoz yoki unga 1 qoʻsh.`);
    await QK.practice.exercises({
      next: (prev, correct, tier) => tizim.makeChotiTask(prev, undefined, tier),
      run: chotiTask,
      praise: (task) => `${S.fmt(task.answer, task.base)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
