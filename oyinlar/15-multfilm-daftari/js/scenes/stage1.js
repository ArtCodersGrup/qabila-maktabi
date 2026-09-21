// Kirish va 1-bosqich: kadrlar (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { video, ui, sound, art, videoUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.notebook() }));
    await ui.say("apprentice", "Qarang, daftar chetiga koptok chizdim!");
    await ui.say("apprentice", "Varaqlarni tez aylantirsam, u sakraydi!");
    await ui.say("elder", "Bu — multfilm. Kompyuterdagi video ham xuddi shunday ishlaydi.");
  }

  const frames = () => video.BOUNCE.map((_, k) => video.bounceFrame(k));

  // 4.1: bola yetishmayotgan kadrga koptokni qo'yadi (2- va 4-kadr joyi xira ko'rinadi)
  async function missingFrame() {
    const el = common.box(true);
    const all = frames();
    const tape = videoUi.strip(el, all, video.MISSING);
    const at = ([x, y]) => y * video.SIZE + x;
    const ghosts = [at(video.BOUNCE[video.MISSING - 1]), at(video.BOUNCE[video.MISSING + 1])];
    let editor = null;
    ui.bubble("elder", "3-kadr yoʻqolibdi! Koptokni 2- va 4-kadrdagi joylar orasiga qoʻy.");
    await ui.settle((done) => {
      let finished = false;
      editor = videoUi.frameGrid(el, video.background(), {
        ghosts,
        onTap: (i) => {
          if (finished) return;
          const x = i % video.SIZE;
          const y = Math.floor(i / video.SIZE);
          if (y === video.SIZE - 1) return; // yer
          if (!video.placeOk(x, y)) {
            sound.play("retry");
            editor.shake(i);
            ui.bubble("elder", "↻ Xira koptoklarga qara: 3-kadr ular orasida boʻlsin.");
            return;
          }
          finished = true;
          const cells = video.background();
          cells[i] = video.BALL;
          editor.set(cells);
          all[video.MISSING] = cells;
          tape.fill(video.MISSING, cells);
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          done();
        },
      });
    });
    await ui.say("elder", "✓ Barakalla! Endi 6 ta kadr tayyor. Bu kadrlar — multfilm.");
    return all;
  }

  // 4.2: sekin va tez o'ynatish
  async function playBoth(all) {
    const el = common.box(true);
    const screen = videoUi.player(el, all[0]);
    ui.bubble("elder", "Avval sekin oʻynatamiz: 1 soniyada 1 ta kadr.");
    await common.waitButton("▶︎ Sekin: 1 kadr/soniya");
    await screen.play(all, video.SPEEDS.slow, all.length);
    await ui.say("elder", "Koptok sakrab-sakrab, toʻxtab-toʻxtab yuryapti.");
    ui.bubble("elder", "Endi tez: 1 soniyada 12 ta kadr!");
    await common.waitButton("▶︎ Tez: 12 kadr/soniya");
    await screen.play(all, video.SPEEDS.fast, 3);
    await ui.say("elder", "Kadrlar tez almashsa, koʻz ularni harakat deb koʻradi.");
    await ui.say("elder", "Multfilmda 1 soniyada 24 ta kadr boʻladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(videoUi.frameIcons(4));
    common.formula(el, ["video — tez almashadigan kadrlar", "kadrlar = kadr/soniya × soniya"]);
    await ui.say("elder", "Har bir rasm — kadr. Video — kadrlar ketma-ketligi.");
    await ui.say("elder", "Jami kadrlarni topish uchun 1 soniyadagi kadrlarni soniyalarga koʻpaytiramiz.");
  }

  // 4.4: mashq — jami kadrlar / necha soniya
  function frameTask(task) {
    const el = common.box(true);
    // Sonlar ish maydonida ham turadi: maslahat chiqqanda pufak almashadi
    el.append(ui.h("div", { class: "facts" },
      ui.h("div", { text: task.type === "total" ? `Multfilm — ${task.seconds} soniya` : `Jami — ${task.total} kadr` }),
      ui.h("div", { text: `1 soniyada — ${task.fps} kadr` })));
    ui.bubble("elder", task.type === "total" ? "Jami nechta kadr?" : "Multfilm necha soniya?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        if (task.type === "total") {
          common.add(el, videoUi.secondBoxes(task.seconds, task.fps));
          ui.bubble("elder", "↻ Har soniyada shuncha kadr. Hammasini qoʻsh.");
        } else {
          common.add(el, common.line(`${task.fps} × ? = ${task.total}`));
          ui.bubble("elder", `↻ ${task.fps} ni nechaga koʻpaytirsak, ${task.total} chiqadi?`);
        }
      },
      solution: () => common.add(el, common.answerLine(task.type === "total"
        ? `${task.fps} × ${task.seconds} = ${task.total} kadr`
        : `${task.total} : ${task.fps} = ${task.seconds} soniya`)),
    });
  }

  async function stage1() {
    const all = await missingFrame();
    await playBoth(all);
    await definition();
    await ui.say("elder", "Endi oʻzing hisobla: kadrlar va soniyalar. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => video.makeFrameTask(prev),
      run: frameTask,
      praise: (task) => `${task.fps} × ${task.seconds} = ${task.total} kadr.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
