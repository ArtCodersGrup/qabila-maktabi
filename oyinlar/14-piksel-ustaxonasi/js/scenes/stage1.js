// Kirish va 1-bosqich: oq-qora rasm (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { pixels, ui, sound, art, pixelsUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.easel() }));
    await ui.say("elder", "Maqsad: rasm hajmini bit va baytda hisoblash.");
    await ui.say("elder", "Kalit gʻoya: rasm — piksellar toʻri, har piksel rangi bitlar bilan yoziladi.");
  }

  // 4.1–4.3: bola chizadi, kataklarda 1/0, har qator — 1 bayt
  async function draw() {
    const el = common.box(true);
    const board = pixelsUi.grid(el, { w: 8, h: 8, editable: true });
    const count = common.line("");
    el.append(count);
    ui.bubble("elder", "Kataklarni bosib rasm chiz — kamida 6 ta katak.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Tayyor", () => {
        if (board.get().filter(Boolean).length < 6) {
          sound.play("retry");
          ui.toast("Kamida 6 ta katakni boʻya.");
          return;
        }
        ui.clearControl();
        done();
      }, "big"));
    });
    board.lock();
    board.showCodes((v) => String(v));
    sound.play("correct");
    await ui.say("elder", "Boʻyalgani — 1, boʻshi — 0. Har katak — bitta piksel, yaʼni 1 bit.");
    await ui.say("elder", "Boʻsh piksel ham joy oladi: unda 0 saqlanadi.");
    ui.bubble("elder", "Qatorlarni sanaymiz: «Sana» ni bos.");
    await common.waitButton("Sana ▶︎");
    for (let r = 0; r < 8; r++) {
      board.highlightRow(r);
      count.textContent = `${r + 1}-qator: 8 bit = 1 bayt · jami ${r + 1} bayt`;
      sound.play("tap");
      await ui.sleep(450);
    }
    board.highlightRow(null);
    await ui.say("elder", "Har qatorda 8 piksel = 8 bit = 1 bayt.");
    await ui.say("elder", "8 qator — 8 bayt. Butun rasm: 64 bit = 8 bayt.");
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["8 × 8 = 64 piksel", "64 bit = 8 bayt", "oq-qora: V = kenglik × balandlik (bit)"]);
    await ui.say("elder", "Oq-qora rasmda har piksel — 1 bit, shuning uchun hajm = kenglik × balandlik bit.");
    await ui.say("elder", "Baytga oʻtish: bitlar soni : 8.");
  }

  // 4.5: mashq — oq-qora rasm necha bit / necha bayt
  function bwTask(task) {
    const el = common.box(true);
    pixelsUi.taskPicture(el, task, pixelsUi.BW);
    const n = task.w * task.h;
    ui.bubble("elder", task.type === "bits" ? "Oq-qora rasm. Hajmi necha bit?" : "Oq-qora rasm. Hajmi necha bayt?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        // Maslahat oraliq natijani ham aytmaydi — faqat usul
        common.add(el, common.line(task.type === "bits" ? `Har piksel 1 bit. ${task.w} × ${task.h} = ?` : `Har piksel 1 bit: ${task.w} × ${task.h} = ? bit. 1 bayt = 8 bit`));
        ui.bubble("elder", task.type === "bits" ? "↻ Kenglikni balandlikka koʻpaytir." : "↻ Avval bitlarni top, keyin 8 ga boʻl.");
      },
      solution: () => common.add(el, common.answerLine(task.type === "bits"
        ? `${task.w} × ${task.h} = ${n} bit`
        : `${n} : 8 = ${task.answer} bayt`)),
    });
  }

  async function stage1() {
    await draw();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta oq-qora rasm — hajmi bit yoki baytda.`);
    await practice.exercises({
      next: (prev, correct, tier) => pixels.makeBwTask(prev, undefined, tier),
      run: bwTask,
      praise: (task) => (task.type === "bits"
        ? `${task.w} × ${task.h} = ${task.answer} bit.`
        : `${task.w * task.h} bit = ${task.answer} bayt.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
