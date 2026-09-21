// 3-bosqich: xaritani to'ldir va yakun (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { atlas, ui, sound, atlasUi, practice, common } = QK;

  // 6.1: 6–11-o'yinlar xaritada
  async function yourGames() {
    const el = common.box(true);
    const map = atlasUi.mapView(el);
    map.show(atlas.ORDER);
    ui.bubble("elder", "Oʻzing oʻynagan oʻyinlarni xaritaga qoʻyamiz.");
    await ui.sleep(700);
    for (const game of atlas.GAMES) {
      map.highlight(game.zone);
      map.add(game.zone, `${game.n}. ${game.title}`);
      sound.play("tap");
      await ui.say("elder", `${game.n}-oʻyin — ${atlas.zoneName(game.zone)}: ${game.note}.`);
    }
    map.highlight(null);
  }

  // 6.2: mashq — real misol xaritaning qayerida?
  function exampleTask(task) {
    const el = common.box(true);
    atlasUi.card(el, task.text);
    ui.bubble("elder", "Bu xaritaning qayerida?");
    return practice.tries({
      setup: (submit) => atlasUi.listButtons(task.options, atlasUi.zoneLabel, submit),
      check: (index) => task.options[index] === task.answer,
      hint: () => ui.bubble("elder", "↻ Savol ber: u oʻrganadimi? Oʻrgansa — koʻp qatlamli tarmoqmi? Oʻrganmasa — aql kerakmi?"),
      solution: () => el.append(common.answerLine(`${atlasUi.zoneLabel(task.answer)}: ${task.why}`)),
    });
  }

  async function wrapUp() {
    const el = common.box(false);
    const map = atlasUi.mapView(el);
    map.show(atlas.ORDER);
    for (const z of atlas.ZONES) map.add(z.id, z.short);
    await ui.say("elder", "Katta doira — sunʼiy intellekt. Ichida — misoldan oʻrganish. Eng ichida — neyron tarmoqlar.");
    await ui.say("elder", "Koʻrish, til va harakat — ular bajaradigan ishlar. Endi sen bu soʻzlarning farqini bilasan!");
  }

  async function stage3() {
    await yourGames();
    await ui.say("elder", "Endi hayotdan misollar: xaritaning qayerida? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => atlas.makeExampleTask(prev),
      run: exampleTask,
      praise: (task) => task.why,
    });
    await wrapUp();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
