// Kirish va 1-bosqich: rasm — bu sonlar (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound, art, visionUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robotga koʻz berdik!");
    await ui.say("apprentice", "Endi u rasmni koʻradimi?");
    await ui.say("elder", "Koʻradi, lekin boshqacha. U faqat kataklardagi sonlarni koʻradi.");
  }

  // 4.1: bola chizadi, sonlar jonli o'zgaradi
  async function draw() {
    const el = common.box(true);
    const nums = visionUi.numbers(el);
    const board = visionUi.grid(el, { editable: true, onChange: (cells) => nums.set(cells) });
    el.insertBefore(board.el, nums.el);
    nums.set(board.get());
    ui.bubble("elder", "Kataklarni bosib rasm chiz. Pastdagi sonlarga qara!");
    let painted = 0;
    await ui.settle((done) => {
      ui.control().append(ui.button("Tayyor", () => {
        painted = vision.filled(board.get());
        if (painted < 6) {
          sound.play("retry");
          ui.toast("Kamida 6 ta katakni boʻya.");
          return;
        }
        ui.clearControl();
        done();
      }, "big"));
    });
    await ui.say("elder", `Sen ${painted} ta katakni boʻyading. Robot buni 1 va 0 lar qatori deb koʻradi.`);
    await ui.say("elder", "Har katak — bitta piksel. 5-oʻyindagi chiroqlarni esla: yoniq — 1, oʻchiq — 0.");
  }

  // 4.3: mashq — sonlarga qarab rasmni topish
  function readTask(task) {
    const el = common.box(true);
    const nums = visionUi.numbers(el);
    nums.set(task.image);
    ui.bubble("elder", "Robot mana shu sonlarni koʻrdi. Bu qaysi rasm?");
    return practice.tries({
      setup: (submit) => visionUi.optionGrids(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        el.append(common.line("Birinchi qatorni solishtir: 0 — boʻsh, 1 — boʻyalgan"));
        ui.bubble("elder", "↻ Birinchi qatorni sana: qaysi rasmda xuddi shunday?");
      },
      solution: () => {
        const right = visionUi.grid(el, { size: "sm" });
        right.set(task.image);
        el.append(common.answerLine("Mana shu rasm"));
      },
    });
  }

  async function stage1() {
    await draw();
    await ui.say("elder", "Endi oʻzing top: sonlar qaysi rasmga tegishli? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => vision.makeReadTask(prev),
      run: readTask,
      praise: () => "Sonlar va rasm — bir narsa.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
