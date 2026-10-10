// 2-bosqich: video hajmi va gigabayt (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { video, ui, sound, videoUi, practice, common } = QK;

  // 5.1: bola kadr qo'shadi, baytlar yig'iladi
  async function addFrames() {
    const TARGET = 5;
    const el = common.box(true);
    const cards = ui.h("div", { class: "tcards" });
    const sum = common.line("Kadrlar: 0 · jami 0 bayt");
    el.append(common.line(`Kichik ekran: 4 × 4 = 16 piksel = 16 bit = ${video.TINY.bytes} bayt`, "muted"), cards, sum);
    ui.bubble("elder", "Har kadr — 2 bayt. «+ kadr» ni 5 marta bos.");
    await ui.settle((done) => {
      let n = 0;
      ui.control().append(ui.button("+ kadr", () => {
        if (n >= TARGET) return;
        cards.append(videoUi.tinyCard(n));
        n++;
        sum.textContent = `Kadrlar: ${n} · jami ${n * video.TINY.bytes} bayt`;
        if (n === TARGET) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", `${TARGET} kadr × ${video.TINY.bytes} bayt = ${TARGET * video.TINY.bytes} bayt. Video hajmi — kadrlar hajmi yigʻindisi.`);
  }

  // 5.2: haqiqiy video — Mbayt va Gbayt
  async function realVideo() {
    const R = video.REAL;
    const el = common.box(false);
    const rows = common.formula(el, [`1 kadr: ${R.w} × ${R.h} × 3 bayt ≈ ${R.frameMb} Mbayt`]);
    await ui.say("elder", `Haqiqiy kadr: ${R.w} × ${R.h} piksel, har biri 3 bayt (RGB) — taxminan ${R.frameMb} Mbayt.`);
    rows.append(ui.h("div", { class: "formula-row", text: `1 soniya: ${R.frameMb} × ${R.fps} = ${R.secondMb} Mbayt` }));
    await ui.say("elder", `${R.fps} kadr/soniya: ${R.frameMb} × ${R.fps} = ${R.secondMb} Mbayt.`);
    rows.append(ui.h("div", { class: "formula-row", text: `1 daqiqa: ${R.secondMb} × 60 = ${R.minuteMb} Mbayt` }));
    await ui.say("elder", `1 daqiqa = 60 soniya: ${R.minuteMb} Mbayt.`);
    el.append(ui.h("div", { class: "ladder" },
      ui.h("span", { class: "step", text: "Kbayt" }), ui.h("span", { class: "arrow", text: "× 1024 →" }),
      ui.h("span", { class: "step", text: "Mbayt" }), ui.h("span", { class: "arrow", text: "× 1024 →" }),
      ui.h("span", { class: "step new", text: "Gbayt" })));
    await ui.say("elder", "Keyingi birlik: 1 Gbayt (gigabayt) = 1024 Mbayt.");
    common.add(el, common.answerLine(`${R.minuteMb} Mbayt ≈ ${R.minuteGb} Gbaytdan koʻp`));
    await ui.say("elder", `Siqilmagan 1 daqiqa video — ${R.minuteGb} Gbaytdan koʻp.`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["video hajmi = 1 kadr hajmi × kadrlar soni", "1 Gbayt = 1024 Mbayt"]);
    await ui.say("elder", "V = 1 kadr hajmi × kadrlar soni; kadrlar soni = kadr/soniya × soniya.");
  }

  // 5.4: mashq — kadrlar × bayt, soniyalar, Gbayt va Mbayt
  function sizeTask(task) {
    const el = common.box(true);
    if (task.type === "frames") {
      const view = ui.h("div", { class: "task-view" }, videoUi.frameIcons(task.frames));
      el.append(ui.h("div", { class: "facts" }, ui.h("div", { text: `1 kadr — ${task.frameBytes} bayt` })), view);
      ui.bubble("elder", `${task.frames} ta kadr — necha bayt?`);
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          view.replaceChildren(videoUi.frameIcons(task.frames, `${task.frameBytes} bayt`));
          ui.bubble("elder", "↻ Har kadr ostida uning hajmi: bir xil sonlarni qoʻshish — koʻpaytirish.");
        },
        solution: () => common.add(el, common.answerLine(`${task.frameBytes} × ${task.frames} = ${task.answer} bayt`)),
      });
    }
    if (task.type === "fps") {
      el.append(ui.h("div", { class: "facts" },
        ui.h("div", { text: `1 kadr — ${task.frameBytes} bayt` }),
        ui.h("div", { text: `1 soniyada — ${task.fps} kadr` }),
        ui.h("div", { text: `Video — ${task.seconds} soniya` })));
      ui.bubble("elder", "Video hajmi necha bayt?");
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line(`1 soniya: ${task.frameBytes} × ${task.fps} = ? bayt`));
          ui.bubble("elder", "↻ Avval 1 soniyani top, keyin soniyalarga koʻpaytir.");
        },
        solution: () => common.add(el, common.answerLine(`${task.frameBytes} × ${task.fps} × ${task.seconds} = ${task.answer} bayt`)),
      });
    }
    // "Qaysi biri eng katta?" — uch karta va "Uchalasi teng" (4 variant)
    const labels = { gb: `${task.gb} Gbayt`, mb: `${task.mb} Mbayt`, films: `${task.n} ta kino × ${task.each} Gbayt`, teng: "Uchalasi teng" };
    const sizes = video.cmpSizes(task);
    el.append(ui.h("div", { class: "cmp" },
      ui.h("div", { class: "cmp-card", text: labels.gb }),
      ui.h("div", { class: "cmp-card", text: labels.mb }),
      ui.h("div", { class: "cmp-card", text: labels.films })));
    ui.bubble("elder", "Qaysi biri eng katta? Uchalasi bir xil boʻlsa — «Uchalasi teng».");
    const keys = video.CMP_OPTIONS;
    return practice.tries({
      setup: (submit) => videoUi.choiceButtons(keys.map((k) => labels[k]), (i) => submit(keys[i])),
      check: (value) => value === task.answer,
      hint: () => {
        common.add(el, common.line("1 Gbayt = 1024 Mbayt"));
        ui.bubble("elder", "↻ Uchalasini ham Mbaytga oʻtkaz, keyin solishtir.");
      },
      solution: () => common.add(el,
        common.line(`${labels.gb} = ${sizes.gb} Mbayt; ${labels.films} = ${task.n * task.each} Gbayt = ${sizes.films} Mbayt`),
        common.answerLine(task.answer === "teng" ? `Uchalasi ham ${sizes.gb} Mbayt — teng` : `Eng kattasi: ${labels[task.answer]} (${sizes[task.answer]} Mbayt)`)),
    });
  }

  function praise(task) {
    if (task.type === "frames") return `${task.frameBytes} × ${task.frames} = ${task.answer} bayt.`;
    if (task.type === "fps") return `${task.frameBytes} × ${task.fps} × ${task.seconds} = ${task.answer} bayt.`;
    return task.answer === "teng" ? `Uchalasi ham ${task.gb * 1024} Mbayt.` : `${task.gb} Gbayt = ${task.gb * 1024} Mbayt.`;
  }

  async function stage2() {
    await addFrames();
    await realVideo();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — video hajmi va birliklarni solishtirish.`);
    await practice.exercises({
      next: (prev, correct, tier) => video.makeSizeTask(prev, undefined, tier),
      run: sizeTask,
      praise,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
