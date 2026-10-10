// 3-bosqich: xona qiymatlari, tizim turlari va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, tizim, ui, sound, art, practice, common } = QK;
  const S = sanoq;

  const BUILDS = [
    { base: 2, count: 5, start: "2-likda xona vaznlarini yasa: 1 dan boshlab har gal 2 ga koʻpaytir.", end: "2-likda vaznlar: 16, 8, 4, 2, 1 — 2⁴ … 2⁰ («Qabila chiroqlari» oʻyinidagi chiroqlar)." },
    { base: 8, count: 3, start: "8-likda: har gal 8 ga koʻpaytir.", end: "8-likda vaznlar: 64, 8, 1 — 8², 8¹, 8⁰." },
    { base: 16, count: 3, start: "16-likda: har gal 16 ga koʻpaytir.", end: "16-likda vaznlar: 256, 16, 1 — 16², 16¹, 16⁰." },
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
    common.formula(el, ["xona vaznlari: 1, b, b², b³ … (bᵏ)", "10-lik: 1, 10, 100, 1000"]);
    await ui.say("elder", "Har keyingi xonaning vazni oldingisidan b marta katta: oʻngdan 1-xona — 1, 2-xona — b, 3-xona — b².");
    await ui.say("elder", "Oʻnlikdagi birlar, oʻnlar, yuzlar, minglar — aynan 10⁰, 10¹, 10², 10³.");
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
      ui.bubble("elder", "Bu xonaning vazni nechaga teng?");
      const list = S.places(task.base, task.k);
      return practice.numberTries({
        answer: task.answer,
        maxLen: 4,
        hint: () => {
          common.add(el, common.line(`1, ${task.base}, … — har gal ${task.base} ga koʻpaytir`));
          ui.bubble("elder", "↻ 1-xona vazni 1. Har keyingisini asosga koʻpaytirib bor.");
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
      ui.bubble("elder", "Bu raqam turgan xonaning vazni nechaga teng?");
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, numberWithPlaces(task.number, task.base));
          ui.bubble("elder", "↻ Har raqam ustida uning xona vazni yozilgan.");
        },
        solution: () => common.add(el, common.answerLine(`${task.digit} — ${task.answer} lar xonasida`)),
      });
    }
    // Tizim turi: 4 yozuvdan bittasi boshqa turda — o'shani top (4 variant)
    el.append(ui.h("div", { class: "count-line", text: "Toʻrtta yozuv" }));
    ui.bubble("elder", task.ask === "nopoz"
      ? "Qaysi biri NOPOZITSION tizimda yozilgan?"
      : "Qaysi biri POZITSION tizimda yozilgan?");
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        task.options.forEach((text) => row.append(ui.button(text, () => submit(text))));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (value) => value === task.answer,
      hint: () => {
        common.add(el, common.line("Pozitsion: raqam qiymati turgan xonasiga bogʻliq. Nopozitsion: belgi har joyda bir xil"));
        ui.bubble("elder", "↻ Har yozuvda soʻra: belgi boshqa joyga koʻchsa, qiymati oʻzgaradimi?");
      },
      solution: () => common.add(el, common.answerLine(`${task.answer} — ${task.why} — ${task.ask === "poz" ? "pozitsion" : "nopozitsion"}`)),
    });
  }

  function praise(task) {
    if (task.type === "place") return `${task.base}-likda ${task.k}-xona — ${task.answer}.`;
    if (task.type === "digitPlace") return `${task.digit} — ${task.answer} lar xonasida.`;
    return task.ask === "poz" ? `${task.answer} — pozitsion: joyi muhim.` : `${task.answer} — nopozitsion: belgi qiymati oʻzgarmaydi.`;
  }

  const SCENES = [
    { art: "chip", lines: ["Qayerda uchraydi: protsessor va xotira 2-likda ishlaydi — har xona bitta tranzistor: oqim bor — 1, yoʻq — 0."] },
    { art: "coins", lines: ["Xona vaznlari bilan istalgan sonni oʻnlikka oʻtkazish — «Tangalar bozori» oʻyinida."] },
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
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — xona vazni va tizim turi.`);
    await practice.exercises({
      next: (prev, correct, tier) => tizim.makePlaceTask(prev, undefined, tier),
      run: placeTask,
      praise,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
