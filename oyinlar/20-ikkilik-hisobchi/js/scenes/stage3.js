// 3-bosqich: ikkilikda ko'paytirish — surish va qo'shish, hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, amal2, ui, sound, art, sanoqUi, practice, common } = QK;
  const S = sanoq;
  const b2 = (s) => S.fmt(s, 2);

  const SCENES = [
    { art: "cpu", lines: ["Protsessor sekundiga milliardlab shunday qoʻshadi — faqat 0 va 1 bilan."] },
    { art: "hex", lines: ["Keyingi oʻyinda — 16-lik: harfli raqamlar bilan hisob!"] },
  ];

  // 6.1: × 10₂ — oxiriga 0
  async function shift() {
    let s = "101";
    const el = common.box(true);
    const big = ui.h("div", { class: "big-value" });
    const show = () => { big.textContent = `${b2(s)} = ${S.fromBase(s, 2)}`; };
    show();
    el.append(big);
    ui.bubble("elder", "Oʻnlikda × 10 — oxiriga 0 qoʻshiladi. Ikkilikda × 10₂ ni bosib koʻr!");
    await ui.settle((done) => {
      let k = 0;
      ui.control().append(ui.button("× 10₂", () => {
        if (k >= 2) return;
        s += "0";
        k++;
        sound.play("tap");
        show();
        if (k === 2) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", "101₂ → 1010₂ → 10100₂: 5 → 10 → 20. Har gal oxiriga 0 — ikki baravar!");
  }

  const mulRows = (a, b) => {
    const m = S.mulBinary(a, b);
    return { m, rows: m.rows.map((r, k) => ({ text: (k ? "+ " : "") + r })) };
  };

  // 6.2: 101 × 11 — qatorlar birma-bir
  async function columns() {
    const a = "101";
    const b = "11";
    const { m } = mulRows(a, b);
    const el = common.box(true);
    const host = ui.h("div", { class: "mb-host" });
    el.append(host);
    const shown = [{ text: a }, { text: "× " + b }, { cls: "line" }];
    host.replaceChildren(common.mulBlock(shown));
    const texts = [
      "Koʻpaytuvchining oxirgi raqami 1 — sonni oʻzini yozamiz: 101.",
      "Keyingi raqam ham 1 — sonni bir xona chapga surib yozamiz: 1010.",
      "Endi qatorlarni qoʻshamiz: 101 + 1010 = 1111.",
    ];
    ui.bubble("elder", "101₂ × 11₂ ni ustunda koʻpaytiramiz. «Keyingi qator»ni bos!");
    await ui.settle((done) => {
      let k = 0;
      ui.control().append(ui.button("Keyingi qator ▶︎", () => {
        if (k < m.rows.length) shown.push({ text: (k ? "+ " : "") + m.rows[k] });
        else shown.push({ cls: "line" }, { text: m.result, cls: "sum" });
        host.replaceChildren(common.mulBlock(shown));
        sound.play("tap");
        ui.bubble("elder", texts[k]);
        k++;
        if (k > m.rows.length) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    await ui.say("elder", texts[2]);
    await ui.say("elder", "Tekshiramiz: 5 × 3 = 15 = 1111₂ ✓. Ikkilikda jadval kerak emas: 1 — sonni yoz, 0 — nol.");
  }

  // 6.3: mashq — surish yoki ko'paytirish
  function mulTask(task) {
    const el = common.box(true);
    const host = ui.h("div", { class: "mb-host" });
    el.append(host);
    host.replaceChildren(common.mulBlock([{ text: task.a }, { text: "× " + task.b }, { cls: "line" }]));
    ui.bubble("elder", "Koʻpaytir! Javobni tugmalar bilan yoz.");
    const x = S.fromBase(task.a, 2);
    const y = S.fromBase(task.b, 2);
    const { m } = mulRows(task.a, task.b);
    const full = () => [{ text: task.a }, { text: "× " + task.b }, { cls: "line" },
      ...m.rows.map((r, k) => ({ text: (k ? "+ " : "") + r })), { cls: "line" }];
    return sanoqUi.digitTries({
      answer: task.answer,
      base: 2,
      maxLen: 9,
      hint: () => {
        if (task.type === "shift") {
          common.add(el, common.line(`${b2(task.b)} da ${task.b.length - 1} ta nol — oxiriga shuncha nol qoʻsh`));
          ui.bubble("elder", "↻ × 10₂ — bitta nol, × 100₂ — ikkita nol.");
        } else {
          host.replaceChildren(common.mulBlock(full()));
          ui.bubble("elder", "↻ Surilgan qatorlarni yozdim. Endi ularni qoʻsh.");
        }
      },
      solution: () => {
        host.replaceChildren(common.mulBlock(task.type === "shift"
          ? [{ text: task.a }, { text: "× " + task.b }, { cls: "line" }, { text: task.answer, cls: "sum" }]
          : [...full(), { text: task.answer, cls: "sum" }]));
        common.add(el, common.answerLine(`Tekshiramiz: ${x} × ${y} = ${x * y} ✓`));
      },
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
    await shift();
    await columns();
    await ui.say("elder", "Endi oʻzing koʻpaytir. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => amal2.makeMulTask(prev),
      run: mulTask,
      praise: (task) => `${b2(task.a)} × ${b2(task.b)} = ${b2(task.answer)}.`,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
