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
    await ui.say("elder", "Sen robot bilan koʻp ish qilding: misol koʻrsatding, soʻz sanatding, mukofot berding.");
    await ui.say("apprentice", "Ularning nomi bormi?");
    await ui.say("elder", "Bor! Keling, hammasini bitta xaritaga joylaymiz.");
  }

  // 4.1–4.4: zonalar birma-bir chiziladi
  async function buildMap() {
    const el = common.box(true);
    const map = atlasUi.mapView(el);
    const steps = [
      { id: "plain", chip: "kalkulyator", line: "Eng tashqarida — oddiy dastur. Kalkulyator, budilnik: qoidani bajaradi, aql talab qilmaydi." },
      { id: "ai", chip: "shaxmat dasturi", line: "Ichkarida — sunʼiy intellekt: aql talab qiladigan ish. Masalan, shaxmat dasturi yurishlarni sanab, eng yaxshisini tanlaydi." },
      { id: "ml", chip: "6–9-oʻyinlar", line: "Uning ichida — mashinali oʻrganish: qoida yozilmaydi, mashina misollardan oʻrganadi." },
      { id: "dl", chip: "11-oʻyin", line: "Eng ichkarida — chuqur oʻrganish: koʻp qatlamli neyron tarmoq bilan oʻrganadi." },
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
    await ui.say("elder", "Koʻrdingmi? Har doira oldingisining ichida. Chuqur oʻrganish — ham ML, ham AI.");
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
    await ui.say("elder", "Endi oʻzing top: qaysi doira haqida gap ketyapti? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => atlas.makeDefTask(prev),
      run: defTask,
      praise: (task) => `Bu — ${atlasUi.zoneLabel(task.answer)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);
