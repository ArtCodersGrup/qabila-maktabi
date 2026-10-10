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
    await ui.say("elder", "Maqsad: kompyuter rasmni qanday koʻrishi va tanishini tushunish (kompyuter koʻrishi).");
    await ui.say("elder", "Kalit gʻoya: kamera uchun rasm — piksellar jadvali, yaʼni sonlar. Robot shakl emas, faqat sonlarni koʻradi.");
  }

  // 4.1: bola chizadi, sonlar jonli o'zgaradi
  async function draw() {
    const el = common.box(true);
    const nums = visionUi.numbers(el);
    const board = visionUi.grid(el, { editable: true, onChange: (cells) => nums.set(cells) });
    el.insertBefore(board.el, nums.el);
    nums.set(board.get());
    ui.bubble("elder", "Kataklarni bosib rasm chiz va pastdagi sonlarga qara.");
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
    await ui.say("elder", `${painted} ta katak boʻyaldi. Robot buni 1 va 0 lar qatori sifatida oladi.`);
    await ui.say("elder", "Har katak — bitta piksel: boʻyalgan — 1, boʻsh — 0. Rangli rasmda har piksel 0–255 oraligʻidagi sonlar bilan yoziladi.");
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
        el.append(common.line("Qatorma-qator solishtir: 0 — boʻsh, 1 — boʻyalgan"));
        ui.bubble("elder", "↻ Birinchi qatorni sana: qaysi rasmlarda xuddi shunday? Keyin ikkinchi qatorga oʻt.");
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
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta piksellar jadvali — qaysi rasmga tegishli.`);
    await practice.exercises({
      next: (prev, correct, tier) => vision.makeReadTask(prev, null, tier),
      run: readTask,
      praise: () => "Sonlar jadvali va rasm — bir maʼlumotning ikki koʻrinishi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
