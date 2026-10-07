// Kirish va 1-bosqich: 2-likdan o'nlikka (DIZAYN 3, 4-bo'limlar).
// 2026-10-07: 5–8 ohangidagi NAMUNA — hikoya o'rniga maqsad, aniq atamalar (asos, xona vazni), shogird savollarisiz.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, bozor, ui, sound, art, bozorUi, practice, common } = QK;
  const S = sanoq;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.market() }));
    await ui.say("elder", "Maqsad: istalgan sanoq tizimidagi sonni oʻnlikka oʻtkazish.");
    await ui.say("elder", "Kalit gʻoya: har xonaning oʻz vazni bor — xuddi tangalardek. Son = raqamlar × vaznlar yigʻindisi.");
  }

  // 4.1: bola 1 turgan xonalardagi tangalarni oladi
  async function coins() {
    const number = "1011";
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(number, 2) }));
    ui.bubble("elder", "Ikkilikda xona vaznlari: 8, 4, 2, 1. Raqami 1 boʻlgan xonalar tangasini yigʻ.");
    const total = await bozorUi.collect(el, number, 2, (text) => ui.bubble("elder", text));
    sound.play("correct");
    await ui.say("elder", `8 + 2 + 1 = ${total}, yaʼni ${S.fmt(number, 2)} = ${total}₁₀.`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, [`1011₂ = ${bozor.expandText("1011", 2)} = 11`, "k-xona vazni = asosᵏ: 2³, 2², 2¹, 2⁰"]);
    await ui.say("elder", "Pozitsion tizimda raqamning qiymati turgan joyiga bogʻliq: oʻngdan k-xonaning vazni — asosᵏ.");
    await ui.say("elder", "Ikkilikda raqam faqat 0 yoki 1, shuning uchun 1 turgan xonalar vaznini qoʻshish kifoya.");
  }

  // 4.3: mashq — ikkilik son → o'nlik
  function binTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt(task.number, 2) }));
    ui.bubble("elder", "Oʻnlikda nechaga teng?");
    return practice.numberTries({
      answer: task.answer,
      maxLen: 4,
      hint: () => {
        common.add(el, bozorUi.placed(task.number, 2));
        ui.bubble("elder", "↻ Vaznlarni yozib qoʻydim. 1 turganlarini qoʻsh.");
      },
      solution: () => common.add(el, common.answerLine(bozor.sumText(task.number, 2))),
    });
  }

  async function stage1() {
    await coins();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta ikkilik son. Yodda hisobla; kerak boʻlsa qogʻoz ol.`);
    await practice.exercises({
      next: (prev, correct, tier) => bozor.makeBinTask(prev, undefined, tier),
      run: binTask,
      praise: (task) => `${S.fmt(task.number, 2)} = ${task.answer}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
