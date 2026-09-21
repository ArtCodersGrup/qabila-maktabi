// 3-bosqich: kilobayt va hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { bytes, ui, sound, art, bytesUi, practice, common } = QK;

  const SCENES = [
    { art: "sms", lines: ["Qisqa SMS — 100 baytga yaqin.", "Bir sahifa kitob — 2 Kbayt atrofida."] },
    { art: "book", lines: ["Qalin kitob — 1000 Kbaytdan ham koʻp!", "Bunday sonlar uchun yanada katta birlik bor — keyingi oʻyinlarda."] },
    { art: "emoji", lines: ["Aslida baʼzi belgilar koʻproq joy oladi.", "Oʻ harfidagi ʻ belgisi — 2 bayt, kulgich (emoji) — 4 bayt."] },
  ];

  // 7.1: bola 1 ni 10 marta ikkilantiradi
  async function doubling() {
    const el = common.box(true);
    const steps = bytes.doublings();
    const big = ui.h("div", { class: "dbl-num", "aria-live": "polite", text: "1" });
    const chain = common.line("1");
    const times = common.line("Ikkilantirish: 0 marta", "muted");
    el.append(big, chain, times);
    ui.bubble("elder", "1 dan boshlaymiz. «× 2» ni bosib, sonni ikkilantir!");

    await ui.settle((done) => {
      let k = 0;
      ui.control().append(ui.button("× 2", () => {
        if (k >= steps.length - 1) return;
        k++;
        big.textContent = String(steps[k]);
        big.classList.remove("pop");
        void big.offsetWidth;
        big.classList.add("pop");
        chain.textContent = steps.slice(0, k + 1).join(" → ");
        times.textContent = `Ikkilantirish: ${k} marta`;
        if (steps[k] === 256) ui.bubble("elder", "256 — bitta baytdagi naqshlar soni! Davom et.");
        if (k === steps.length - 1) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", "10 marta ikkilantirding — 1024 chiqdi. Bu 1000 ga juda yaqin!");
    await ui.say("elder", "Shuning uchun 1024 bayt kilobayt deyiladi. «Kilo» — ming degani.");
  }

  // 7.2: kilobayt qutisi to'ladi
  async function kbFill() {
    const el = common.box(true);
    const count = common.line("0 bayt");
    const box = bytesUi.kbBox(el, (n) => { count.textContent = `${n} bayt`; });
    el.append(count);
    ui.bubble("elder", "Bu qutida 1024 ta katak — har biri 1 bayt. «Toʻldir»ni bos!");
    await common.waitButton("Toʻldir");
    await box.fill();
    sound.play("correct");
    el.append(common.answerLine("1024 bayt = 1 Kbayt"));
    await ui.say("elder", "1024 ta bayt — 1 kilobayt. Qisqasi: 1 Kbayt.");
  }

  // 7.3: ta'rif
  async function definition() {
    const el = common.box(false);
    el.append(bytesUi.pages(1, false));
    common.formula(el, ["1 Kbayt = 1024 bayt", "1 sahifa ≈ 2 Kbayt"]);
    await ui.say("elder", "Bir sahifa kitobda taxminan 2000 ta belgi bor.");
    await ui.say("elder", "Demak, bir sahifa — 2 Kbaytga yaqin.");
  }

  // "Qaysi biri katta?" tugmalari
  function compareButtons(task, submit) {
    const row = ui.h("div", { class: "choice-row" });
    row.append(ui.button(`${task.kb} Kbayt`, () => submit("kb")));
    row.append(ui.button(`${task.bytes} bayt`, () => submit("bytes")));
    ui.clearControl();
    ui.control().append(row);
  }

  // 7.4: mashq — sahifalar, bayt → Kbayt, taqqoslash
  function kbTask(task) {
    const el = common.box(true);
    if (task.type === "pages") {
      const view = ui.h("div", { class: "task-view" }, bytesUi.pages(task.pages, false));
      el.append(view);
      ui.bubble("elder", `Bir sahifa — 2 Kbayt deb olamiz. ${task.pages} sahifa — necha Kbayt?`);
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          view.replaceChildren(bytesUi.pages(task.pages, true));
          el.append(common.line(Array(task.pages).fill("2").join(" + ") + " = ?"));
          ui.bubble("elder", "↻ Har sahifa ostida 2 Kbayt. Hammasini qoʻsh.");
        },
        solution: () => el.append(common.answerLine(`${task.pages} × 2 = ${task.answer} Kbayt`)),
      });
    }
    if (task.type === "toKb") {
      el.append(ui.h("div", { class: "big-value", text: `${task.bytes} bayt` }));
      ui.bubble("elder", `${task.bytes} bayt — necha Kbayt?`);
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          const table = ui.h("div", { class: "kb-table" });
          for (let k = 1; k <= 6; k++) table.append(ui.h("div", { text: `${k} Kbayt = ${k * bytes.KB} bayt` }));
          el.append(table);
          ui.bubble("elder", "↻ Jadvaldan shu sonni top.");
        },
        solution: () => el.append(common.answerLine(`${task.answer} × 1024 = ${task.bytes} → ${task.answer} Kbayt`)),
      });
    }
    const kbBytes = task.kb * bytes.KB;
    el.append(ui.h("div", { class: "cmp" },
      ui.h("div", { class: "cmp-card", text: `${task.kb} Kbayt` }),
      ui.h("div", { class: "cmp-or", text: "yoki" }),
      ui.h("div", { class: "cmp-card", text: `${task.bytes} bayt` })));
    ui.bubble("elder", "Qaysi biri katta?");
    return practice.tries({
      setup: (submit) => compareButtons(task, submit),
      check: (value) => value === task.answer,
      hint: () => {
        el.append(common.line(`${task.kb} Kbayt = ${task.kb} × 1024 = ${kbBytes} bayt`));
        ui.bubble("elder", "↻ Ikkalasini baytda solishtir.");
      },
      solution: () => {
        const sign = kbBytes > task.bytes ? ">" : "<";
        el.append(common.answerLine(`${kbBytes} bayt ${sign} ${task.bytes} bayt`));
      },
    });
  }

  function praise(task) {
    if (task.type === "pages") return `${task.pages} sahifa ≈ ${task.answer} Kbayt.`;
    if (task.type === "toKb") return `${task.bytes} bayt = ${task.answer} Kbayt.`;
    return `${task.kb} Kbayt = ${task.kb * bytes.KB} bayt.`;
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await doubling();
    await kbFill();
    await definition();
    await ui.say("elder", "Endi oʻzing hisobla: kilobaytlar. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => bytes.makeKbTask(prev),
      run: kbTask,
      praise,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
