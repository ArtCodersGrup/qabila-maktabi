// 3-bosqich: rangli chiroqlar, nechta chiroq kerak, hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, art, common } = QK;

  // Hikoya: art — rasm (QK.art.story), caption — rasm ostidagi yozuv, lines — Oqsoqol gaplari
  const SCENES = [
    { art: "bits", caption: "1 0 1 1 0 1", lines: ["Kompyuterda millionlab juda kichik «chiroqlar» bor — ular bit deyiladi.", "Yoqilgan — 1, oʻchgan — 0."] },
    { art: "byte", caption: "8 bit = 1 bayt", lines: ["8 ta bit — 1 bayt.", "U 256 xil boʻladi: 2 ni 8 marta koʻpaytiramiz."] },
    { art: "pixel", lines: ["Ekrandagi har bir nuqta — 3 ta kichik chiroq: qizil, yashil va koʻk."] },
    { art: "screen", lines: ["Har biri 256 xil yorugʻlikda yonadi.", "Shuning uchun ekran millionlab rangni koʻrsata oladi!"] },
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
    await ui.say("elder", "Holatlar sonini chiroqlar sonicha koʻpaytiramiz.");
    await ui.say("elder", "Holat koʻp boʻlsa — chiroq kam kerak.");
  }

  // 1-xato maslahati: 1, 2, 3… ta chiroq naqshlari (belgisiz)
  function hintRows(q) {
    const max = q.states === lamps.PLAIN ? 6 : 4;
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
    return common.numberTries({
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
    ui.bubble("elder", "Qabilaga rangli chiroqlar keldi: oʻchiq, sariq, koʻk — 3 xil! 2 ta chiroq bilan hamma naqshni top.");
    await common.findAll({ count: 2, states: lamps.COLOR });
    await ui.say("elder", `2 ta rangli chiroq — 9 ta naqsh: 3 × 3 = 3${ui.sup(2)}.`);
    await explain();
    await ui.say("elder", "Endi hisoblaymiz: nechta chiroq kerak? 3 ta toʻgʻri javob!");
    await common.exercises({
      next: (prev) => lamps.makeLampsQuestion(prev),
      run: lampsTask,
      praise: (q) => `${q.answer} ta chiroq yetadi.`,
    });
    for (const sc of SCENES) await showScene(sc);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
