// 2-bosqich: matn ichida yurish va tahrirlash; o'xshash tugmalarning farqi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function harakat() {
    const el = common.box(false);
    el.append(common.kartalar(["tab", "enter", "home", "end"].map(L.amalById)));
    await ui.say("elder", "Sichqonchasiz ham yurish mumkin: Home — qator boshiga, End — oxiriga.");
    await ui.say("elder", "Tab esa shakllarda keyingi katakka sakraydi — parol yozayotganda juda qulay.");
  }

  async function tahrir() {
    const el = common.box(false);
    el.append(common.kartalar(["backspace", "delete", "shift-right", "ctrl-left"].map(L.amalById)));
    await ui.say("elder", "Backspace chapdagini, Delete oʻngdagini oʻchiradi — koʻpchilik shuni adashtiradi.");
    await ui.say("elder", "Shift bilan oʻq bossang — matn belgilanadi. Ctrl bilan oʻq — soʻz-soʻz sakraydi.");
  }

  // Mashq: yarmi farq savoli, yarmi — tugmani o'zi bosish
  const keyingi = (prev, togri) => (togri % 2 === 0 ? L.farqTask(Math.random, prev) : L.bosishTask(Math.random, prev));

  async function stage2() {
    await harakat();
    await tahrir();
    await ui.say("elder", "Endi sinab koʻramiz. Baʼzida javobni tanlaysan, baʼzida oʻzing bosasan.");
    await practice.exercises({
      next: (prev, togri) => keyingi(prev, togri),
      run: (task) => (task.tur === "farq" ? common.farqExercise(task) : common.bosishExercise(task)),
      praise: (task) => (task.tur === "farq" ? L.amalById(task.javob).nom : L.yozuv(task.amal) + " — toʻgʻri bosildi"),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
