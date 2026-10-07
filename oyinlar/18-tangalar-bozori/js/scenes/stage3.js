// 3-bosqich: 16-likdan o'nlikka va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, bozor, ui, sound, art, bozorUi, practice, common } = QK;
  const S = sanoq;

  const SCENES = [
    { art: "paint", lines: ["Qayerda uchraydi: rang kodi #FF8800 — R = FF = 255, G = 88 = 136, B = 00 = 0.", "Bitta bayt (8 bit) aynan 2 ta 16-lik raqamga sigʻadi — shuning uchun dasturchilar 16-likni yaxshi koʻradi."] },
    { art: "arrows", lines: ["Teskari yoʻl — oʻnlikdan istalgan tizimga — «Qoplarga joylash» oʻyinida."] },
  ];

  // 6.1: bola harfni bosadi — u songa aylanadi, keyin yoyib yoziladi
  async function letters() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt("C8", 16) }), bozorUi.hexStrip());
    ui.bubble("elder", "16-likda 16 ta raqam kerak: 0–9 va A–F. C ni bos — u nechaga teng?");
    await ui.settle((done) => {
      const card = ui.h("button", { class: "letter-card", type: "button", text: "C" });
      const row = ui.h("div", { class: "letter-row" }, card, ui.h("span", { class: "letter-rest", text: "8" }));
      el.append(row);
      card.addEventListener("click", () => {
        if (card.classList.contains("flipped")) return;
        card.classList.add("flipped");
        card.textContent = "12";
        sound.play("correct");
        done();
      });
    });
    common.add(el, bozorUi.placed("C8", 16, { values: true }));
    await ui.say("elder", "C = 12. Vaznlar: 16¹ = 16 va 16⁰ = 1.");
    common.add(el, common.answerLine(`${bozor.expandText("C8", 16)} = 200`));
    await ui.say("elder", "12·16 + 8 = 200, yaʼni C8₁₆ = 200₁₀.");
    common.add(el, common.answerLine(`FF₁₆ = ${bozor.expandText("FF", 16)} = 255`));
    await ui.say("elder", "FF₁₆ = 255 — ikki xonali eng katta 16-lik son, bir baytning eng katta qiymati.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(bozorUi.hexStrip());
    common.formula(el, ["1) harf → son (A = 10 … F = 15)", "2) raqam × vazn (…, 256, 16, 1)", "3) yigʻindi"]);
    await ui.say("elder", "Usul oʻsha: faqat raqamlar orasida harflar bor. Uch xonali sonda vaznlar 256, 16, 1.");
  }

  // 6.3: mashq — 16-lik son → o'nlik
  function hexTask(task) {
    const el = common.box(true);
    // A–F qatori faqat birinchi javoblarda (tier 0) ko'rinadi; keyin yashirin — maslahat qaytaradi
    if (!task.tier) el.append(bozorUi.hexStrip());
    el.append(ui.h("div", { class: "big-value", text: S.fmt(task.number, 16) }));
    ui.bubble("elder", "Oʻnlikda nechaga teng?");
    return practice.numberTries({
      answer: task.answer,
      maxLen: 4,
      hint: () => {
        if (task.tier) el.prepend(bozorUi.hexStrip());
        common.add(el, bozorUi.placed(task.number, 16, { values: true }));
        ui.bubble("elder", "↻ Harflar songa aylantirildi. Endi raqam × vazn.");
      },
      solution: () => common.add(el, common.answerLine(`${bozor.expandText(task.number, 16)} = ${task.answer}`)),
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await letters();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta 16-lik son. A–F jadvali faqat birinchi misolda koʻrinadi.`);
    await practice.exercises({
      next: (prev, correct, tier) => bozor.makeHexTask(prev, undefined, tier),
      run: hexTask,
      praise: (task) => `${S.fmt(task.number, 16)} = ${task.answer}.`,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
