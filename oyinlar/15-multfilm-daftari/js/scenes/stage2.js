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
    ui.bubble("elder", "Har kadr — 2 bayt. «+ kadr»ni 5 marta bos!");
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
    await ui.say("elder", `Haqiqiy video kadri: ${R.w} × ${R.h} piksel, har biri 3 bayt. Bu — ${R.frameMb} Mbaytga yaqin.`);
    rows.append(ui.h("div", { class: "formula-row", text: `1 soniya: ${R.frameMb} × ${R.fps} = ${R.secondMb} Mbayt` }));
    await ui.say("elder", `1 soniyada ${R.fps} kadr — ${R.secondMb} Mbayt!`);
    rows.append(ui.h("div", { class: "formula-row", text: `1 daqiqa: ${R.secondMb} × 60 = ${R.minuteMb} Mbayt` }));
    await ui.say("elder", `1 daqiqada 60 soniya — ${R.minuteMb} Mbayt. Juda katta son!`);
    el.append(ui.h("div", { class: "ladder" },
      ui.h("span", { class: "step", text: "Kbayt" }), ui.h("span", { class: "arrow", text: "× 1024 →" }),
      ui.h("span", { class: "step", text: "Mbayt" }), ui.h("span", { class: "arrow", text: "× 1024 →" }),
      ui.h("span", { class: "step new", text: "Gbayt" })));
    await ui.say("elder", "Yana katta birlik: 1024 Mbayt = 1 Gbayt (gigabayt).");
    common.add(el, common.answerLine(`${R.minuteMb} Mbayt ≈ ${R.minuteGb} Gbaytdan koʻp`));
    await ui.say("elder", `Demak, 1 daqiqa video — ${R.minuteGb} Gbaytdan koʻp!`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["video hajmi = 1 kadr hajmi × kadrlar soni", "1 Gbayt = 1024 Mbayt"]);
    await ui.say("elder", "Video hajmini topish uchun 1 kadr hajmini kadrlar soniga koʻpaytiramiz.");
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
          ui.bubble("elder", "↻ Har kadr ostida uning hajmi. Hammasini qoʻsh.");
        },
        solution: () => common.add(el, common.answerLine(`${task.frameBytes} × ${task.frames} = ${task.answer} bayt`)),
      });
    }
    if (task.type === "fps") {
      el.append(ui.h("div", { class: "facts" },
        ui.h("div", { text: `1 kadr — ${task.frameBytes} bayt` }),
        ui.h("div", { text: `1 soniyada — ${task.fps} kadr` }),
        ui.h("div", { text: `Video — ${task.seconds} soniya` })));
      ui.bubble("elder", "Bu video necha bayt?");
      const perSecond = task.frameBytes * task.fps;
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line(`1 soniya: ${task.frameBytes} × ${task.fps} = ${perSecond} bayt`));
          ui.bubble("elder", "↻ Avval 1 soniyani top, keyin soniyalarga koʻpaytir.");
        },
        solution: () => common.add(el, common.answerLine(`${task.frameBytes} × ${task.fps} × ${task.seconds} = ${task.answer} bayt`)),
      });
    }
    const inMb = task.gb * 1024;
    el.append(ui.h("div", { class: "cmp" },
      ui.h("div", { class: "cmp-card", text: `${task.gb} Gbayt` }),
      ui.h("div", { class: "cmp-or", text: "yoki" }),
      ui.h("div", { class: "cmp-card", text: `${task.mb} Mbayt` })));
    ui.bubble("elder", "Qaysi biri katta?");
    const keys = ["gb", "mb"];
    return practice.tries({
      setup: (submit) => videoUi.choiceButtons([`${task.gb} Gbayt`, `${task.mb} Mbayt`], (i) => submit(keys[i])),
      check: (value) => value === task.answer,
      hint: () => {
        common.add(el, common.line(`${task.gb} Gbayt = ${task.gb} × 1024 = ${inMb} Mbayt`));
        ui.bubble("elder", "↻ Ikkalasini Mbaytda solishtir.");
      },
      solution: () => common.add(el, common.answerLine(`${inMb} Mbayt ${inMb > task.mb ? ">" : "<"} ${task.mb} Mbayt`)),
    });
  }

  function praise(task) {
    if (task.type === "frames") return `${task.frameBytes} × ${task.frames} = ${task.answer} bayt.`;
    if (task.type === "fps") return `${task.frameBytes} × ${task.fps} × ${task.seconds} = ${task.answer} bayt.`;
    return `${task.gb} Gbayt = ${task.gb * 1024} Mbayt.`;
  }

  async function stage2() {
    await addFrames();
    await realVideo();
    await definition();
    await ui.say("elder", "Endi oʻzing hisobla: video hajmi. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => video.makeSizeTask(prev),
      run: sizeTask,
      praise,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
