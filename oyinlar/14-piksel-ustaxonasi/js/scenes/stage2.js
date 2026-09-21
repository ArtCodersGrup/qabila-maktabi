// 2-bosqich: ranglar va bitlar (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { pixels, ui, sound, pixelsUi, practice, common } = QK;

  const P4 = pixels.PALETTE4;

  // 5.1–5.2: 4 rang bilan bo'yash, har katakda 2 bitli kod
  async function paint() {
    const el = common.box(true);
    let pal = null;
    const board = pixelsUi.grid(el, {
      w: 4, h: 4, size: "md", editable: true,
      colors: P4.map((c) => c.color),
      pickColor: () => pal.get(),
    });
    board.showCodes((v) => P4[v].code);
    const legend = ui.h("div", { class: "legend" });
    P4.forEach((c) => legend.append(ui.h("span", { class: "legend-item" },
      ui.h("span", { class: "legend-dot", style: `background:${c.color}` }),
      ui.h("span", { text: `${c.name} ${c.code}` }))));
    el.append(legend);
    ui.bubble("elder", "Rang tanla va kataklarni boʻya. Har katakda uning kodi!");
    await ui.settle((done) => {
      const row = ui.h("div", { class: "control-row" });
      ui.control().append(row);
      pal = pixelsUi.palette(row, P4, 3);
      row.append(ui.button("Tayyor", () => {
        if (board.get().filter(Boolean).length < 4) {
          sound.play("retry");
          ui.toast("Kamida 4 ta katakni rangli qil.");
          return;
        }
        ui.clearControl();
        done();
      }));
    });
    board.lock();
    sound.play("correct");
    await ui.say("elder", "4 xil rang — har piksel 2 bit: 2 × 2 = 4 xil kod.");
    await ui.say("elder", "16 piksel × 2 bit = 32 bit, yaʼni 4 bayt.");
  }

  // 5.3: ta'rif — ranglar jadvali
  async function definition() {
    const el = common.box(false);
    const table = ui.h("div", { class: "ctable" });
    for (const [colors, bits] of pixels.COLOR_TABLE) {
      table.append(ui.h("span", { text: `${colors} rang` }), ui.h("span", { text: `${bits} bit` }));
    }
    el.append(table);
    common.formula(el, ["hajm = kenglik × balandlik × bit"]);
    await ui.say("elder", "Rang qancha koʻp boʻlsa, har pikselga shuncha koʻp bit kerak.");
    await ui.say("elder", "256 rang — 8 bit, yaʼni har piksel 1 bayt.");
  }

  function bitsTable(mark) {
    const table = ui.h("div", { class: "ctable" });
    for (let k = 1; k <= 8; k++) {
      table.append(ui.h("span", { text: `${k} bit` }), ui.h("span", { text: `${2 ** k} rang${mark === k ? " ✓" : ""}` }));
    }
    return table;
  }

  // 5.4: mashq — nechta bit kerak / rasm necha bit
  function colorTask(task) {
    const el = common.box(true);
    if (task.type === "bpp") {
      el.append(ui.h("div", { class: "big-value", text: `${task.colors} xil rang` }));
      ui.bubble("elder", "Har pikselga eng kamida nechta bit kerak?");
      let table = null;
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          table = bitsTable(null);
          common.add(el, table);
          ui.bubble("elder", "↻ Jadvalga qara: qaysi qatorda rang yetadi?");
        },
        solution: () => {
          const marked = bitsTable(task.answer);
          if (table) table.replaceWith(marked);
          else common.add(el, marked);
          common.add(el, common.answerLine(`${task.answer} bit — ${2 ** task.answer} rang, ${task.colors} ga yetadi`));
        },
      });
    }
    const colors = task.colors === 2 ? pixelsUi.BW : pixels.PALETTE16;
    pixelsUi.taskPicture(el, task, colors, `${task.colors} xil rang`);
    const p = task.w * task.h;
    ui.bubble("elder", "Bu rasm necha bit?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, common.line(`${task.w} × ${task.h} = ${p} piksel, har piksel ${task.bpp} bit`));
        ui.bubble("elder", "↻ Piksellar sonini bitga koʻpaytir.");
      },
      solution: () => common.add(el, common.answerLine(`${task.w} × ${task.h} × ${task.bpp} = ${task.answer} bit`)),
    });
  }

  async function stage2() {
    await paint();
    await definition();
    await ui.say("elder", "Endi oʻzing hisobla: ranglar va bitlar. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => pixels.makeColorTask(prev),
      run: colorTask,
      praise: (task) => (task.type === "bpp"
        ? `${task.colors} rang — ${task.answer} bit.`
        : `${task.w} × ${task.h} × ${task.bpp} = ${task.answer} bit.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
