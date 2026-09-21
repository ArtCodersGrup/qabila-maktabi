// 3-bosqich: nechta sig'adi? va blok yakuni — hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { units, ui, sound, art, unitsUi, practice, common } = QK;

  const SCENES = [
    { art: "disk", lines: [`Doʻkonda «1 Tbayt» deb yozilgan disk kompyuterda ${units.DISK.gb} Gbayt koʻrinadi.`, "Doʻkon 1000 bilan sanaydi, kompyuter esa 1024 bilan. Disk kichraymagan!"] },
    { art: "datacenter", lines: ["Katta maʼlumot markazlarida minglab Tbayt saqlanadi.", "1024 Tbayt — 1 Pbayt (petabayt)!"] },
    { art: "ladder", lines: ["Hammasi bitta bitdan boshlanadi: yoniq yoki oʻchiq.", "Endi sen axborotni oʻlchay olasan!"] },
  ];

  // 6.1: fleshkani filmlar bilan to'ldirish
  async function fillFlash() {
    const { gb, film } = units.FLASH;
    const parts = gb / film;
    const el = common.box(true);
    const bar = unitsUi.storageBar(el, parts, `Fleshka: ${gb} Gbayt`);
    const count = common.line("Filmlar: 0");
    el.append(count);
    ui.bubble("elder", `Fleshkaga ${film} Gbaytli filmlarni joyla. Nechta sigʻarkin?`);
    await ui.settle((done) => {
      let n = 0;
      ui.control().append(ui.button(`Film qoʻsh (${film} Gbayt)`, () => {
        if (n >= parts) return;
        n++;
        bar.fill(n);
        count.textContent = `Filmlar: ${n} · band: ${n * film} Gbayt`;
        if (n === parts) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", `Toʻldi! ${gb} : ${film} = ${parts} ta film sigʻdi.`);
  }

  // 6.2: turli birlik — avval aylantiramiz
  async function crossUnits() {
    const { gb, mb } = units.CROSS;
    const parts = (gb * 1024) / mb;
    const el = common.box(false);
    const bar = unitsUi.storageBar(el, parts, `Fleshka: ${gb} Gbayt`);
    await ui.say("elder", `${gb} Gbaytli fleshkaga ${mb} Mbaytli video nechta sigʻadi?`);
    const rows = common.formula(el, [`${gb} Gbayt = ${gb * 1024} Mbayt`]);
    await ui.say("elder", "Birliklar har xil! Avval bir xil birlikka aylantiramiz.");
    rows.append(ui.h("div", { class: "formula-row", text: `${gb * 1024} : ${mb} = ${parts}` }));
    bar.fill(parts);
    sound.play("correct");
    await ui.say("elder", `${gb * 1024} : ${mb} = ${parts}. ${parts} ta video sigʻadi!`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["nechta sigʻadi = xotira : fayl", "(bir xil birlikda!)"]);
    await ui.say("elder", "Xotirani fayl hajmiga boʻlamiz. Birliklar bir xil boʻlsin!");
  }

  // 6.4: mashq — nechta sig'adi
  function fitTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "facts" },
      ui.h("div", { text: `${task.device} — ${task.cap} ${task.capUnit}` }),
      ui.h("div", { text: `1 ta ${task.file} — ${task.size} ${task.sizeUnit}` })));
    ui.bubble("elder", `Nechta ${task.file} sigʻadi?`);
    const capIn = task.type === "same" ? task.cap : task.cap * 1024;
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, common.line(task.type === "same"
          ? `${task.cap} : ${task.size} = ?`
          : `${task.cap} ${task.capUnit} = ${capIn} ${task.sizeUnit}. ${capIn} : ${task.size} = ?`));
        ui.bubble("elder", task.type === "same" ? "↻ Xotirani fayl hajmiga boʻl." : "↻ Avval bir xil birlikka aylantir, keyin boʻl.");
      },
      solution: () => common.add(el, common.answerLine(`${capIn} : ${task.size} = ${task.answer} ta ${task.file}`)),
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await fillFlash();
    await crossUnits();
    await definition();
    await ui.say("elder", "Endi oʻzing hisobla: nechta sigʻadi? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => units.makeFitTask(prev),
      run: fitTask,
      praise: (task) => `${task.answer} ta ${task.file} sigʻadi.`,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
