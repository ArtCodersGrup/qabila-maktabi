// 2-bosqich: matnni o'lchaymiz (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { bytes, ui, sound, bytesUi, practice, common } = QK;

  const isMark = (ch) => /[.,!?]/.test(ch);

  // 6.1–6.2: bola xabar belgilarini sandiqlarga joylaydi
  async function pack() {
    const message = bytes.DEMO;
    const el = common.box(true);
    const count = common.line("Baytlar: 0");
    el.append(ui.h("div", { class: "pack-head" }, bytesUi.messageView(message, false), count));
    const slots = bytesUi.packer(el, message);
    ui.bubble("elder", "Har bir belgini bos — u oʻz sandigʻiga tushadi.");

    let packed = 0;
    let saidSpace = false;
    let saidMark = false;
    await ui.settle((done) => {
      bytesUi.charButtons(message, (k, ch) => {
        slots.fill(k);
        packed++;
        count.textContent = `Baytlar: ${packed}`;
        if (ch === " " && !saidSpace) {
          saidSpace = true;
          ui.bubble("elder", "Boʻsh joy ham belgi! U ham 1 bayt oladi.");
        } else if (isMark(ch) && !saidMark) {
          saidMark = true;
          ui.bubble("elder", "Vergul va undov ham belgi — har biri 1 bayt!");
        }
        if (packed === message.length) {
          ui.clearControl();
          done();
        }
      });
    });
    sound.play("correct");
    const n = message.length;
    await ui.say("elder", `✓ ${n} ta belgi — ${n} ta sandiq, yaʼni ${n} bayt.`);
    await ui.say("elder", `Bitda: ${n} × 8 = ${n * 8} bit.`);
  }

  // 6.3: ta'rif
  async function definition() {
    const el = common.box(false);
    el.append(bytesUi.chest("A", { code: true }));
    common.formula(el, ["belgilar soni = baytlar soni", "bitlar = baytlar × 8"]);
    await ui.say("elder", "Har bir belgi — 1 bayt: harf, raqam, boʻsh joy, nuqta — hammasi.");
    await ui.say("elder", "Har belgining oʻz naqshi bor: A — 01000001. Bu jadval ASCII deyiladi.");
  }

  // 6.4: mashq — xabar necha bayt / necha bit
  function textTask(task) {
    const el = common.box(true);
    el.append(bytesUi.messageView(task.message, false));
    const n = task.message.length;
    ui.bubble("elder", task.type === "bytes" ? "Bu xabar necha bayt?" : "Bu xabar necha bit?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, bytesUi.messageView(task.message, true));
        ui.bubble("elder", task.type === "bytes"
          ? "↻ Belgilarga ajratdim, boʻsh joy — ␣. Hammasini sana."
          : "↻ Belgilarni sana. Har belgi — 8 bit.");
      },
      solution: () => {
        common.add(el, common.answerLine(task.type === "bytes"
          ? `${n} ta belgi — ${n} bayt`
          : `${n} × 8 = ${n * 8} bit`));
      },
    });
  }

  async function stage2() {
    await pack();
    await definition();
    await ui.say("elder", "Endi oʻzing oʻlcha: xabar necha bayt yoki necha bit? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => bytes.makeTextTask(prev),
      run: textTask,
      praise: (task) => {
        const n = task.message.length;
        return task.type === "bytes" ? `${n} ta belgi — ${n} bayt.` : `${n} bayt = ${n * 8} bit.`;
      },
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
