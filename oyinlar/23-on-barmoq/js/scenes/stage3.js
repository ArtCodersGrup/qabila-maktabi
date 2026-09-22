// 3-bosqich: pastki qator, katta harflar, maqollar va hikoya (DIZAYN 8-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, typing: T, typingUi, common } = QK;

  async function definition() {
    const el = common.box(false);
    const kb = typingUi.keyboard(el, { learned: T.allowed(3) });
    kb.mark(["shift-l", "shift-r"]);
    common.formula(el, ["Katta harf = Shift + harf", "Shift — boshqa qoʻlning jimjilogʻi", "Gap oxirida — nuqta"]);
    await ui.say("elder", "Endi hamma harfni bilasan!");
    await ui.say("elder", "Harf chap qoʻlda boʻlsa — oʻng Shift, oʻng qoʻlda boʻlsa — chap Shift.");
  }

  // 8.5: hikoya — yozuv mashinkasi va tezlik
  async function story() {
    let el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.typewriter() }));
    await ui.say("elder", "Harflarning bunday tartibi 150 yil oldin yozuv mashinkasi uchun oʻylab topilgan.");
    await ui.say("elder", "Birinchi qatordagi harflar boʻyicha uni QWERTY deyishadi.");

    el = common.box(false);
    const best = typingUi.best();
    el.append(ui.h("div", { class: "story-art small", html: art.trophy() }));
    if (best) el.append(ui.h("div", { class: "best", text: `Rekord: ${best} belgi/daqiqa` }));
    await ui.say("elder", "Koʻp yozadigan kattalar 1 daqiqada 200–300 belgi yozadi.");
    await ui.say("elder", best
      ? `Sening rekording — ${best}. Har kuni 10 daqiqa mashq qilsang, tez oʻsadi!`
      : "Har kuni 10 daqiqa mashq qilsang, tezliging tez oʻsadi!");
  }

  async function stage3() {
    const el = common.box(true);
    const kb = typingUi.keyboard(el, { learned: T.allowed(3) });
    const hd = typingUi.hands(el);
    kb.mark(T.ROWS.bottom.filter((k) => k !== "/"));
    hd.show(["lp", "lr", "lm", "li", "ri", "rm", "rr"]);
    await ui.say("elder", "Endi pastki qator. Barmoq pastga tushadi, bosadi va joyiga qaytadi.");
    await common.drills(3);
    await definition();
    await ui.say("elder", `Endi maqollar yozamiz. 3 ta maqol — aniqlik kamida ${T.PASS}%!`);
    await common.lineExercises({ stage: 3, speed: true, record: true });
    await story();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);
