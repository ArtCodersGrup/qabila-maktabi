// 3-bosqich: 16-lik va 8-likka, teskari tekshirish, hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, qop, ui, art, sanoqUi, practice, common, qopScenes } = QK;
  const S = sanoq;

  const SCENES = [
    { art: "convert", lines: ["Kompyuter ham har kuni shunday aylantiradi.", "Sen yozgan 13 ni u ichida 1101 qilib saqlaydi."] },
    { art: "plus", lines: ["Keyingi oʻyinda — ikkilikda qoʻshish, ayirish va koʻpaytirish!"] },
  ];

  const expandText = (s, b) => S.expand(s, b).map((d) => `${d.value}·${d.place}`).join(" + ");

  // 6.1: 200 → C8₁₆ va tekshirish
  async function hexDemo() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: "200 → 16-lik" }));
    ui.bubble("elder", "200 ni 16-likka oʻtkazamiz. «Boʻl»ni bos!");
    await qopScenes.divideAndRead(el, 200, 16, [
      "200 : 16 = 12, qoldiq 8.",
      "12 : 16 = 0, qoldiq 12 — bu bitta raqam: C!",
    ]);
    common.add(el, common.answerLine(`Tekshiramiz: C8₁₆ = ${expandText("C8", 16)} = 200 ✓`));
    await ui.say("elder", "Teskari yoʻl bilan tekshirish — eng ishonchli usul.");
  }

  // 6.2: mashq — 16-lik, 8-lik, "to'g'ri yozuvni tanla" (4 variant)
  function anyTask(task) {
    const el = common.box(true);
    if (task.type !== "choose") {
      el.append(ui.h("div", { class: "big-value", text: `${task.n} → ${task.base}-lik` }));
      ui.bubble("elder", `Bu sonni ${task.base}-likda yoz.`);
      return sanoqUi.digitTries({
        answer: task.answer,
        base: task.base,
        maxLen: 4,
        hint: () => {
          common.add(el, qopScenes.firstStep(task));
          ui.bubble("elder", "↻ Qoldiq 10 dan katta boʻlsa — harf bilan yoz.");
        },
        solution: () => qopScenes.solutionTable(el, task),
      });
    }
    // 4 variantdan to'g'ri yozuvni tanlash: biri — qoldiqlar teskari o'qilgan, biri — bitta raqami xato
    el.append(ui.h("div", { class: "big-value", text: `${task.n} → ${task.base}-lik` }));
    ui.bubble("elder", "Toʻrtta javobdan faqat bittasi toʻgʻri. Qaysi biri?");
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        task.options.forEach((o) => row.append(ui.button(S.fmt(o, task.base), () => submit(o))));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (value) => value === task.answer,
      hint: () => {
        common.add(el, common.line(`Xonalar: ${S.places(task.base, task.answer.length).reverse().join(", ")} — raqam × xona qiymati`));
        ui.bubble("elder", "↻ Har javobni oʻnlikka qaytarib tekshir.");
      },
      solution: (value) => {
        const lines = [common.answerLine(`${S.fmt(task.answer, task.base)} = ${expandText(task.answer, task.base)} = ${task.n} ✓`)];
        if (value === task.reversed) lines.unshift(common.line(`${S.fmt(value, task.base)} = ${S.fromBase(value, task.base)} — qoldiqlar teskari oʻqilgan`));
        common.add(el, ...lines);
      },
    });
  }

  function praise(task) {
    if (task.type === "choose") return `Tekshirdik: ${S.fmt(task.answer, task.base)} = ${task.n}.`;
    return `${task.n} = ${S.fmt(task.answer, task.base)}.`;
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await hexDemo();
    await ui.say("elder", `Endi oʻzing: 16-lik, 8-lik va toʻgʻri javobni tanlash. ${QK.practice.need()} ta toʻgʻri javob!`);
    await practice.exercises({
      next: (prev, correct, tier) => qop.makeAnyTask(prev, undefined, tier),
      run: anyTask,
      praise,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
