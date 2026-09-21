// 3-bosqich: 16-likdan o'nlikka va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, bozor, ui, sound, art, bozorUi, practice, common } = QK;
  const S = sanoq;

  const SCENES = [
    { art: "paint", lines: ["Rang kodi #FF8800: qizil FF = 255, yashil 88 = 136, koʻk 00 = 0.", "Shuning uchun u toʻq sariq!"] },
    { art: "arrows", lines: ["Keyingi oʻyinda — teskari yoʻl.", "Oʻnlikdagi sonni istalgan tizimga oʻtkazamiz!"] },
  ];

  // 6.1: bola harfni bosadi — u songa aylanadi, keyin yoyib yoziladi
  async function letters() {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: S.fmt("C8", 16) }), bozorUi.hexStrip());
    ui.bubble("elder", "16-likda harflar bor. C harfini bos — u qaysi songa aylanadi?");
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
    await ui.say("elder", "C = 12. Xonalar: 16 va 1.");
    common.add(el, common.answerLine(`${bozor.expandText("C8", 16)} = 200`));
    await ui.say("elder", "12·16 + 8 = 200. Demak, C8₁₆ = 200!");
    common.add(el, common.answerLine(`FF₁₆ = ${bozor.expandText("FF", 16)} = 255`));
    await ui.say("elder", "Eng katta ikki xonali 16-lik son — FF = 255. Esingdami, rang chirogʻi 0–255!");
  }

  async function definition() {
    const el = common.box(false);
    el.append(bozorUi.hexStrip());
    common.formula(el, ["1) harfni songa aylantir", "2) raqam × xona qiymati (16, 1)", "3) hammasini qoʻsh"]);
    await ui.say("elder", "Avval harfni songa aylantir, keyin xona qiymatiga koʻpaytir.");
  }

  // 6.3: mashq — 16-lik son → o'nlik (A–F qatori doim ko'rinadi)
  function hexTask(task) {
    const el = common.box(true);
    el.append(bozorUi.hexStrip(), ui.h("div", { class: "big-value", text: S.fmt(task.number, 16) }));
    ui.bubble("elder", "Bu son oʻnlikda nechaga teng?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, bozorUi.placed(task.number, 16, { values: true }));
        ui.bubble("elder", "↻ Harfni songa aylantirdim. Endi xona qiymatiga koʻpaytir.");
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
    await ui.say("elder", "Endi oʻzing: 16-likdan oʻnlikka. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => bozor.makeHexTask(prev),
      run: hexTask,
      praise: (task) => `${S.fmt(task.number, 16)} = ${task.answer}.`,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
