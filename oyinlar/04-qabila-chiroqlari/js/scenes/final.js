// Bosqich tugashi va tabrik ekrani. 4-o'yinda finale yo'q.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    const next = { 1: "ikkilik sonlar", 2: "koʻp holatli chiroqlar" }[s];
    const text = goingOn && next ? `${s}-bosqich tugadi. Keyingisi — ${next}.` : `${s}-bosqich tugadi.`;
    await ui.say("elder", text);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: n bitda nechta xabar sigʻishini hisoblay olasan va ikkilik sonni oʻqiy olasan.");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { html: "n bit — 2<sup>n</sup> ta naqsh" }),
      ui.h("div", { text: "101₂ = 4 + 1 = 5" }),
      ui.h("div", { text: "k holat, n chiroq — kⁿ ta naqsh" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);
