// Kirish va 1-bosqich: kattadan boshlab (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, qop, ui, sound, art, qopUi, sanoqUi, practice, common } = QK;
  const S = sanoq;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.apples() }));
    await ui.say("elder", "Oldingi oʻyinda istalgan sonni oʻnlikka oʻtkazding.");
    await ui.say("apprentice", "Teskarisi-chi? 13 ni ikkilikda qanday yozaman?");
    await ui.say("elder", "Ikki usul bor. Kel, tangalar va olmalar bilan koʻramiz.");
  }

  // 4.1: har tanga uchun — sig'adimi?
  async function greedy() {
    const n = 13;
    const steps = qop.greedySteps(n);
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: `${n} → 2-lik` }));
    const row = qopUi.coinRow(el, steps);
    const left = common.line(`Qoldi: ${n}`);
    const answer = common.line("Javob: …", "ans");
    el.append(left, answer);
    let digits = "";
    for (let k = 0; k < steps.length; k++) {
      const s = steps[k];
      row.focus(k);
      ui.bubble("elder", `${s.coin} sigʻadimi? Qoldi: ${s.left}.`);
      await ui.settle((done) => {
        const choose = (fits) => {
          if (fits !== s.fits) {
            sound.play("retry");
            ui.pose("apprentice", "think", 900);
            ui.bubble("elder", `↻ Solishtir: qoldi ${s.left}, tanga ${s.coin}.`);
            return;
          }
          sound.play("tap");
          ui.clearControl();
          done();
        };
        const buttons = ui.h("div", { class: "choice-row" });
        buttons.append(ui.button("Sigʻadi (1)", () => choose(true)), ui.button("Sigʻmaydi (0)", () => choose(false), "secondary"));
        ui.clearControl();
        ui.control().append(buttons);
      });
      digits += s.fits ? "1" : "0";
      row.set(k, s.fits ? "1" : "0");
      left.textContent = `Qoldi: ${s.fits ? s.left - s.coin : s.left}`;
      answer.textContent = `Javob: ${digits}`;
    }
    row.focus(-1);
    sound.play("correct");
    await ui.say("elder", `13 = 8 + 4 + 1. Demak, 13 = ${S.fmt(digits, 2)}!`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["eng katta sigʻadigan tangadan boshla", "sigʻdi — 1, sigʻmadi — 0", "13 = 8 + 4 + 1 → 1101₂"]);
    await ui.say("elder", "Kattadan boshlaymiz: tanga sigʻsa — 1, sigʻmasa — 0.");
  }

  // 4.3: mashq — o'nlik → ikkilik
  function greedyTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: `${task.n} → 2-lik` }));
    ui.bubble("elder", "Bu sonni ikkilikda yoz.");
    return sanoqUi.digitTries({
      answer: task.answer,
      base: 2,
      maxLen: 7,
      hint: () => {
        const coins = qop.greedySteps(task.n).map((s) => ({ coin: s.coin }));
        common.add(el, ui.h("div", { class: "hint-coins" }, ...coins.map((c) => ui.h("span", { class: "qcoin", text: String(c.coin) }))));
        ui.bubble("elder", "↻ Eng katta sigʻadigan tangadan boshla.");
      },
      solution: () => {
        const parts = qop.greedySteps(task.n).filter((s) => s.fits).map((s) => s.coin);
        common.add(el, common.answerLine(`${parts.join(" + ")} = ${task.n} → ${S.fmt(task.answer, 2)}`));
      },
    });
  }

  async function stage1() {
    await greedy();
    await definition();
    await ui.say("elder", "Endi oʻzing: oʻnlikdan ikkilikka. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => qop.makeGreedyTask(prev),
      run: greedyTask,
      praise: (task) => `${task.n} = ${S.fmt(task.answer, 2)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
