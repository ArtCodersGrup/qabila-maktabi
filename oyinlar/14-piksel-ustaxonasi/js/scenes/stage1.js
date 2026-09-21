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
    await ui.say("elder", "Bugun ustaxonada kompyuterda rasm chizamiz!");
    await ui.say("apprentice", "Rasm necha bayt boʻladi?");
    await ui.say("elder", "Kel, oʻzimiz chizib, sanab koʻramiz.");
  }

  // 4.1–4.3: bola chizadi, kataklarda 1/0, har qator — 1 bayt
  async function draw() {
    const el = common.box(true);
    const board = pixelsUi.grid(el, { w: 8, h: 8, editable: true });
    const count = common.line("");
    el.append(count);
    ui.bubble("elder", "Kataklarni bosib rasm chiz. Kamida 6 ta katakni boʻya!");
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
    await ui.say("elder", "Boʻsh katak ham joy oladi: kompyuter u yerda 0 ni saqlaydi.");
    ui.bubble("elder", "Endi qatorlarni sanaymiz. «Sana»ni bos!");
    await common.waitButton("Sana ▶︎");
    for (let r = 0; r < 8; r++) {
      board.highlightRow(r);
      count.textContent = `${r + 1}-qator: 8 bit = 1 bayt · jami ${r + 1} bayt`;
      sound.play("tap");
      await ui.sleep(450);
    }
    board.highlightRow(null);
    await ui.say("elder", "Har qatorda 8 piksel — 8 bit, yaʼni 1 bayt!");
    await ui.say("elder", "8 qator — 8 bayt. Butun rasm: 64 bit = 8 bayt.");
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["8 × 8 = 64 piksel", "64 bit = 8 bayt", "oq-qora rasm: kenglik × balandlik (bit)"]);
    await ui.say("elder", "Oq-qora rasmda har piksel — 1 bit.");
    await ui.say("elder", "Hajmini topish uchun kenglikni balandlikka koʻpaytiramiz.");
  }

  // 4.5: mashq — oq-qora rasm necha bit / necha bayt
  function bwTask(task) {
    const el = common.box(true);
    pixelsUi.taskPicture(el, task, pixelsUi.BW);
    const n = task.w * task.h;
    ui.bubble("elder", task.type === "bits" ? "Bu oq-qora rasm necha bit?" : "Bu oq-qora rasm necha bayt?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, common.line(task.type === "bits" ? `Har piksel 1 bit. ${task.w} × ${task.h} = ?` : `${task.w} × ${task.h} = ${n} bit. ${n} : 8 = ?`));
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
    await ui.say("elder", "Endi oʻzing hisobla: rasm necha bit yoki necha bayt? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => pixels.makeBwTask(prev),
      run: bwTask,
      praise: (task) => (task.type === "bits"
        ? `${task.w} × ${task.h} = ${task.answer} bit.`
        : `${task.w * task.h} bit = ${task.answer} bayt.`),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
