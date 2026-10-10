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
    await ui.say("elder", "Maqsad: oʻnlikdagi sonni istalgan sanoq tizimiga oʻtkazish («Tangalar bozori» oʻyinidagi yoʻlning teskarisi).");
    await ui.say("elder", "Ikki usul bor: xona vaznlarini ayirish va asosga ketma-ket boʻlish.");
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
      ui.bubble("elder", `Vazn ${s.coin} sigʻadimi? Qoldi: ${s.left}.`);
      await ui.settle((done) => {
        const choose = (fits) => {
          if (fits !== s.fits) {
            sound.play("retry");
            ui.pose("apprentice", "think", 900);
            ui.bubble("elder", `↻ Solishtir: qoldi ${s.left}, vazn ${s.coin}.`);
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
    await ui.say("elder", `13 = 8 + 4 + 1, yaʼni 13₁₀ = ${S.fmt(digits, 2)}.`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["vaznlar: …, 8, 4, 2, 1 — kattasidan boshla", "sigʻdi — 1 (ayir), sigʻmadi — 0", "13 = 8 + 4 + 1 → 1101₂"]);
    await ui.say("elder", "1-usul: eng katta vazndan boshlab, sigʻsa — 1 yozib ayiramiz, sigʻmasa — 0.");
  }

  // 4.3: mashq — o'nlik → ikkilik
  function greedyTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: `${task.n} → 2-lik` }));
    ui.bubble("elder", "Ikkilikda yoz.");
    return sanoqUi.digitTries({
      answer: task.answer,
      base: 2,
      maxLen: 8,
      hint: () => {
        const coins = qop.greedySteps(task.n).map((s) => ({ coin: s.coin }));
        common.add(el, ui.h("div", { class: "hint-coins" }, ...coins.map((c) => ui.h("span", { class: "qcoin", text: String(c.coin) }))));
        ui.bubble("elder", "↻ Vaznlarni yozib qoʻydim. Eng katta sigʻadiganidan boshla.");
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
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta son — oʻnlikdan ikkilikka.`);
    await practice.exercises({
      next: (prev, correct, tier) => qop.makeGreedyTask(prev, undefined, tier),
      run: greedyTask,
      praise: (task) => `${task.n} = ${S.fmt(task.answer, 2)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
