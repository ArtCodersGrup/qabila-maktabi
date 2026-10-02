// 2-bosqich: kattasini top (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { units, ui, sound, unitsUi, practice, common } = QK;
  const U = units.UNITS;

  // 5.1: fayllarni eng kichigidan boshlab tartiblash
  async function sortFiles() {
    const el = common.box(true);
    const shelf = ui.h("div", { class: "shelf" });
    const slots = units.ORDER.map(() => ui.h("div", { class: "shelf-slot" }));
    shelf.append(...slots);
    el.append(common.line("Kichigidan kattasiga:"), shelf);
    ui.bubble("elder", "Eng kichik fayldan boshlab bos!");
    let next = 0;
    await ui.settle((done) => {
      const pad = ui.h("div", { class: "file-pad" });
      units.ITEMS.forEach((item) => {
        const card = unitsUi.fileCard(item, true);
        card.addEventListener("click", () => {
          if (card.disabled) return;
          const want = units.ITEMS.find((i) => i.id === units.ORDER[next]);
          if (item.id !== want.id) {
            sound.play("retry");
            ui.pose("apprentice", "think", 1000);
            ui.bubble("elder", item.unit === want.unit
              ? "↻ Birlik bir xil — endi sonni solishtir."
              : "↻ Birlikka qara: bayt < Kbayt < Mbayt < Gbayt.");
            return;
          }
          card.disabled = true;
          sound.play("correct");
          slots[next].replaceChildren(unitsUi.fileCard(item, false));
          slots[next].classList.add("full");
          next++;
          if (next === units.ORDER.length) {
            ui.clearControl();
            done();
          }
        });
        pad.append(card);
      });
      ui.clearControl();
      ui.control().append(pad);
    });
    await ui.say("elder", "✓ SMS — eng kichik, film — eng katta!");
    await ui.say("elder", "Surat va qoʻshiq — ikkalasi Mbaytda. Birlik bir xil boʻlsa, sonni solishtiramiz: 3 < 4.");
  }

  // 5.2: tuzoq — 2000 Mbayt yoki 1 Gbayt?
  async function trap() {
    const a = { n: 2000, unit: "Mbayt" };
    const b = { n: 1, unit: "Gbayt" };
    const el = common.box(true);
    el.append(ui.h("div", { class: "cmp" }, unitsUi.sizeCard(a), ui.h("div", { class: "cmp-or", text: "yoki" }), unitsUi.sizeCard(b)));
    ui.bubble("elder", "Qaysi biri katta? Oʻylab koʻr!");
    const pickedA = await ui.choice([{ label: "2000 Mbayt", value: true }, { label: "1 Gbayt", value: false }]);
    if (pickedA) {
      sound.play("correct");
      ui.pose("apprentice", "happy", 900);
    } else sound.play("retry");
    el.append(common.line("1 Gbayt = 1024 Mbayt"), common.answerLine("2000 Mbayt > 1024 Mbayt"));
    await ui.say("elder", pickedA ? "✓ Toʻgʻri! 1 Gbayt — bor-yoʻgʻi 1024 Mbayt." : "↻ Aldandingmi? 1 Gbayt — bor-yoʻgʻi 1024 Mbayt. 2000 kattaroq!");
    await ui.say("elder", "Birlik katta boʻlsa ham, son kichik boʻlsa — aylantirib solishtir.");
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["1) Birlik bir xil — sonni solishtir", "2) Birlik boshqa — bir xil birlikka aylantir"]);
    await ui.say("elder", "Solishtirishning ikki qoidasi. Aylantirishda 1024 ni unutma!");
  }

  // 5.4: mashq — uch kartadan qaysi biri eng katta, yoki uchalasi teng (4 variant)
  function compareTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "cmp" }, ...task.cards.map((c) => ui.h("div", { class: "cmp-card", text: c.label }))));
    ui.bubble("elder", "Qaysi biri eng katta? Uchalasi bir xil boʻlsa — «Uchalasi teng».");
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        task.cards.forEach((c, i) => row.append(ui.button(c.label, () => submit(i))));
        row.append(ui.button("Uchalasi teng", () => submit(units.TENG), "secondary"));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (value) => value === task.answer,
      hint: () => {
        common.add(el, common.line(`1 ${task.unit} = 1024 ${task.small}`));
        ui.bubble("elder", `↻ Uchalasini ham ${task.small}ga oʻtkaz, keyin solishtir.`);
      },
      solution: () => {
        common.add(el,
          common.line(task.cards.map((c) => `${c.label} = ${c.value} ${task.small}`).join("; ")),
          common.answerLine(task.answer === units.TENG ? "Uchalasi teng" : `Eng kattasi: ${task.cards[task.answer].label}`));
      },
    });
  }

  async function stage2() {
    await sortFiles();
    await trap();
    await definition();
    await ui.say("elder", `Endi oʻzing solishtir. ${QK.practice.need()} ta toʻgʻri javob!`);
    await practice.exercises({
      next: (prev, correct, tier) => units.makeCompareTask(prev, undefined, tier),
      run: compareTask,
      praise: (task) => {
        if (task.answer === units.TENG) return `Uchalasi ham ${task.cards[0].value} ${task.small}.`;
        return `${task.cards[task.answer].label} — eng kattasi.`;
      },
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
