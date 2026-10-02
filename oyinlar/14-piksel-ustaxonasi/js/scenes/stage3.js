// 3-bosqich: haqiqiy surat — rang aralashtirish, megabayt, siqish, hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { pixels, ui, sound, art, pixelsUi, practice, common } = QK;

  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  // Katta sonlar guruhlab yoziladi: 12 000 000
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const SCENES = [
    { art: "phone", lines: [`Telefon surati siqilmasa ${pixels.PHOTO.mb} Mbayt, siqilsa — 3–4 Mbayt.`, "Telefon koʻz sezmaydigan mayda farqlarni ham tashlab yuboradi."] },
    { art: "zoom", lines: ["Rasmni juda kattalashtirsang, kataklar — piksellar koʻrinadi."] },
    { art: "film", lines: ["Rasmlar tez almashsa — video boʻladi.", "Bu keyingi oʻyinda!"] },
  ];

  // 6.1–6.2: bola qizil, yashil, ko'k chiroqlardan rang yasaydi
  async function mix() {
    const AFTER = ["Qizil va yashil — sariq boʻldi! Ekranda ranglar shunday aralashadi.", "Uchalasi yoniq — oq!"];
    for (let t = 0; t < pixels.TARGETS.length; t++) {
      const target = pixels.TARGETS[t];
      const el = common.box(true);
      ui.bubble("elder", `${cap(pixels.mixName(target))} rangni yasa! Chiroqlarni yoqib koʻr.`);
      await ui.settle((done) => {
        const m = pixelsUi.mixer(el, target, (rgb) => {
          if (rgb.join("") !== target.join("")) return;
          m.lock();
          done();
        });
      });
      sound.play("correct");
      ui.pose("apprentice", "happy", 900);
      await ui.say("elder", AFTER[t]);
    }
    await ui.say("elder", "3 ta chiroq, har biri yoniq yoki oʻchiq — 8 xil rang, yaʼni 3 bit.");
    await ui.say("elder", "Haqiqiy ekranda har chiroq 256 xil yorugʻlikda yonadi — bu 1 bayt.");
    await ui.say("elder", "Demak, rangli piksel — 3 bayt. Ranglar 16 milliondan ham koʻp!");
  }

  // 6.3: telefon surati va megabayt
  async function megabyte() {
    const P = pixels.PHOTO;
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art small", html: art.story("phone") }));
    const rows = common.formula(el, [`${fmt(P.w)} × ${fmt(P.h)} = ${fmt(P.pixels)} piksel`]);
    await ui.say("elder", "Telefon surati: 4000 × 3000 — 12 million piksel.");
    rows.append(ui.h("div", { class: "formula-row", text: `${fmt(P.pixels)} × 3 = ${fmt(P.bytes)} bayt` }));
    await ui.say("elder", "Har biri 3 bayt — 36 million bayt! Juda katta son.");
    el.append(ui.h("div", { class: "ladder" },
      ui.h("span", { class: "step", text: "bayt" }), ui.h("span", { class: "arrow", text: "× 1024 →" }),
      ui.h("span", { class: "step", text: "Kbayt" }), ui.h("span", { class: "arrow", text: "× 1024 →" }),
      ui.h("span", { class: "step new", text: "Mbayt" })));
    await ui.say("elder", "Katta sonlar uchun katta birlik: 1024 Kbayt = 1 Mbayt (megabayt).");
    el.append(common.answerLine(`${fmt(P.bytes)} bayt ≈ ${P.mb} Mbayt`));
    await ui.say("elder", `Bu surat — ${P.mb} Mbaytga yaqin.`);
  }

  // 6.4: siqish — qatorni qisqa yozish
  async function squeeze() {
    const row = pixels.DEMO_ROW;
    const el = common.box(true);
    el.append(pixelsUi.rowView(row, false));
    ui.bubble("elder", `Bu qatorda ${row.length} ta piksel. Uni qisqaroq yozsa boʻladimi?`);
    await common.waitButton("Qisqa yoz");
    el.append(pixelsUi.rleView(row));
    sound.play("correct");
    const parts = pixels.runs(row).length;
    await ui.say("elder", `${row.length} ta piksel oʻrniga ${parts} ta yozuv: 6 koʻk, 2 oq, 2 koʻk!`);
    await ui.say("elder", "Telefon takrorlanuvchi ranglarni shunday qisqa yozadi — bu siqish.");
  }

  // "Qaysi biri eng katta?" — uch karta va "Uchalasi teng" (4 variant)
  const cmpLabels = (task) => ({
    mb: `${task.mb} Mbayt`, kb: `${task.kb} Kbayt`, photos: `${task.n} ta surat × ${task.each} Mbayt`, teng: "Uchalasi teng",
  });

  function compareButtons(task, submit) {
    const labels = cmpLabels(task);
    const row = ui.h("div", { class: "choice-row" });
    pixels.CMP_OPTIONS.forEach((k) => row.append(ui.button(labels[k], () => submit(k), k === "teng" ? "secondary" : "")));
    ui.clearControl();
    ui.control().append(row);
  }

  // 6.5: mashq — rangli rasm, qisqa yozuv, Mbayt va Kbayt
  function photoTask(task) {
    const el = common.box(true);
    if (task.type === "rgb") {
      pixelsUi.taskPicture(el, task, pixels.PALETTE16, "rangli");
      const p = task.w * task.h;
      ui.bubble("elder", "Bu rangli rasm. Necha bayt?");
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line(`Har piksel 3 bayt. ${task.w} × ${task.h} = ${p} piksel`));
          ui.bubble("elder", "↻ Piksellar sonini 3 ga koʻpaytir.");
        },
        solution: () => common.add(el, common.answerLine(`${p} × 3 = ${task.answer} bayt`)),
      });
    }
    if (task.type === "runs") {
      const view = ui.h("div", { class: "task-view" }, pixelsUi.rowView(task.row, false));
      el.append(view);
      ui.bubble("elder", "Bu qatorni qisqa yozsak, nechta yozuv chiqadi?");
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          view.replaceChildren(pixelsUi.rowView(task.row, true));
          ui.bubble("elder", "↻ Bir xil rangli boʻlaklarni ajratdim. Nechta boʻlak?");
        },
        solution: () => {
          common.add(el, pixelsUi.rleView(task.row));
          common.add(el, common.answerLine(`${task.answer} ta yozuv`));
        },
      });
    }
    if (task.type === "cbytes") {
      pixelsUi.taskPicture(el, task, pixels.PALETTE16, `${task.colors} xil rang`);
      const p = task.w * task.h;
      ui.bubble("elder", `Bu rasmda ${task.colors} xil rang. U necha BAYT?`);
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line(`${task.colors} rang — har piksel ${task.bpp} bit. Avval bitlar, keyin : 8`));
          ui.bubble("elder", "↻ Kenglik × balandlik × bit — bu bitlar. 8 bit — 1 bayt.");
        },
        solution: () => common.add(el, common.answerLine(`${task.w} × ${task.h} × ${task.bpp} = ${p * task.bpp} bit; ${p * task.bpp} : 8 = ${task.answer} bayt`)),
      });
    }
    const labels = cmpLabels(task);
    const sizes = pixels.cmpSizes(task);
    el.append(ui.h("div", { class: "cmp" },
      ui.h("div", { class: "cmp-card", text: labels.mb }),
      ui.h("div", { class: "cmp-card", text: labels.kb }),
      ui.h("div", { class: "cmp-card", text: labels.photos })));
    ui.bubble("elder", "Qaysi biri eng katta? Uchalasi bir xil boʻlsa — «Uchalasi teng».");
    return practice.tries({
      setup: (submit) => compareButtons(task, submit),
      check: (value) => value === task.answer,
      hint: () => {
        common.add(el, common.line("1 Mbayt = 1024 Kbayt"));
        ui.bubble("elder", "↻ Uchalasini ham Kbaytga oʻtkaz, keyin solishtir.");
      },
      solution: () => common.add(el,
        common.line(`${labels.mb} = ${sizes.mb} Kbayt; ${labels.photos} = ${task.n * task.each} Mbayt = ${sizes.photos} Kbayt`),
        common.answerLine(task.answer === "teng" ? `Uchalasi ham ${sizes.mb} Kbayt — teng` : `Eng kattasi: ${labels[task.answer]} (${sizes[task.answer]} Kbayt)`)),
    });
  }

  function praise(task) {
    if (task.type === "rgb") return `${task.w * task.h} piksel × 3 = ${task.answer} bayt.`;
    if (task.type === "cbytes") return `${task.w * task.h * task.bpp} bit = ${task.answer} bayt.`;
    if (task.type === "runs") return `${task.row.length} ta piksel — ${task.answer} ta yozuv.`;
    return task.answer === "teng" ? `Uchalasi ham ${task.mb * 1024} Kbayt.` : `${task.mb} Mbayt = ${task.mb * 1024} Kbayt.`;
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
    await mix();
    await megabyte();
    await squeeze();
    await ui.say("elder", `Endi oʻzing hisobla: rangli rasm, siqish va megabayt. ${QK.practice.need()} ta toʻgʻri javob!`);
    await practice.exercises({
      next: (prev, correct, tier) => pixels.makePhotoTask(prev, undefined, tier),
      run: photoTask,
      praise,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
