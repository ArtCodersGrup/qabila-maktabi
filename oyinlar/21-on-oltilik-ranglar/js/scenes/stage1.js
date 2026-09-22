// Kirish va 1-bosqich: 2 ↔ 16 va rang kodlari (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, amal16, ui, sound, art, amal16Ui, sanoqUi, practice, common } = QK;
  const S = sanoq;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.painter() }));
    await ui.say("apprentice", "Rassom kompyuterda #FF8800 deb yozibdi. Bu nima?");
    await ui.say("elder", "Bu — oʻn oltilik sonlar. Kel, ochib koʻramiz.");
  }

  async function tetrads() {
    const el = common.box(false);
    el.append(amal16Ui.tetradTable());
    await ui.say("elder", "Bitta 16-lik raqam — 16 xil. 4 ta bit ham 16 xil: 2·2·2·2 = 16.");
    await ui.say("elder", "Demak, 4 ta bit = bitta 16-lik raqam! Jadvalga qara: B — 1011.");
  }

  // 4.2: 1011 0110₂ → B6₁₆ (guruhlarni bosish)
  async function binToHex() {
    const bits = "10110110";
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(bits, 2) }));
    ui.bubble("elder", "Oʻngdan 4 tadan ajratdim. Har guruhni bos — u 16-lik raqamga aylanadi!");
    const g = amal16.groups(bits);
    await amal16Ui.flipRow(el, g.map((x) => ({ front: x, back: S.toBase(S.fromBase(x, 2), 16) })));
    sound.play("correct");
    common.add(el, common.answerLine(`${S.fmt(bits, 2)} = ${S.fmt("B6", 16)}`));
    await ui.say("elder", "1011 — B, 0110 — 6. Demak, B6₁₆! Sakkizta raqam oʻrniga ikkita.");
  }

  // 4.3: 3F₁₆ → 0011 1111₂
  async function hexToBin() {
    const hex = "3F";
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(hex, 16) }));
    ui.bubble("elder", "Teskarisi: har raqamni bos — u 4 ta bitga aylanadi.");
    await amal16Ui.flipRow(el, [...hex].map((ch) => ({ front: ch, back: S.toBase(S.digitValue(ch), 2).padStart(4, "0") })));
    sound.play("correct");
    common.add(el, common.answerLine(`${S.fmt(hex, 16)} = ${S.fmt("00111111", 2)} = ${S.fmt("111111", 2)}`));
    await ui.say("elder", "3 — 0011, F — 1111. Boshidagi nollar yozilmasa ham boʻladi.");
  }

  // 4.4: rang kodi
  async function colors() {
    const el = common.box(false);
    el.append(amal16Ui.swatch("#FF8800"));
    await ui.say("elder", "Rang kodi — uchta 16-lik son: qizil, yashil va koʻk chiroq (7-oʻyinni esla).");
    await ui.say("elder", "FF — 255, toʻliq yoniq. 88 — 136, yarim. 00 — oʻchiq. Natija — toʻq sariq!");
  }

  // 4.5: mashq — 2 → 16, 16 → 2, rang
  function convTask(task) {
    const el = common.box(true);
    if (task.type === "bin2hex") {
      el.append(ui.h("div", { class: "big-value", text: S.fmt(task.bits, 2) }));
      ui.bubble("elder", "Bu sonni 16-likda yoz.");
      const g = amal16.groups(task.bits);
      return sanoqUi.digitTries({
        answer: task.answer,
        base: 16,
        maxLen: 2,
        hint: () => {
          common.add(el, common.line(`4 tadan: ${g.join(" | ")}`), amal16Ui.tetradTable());
          ui.bubble("elder", "↻ Har guruhni jadvaldan top.");
        },
        solution: () => common.add(el, common.answerLine(g.map((x) => `${x} → ${S.toBase(S.fromBase(x, 2), 16)}`).join(", "))),
      });
    }
    if (task.type === "hex2bin") {
      el.append(ui.h("div", { class: "big-value", text: S.fmt(task.hex, 16) }));
      ui.bubble("elder", "Bu sonni ikkilikda yoz.");
      return sanoqUi.digitTries({
        answer: task.answer,
        base: 2,
        maxLen: 8,
        hint: () => {
          common.add(el, amal16Ui.tetradTable([...task.hex]));
          ui.bubble("elder", "↻ Har raqam — 4 ta bit. Jadvaldan top.");
        },
        solution: () => common.add(el, common.answerLine([...task.hex].map((ch) => `${ch} → ${S.toBase(S.digitValue(ch), 2).padStart(4, "0")}`).join(", "))),
      });
    }
    el.append(ui.h("div", { class: "big-value", text: task.code }));
    ui.bubble("elder", "Bu qaysi rang?");
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        task.options.forEach((o, i) => row.append(ui.h("button", {
          class: "btn secondary color-btn", type: "button", style: `background:${o.code}`, "aria-label": o.name,
          onClick: () => { sound.play("tap"); submit(i); },
        })));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (value) => value === task.answer,
      hint: () => {
        common.add(el, amal16Ui.swatch(task.code).querySelector(".sw-info"));
        ui.bubble("elder", "↻ Qaysi chiroq FF — toʻliq yoniq, qaysi biri 00 — oʻchiq?");
      },
      solution: () => common.add(el, common.answerLine(`${task.code} — ${task.options[task.answer].name}`)),
    });
  }

  function praise(task) {
    if (task.type === "bin2hex") return `${S.fmt(task.bits, 2)} = ${S.fmt(task.answer, 16)}.`;
    if (task.type === "hex2bin") return `${S.fmt(task.hex, 16)} = ${S.fmt(task.answer, 2)}.`;
    return `${task.code} — ${task.options[task.answer].name}.`;
  }

  async function stage1() {
    await tetrads();
    await binToHex();
    await hexToBin();
    await colors();
    await ui.say("elder", "Endi oʻzing: 2 ↔ 16 va ranglar. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => amal16.makeConvTask(prev),
      run: convTask,
      praise,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
