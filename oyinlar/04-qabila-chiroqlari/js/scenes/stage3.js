// 3-bosqich: rangli chiroqlar, nechta chiroq kerak, hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, art, common, practice } = QK;

  // Hikoya: art — rasm (QK.art.story), caption — rasm ostidagi yozuv, lines — Oqsoqol gaplari
  const SCENES = [
    { art: "bits", caption: "1 0 1 1 0 1", lines: ["Qayerda uchraydi: kompyuter xotirasi — milliardlab bit, har biri 0 yoki 1.", "Bit — xuddi chiroq: yoniq 1, oʻchiq 0."] },
    { art: "byte", caption: "8 bit = 1 bayt", lines: ["1 bayt = 8 bit.", "2⁸ = 256 xil qiymat: 0 dan 255 gacha."] },
    { art: "pixel", lines: ["Ekran pikseli — 3 ta subpiksel: qizil (R), yashil (G), koʻk (B)."] },
    { art: "screen", lines: ["Har subpikselga 1 bayt: 256 daraja yorugʻlik.", "Jami 256³ ≈ 16,7 million rang."] },
  ];

  // 7.2: ta'rif — oddiy va rangli chiroqlar naqshlari
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const row = (states) => [1, 2, 3, 4].map((n) => lamps.count(states, n)).join(", ");
    ui.work().append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "1, 2, 3, 4 ta chiroq:" }),
      ui.h("div", { class: "formula-row", text: `Oddiy: ${row(lamps.PLAIN)}` }),
      ui.h("div", { class: "formula-row", text: `Rangli: ${row(lamps.COLOR)}` })));
    await ui.say("elder", "Umumiy qoida: k holatli n ta chiroq — kⁿ ta naqsh.");
    await ui.say("elder", "Holat koʻp boʻlsa, oʻsha xabarlar uchun chiroq kamroq kerak.");
  }

  // 1-xato maslahati: 1, 2, 3… ta chiroq naqshlari (belgisiz)
  function hintRows(q) {
    const max = q.states === lamps.PLAIN ? 9 : 6; // eng katta narsa (365 ta kun): 9 ta oddiy yoki 6 ta rangli chiroq
    const box = ui.h("div", { class: "rows2" });
    for (let n = 1; n <= max; n++) box.append(ui.h("div", { class: "formula-row", text: `${n} ta: ${lamps.count(q.states, n)}` }));
    return box;
  }

  // 2-xato yechimi: qadamlar ✓ / — bilan
  function solutionRows(q) {
    const box = ui.h("div", { class: "formula-box" });
    for (const s of lamps.lampSteps(q.items, q.states)) {
      box.append(ui.h("div", { class: "formula-row", text: `${s.lamps} ta: ${s.count} ${s.enough ? "✓ yetadi" : "— kam"}` }));
    }
    return box;
  }

  // 7.3: nechta chiroq kerak?
  function lampsTask(q) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const kind = q.states === lamps.PLAIN ? "oddiy" : "rangli";
    ui.bubble("elder", `${q.text} uchun eng kamida nechta ${kind} chiroq kerak?`);
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    return practice.numberTries({ maxLen: 2,
      answer: q.answer,
      hint: () => {
        box.innerHTML = "";
        box.append(hintRows(q));
        ui.bubble("elder", `↻ Naqshlar soni ${q.items} yoki koʻproq boʻlgan birinchi qatorni top.`);
      },
      solution: () => {
        box.innerHTML = "";
        box.append(solutionRows(q));
        box.lastChild.lastChild.scrollIntoView({ block: "nearest" });
      },
    });
  }

  async function showScene(sc) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: art.story(sc.art) }),
      sc.caption ? ui.h("div", { class: "story-caption", text: sc.caption }) : null));
    for (const line of sc.lines) await ui.say("elder", line);
  }

  async function stage3() {
    ui.bubble("elder", "Endi chiroq 3 holatli: oʻchiq, sariq, koʻk. 2 ta chiroq bilan barcha naqshlarni top.");
    await common.findAll({ count: 2, states: lamps.COLOR });
    await ui.say("elder", `2 ta rangli chiroq — 9 ta naqsh: 3 × 3 = 3${ui.sup(2)}.`);
    await explain();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta masala — eng kamida nechta chiroq kerak. Shart: kⁿ ≥ xabarlar soni.`);
    await practice.exercises({
      next: (prev, correct, tier) => lamps.makeLampsQuestion(prev, null, tier),
      run: lampsTask,
      praise: (q) => `${q.answer} ta chiroq yetadi.`,
    });
    for (const sc of SCENES) await showScene(sc);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
