// 2-bosqich: yuqori qator, oʻ va gʻ, aniqlik va tezlik (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, typing: T, typingUi, common } = QK;

  async function definition() {
    const el = common.box(false);
    const kb = typingUi.keyboard(el, { learned: T.allowed(2) });
    kb.mark(T.ROWS.top);
    common.formula(el, [
      "Yuqori qator: Q W E R T — Y U I O P",
      "20 ta belgi, 21 ta bosish → aniqlik 95%",
      "1 daqiqada 60 ta belgi → 60 belgi/daqiqa",
    ]);
    await ui.say("elder", "Aniqlik — bosishlaringdan nechtasi toʻgʻri boʻlgani.");
    await ui.say("elder", "Tezlik — 1 daqiqada nechta belgi yozganing. Avval aniq yoz, tezlik oʻzi keladi!");
  }

  async function stage2() {
    const el = common.box(true);
    const kb = typingUi.keyboard(el, { learned: T.allowed(2) });
    const hd = typingUi.hands(el);
    kb.mark(T.ROWS.top);
    hd.show(["lp", "lr", "lm", "li", "ri", "rm", "rr", "rp"]);
    await ui.say("elder", "Endi yuqori qator. Barmoq yuqoriga chiqadi, bosadi va joyiga qaytadi.");
    await common.drills(2);
    await definition();
    await ui.say("elder", "Endi soʻzlar. Natijada tezliging ham chiqadi — lekin avval aniqlik!");
    await common.lineExercises({ stage: 2, speed: true });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);
