// 3-bosqich: faqat o'zgargani — siqish va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { video, ui, sound, art, videoUi, practice, common } = QK;

  const SCENES = [
    { art: "film", lines: [`Siqilmagan film: 1 daqiqasi — ${video.REAL.minuteGb} Gbaytdan koʻp.`, "Siqilgan 2 soatlik kino — 2–4 Gbayt."] },
    { art: "speaker", lines: ["Video — kadrlar va ovoz.", "Ovoz ham sonlarga aylantirib saqlanadi."] },
    { art: "stream", lines: ["Internetda video koʻrganingda ham asosan oʻzgargan joylar keladi.", "Shuning uchun tinch video tezroq yuklanadi."] },
  ];

  // 6.1: bola 2-kadrdagi o'zgargan kataklarni topadi
  async function findChanges() {
    const el = common.box(true);
    const changed = new Set(video.diff(video.DEMO_A, video.DEMO_B));
    const found = new Set();
    const count = common.line(`Topildi: 0 / ${changed.size}`);
    let frames = null;
    ui.bubble("elder", "Quti biroz surildi. 2-kadrda oʻzgargan kataklarni bos!");
    await ui.settle((done) => {
      frames = videoUi.pair(el, video.DEMO_A, video.DEMO_B, {
        size: "demo",
        onTap: (i) => {
          if (found.has(i)) return;
          if (!changed.has(i)) {
            sound.play("retry");
            frames.second.shake(i);
            ui.toast("Bu katak oʻzgarmagan.");
            return;
          }
          found.add(i);
          frames.second.mark(i, "found");
          sound.play("tap");
          count.textContent = `Topildi: ${found.size} / ${changed.size}`;
          if (found.size === changed.size) done();
        },
      });
      el.append(count);
    });
    sound.play("correct");
    await ui.say("elder", `Butun kadr — ${video.CELLS} piksel. Oʻzgargani — faqat ${changed.size} ta!`);
  }

  async function definition() {
    const el = common.box(false);
    common.formula(el, ["1-kadr — toʻliq", "keyingi kadrlar — faqat oʻzgargani"]);
    await ui.say("elder", "Video siqilganda 1-kadr toʻliq saqlanadi. Keyingilarida — faqat oʻzgargan piksellar.");
    await ui.say("elder", "Siqilmasa 2 soatlik kino 1000 Gbaytga yaqin boʻlardi. Siqilgani — bir necha Gbayt.");
  }

  // 6.3: mashq — nechta o'zgardi, nechta tejaldi, qaysi video ko'proq siqiladi
  function compressTask(task) {
    const el = common.box(true);
    if (task.type === "diff") {
      const frames = videoUi.pair(el, task.a, task.b, { size: "sm" });
      const changed = video.diff(task.a, task.b);
      ui.bubble("elder", "Nechta katak oʻzgardi?");
      return practice.tries({
        setup: (submit) => videoUi.choiceButtons(task.options, (i) => submit(task.options[i]), "nums"),
        check: (value) => value === task.answer,
        hint: () => {
          const rows = new Set(changed.map((i) => Math.floor(i / video.SIZE)));
          frames.first.markRows(rows);
          frames.second.markRows(rows);
          ui.bubble("elder", "↻ Oʻzgarish bor qatorlarni yoritdim. Ularni katakma-katak solishtir.");
        },
        solution: () => {
          frames.first.markRows(new Set());
          frames.second.markRows(new Set());
          changed.forEach((i) => frames.second.mark(i, "found"));
          common.add(el, common.answerLine(`${task.answer} ta katak oʻzgardi`));
        },
      });
    }
    if (task.type === "saved") {
      el.append(ui.h("div", { class: "facts" },
        ui.h("div", { text: `Kadr — ${video.CELLS} piksel` }),
        ui.h("div", { text: `Oʻzgargani — ${task.changed} ta` })));
      ui.bubble("elder", "Nechta piksel qayta saqlanmaydi?");
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line(`${video.CELLS} − ${task.changed} = ?`));
          ui.bubble("elder", "↻ Oʻzgarmaganlari qayta saqlanmaydi.");
        },
        solution: () => common.add(el, common.answerLine(`${video.CELLS} − ${task.changed} = ${task.answer}`)),
      });
    }
    ui.bubble("elder", "Qaysi video koʻproq siqiladi?");
    el.append(ui.h("div", { class: "story-art small", html: art.story("film") }));
    return practice.tries({
      setup: (submit) => videoUi.choiceButtons(task.options.map((o) => o.label), submit, "wide"),
      check: (value) => value === task.answer,
      hint: () => ui.bubble("elder", "↻ Qaysi birida kadrdan kadrga kamroq narsa oʻzgaradi?"),
      solution: () => common.add(el, common.answerLine(`«${task.options[task.answer].label}» — oʻzgarish kam, koʻproq siqiladi`)),
    });
  }

  function praise(task) {
    if (task.type === "diff") return `${task.answer} ta katak — faqat shularni saqlaymiz.`;
    if (task.type === "saved") return `${task.answer} ta piksel tejaldi.`;
    return "Tinch videoda oʻzgarish kam — u koʻproq siqiladi.";
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
    await findChanges();
    await definition();
    await ui.say("elder", "Endi oʻzing top: siqish qanday ishlaydi. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => video.makeCompressTask(prev),
      run: compressTask,
      praise,
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
