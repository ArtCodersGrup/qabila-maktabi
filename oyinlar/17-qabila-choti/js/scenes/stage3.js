// 3-bosqich: xona qiymatlari, tizim turlari va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, tizim, ui, sound, art, practice, common } = QK;
  const S = sanoq;

  const BUILDS = [
    { base: 2, count: 5, start: "2-likda xonalar: 1 dan boshlab, har gal 2 ga koʻpaytir!", end: "2-lik xonalar: 16, 8, 4, 2, 1 — 5-oʻyindagi chiroqlarni esla!" },
    { base: 8, count: 3, start: "Endi 8-lik: har gal 8 ga koʻpaytir!", end: "8-lik xonalar: 64, 8, 1." },
    { base: 16, count: 3, start: "16-lik: har gal 16 ga koʻpaytir!", end: "16-lik xonalar: 256, 16, 1." },
  ];

  // Xona qutilari: o'ngda 1, chapga qarab kattalashadi
  function placeRow(values) {
    const row = ui.h("div", { class: "places" });
    values.forEach((v) => row.append(ui.h("span", { class: "place-box", text: String(v) })));
    return row;
  }

  // 6.1: bola "× n" bilan xonalarni yasaydi
  async function build(run) {
    const el = common.box(true);
    const title = ui.h("div", { class: "big-value", text: `${run.base}-lik` });
    const host = ui.h("div", { class: "places-host" });
    el.append(title, host);
    const values = [1];
    host.replaceChildren(placeRow(values));
    ui.bubble("elder", run.start);
    await ui.settle((done) => {
      ui.control().append(ui.button(`× ${run.base}`, () => {
        if (values.length >= run.count) return;
        values.push(values[values.length - 1] * run.base);
        host.replaceChildren(placeRow(values));
        sound.play("tap");
        if (values.length === run.count) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", run.end);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["xonalar: 1, n, n·n, n·n·n …", "10-lik: 1, 10, 100, 1000"]);
    await ui.say("elder", "Har keyingi xona oldingisidan asos marta katta.");
    await ui.say("elder", "10-likda ham shunday: 1, 10, 100, 1000 — tanish-ku!");
  }

  // Son ustida xona qiymatlari (maslahat uchun)
  function numberWithPlaces(number, base) {
    const grid = ui.h("div", { class: "nplaces", style: `grid-template-columns: repeat(${number.length}, auto)` });
    S.expand(number, base).forEach((d) => grid.append(ui.h("span", { class: "np-place", text: String(d.place) })));
    [...number].forEach((ch) => grid.append(ui.h("span", { class: "np-digit", text: ch })));
    return grid;
  }

  // 6.3: mashq — xona qiymati / raqam turgan xona / tizim turi
  function placeTask(task) {
    const el = common.box(true);
    if (task.type === "place") {
      el.append(ui.h("div", { class: "facts" },
        ui.h("div", { text: `Tizim: ${task.base}-lik` }),
        ui.h("div", { text: `Xona: oʻngdan ${task.k}-xona` })));
      ui.bubble("elder", "Bu xonaning qiymati nechaga teng?");
      const list = S.places(task.base, task.k);
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line(`1, ${task.base}, … — har gal ${task.base} ga koʻpaytir`));
          ui.bubble("elder", "↻ Birlar xonasidan boshlab koʻpaytirib bor.");
        },
        solution: () => {
          el.append(placeRow(list));
          common.add(el, common.answerLine(`${task.k}-xona: ${task.answer}`));
        },
      });
    }
    if (task.type === "digitPlace") {
      el.append(ui.h("div", { class: "facts" },
        ui.h("div", { text: `Son: ${S.fmt(task.number, task.base)}` }),
        ui.h("div", { text: `Raqam: ${task.digit}` })));
      ui.bubble("elder", "Bu raqam turgan xonaning qiymati nechaga teng?");
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, numberWithPlaces(task.number, task.base));
          ui.bubble("elder", "↻ Har raqam ustida uning xona qiymati.");
        },
        solution: () => common.add(el, common.answerLine(`${task.digit} — ${task.answer} lar xonasida`)),
      });
    }
    el.append(ui.h("div", { class: "big-value", text: task.text }));
    ui.bubble("elder", "Bu qaysi turdagi tizim?");
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        row.append(ui.button("Pozitsion", () => submit("poz")), ui.button("Nopozitsion", () => submit("nopoz")));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (value) => value === task.answer,
      hint: () => ui.bubble("elder", "↻ Raqam qiymati turgan joyiga bogʻliqmi?"),
      solution: () => common.add(el, common.answerLine(`${task.why} — ${task.answer === "poz" ? "pozitsion" : "nopozitsion"}`)),
    });
  }

  function praise(task) {
    if (task.type === "place") return `${task.base}-likda ${task.k}-xona — ${task.answer}.`;
    if (task.type === "digitPlace") return `${task.digit} — ${task.answer} lar xonasida.`;
    return task.answer === "poz" ? "Pozitsion: joyi muhim." : "Nopozitsion: belgi qiymati oʻzgarmaydi.";
  }

  const SCENES = [
    { art: "chip", lines: ["Kompyuter 2-likda ishlaydi: har xona — bitta chiroq.", "Yoniq — 1, oʻchiq — 0."] },
    { art: "coins", lines: ["Keyingi oʻyinda xona qiymatlari tangalarga aylanadi.", "Ular bilan istalgan sonni oʻnlikka oʻgiramiz!"] },
  ];

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    for (const run of BUILDS) await build(run);
    await definition();
    await ui.say("elder", "Endi oʻzing top: xonalar va tizim turlari. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => tizim.makePlaceTask(prev),
      run: placeTask,
      praise,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
