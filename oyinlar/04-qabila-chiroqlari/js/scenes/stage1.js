// Kirish va 1-bosqich: chiroq naqshlari (DIZAYN 4, 5-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, art, lampsUi, common, practice } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("hills") }));
    await ui.say("elder", "Qabilaga elektr chiroqlari keldi!");
    await ui.say("apprentice", "Qoʻshni qabila togʻ ortida. Tunda ularga qanday xabar yuboramiz?");
    await ui.say("elder", "Chiroqlar bilan! Kel, oʻrganamiz.");
  }

  // 5.1: bitta chiroq — faqat 2 ta xabar
  async function oneLamp() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    const meaning = ui.h("div", { class: "lamp-sum" });
    const show = (p) => { meaning.textContent = p[0] ? "Yoniq — «Keling»" : "Oʻchiq — «Kelmang»"; };
    box.append(meaning);
    show([0]);
    ui.bubble("elder", "Chiroqni bosib koʻr. Yoniq — «Keling», oʻchiq — «Kelmang».");
    // Avval qildir: "Davom" bola chiroqni bir marta bosgandan keyin chiqadi
    await ui.settle((done) => {
      const row = lampsUi.lampRow(box, { count: 1, states: lamps.PLAIN, onChange: (p) => { show(p); done(); } });
      box.prepend(box.lastChild); // chiroq yozuvdan tepada tursin
      return row;
    });
    await ui.say("elder", "Faqat 2 ta xabar — bu kam!");
  }

  // 5.4: ta'rif
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "formula-box" });
    ui.work().append(box);
    ["1 chiroq: 2", "2 chiroq: 2 × 2 = 4", `3 chiroq: 2 × 2 × 2 = 2${ui.sup(3)} = 8`].forEach((t) => {
      box.append(ui.h("div", { class: "formula-row", text: t }));
    });
    await ui.say("elder", "Har bir chiroq 2 xil boʻladi. Chiroqlar soni qancha boʻlsa, 2 ni shuncha marta koʻpaytiramiz.");
    await ui.say("elder", "2-oʻyindagi harflarni esla — xuddi shunday!");
  }

  // 5.5: naqshni o'qish yoki yuborish; kod jadvali ko'rinib turadi
  function codeTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const pattern = lamps.fromNumber(task.meaning, 3);
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    let row = null;
    if (task.type === "decode") {
      ui.bubble("elder", "Qoʻshni qabila chiroq yoqdi. Nima deyapti?");
      box.append(lampsUi.patternView(pattern, lamps.PLAIN, true));
    } else {
      ui.bubble("elder", `Qoʻshni qabilaga «${lamps.MEANINGS[task.meaning]}» deb yubor.`);
      row = lampsUi.lampRow(box, { count: 3, states: lamps.PLAIN });
    }
    const table = lampsUi.codeTable(box);
    return practice.tries({
      setup: (submit) => {
        if (task.type === "decode") lampsUi.meaningButtons((i) => submit(i));
        else ui.control().append(ui.button("Yuborish", () => submit(row.get())));
      },
      check: (v) => {
        const ok = task.type === "decode" ? v === task.meaning : lamps.toNumber(v) === task.meaning;
        if (ok && row) row.lock(); // maqtov paytida chiroqlar o'zgarmasin
        return ok;
      },
      hint: () => {
        table.highlight(task.meaning);
        if (row) row.shake();
        ui.bubble("elder", "↻ Jadvalga qara — kerakli qator yonib turibdi.");
      },
      solution: () => {
        table.highlight(task.meaning);
        if (row) {
          row.set(pattern);
          row.lock();
        }
        box.append(ui.h("div", { class: "answer", text: `Javob: ${lamps.MEANINGS[task.meaning]}` }));
      },
    });
  }

  async function stage1() {
    await oneLamp();
    ui.bubble("elder", "Endi 2 ta chiroq. Naqsh yasab «Saqlash»ni bos — hammasini top!");
    await common.findAll({ count: 2, states: lamps.PLAIN });
    await ui.say("elder", "2 ta chiroq — 4 ta naqsh.");
    ui.bubble("elder", "Endi 3 ta chiroq. Har bir naqshga maʼno beramiz!");
    await common.findAll({ count: 3, states: lamps.PLAIN, labelFor: (p) => lamps.MEANINGS[lamps.toNumber(p)] });
    await ui.say("elder", "3 ta chiroq — 8 ta naqsh. Har biriga maʼno berdik!");
    await explain();
    await ui.say("elder", "Endi qoʻshni qabila bilan gaplashamiz. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev) => lamps.makeCodeTask(prev),
      run: codeTask,
      praise: (t) => `Bu — «${lamps.MEANINGS[t.meaning]}».`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
