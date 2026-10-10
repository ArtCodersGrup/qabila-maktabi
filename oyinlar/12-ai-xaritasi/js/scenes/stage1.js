// Kirish va 1-bosqich: uch doira (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { atlas, ui, sound, art, atlasUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("map") }));
    await ui.say("elder", "Maqsad: sunʼiy intellekt (AI), mashinali oʻrganish (ML) va chuqur oʻrganish (DL) farqini bilish.");
    await ui.say("elder", "Kalit gʻoya: AI ⊃ ML ⊃ DL — har biri oldingisining ichidagi doira. Koʻrish, til kabi vazifalar esa alohida.");
  }

  // 4.1–4.4: zonalar birma-bir chiziladi
  async function buildMap() {
    const el = common.box(true);
    const map = atlasUi.mapView(el);
    const steps = [
      { id: "plain", chip: "kalkulyator", line: "Eng tashqarida — oddiy dastur (kalkulyator, budilnik): yozilgan qoidani bajaradi, aql talab qilmaydi." },
      { id: "ai", chip: "shaxmat dasturi", line: "AI — odatda aql talab qiladigan ishni bajaruvchi dastur. Masalan, shaxmat dasturi yurishlarni hisoblab, eng yaxshisini tanlaydi." },
      { id: "ml", chip: "oʻynagan oʻyinlaring", line: "ML — AI ning bir qismi: qoida yozilmaydi, dastur misollardan oʻrganadi." },
      { id: "dl", chip: "neyron tarmoq", line: "DL — ML ning bir qismi: koʻp qatlamli neyron tarmoq bilan oʻrganish." },
    ];
    const shown = [];
    for (const step of steps) {
      shown.push(step.id);
      map.show(shown);
      map.highlight(step.id);
      map.add(step.id, step.chip);
      sound.play("tap");
      await ui.say("elder", step.line);
    }
    map.highlight(null);
    await ui.say("elder", "Har doira oldingisining ichida, shuning uchun DL — ham ML, ham AI. Teskarisi har doim ham toʻgʻri emas.");
  }

  // 4.5: mashq — ta'rif qaysi doiraga tegishli?
  function defTask(task) {
    const el = common.box(true);
    const view = atlasUi.card(el, task.text);
    ui.bubble("elder", "Bu qaysi doira haqida?");
    return practice.tries({
      setup: (submit) => atlasUi.listButtons(task.options, atlasUi.zoneLabel, submit),
      check: (index) => task.options[index] === task.answer,
      hint: () => {
        view.mark(task.key);
        ui.bubble("elder", "↻ Belgilangan soʻzga qara: qoida, misol yoki qatlam?");
      },
      solution: () => {
        view.mark(task.key);
        el.append(common.answerLine(atlasUi.zoneLabel(task.answer)));
      },
    });
  }

  async function stage1() {
    await buildMap();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta taʼrif — qaysi doiraga tegishli.`);
    await practice.exercises({
      next: (prev, correct, tier) => atlas.makeDefTask(prev, null, tier),
      run: defTask,
      praise: (task) => `Bu — ${atlasUi.zoneLabel(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
