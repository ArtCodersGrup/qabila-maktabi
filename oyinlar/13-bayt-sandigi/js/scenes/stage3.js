// 3-bosqich: kilobayt va hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { bytes, ui, sound, art, bytesUi, practice, common } = QK;

  const SCENES = [
    { art: "sms", lines: ["Qayerda uchraydi: qisqa SMS — 100 baytga yaqin, kitobning bir sahifasi — taxminan 2 Kbayt."] },
    { art: "book", lines: ["Qalin kitob — 1000 Kbaytdan ham koʻp. Undan katta birliklar — «Xotira ombori» oʻyinida."] },
    { art: "emoji", lines: ["Aniqrogʻi: zamonaviy UTF-8 kodlashda baʼzi belgilar koʻproq joy oladi. Oʻ dagi ʻ belgisi — 2 bayt, emoji — 4 bayt."] },
  ];

  // 7.1: bola 1 ni 10 marta ikkilantiradi
  async function doubling() {
    const el = common.box(true);
    const steps = bytes.doublings();
    const big = ui.h("div", { class: "dbl-num", "aria-live": "polite", text: "1" });
    const chain = common.line("1");
    const times = common.line("Ikkilantirish: 0 marta", "muted");
    el.append(big, chain, times);
    ui.bubble("elder", "1 dan boshla va «× 2» ni bosib, sonni ikkilantir.");

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
        if (steps[k] === 256) ui.bubble("elder", "256 = 2⁸ — bitta baytdagi naqshlar soni. Davom et.");
        if (k === steps.length - 1) {
          ui.clearControl();
          done();
        }
      }, "big"));
    });
    sound.play("correct");
    await ui.say("elder", "2¹⁰ = 1024 — bu 1000 ga juda yaqin.");
    await ui.say("elder", "Shuning uchun 1024 bayt kilobayt deyiladi («kilo» — ming). Kompyuterda ikkining darajasi qulay.");
  }

  // 7.2: kilobayt qutisi to'ladi
  async function kbFill() {
    const el = common.box(true);
    const count = common.line("0 bayt");
    const box = bytesUi.kbBox(el, (n) => { count.textContent = `${n} bayt`; });
    el.append(count);
    ui.bubble("elder", "Bu qutida 1024 ta katak — har biri 1 bayt. «Toʻldir»ni bos.");
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
    await ui.say("elder", "Kitobning bir sahifasida taxminan 2000 ta belgi bor.");
    await ui.say("elder", "2000 bayt ≈ 2048 bayt = 2 Kbayt, yaʼni bir sahifa ≈ 2 Kbayt.");
  }

  // "Qaysi biri eng katta?" — uch karta va "Teng" (4 variant)
  const cmpLabels = (task) => ({ kb: `${task.kb} Kbayt`, bytes: `${task.bytes} bayt`, pages: `${task.pages} sahifa`, teng: "Uchalasi teng" });

  function compareButtons(task, submit) {
    const labels = cmpLabels(task);
    const row = ui.h("div", { class: "choice-row" });
    bytes.CMP_OPTIONS.forEach((k) => row.append(ui.button(labels[k], () => submit(k), k === "teng" ? "secondary" : "")));
    ui.clearControl();
    ui.control().append(row);
  }

  // 7.4: mashq — sahifalar, bayt → Kbayt, taqqoslash
  function kbTask(task) {
    const el = common.box(true);
    if (task.type === "pages") {
      // Ko'p sahifa (tier 1–2) ekranga sig'maydi — son yoziladi
      const many = task.pages > 10;
      const view = ui.h("div", { class: "task-view" }, many
        ? ui.h("div", { class: "big-value", text: `${task.pages} sahifa` })
        : bytesUi.pages(task.pages, false));
      el.append(view);
      ui.bubble("elder", `Bir sahifa — 2 Kbayt deb olamiz. ${task.pages} sahifa — necha Kbayt?`);
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          if (!many) view.replaceChildren(bytesUi.pages(task.pages, true));
          common.add(el, common.line(many ? `${task.pages} × 2 = ?` : Array(task.pages).fill("2").join(" + ") + " = ?"));
          ui.bubble("elder", "↻ Har sahifa — 2 Kbayt. Hammasini qoʻsh.");
        },
        solution: () => common.add(el, common.answerLine(`${task.pages} × 2 = ${task.answer} Kbayt`)),
      });
    }
    if (task.type === "toKb") {
      el.append(ui.h("div", { class: "big-value", text: `${task.bytes} bayt` }));
      ui.bubble("elder", `${task.bytes} bayt — necha Kbayt?`);
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          // Maslahat — asbob: jadvalning boshi, davomini bola o'zi topadi
          const table = ui.h("div", { class: "kb-table" });
          for (let k = 1; k <= 2; k++) table.append(ui.h("div", { text: `${k} Kbayt = ${k * bytes.KB} bayt` }));
          table.append(ui.h("div", { text: "… har safar 1024 qoʻshiladi" }));
          common.add(el, table);
          ui.bubble("elder", "↻ 1024 ni necha marta qoʻshsang, shu son chiqadi?");
        },
        solution: () => common.add(el, common.answerLine(`${task.answer} × 1024 = ${task.bytes} → ${task.answer} Kbayt`)),
      });
    }
    const labels = cmpLabels(task);
    const sizes = bytes.cmpSizes(task);
    el.append(ui.h("div", { class: "cmp" },
      ui.h("div", { class: "cmp-card", text: labels.kb }),
      ui.h("div", { class: "cmp-card", text: labels.bytes }),
      ui.h("div", { class: "cmp-card", text: labels.pages })));
    ui.bubble("elder", "Qaysi biri eng katta? Uchalasi bir xil boʻlsa — «Uchalasi teng».");
    return practice.tries({
      setup: (submit) => compareButtons(task, submit),
      check: (value) => value === task.answer,
      hint: () => {
        common.add(el, common.line("1 Kbayt = 1024 bayt, 1 sahifa = 2 Kbayt"));
        ui.bubble("elder", "↻ Uchalasini ham baytga oʻtkaz, keyin solishtir.");
      },
      solution: () => {
        common.add(el,
          common.line(`${labels.kb} = ${sizes.kb} bayt; ${labels.pages} = ${task.pages * 2} Kbayt = ${sizes.pages} bayt`),
          common.answerLine(task.answer === "teng" ? `Uchalasi ham ${sizes.kb} bayt — teng` : `Eng kattasi: ${labels[task.answer]} (${sizes[task.answer]} bayt)`));
      },
    });
  }

  function praise(task) {
    if (task.type === "pages") return `${task.pages} sahifa ≈ ${task.answer} Kbayt.`;
    if (task.type === "toKb") return `${task.bytes} bayt = ${task.answer} Kbayt.`;
    return task.answer === "teng" ? `Uchalasi ham ${task.kb * bytes.KB} bayt.` : `${task.kb} Kbayt = ${task.kb * bytes.KB} bayt.`;
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
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta misol — Kbayt, bayt va sahifalar.`);
    await practice.exercises({
      next: (prev, correct, tier) => bytes.makeKbTask(prev, undefined, tier),
      run: kbTask,
      praise,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
